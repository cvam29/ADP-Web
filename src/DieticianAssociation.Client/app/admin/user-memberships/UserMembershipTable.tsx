import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Eye, Trash2, MailCheck, Mail, KeySquare, AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getMembershipStatusName,
  getMembershipTierName,
} from "@/lib/user-utils";
import { useMembershipStore } from "@/store/useMembershipStore";

interface UserMembershipTableProps {
  userMemberships: any[];
  onStatusChange: (membershipId: string, newStatus: any) => Promise<void>;
  onDelete: (membershipId: string) => Promise<void>;
  onPlanChange: (membershipId: string, membershipPlanId: string) => Promise<void>;
  onPermanentDelete: (membershipId: string) => Promise<void>;
  onPaymentStatusChange: (
    paymentRecordId: string,
    newStatus: number,
  ) => Promise<void>;
}

export default function UserMembershipTable({
  userMemberships,
  onStatusChange,
  onDelete,
  onPlanChange,
  onPermanentDelete,
  onPaymentStatusChange,
}: UserMembershipTableProps) {
  const router = useRouter();
  const { memberships: availablePlans, fetchMemberships } = useMembershipStore();
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    fetchMemberships();
  }, [fetchMemberships]);

  const handleDelete = async (membershipId: string, userName: string) => {
    if (
      confirm(
        `Are you sure you want to delete the membership for ${userName}? This will set the status to Suspended.`,
      )
    ) {
      await onDelete(membershipId);
    }
  };

  const handlePermanentDelete = async () => {
    if (permanentDeleteTarget) {
      await onPermanentDelete(permanentDeleteTarget.id);
      setPermanentDeleteTarget(null);
    }
  };

  return (
    <div className="overflow-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Request ID</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Tier</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead>Email Flags</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {userMemberships?.map((membership) => (
            <TableRow key={membership.id}>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {membership.applicationRequestId || "—"}
              </TableCell>
              <TableCell className="font-medium">
                {membership.userName}
              </TableCell>
              <TableCell>{membership.userEmail}</TableCell>
              <TableCell>{membership.userPhone || "—"}</TableCell>
              <TableCell>
                <Select
                  value={membership.membershipPlanId || ""}
                  onValueChange={(val) => {
                    if (val !== membership.membershipPlanId) {
                      onPlanChange(membership.id, val);
                    }
                  }}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id!}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                {getMembershipTierName(membership.membershipTier)}
              </TableCell>
              <TableCell>
                <Select
                  value={String(membership.status)}
                  onValueChange={(val) => {
                    if (val === "0" && membership.paymentStatus !== 1) {
                      alert(
                        "Please update the Payment Status to 'Verified' before activating the membership.",
                      );
                      return;
                    }
                    onStatusChange(membership.id, { status: Number(val) });
                  }}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Active</SelectItem>
                    <SelectItem value="1">Expired</SelectItem>
                    <SelectItem value="2">Pending</SelectItem>
                    <SelectItem value="3">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                {new Date(membership.startDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {new Date(membership.endDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {new Date(membership.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {membership.paymentFilePath ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      window.open(membership.paymentFilePath, "_blank")
                    }
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                {membership.paymentRecordId ? (
                  <Select
                    value={String(membership.paymentStatus || 0)}
                    onValueChange={(val) =>
                      onPaymentStatusChange(
                        membership.paymentRecordId,
                        Number(val),
                      )
                    }
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Pending</SelectItem>
                      <SelectItem value="1">Verified</SelectItem>
                      <SelectItem value="2">Rejected</SelectItem>
                      <SelectItem value="3">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <span
                    title={membership.confirmationSent ? "Confirmation sent" : "Confirmation not sent"}
                    className={cn(
                      "inline-flex items-center rounded-full p-1",
                      membership.confirmationSent
                        ? "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    <MailCheck className="w-3.5 h-3.5" />
                  </span>
                  <span
                    title={membership.tempPasswordSent ? "Temp password sent" : "Temp password not sent"}
                    className={cn(
                      "inline-flex items-center rounded-full p-1",
                      membership.tempPasswordSent
                        ? "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <span
                    title={membership.requirePasswordReset ? "Password reset required" : "No password reset required"}
                    className={cn(
                      "inline-flex items-center rounded-full p-1",
                      membership.requirePasswordReset
                        ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    <KeySquare className="w-3.5 h-3.5" />
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const url = `/admin/users/view`;
                      window.history.pushState(
                        { userId: membership.userId },
                        "",
                        url,
                      );
                      router.push(url);
                    }}
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      handleDelete(membership.id, membership.userName)
                    }
                    aria-label="Suspend membership"
                    title="Suspend (soft delete)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="bg-red-800 hover:bg-red-900"
                    onClick={() =>
                      setPermanentDeleteTarget({ id: membership.id, name: membership.userName })
                    }
                    aria-label="Permanently delete membership"
                    title="Permanently delete"
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}

          {userMemberships?.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={14}
                className="text-center text-muted-foreground py-8"
              >
                No user memberships found. Adjust your filters or check back
                later.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Permanent Delete Confirmation Dialog */}
      <AlertDialog open={!!permanentDeleteTarget} onOpenChange={(open) => !open && setPermanentDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete Membership</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the membership for <strong>{permanentDeleteTarget?.name}</strong> and all related payment records.
              <br /><br />
              <span className="text-red-600 font-semibold">This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePermanentDelete}
              className="bg-red-800 hover:bg-red-900"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
