"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Edit,
  Trash2,
  Ticket,
  ChevronDown,
  ChevronUp,
  Eye,
  KeyRound,
  LayoutDashboard,
  ShieldCheck,
  Mail,
  MailCheck,
  KeySquare,
} from "lucide-react";
import type { UpdateRoleDtoRole } from "@/services/generated";
import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UserTableProps {
  users: any[];
  onEdit: (user: any, form: any) => void;
  onDelete: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onStatusChange: (id: string, dto: any) => void;
  onRoleChange: (id: string, role: { role: UpdateRoleDtoRole }) => void;
  onAssignMembership: (user: any) => void;
  onResetPassword: (user: any) => void;
  onManagePermissions: (user: any) => void;
  onViewAs: (user: any) => void;
}

export default function UserTable({
  users,
  onEdit,
  onDelete,
  onPermanentDelete,
  onStatusChange,
  onRoleChange,
  onAssignMembership,
  onResetPassword,
  onManagePermissions,
  onViewAs,
}: UserTableProps) {
  const router = useRouter();
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [permanentDeleteUserId, setPermanentDeleteUserId] = useState<string | null>(null);
  const [openPermanentDeleteDialog, setOpenPermanentDeleteDialog] = useState(false);

  const handleDeleteClick = (id: string) => {
    setDeleteUserId(id);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (deleteUserId) {
      onDelete(deleteUserId);
    }
    setOpenDeleteDialog(false);
    setDeleteUserId(null);
  };

  const handlePermanentDeleteClick = (id: string) => {
    setPermanentDeleteUserId(id);
    setOpenPermanentDeleteDialog(true);
  };

  const handleConfirmPermanentDelete = () => {
    if (permanentDeleteUserId) {
      onPermanentDelete(permanentDeleteUserId);
    }
    setOpenPermanentDeleteDialog(false);
    setPermanentDeleteUserId(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      <Table className="border-collapse table-auto">
        <TableHeader className="bg-secondary/50">
          <TableRow>
            <TableHead className="w-[160px]">Name</TableHead>
            <TableHead className="w-[220px]">Email</TableHead>
            <TableHead className="w-[140px]">Role</TableHead>
            <TableHead className="w-[140px] hidden md:table-cell">Phone</TableHead>
            <TableHead className="w-[220px] hidden lg:table-cell">Membership</TableHead>
            <TableHead className="w-[140px] whitespace-nowrap hidden md:table-cell">Email Flags</TableHead>
            <TableHead className="w-[120px] whitespace-nowrap hidden lg:table-cell">Status</TableHead>
            <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map((user) => {
            const membership = user?.membership ?? {};
            const memStatus = membership?.status ?? null;
            const memTier = membership?.tier ?? null;
            const memName = membership?.name ?? null;
            const isActiveMembership = memStatus === "Active";
            const expired =
              membership?.expirationDate &&
              new Date(membership.expirationDate) < new Date();
            const isExpanded = expandedRows[user.id];
            const canViewAs = user.roleId !== 1 && user.roleId !== 2;

            return (
              <TableRow key={user.id} className="hover:bg-secondary/40">
                {/* Name */}
                <TableCell className="font-medium whitespace-nowrap">
                  {user.name ?? "—"}
                </TableCell>

                {/* Email */}
                <TableCell className="text-sm text-muted-foreground truncate max-w-[220px]">
                  {user.email ?? "—"}
                </TableCell>

                {/* Role */}
                <TableCell className="whitespace-nowrap">
                  <Select
                    value={String(user.roleId ?? 0)}
                    onValueChange={(val) =>
                      onRoleChange(user.id, {
                        role: Number(val) as UpdateRoleDtoRole,
                      })
                    }
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Student</SelectItem>
                      <SelectItem value="2">Admin</SelectItem>
                      <SelectItem value="3">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>

                {/* Phone */}
                <TableCell className="text-sm whitespace-nowrap hidden md:table-cell">
                  {user.phone ?? "—"}
                </TableCell>

                {/* Membership (Expandable) */}
                <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                  {membership && memStatus ? (
                    <div className="flex flex-col gap-1">
                      {/* Header Row (Tier + Status + Toggle) */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "px-2 py-0.5 rounded text-xs",
                              isActiveMembership
                                ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
                                : "bg-secondary text-muted-foreground border-border",
                            )}
                          >
                            {memName ?? "—"}
                          </Badge>

                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-medium",
                              memStatus === "Active" &&
                                "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
                              memStatus === "Pending" &&
                                "bg-secondary text-muted-foreground",
                              (memStatus === "Expired" || expired) &&
                                "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
                            )}
                          >
                            {memStatus}
                          </span>
                        </div>

                        <button
                          onClick={() => toggleExpand(user.id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-1 rounded-md bg-secondary p-2 text-xs text-muted-foreground border border-border">
                          <div>
                            <span className="font-medium text-foreground">Joined:</span>{" "}
                            {membership.joinDate
                              ? new Date(
                                  membership.joinDate,
                                ).toLocaleDateString()
                              : "—"}
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Expires:</span>{" "}
                            {membership.expirationDate
                              ? new Date(
                                  membership.expirationDate,
                                ).toLocaleDateString()
                              : "—"}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground/60 italic">No Membership</span>
                  )}
                </TableCell>

                {/* Email Flags */}
                <TableCell className="whitespace-nowrap hidden md:table-cell">
                  <div className="flex items-center gap-1.5">
                    <span
                      title={user.confirmationSent ? "Confirmation sent" : "Confirmation not sent"}
                      className={cn(
                        "inline-flex items-center rounded-full p-1",
                        user.confirmationSent
                          ? "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400"
                          : "bg-secondary text-muted-foreground"
                      )}
                    >
                      <MailCheck className="w-3.5 h-3.5" />
                    </span>
                    <span
                      title={user.tempPasswordSent ? "Temp password sent" : "Temp password not sent"}
                      className={cn(
                        "inline-flex items-center rounded-full p-1",
                        user.tempPasswordSent
                          ? "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
                          : "bg-secondary text-muted-foreground"
                      )}
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </span>
                    <span
                      title={user.requirePasswordReset ? "Password reset required" : "No password reset required"}
                      className={cn(
                        "inline-flex items-center rounded-full p-1",
                        user.requirePasswordReset
                          ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
                          : "bg-secondary text-muted-foreground"
                      )}
                    >
                      <KeySquare className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </TableCell>

                {/* User Status Switch */}
                <TableCell className="whitespace-nowrap hidden lg:table-cell">
                  <Switch
                    checked={!!user.isActive}
                    onCheckedChange={(checked) =>
                      onStatusChange(user.id, { isActive: checked })
                    }
                  />
                </TableCell>

                {/* Actions */}
                <TableCell className="whitespace-nowrap">
                  <div className="flex justify-end gap-2 whitespace-nowrap">
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      onClick={() => onAssignMembership(user)}
                    >
                      <Ticket className="w-4 h-4 mr-1" /> Assign
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      onClick={() => onManagePermissions(user)}
                      title="Manage permissions"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      onClick={() => onResetPassword(user)}
                      title="Set temporary password"
                    >
                      <KeyRound className="w-4 h-4" />
                    </Button>

                    {canViewAs ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0"
                        onClick={() => onViewAs(user)}
                        title="View this member dashboard"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                      </Button>
                    ) : null}

                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      onClick={() =>
                        onEdit(user, {
                          name: user.name,
                          email: user.email,
                          password: "",
                          role: user.roleId,
                          phone: user.phone ?? "",
                          organization: user.organization ?? "",
                          designation: user.designation ?? "",
                        })
                      }
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      onClick={() => {
                        const url = `/admin/users/view`;
                        window.history.pushState({ userId: user.id }, "", url);
                        router.push(url);
                      }}
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    {/* <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(user.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button> */}
                    <Button
                      size="sm"
                      variant="destructive"
                      className="shrink-0"
                      onClick={() => handleDeleteClick(user.id)}
                      title="Soft delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="shrink-0 bg-red-800 hover:bg-red-900"
                            onClick={() => handlePermanentDeleteClick(user.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="text-[10px] font-bold">!</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Permanently delete user and all data</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              This will soft-delete the user. The user can be restored later
              by an admin.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={openPermanentDeleteDialog} onOpenChange={setOpenPermanentDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              This action <strong>cannot be undone</strong>. This will permanently
              delete the user and remove all associated data including memberships,
              addresses, education records, payment records, and permissions.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPermanentDelete}
              className="bg-red-800 hover:bg-red-900"
            >
              Permanently Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
