"use client"

import { useEffect, useMemo, useState } from "react"
import useDebounce from "@/hooks/use-debounce"
import { useContactStore } from "@/store/useContactStore"
import FeedbackMessage from "@/components/feedback-message"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Pagination from "../users/Pagination"
import { Eye, Trash2, Mail } from "lucide-react"

const STATUS_OPTIONS = ["new", "in-progress", "resolved", "closed"] as const
const CATEGORY_OPTIONS = [
  "membership",
  "events",
  "resources",
  "technical",
  "billing",
  "general",
] as const

export default function AdminContactMessagesPage() {
  const {
    messages,
    pagedResult,
    loading,
    success,
    message,
    fetchMessages,
    updateStatus,
    deleteMessage,
    clearMessage,
  } = useContactStore()

  // Paging & filters
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>()

  const debouncedSearch = useDebounce(search)
  const debouncedStatus = useDebounce(statusFilter)
  const debouncedCategory = useDebounce(categoryFilter)

  const params = useMemo(() => {
    const filters: Record<string, unknown> = {}
    if (debouncedStatus) filters.status = debouncedStatus
    if (debouncedCategory) filters.category = debouncedCategory

    const p: any = { page, pageSize }
    if (debouncedSearch) p.search = debouncedSearch
    if (Object.keys(filters).length > 0) p.filters = filters
    return p
  }, [page, pageSize, debouncedSearch, debouncedStatus, debouncedCategory])

  useEffect(() => {
    fetchMessages(params)
  }, [fetchMessages, params])

  // Details dialog state
  const [openDetailsId, setOpenDetailsId] = useState<string | null>(null)
  const [statusDraft, setStatusDraft] = useState<string>("new")

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const current = messages.find((m) => String(m.id) === String(openDetailsId))

  useEffect(() => {
    if (current?.status) setStatusDraft(current.status)
  }, [current?.status])

  const renderStatusBadge = (s?: string | null) => {
    const status = (s || "new").toLowerCase()
    const map: Record<string, string> = {
      new: "bg-blue-100 text-blue-800 border-blue-200",
      "in-progress": "bg-amber-100 text-amber-800 border-amber-200",
      resolved: "bg-green-100 text-green-800 border-green-200",
      closed: "bg-gray-100 text-gray-800 border-gray-200",
    }
    const cls = map[status] ?? "bg-slate-100 text-slate-800 border-slate-200"
    return (
      <Badge variant="outline" className={cls}>
        {status}
      </Badge>
    )
  }

  return (
    <div className="w-full px-6 py-8 space-y-6">
      <FeedbackMessage message={message ?? undefined} success={success} onClear={clearMessage} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Contact Messages</h1>
          <p className="mt-1 text-sm text-gray-600">
            Review, update status, and respond to Contact Us messages.
          </p>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Mail className="w-5 h-5" />
          <span className="text-sm">Total: {pagedResult?.totalItems ?? messages.length}</span>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter contact messages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <Input
              placeholder="Search by name, email, subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:max-w-sm"
            />

            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(search || statusFilter || categoryFilter) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("")
                  setStatusFilter(undefined)
                  setCategoryFilter(undefined)
                  setPage(1)
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <CardDescription>List of contact requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-auto rounded-md border">
            <Table className="w-full table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[14rem]">From</TableHead>
                  <TableHead className="w-[18rem]">Email</TableHead>
                  <TableHead className="w-[14rem] hidden md:table-cell">Mobile</TableHead>
                  <TableHead className="w-auto">Subject</TableHead>
                  <TableHead className="w-[10rem] hidden md:table-cell">Category</TableHead>
                  <TableHead className="w-[12rem]">Status</TableHead>
                  <TableHead className="w-[16rem] hidden lg:table-cell">Date</TableHead>
                  <TableHead className="w-[8rem] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6">
                      Loading...
                    </TableCell>
                  </TableRow>
                )}
                {!loading && (!messages || messages.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6">
                      No messages found
                    </TableCell>
                  </TableRow>
                )}
                {!loading &&
                  messages?.map((m) => (
                    <TableRow key={String(m.id)}>
                      <TableCell className="font-medium w-[14rem] whitespace-nowrap">{m.name ?? "—"}</TableCell>
                      <TableCell className="text-sm text-gray-600 w-[18rem] whitespace-nowrap">{m.email ?? "—"}</TableCell>
                      <TableCell className="text-sm text-gray-600 w-[14rem] whitespace-nowrap hidden md:table-cell">{m.mobileNumber ?? "—"}</TableCell>
                      <TableCell className="min-w-0 truncate">{m.subject ?? "—"}</TableCell>
                      <TableCell className="w-[10rem] hidden md:table-cell">
                        <Badge variant="outline">{m.category ?? "—"}</Badge>
                      </TableCell>
                      <TableCell className="w-[12rem]">{renderStatusBadge(m.status)}</TableCell>
                      <TableCell className="text-sm text-gray-600 w-[16rem] whitespace-nowrap hidden lg:table-cell">
                        {m.createdAt ? new Date(m.createdAt).toLocaleString() : "—"}
                      </TableCell>
                      <TableCell className="w-[8rem] text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setOpenDetailsId(String(m.id))}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteId(String(m.id))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          {pagedResult && (
            <div className="mt-4">
              <Pagination
                page={page}
                pageSize={pageSize}
                pagedResult={pagedResult}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details dialog */}
      <Dialog open={!!openDetailsId} onOpenChange={(open) => !open && setOpenDetailsId(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
            <DialogDescription>View and update message status</DialogDescription>
          </DialogHeader>
          {current ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">From</div>
                  <div className="font-medium">{current.name}</div>
                  <div className="text-sm text-gray-600">{current.email}</div>
                  <div className="text-xs text-gray-500 mt-3">Mobile</div>
                  <div className="text-sm text-gray-600">{current.mobileNumber ?? "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Category</div>
                  <div>{current.category}</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Subject</div>
                <div className="font-medium">{current.subject}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Message</div>
                <div className="whitespace-pre-wrap text-sm">{current.message}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                  <div className="text-xs text-gray-500 mb-2">Status</div>
                  <Select value={statusDraft} onValueChange={setStatusDraft}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setOpenDetailsId(null)}>
                    Close
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!openDetailsId) return
                      await updateStatus(openDetailsId, statusDraft)
                      await fetchMessages(params)
                      setOpenDetailsId(null)
                    }}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-gray-600">No message selected</div>
          )}
          <DialogFooter></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete message?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the contact message.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleteId) return
                await deleteMessage(deleteId)
                const result = pagedResult
                const hasItems = (messages ?? []).length > 0
                if (!hasItems && page > 1 && result?.hasPrevious) {
                  const prev = Math.max(1, page - 1)
                  setPage(prev)
                  await fetchMessages({ ...params, page: prev } as any)
                } else {
                  await fetchMessages(params)
                }
                setDeleteId(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
