import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { handleError } from './storeUtils'
import { apiClient } from '../services/api-client'
import {
  getDieticianAssociationAPI,
  EmailTemplateDto,
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
  SentEmailDto,
  SendTemplatedEmailRequestDto,
  SendDirectEmailRequestDto
} from '../services/generated'
import { toast } from '@/hooks/use-toast'

const api = getDieticianAssociationAPI();

interface EmailState {
  templates: EmailTemplateDto[]
  loading: boolean
  error?: string

  // Outbox state
  outboxEmails: any[]
  outboxPagedResult?: any
  outboxLoading: boolean

  // Inbox state
  inboxEmails: any[]
  inboxPagedResult?: any
  inboxLoading: boolean

  // Account state
  accounts: string[]
  accountsLoading: boolean

  fetchTemplates: () => Promise<void>
  createTemplate: (data: CreateEmailTemplateDto) => Promise<void>
  updateTemplate: (id: string, data: UpdateEmailTemplateDto) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>

  sendTemplatedEmail: (data: SendTemplatedEmailRequestDto) => Promise<void>
  sendDirectEmail: (data: SendDirectEmailRequestDto) => Promise<void>

  // Imap actions
  fetchOutbox: (params: any, account?: string, noCache?: boolean) => Promise<void>
  fetchInbox: (params: any, account?: string, noCache?: boolean) => Promise<void>
  fetchOutboxEmailDetail: (id: string, account?: string) => Promise<SentEmailDto | null>
  fetchInboxEmailDetail: (id: string, account?: string) => Promise<SentEmailDto | null>
  fetchAccounts: () => Promise<void>

  removeError: () => void
}

export const useEmailStore = create<EmailState>()(
  devtools((set, get) => ({
    templates: [],
    loading: false,
    error: undefined,

    outboxEmails: [],
    outboxPagedResult: undefined,
    outboxLoading: false,

    inboxEmails: [],
    inboxPagedResult: undefined,
    inboxLoading: false,

    accounts: [],
    accountsLoading: false,

    fetchTemplates: async () => {
      set({ loading: true, error: undefined })
      try {
        const response = await api.getApiEmailTemplates()
        set({ templates: response.data, loading: false })
      } catch (err) {
        const errorMessage = handleError(err)
        set({ error: errorMessage, loading: false })
        throw new Error(errorMessage)
      }
    },

    createTemplate: async (data) => {
      set({ loading: true, error: undefined })
      try {
        await api.postApiEmailTemplates(data)
        await get().fetchTemplates()
        set({ loading: false })
      } catch (err) {
        const errorMessage = handleError(err)
        set({ error: errorMessage, loading: false })
        throw new Error(errorMessage)
      }
    },

    updateTemplate: async (id, data) => {
      set({ loading: true, error: undefined })
      try {
        await api.putApiEmailTemplatesId(id, data)
        await get().fetchTemplates()
        set({ loading: false })
      } catch (err) {
        const errorMessage = handleError(err)
        set({ error: errorMessage, loading: false })
        throw new Error(errorMessage)
      }
    },

    deleteTemplate: async (id) => {
      set({ loading: true, error: undefined })
      try {
        await api.deleteApiEmailTemplatesId(id)
        await get().fetchTemplates()
        set({ loading: false })
      } catch (err) {
        const errorMessage = handleError(err)
        set({ error: errorMessage, loading: false })
        throw new Error(errorMessage)
      }
    },

    sendTemplatedEmail: async (data) => {
      set({ loading: true, error: undefined })
      try {
        await api.postApiEmailsSendTemplate(data)
        set({ loading: false })
      } catch (err) {
        const errorMessage = handleError(err)
        set({ error: errorMessage, loading: false })
        throw new Error(errorMessage)
      }
    },

    sendDirectEmail: async (data) => {
      set({ loading: true, error: undefined })
      try {
        await api.postApiEmailsSendDirect(data)
        set({ loading: false })
      } catch (err) {
        const errorMessage = handleError(err)
        set({ error: errorMessage, loading: false })
        throw new Error(errorMessage)
      }
    },

    fetchOutbox: async (params: any, account?: string, noCache?: boolean) => {
      set({ outboxLoading: true, error: undefined })
      try {
        const result = await api.postApiEmailsOutbox(params, { account, noCache: noCache || undefined })
        set({
          outboxEmails: result.data.items ?? [],
          outboxPagedResult: result.data,
          outboxLoading: false,
        })
      } catch (err) {
        const errorMessage = handleError(err)
        set({ error: errorMessage, outboxLoading: false })
        toast({
          title: 'Outbox Error',
          description: errorMessage,
          variant: 'error',
        })
      }
    },

    fetchInbox: async (params: any, account?: string, noCache?: boolean) => {
      set({ inboxLoading: true, error: undefined })
      try {
        const result = await api.postApiEmailsInbox(params, { account, noCache: noCache || undefined })
        set({
          inboxEmails: result.data.items ?? [],
          inboxPagedResult: result.data,
          inboxLoading: false,
        })
      } catch (err) {
        const errorMessage = handleError(err)
        set({ error: errorMessage, inboxLoading: false })
        toast({
          title: 'Inbox Error',
          description: errorMessage,
          variant: 'error',
        })
      }
    },

    fetchOutboxEmailDetail: async (id, account) => {
      try {
        const result = await apiClient<SentEmailDto>(
          {
            url: `/api/emails/outbox/${encodeURIComponent(id)}`,
            method: 'GET',
            params: { account },
          }
        )

        return result.data
      } catch (err) {
        const errorMessage = handleError(err)
        toast({
          title: 'Outbox Error',
          description: errorMessage,
          variant: 'error',
        })

        return null
      }
    },

    fetchInboxEmailDetail: async (id, account) => {
      try {
        const result = await apiClient<SentEmailDto>(
          {
            url: `/api/emails/inbox/${encodeURIComponent(id)}`,
            method: 'GET',
            params: { account },
          }
        )

        return result.data
      } catch (err) {
        const errorMessage = handleError(err)
        toast({
          title: 'Inbox Error',
          description: errorMessage,
          variant: 'error',
        })

        return null
      }
    },

    fetchAccounts: async () => {
      set({ accountsLoading: true, error: undefined })
      try {
        const result = await api.getApiEmailsAccounts()
        set({
          accounts: result.data ?? [],
          accountsLoading: false,
        })
      } catch (err) {
        const errorMessage = handleError(err)
        set({ error: errorMessage, accountsLoading: false })
      }
    },

    removeError: () => set({ error: undefined }),
  }))
)
