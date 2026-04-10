"use client";
import { useEffect, useState } from "react";
import { useUserStore } from "@/store/useUsersStore";
import { useMembershipStore } from "@/store/useMembershipStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import FeedbackMessage from "@/components/feedback-message";
import UserFormDialog from "./UserFormDialog";
import UserFilters from "./UserFilters";
import UserTable from "./UserTable";
import Pagination from "./Pagination";
import MembershipDialog from "./MembershipDialog";
import TempPasswordDialog from "./TempPasswordDialog";
import PermissionsDialog from "./PermissionsDialog";
import useDebounce from "@/hooks/use-debounce";
import { useAuthStore } from "@/store/useAuthStore";
import { useAuth } from "@/contexts/auth-context";
import { refreshCurrentUserSession } from "../../../lib/auth-session";
import {
  CreateUserDto,
  CreateUserDtoRole as UserRole,
  PermissionDto,
  UpdateMembershipDto,
  UpdateMembershipDtoStatus,
} from "@/services/generated";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

type PermissionMode = "inherit" | "allow" | "deny";

type DateFilter =
  | "all"
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_30_days"
  | "last_3_months"
  | "last_6_months"
  | "last_1_year";

export default function UsersManagement() {
  const {
    users,
    pagedResult,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    permanentDeleteUser,
    updateStatus,
    updateRole,
    fetchPermissionCatalog,
    fetchUserPermissions,
    updateUserPermissions,
    permissionCatalog,
    updateUserMembership,
    setTemporaryPassword,
    success,
    message,
    clearMessage,
  } = useUserStore();

  const { memberships, fetchMemberships } = useMembershipStore();
  const { startViewAs } = useAuth();
  const router = useRouter();
  const currentAuthUser = useAuthStore((state) => state.user);
  const syncCurrentUser = useAuthStore((state) => state.syncCurrentUser);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>();
  const [dateFilter, setDateFilter] = useState<DateFilter | undefined>();

  const debouncedSearch = useDebounce(search);
  const debouncedRole = useDebounce(roleFilter);
  const debouncedStatus = useDebounce(statusFilter);
  const debouncedDate = useDebounce(dateFilter);

  const [showUserDialog, setShowUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState<CreateUserDto>({
    name: "",
    email: "",
    password: "",
    role: UserRole.student,
    phone: "",
    organization: "",
  });

  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showTempPasswordModal, setShowTempPasswordModal] = useState(false);
  const [passwordTargetUser, setPasswordTargetUser] = useState<any>(null);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [permissionTargetUser, setPermissionTargetUser] = useState<any>(null);
  const [permissionSelections, setPermissionSelections] = useState<Record<string, PermissionMode>>({});
  const [membershipForm, setMembershipForm] = useState<UpdateMembershipDto>({
    membershipPlanId: null,
    status: UpdateMembershipDtoStatus.active,
    startDate: new Date().toISOString().split("T")[0],
  });

  const refreshUsers = async () => {
    await fetchUsers({
      page,
      pageSize,
      search: debouncedSearch,
      filters: {
        ...(debouncedRole ? { role: debouncedRole } : {}),
        ...(debouncedStatus !== undefined ? { isActive: debouncedStatus } : {}),
        ...(debouncedDate && debouncedDate !== "all"
          ? { dateRange: debouncedDate }
          : {}),
      },
    });
  };

  useEffect(() => {
    fetchMemberships();
  }, [fetchMemberships]);

  useEffect(() => {
    refreshUsers();
  }, [
    page,
    pageSize,
    debouncedSearch,
    debouncedRole,
    debouncedStatus,
    debouncedDate,
    fetchUsers,
  ]);

  const hydratePermissionSelections = (catalog: PermissionDto[], allowed: string[] = [], denied: string[] = []) => {
    const nextSelections = Object.fromEntries(
      catalog
        .map((permission) => permission.key)
        .filter((key): key is string => Boolean(key))
        .map((key) => {
          if (allowed.includes(key)) {
            return [key, "allow"];
          }

          if (denied.includes(key)) {
            return [key, "deny"];
          }

          return [key, "inherit"];
        }),
    ) as Record<string, PermissionMode>;

    setPermissionSelections(nextSelections);
  };

  return (
    <div className="w-full px-6 py-8 space-y-6">
      <FeedbackMessage
        message={message ?? undefined}
        success={success}
        onClear={clearMessage}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Users Management
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage users, their roles, and memberships in the system.
          </p>
        </div>
        <Button
          onClick={() => setShowUserDialog(true)}
          className="flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Refine your search by role, status, or keyword
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserFilters
            search={search}
            setSearch={setSearch}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            setDateFilter={setDateFilter}
            clearFilters={() => {
              setSearch("");
              setRoleFilter(undefined);
              setStatusFilter(undefined);
              setPage(1);
            }}
          />
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            List of all users with their details
          </CardDescription>
        </CardHeader>

        {/* CardContent WITHOUT overflow-x-scroll */}
        <CardContent>
          <div className="w-full overflow-x-auto">
            <UserTable
              users={users}
              onEdit={(user, form) => {
                setEditingUser(user);
                setFormData(form);
                setShowUserDialog(true);
              }}
              onDelete={deleteUser}
              onPermanentDelete={permanentDeleteUser}
              onStatusChange={async (userId, newStatus) => {
                await updateStatus(userId, newStatus);
                await refreshUsers();
              }}
              onRoleChange={async (userId, newRole) => {
                await updateRole(userId, newRole);
                await refreshUsers();
              }}
              onAssignMembership={(user) => {
                setSelectedUser(user);
                setMembershipForm({
                  membershipPlanId: user.membershipPlanId ?? null,
                  status: UpdateMembershipDtoStatus.active,
                  startDate: new Date().toISOString().split("T")[0],
                });
                setShowMembershipModal(true);
              }}
              onResetPassword={(user) => {
                setPasswordTargetUser(user);
                setShowTempPasswordModal(true);
              }}
              onManagePermissions={async (user) => {
                const catalog = permissionCatalog.length > 0
                  ? permissionCatalog
                  : await fetchPermissionCatalog();

                const result = await fetchUserPermissions(user.id);

                hydratePermissionSelections(
                  catalog,
                  result?.allowedPermissions ?? [],
                  result?.deniedPermissions ?? [],
                );

                setPermissionTargetUser(user);
                setShowPermissionsDialog(true);
              }}
              onViewAs={async (user) => {
                if (!user?.id) return;

                const success = await startViewAs(user.id);
                if (!success) {
                  return;
                }

                router.push("/dashboard");
              }}
            />
          </div>

          {/* Pagination stays OUTSIDE scroll wrapper */}
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

      {/* User Form Dialog */}
      <UserFormDialog
        open={showUserDialog}
        onClose={() => {
          setShowUserDialog(false);
          setEditingUser(null);
        }}
        formData={formData}
        setFormData={setFormData}
        editingUser={editingUser}
        onSubmit={async () => {
          if (editingUser) {
            await updateUser(editingUser.id, formData);
          } else {
            await createUser(formData);
          }
          await refreshUsers();
          setShowUserDialog(false);
          setEditingUser(null);
        }}
      />

      {/* Membership Dialog */}
      <MembershipDialog
        open={showMembershipModal}
        onClose={() => setShowMembershipModal(false)}
        memberships={memberships}
        membershipForm={membershipForm}
        setMembershipForm={setMembershipForm}
        onSubmit={async () => {
          if (!selectedUser) return;
          await updateUserMembership(selectedUser.id, membershipForm);
          await refreshUsers();
          setShowMembershipModal(false);
          setSelectedUser(null);
        }}
      />

      <PermissionsDialog
        open={showPermissionsDialog}
        onClose={() => {
          setShowPermissionsDialog(false);
          setPermissionTargetUser(null);
        }}
        userName={permissionTargetUser?.name}
        permissions={permissionCatalog}
        selections={permissionSelections}
        setSelections={setPermissionSelections}
        onSubmit={async () => {
          if (!permissionTargetUser?.id) return;

          const allowedPermissions = Object.entries(permissionSelections)
            .filter(([, value]) => value === "allow")
            .map(([key]) => key);
          const deniedPermissions = Object.entries(permissionSelections)
            .filter(([, value]) => value === "deny")
            .map(([key]) => key);

          const updatedPermissions = await updateUserPermissions(permissionTargetUser.id, {
            allowedPermissions,
            deniedPermissions,
          });

          if (currentAuthUser?.id === permissionTargetUser.id && updatedPermissions?.effectivePermissions) {
            await refreshCurrentUserSession().catch(() => {
              const nextUser = {
                ...currentAuthUser,
                effectivePermissions: updatedPermissions.effectivePermissions,
              };

              syncCurrentUser(nextUser);
            });
          }

          await refreshUsers();
          setShowPermissionsDialog(false);
          setPermissionTargetUser(null);
        }}
      />

      <TempPasswordDialog
        open={showTempPasswordModal}
        onClose={() => {
          setShowTempPasswordModal(false);
          setPasswordTargetUser(null);
        }}
        userName={passwordTargetUser?.name}
        userEmail={passwordTargetUser?.email}
        onSubmit={async ({
          temporaryPassword,
          sendEmail,
          bccSupport,
          supportEmail,
        }) => {
          if (!passwordTargetUser?.id) return;

          await setTemporaryPassword(passwordTargetUser.id, {
            temporaryPassword,
            sendEmail,
            bccSupport,
            supportEmail,
            requirePasswordReset: true,
          });
        }}
      />
    </div>
  );
}
