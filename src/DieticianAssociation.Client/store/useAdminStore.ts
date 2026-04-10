import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { handleError } from './storeUtils'
import {
  AdminDashboardStatsDto,
  getDieticianAssociationAPI,
  UpdateMembershipDto,
  UpdateRoleDto,
} from '../services/generated'

const api = getDieticianAssociationAPI()

interface AdminState {
  // paginatedUserResult?: UserDtoPagedResult
  // user?: UserDto | undefined
  stats?: AdminDashboardStatsDto
  loading: boolean
  error?: string

  fetchStats: () => Promise<void>
  updateUserMembership: (id: string, data: UpdateMembershipDto) => Promise<void>
  updateRole: (id: string, data: UpdateRoleDto) => Promise<void>
  remove: (id: string) => Promise<void>
  removeError: () => void
}

export const useAdminStore = create<AdminState>()(
  devtools((set) => ({
    // paginatedUserResult: undefined,
    // user: undefined,
    stats: undefined,
    loading: false,
    error: undefined,

    fetchStats: async () => {
      set({ loading: true, error: undefined })
      try {
        const result = await api.getApiDashboardStats()
        set({ stats: result.data, loading: false })
      } catch (err) {
        set({ error: handleError(err), loading: false })
      }
    },

    updateUserMembership: async (id, data) => {
      set({ loading: true, error: undefined })
      try {
        await api.putApiAdminUsersUserIdMembership(id, data)
        set({ loading: false })
      } catch (err) {
        set({ error: handleError(err), loading: false })
      }
    },

    updateRole: async (id, data) => {
      set({ loading: true, error: undefined })
      try {
        await api.putApiAdminUsersUserIdRole(id, data)
        set({ loading: false })
      } catch (err) {
        set({ error: handleError(err), loading: false })
      }
    },
    remove: async (id) => {
      set({ loading: true, error: undefined })
      try {
        await api.deleteApiAdminUsersUserId(id)
        set({ loading: false })
      } catch (err) {
        set({ error: handleError(err), loading: false })
      }
    },

    removeError: () => set({ error: undefined }),
  }))
)
