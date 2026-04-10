"use client";
import { useEffect, useState, useCallback } from "react";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { useEmailStore } from "@/store/useEmailStore";
import { SentEmailDto } from "@/services/generated";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye, RefreshCw, Loader2 } from "lucide-react";
import useDebounce from "@/hooks/use-debounce";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

function formatEmailDate(dateSent?: string | null) {
  return dateSent ? new Date(dateSent).toLocaleString() : "-";
}

export default function OutboxPage() {
  const {
    outboxEmails,
    outboxPagedResult,
    outboxLoading,
    fetchOutbox,
    fetchOutboxEmailDetail,
    accounts,
    fetchAccounts,
  } = useEmailStore();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedEmail, setSelectedEmail] = useState<SentEmailDto | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [emailDetailLoading, setEmailDetailLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const loadOutbox = useCallback(() => {
    fetchOutbox({
      page,
      pageSize,
      search: debouncedSearch || undefined,
      sortBy: "date",
      sortDirection: "desc",
    }, selectedAccount === "all" ? undefined : selectedAccount);
  }, [fetchOutbox, page, pageSize, debouncedSearch, selectedAccount]);

  const handleRefresh = useCallback(() => {
    fetchOutbox({
      page,
      pageSize,
      search: debouncedSearch || undefined,
      sortBy: "date",
      sortDirection: "desc",
    }, selectedAccount === "all" ? undefined : selectedAccount, true);
  }, [fetchOutbox, page, pageSize, debouncedSearch, selectedAccount]);

  const handleEmailPreview = useCallback(
    async (email: SentEmailDto) => {
      setSelectedEmail(email);
      setEmailDetailLoading(true);

      const detailedEmail = await fetchOutboxEmailDetail(
        email.id ?? "",
        selectedAccount === "all" ? undefined : selectedAccount,
      );

      if (detailedEmail) {
        setSelectedEmail(detailedEmail);
      }

      setEmailDetailLoading(false);
    },
    [fetchOutboxEmailDetail, selectedAccount],
  );

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    loadOutbox();
  }, [loadOutbox]);

  return (
    <div className="w-full px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Email Outbox
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            View all sent emails from the system via IMAP.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={outboxLoading}
          className="flex items-center gap-2"
        >
          {outboxLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter emails by subject, recipient, or account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by subject or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            {accounts.length > 0 && (
              <Select
                value={selectedAccount}
                onValueChange={(value) => {
                  setSelectedAccount(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Filter by account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account} value={account}>
                      {account}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Sent Emails</CardTitle>
          <CardDescription>
            {outboxPagedResult
              ? `${outboxPagedResult.totalItems} total emails`
              : "Loading..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {outboxLoading && outboxEmails.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : (
            <>
              <div className="overflow-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px] hidden sm:table-cell">Date</TableHead>
                      <TableHead className="w-[200px]">From</TableHead>
                      <TableHead className="w-[200px]">To</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead className="text-right w-[100px]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outboxEmails.map((email: any) => (
                      <TableRow key={email.id}>
                        <TableCell className="text-sm text-gray-600 hidden sm:table-cell">
                          {formatEmailDate(email.dateSent)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              email.fromAddress?.includes("info@")
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : email.fromAddress?.includes("admin@")
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : "bg-gray-50 text-gray-700 border-gray-200"
                            }
                          >
                            {email.fromAddress}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {email.toAddress}
                        </TableCell>
                        <TableCell className="text-sm">
                          {email.subject}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void handleEmailPreview(email)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {outboxEmails.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-gray-500 py-8"
                        >
                          {outboxLoading
                            ? "Loading emails..."
                            : "No sent emails found."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {outboxPagedResult && (
                <DataTablePagination
                  currentPage={outboxPagedResult.page ?? page}
                  totalPages={outboxPagedResult.totalPages ?? 0}
                  pageSize={pageSize}
                  totalItems={outboxPagedResult.totalItems ?? 0}
                  hasNextPage={outboxPagedResult.hasNext ?? false}
                  hasPreviousPage={outboxPagedResult.hasPrevious ?? false}
                  onPageChange={setPage}
                  onPageSizeChange={(nextPageSize) => {
                    setPageSize(nextPageSize);
                    setPage(1);
                  }}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Email Preview Dialog */}
      <Dialog
        open={!!selectedEmail}
        onOpenChange={(open) => !open && setSelectedEmail(null)}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {selectedEmail?.subject}
            </DialogTitle>
            <div className="text-sm text-gray-500 space-y-1 mt-2">
              <p>
                <strong>From:</strong> {selectedEmail?.fromAddress}
              </p>
              <p>
                <strong>To:</strong> {selectedEmail?.toAddress}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {selectedEmail ? formatEmailDate(selectedEmail.dateSent) : ""}
              </p>
            </div>
          </DialogHeader>
          <div className="border rounded-lg p-4 mt-4 bg-gray-50">
            {emailDetailLoading ? (
              <div className="flex items-center justify-center py-12 text-gray-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading email content...
              </div>
            ) : (
              <div
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(selectedEmail?.bodyHtml || ""),
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
