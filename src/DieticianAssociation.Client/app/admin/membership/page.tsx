"use client";

import { useState, useEffect, useRef } from "react";
import { useMembershipStore } from "@/store/useMembershipStore";
import { useUserStore } from "@/store/useUsersStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit, Trash2, Plus } from "lucide-react";
import {
  CreateMembershipPlanDto,
  MembershipPlanDto,
  MembershipPlanDtoTier,
  PermissionDto,
} from "@/services/generated";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getMembershipTierName } from "@/lib/user-utils";
import { refreshCurrentUserSession } from "../../../lib/auth-session";

const defaultMembershipPermissions = [
  {
    key: "member.dashboard.access",
    name: "Dashboard Access",
    description: "Allow members to access the main member dashboard.",
  },
  {
    key: "member.directory.access",
    name: "Directory Access",
    description: "Allow members to open the professional directory.",
  },
  {
    key: "member.research.access",
    name: "Research Access",
    description: "Allow members to open the research library section.",
  },
  {
    key: "member.tools.access",
    name: "Tools Access",
    description: "Allow members to use professional tools.",
  },
  {
    key: "member.career.access",
    name: "Career Access",
    description: "Allow members to open the career center.",
  },
  {
    key: "member.certificates.access",
    name: "Certificate Access",
    description: "Allow members to view certificates.",
  },
] satisfies Array<Required<Pick<PermissionDto, "key" | "name" | "description">>>;

function formatPermissionLabel(permissionKey: string): string {
  return permissionKey
    .split(".")
    .filter((segment) => segment !== "member")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function getSortedPermissionKeys(
  permissionKeys: string[],
  permissionDetailsByKey: Map<string, PermissionDto>
): string[] {
  return [...permissionKeys].sort((left, right) => {
    const leftName = permissionDetailsByKey.get(left)?.name ?? formatPermissionLabel(left);
    const rightName = permissionDetailsByKey.get(right)?.name ?? formatPermissionLabel(right);

    return leftName.localeCompare(rightName);
  });
}

export default function MembershipPlansManagement() {
  const {
    memberships,
    fetchMemberships,
    createMembership,
    updateMembership,
    deleteMembership,
  } = useMembershipStore();
  const { permissionCatalog, fetchPermissionCatalog } = useUserStore();

  const [showDialog, setShowDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlanDto | null>(null);
  const [formData, setFormData] = useState<CreateMembershipPlanDto>({
    name: "",
    tier: MembershipPlanDtoTier.student,
    price: 0,
    duration: 1,
    features: [],
    popular: false,
    initialFee: null,
    renewalFee: null,
    discountedPrice: null,
    discountedRenewalFee: null,
    discount: null,
    priceWithGST: null,
    renewalPriceWithGST: null,
    description: "",
    permissionKeys: [],
  });

  const didFetchRef = useRef(false);
  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    fetchMemberships().catch(() => {
      didFetchRef.current = false;
    });
  }, [fetchMemberships]);

  useEffect(() => {
    if (permissionCatalog.length > 0) return;
    fetchPermissionCatalog().catch(() => undefined);
  }, [fetchPermissionCatalog, permissionCatalog.length]);

  const membershipPermissions = (permissionCatalog.length > 0
    ? permissionCatalog.filter((permission) => permission.key?.startsWith("member."))
    : defaultMembershipPermissions
  ).sort((left, right) => (left.name ?? "").localeCompare(right.name ?? ""));

  const permissionDetailsByKey = new Map(
    membershipPermissions.map((permission) => [permission.key ?? "", permission])
  );

  const resetForm = () =>
    setFormData({
      name: "",
      tier: MembershipPlanDtoTier.student,
      price: 0,
      duration: 1,
      features: [],
      popular: false,
      initialFee: null,
      renewalFee: null,
      discountedPrice: null,
      discountedRenewalFee: null,
      discount: null,
      priceWithGST: null,
      renewalPriceWithGST: null,
      description: "",
      permissionKeys: [],
    });

  const openCreateDialog = () => {
    setEditingPlan(null);
    resetForm();
    setShowDialog(true);
  };

  const openEditDialog = (p: MembershipPlanDto) => {
    setEditingPlan(p);
    setFormData({
      name: p.name ?? "",
      tier: p.tier ?? MembershipPlanDtoTier.student,
      price: p.price ?? 0,
      duration: p.duration ?? 1,
      features: p.features ?? [],
      popular: !!p.popular,
      initialFee: p.initialFee ?? null,
      renewalFee: p.renewalFee ?? null,
      discountedPrice: p.discountedPrice ?? null,
      discountedRenewalFee: p.discountedRenewalFee ?? null,
      discount: p.discount ?? null,
      priceWithGST: p.priceWithGST ?? null,
      renewalPriceWithGST: p.renewalPriceWithGST ?? null,
      description: p.description ?? "",
      permissionKeys: p.permissionKeys ?? [],
    });
    setShowDialog(true);
  };

  const togglePermission = (permissionKey: string, checked: boolean) => {
    const currentPermissionKeys = formData.permissionKeys ?? [];
    const nextPermissionKeys = checked
      ? Array.from(new Set([...currentPermissionKeys, permissionKey]))
      : currentPermissionKeys.filter((key) => key !== permissionKey);

    setFormData({
      ...formData,
      permissionKeys: nextPermissionKeys,
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingPlan) {
        await updateMembership(editingPlan.id!, formData);
      } else {
        await createMembership(formData);
      }

      await refreshCurrentUserSession().catch(() => undefined);

      await fetchMemberships();
      setShowDialog(false);
      setEditingPlan(null);
      resetForm();
    } catch (err) {
      // simple error handling — adjust to your toast/logger if needed
      console.error("Failed to save membership plan", err);
      setShowDialog(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    try {
      await deleteMembership(id);
      await fetchMemberships();
    } catch (err) {
      console.error("Failed to delete plan", err);
    }
  };

  return (
    <div className="w-full px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Membership Plans</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create and manage membership plans for your platform.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchMemberships()}>
            Refresh
          </Button>

          {/* Dialog Trigger for Create */}
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Plan
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPlan ? "Edit Plan" : "Create Plan"}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {editingPlan ? "Update the plan details below." : "Fill in details to create a new plan."}
                </p>
              </DialogHeader>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <Label>Name</Label>
                  <Input
                    value={formData.name ?? ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Plan name (e.g., Student)"
                  />
                </div>

                {/* Tier */}
                <div>
                  <Label>Tier</Label>
                  <Select
                    value={String(formData.tier ?? MembershipPlanDtoTier.student)}
                    onValueChange={(val) =>
                      setFormData({ ...formData, tier: Number(val) as MembershipPlanDtoTier })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={MembershipPlanDtoTier.student.toString()}>Student</SelectItem>
                      <SelectItem value={MembershipPlanDtoTier.professional.toString()}>Professional</SelectItem>
                      <SelectItem value={MembershipPlanDtoTier.premium.toString()}>Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price */}
                <div>
                  <Label>Price (₹)</Label>
                  <Input
                    type="number"
                    value={formData.price ?? 0}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    min={0}
                  />
                </div>

                {/* Duration */}
                <div>
                  <Label>Duration (months)</Label>
                  <Input
                    type="number"
                    value={formData.duration ?? 1}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    min={1}
                  />
                </div>

                {/* Initial Fee */}
                <div>
                  <Label>Initial Fee</Label>
                  <Input
                    type="number"
                    value={formData.initialFee ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, initialFee: e.target.value ? Number(e.target.value) : null })
                    }
                  />
                </div>

                {/* Renewal Fee */}
                <div>
                  <Label>Renewal Fee</Label>
                  <Input
                    type="number"
                    value={formData.renewalFee ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, renewalFee: e.target.value ? Number(e.target.value) : null })
                    }
                  />
                </div>

                {/* Discount */}
                <div>
                  <Label>Discount (%)</Label>
                  <Input
                    value={formData.discount ?? ""}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    placeholder="Optional"
                  />
                </div>

                {/* Discounted Price */}
                <div>
                  <Label>Discounted Price</Label>
                  <Input
                    type="number"
                    value={formData.discountedPrice ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, discountedPrice: e.target.value ? Number(e.target.value) : null })
                    }
                  />
                </div>

                {/* Discounted Renewal Fee */}
                <div>
                  <Label>Discounted Renewal Fee</Label>
                  <Input
                    type="number"
                    value={formData.discountedRenewalFee ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountedRenewalFee: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                  />
                </div>

                {/* Price with GST */}
                <div>
                  <Label>Price with GST</Label>
                  <Input
                    type="number"
                    value={formData.priceWithGST ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, priceWithGST: e.target.value ? Number(e.target.value) : null })
                    }
                  />
                </div>

                {/* Renewal Price with GST */}
                <div>
                  <Label>Renewal Price with GST</Label>
                  <Input
                    type="number"
                    value={formData.renewalPriceWithGST ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        renewalPriceWithGST: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <Label>Description</Label>
                  <Input
                    value={formData.description ?? ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Short plan description"
                  />
                </div>

                {/* Features */}
                <div className="sm:col-span-2">
                  <Label>Features (comma separated)</Label>
                  <Input
                    value={formData.features?.join(", ") ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        features: e.target.value
                          .split(",")
                          .map((f) => f.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="e.g., Access to resources, Priority support"
                  />
                </div>

                {/* Popular */}
                <div className="sm:col-span-2 flex items-center gap-3 mt-2">
                  <Checkbox
                    checked={formData.popular}
                    onCheckedChange={(checked) => setFormData({ ...formData, popular: !!checked })}
                  />
                  <Label>Mark as Popular</Label>
                </div>

                <div className="sm:col-span-2 space-y-3 rounded-lg border p-4">
                  <div>
                    <Label>Member Permissions</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Select which member dashboard features become available when this plan is active.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {membershipPermissions.map((permission) => {
                      const permissionKey = permission.key ?? "";
                      const isChecked = (formData.permissionKeys ?? []).includes(permissionKey);

                      return (
                        <label
                          key={permissionKey}
                          className="flex items-start gap-3 rounded-md border p-3 cursor-pointer"
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => togglePermission(permissionKey, !!checked)}
                          />
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {permission.description || permissionKey}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <div className="flex w-full justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit}>{editingPlan ? "Update" : "Create"}</Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table block */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Plans List</CardTitle>
          <CardDescription>All membership plans available in the system</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-auto rounded-md border">
            <Table>
              <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Popular</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberships.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{getMembershipTierName(p.tier ?? MembershipPlanDtoTier.student)}</TableCell>
                  <TableCell>₹{p.price}</TableCell>
                 <TableCell>
  {p?.duration ? Math.floor(p.duration / 12) : 0} years
</TableCell>

                  <TableCell>{p.popular ? "✅" : "—"}</TableCell>
                  <TableCell className="min-w-[300px] max-w-[360px] align-top">
                    {p.permissionKeys && p.permissionKeys.length > 0 ? (
                      <TooltipProvider delayDuration={150}>
                        {(() => {
                          const sortedPermissionKeys = getSortedPermissionKeys(
                            p.permissionKeys,
                            permissionDetailsByKey
                          );
                          const visiblePermissionKeys = sortedPermissionKeys.slice(0, 3);
                          const hiddenPermissionKeys = sortedPermissionKeys.slice(3);

                          return (
                            <div className="space-y-2 py-1">
                              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                {sortedPermissionKeys.length} enabled
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {visiblePermissionKeys.map((permissionKey) => {
                                  const permission = permissionDetailsByKey.get(permissionKey);
                                  const permissionName = permission?.name ?? formatPermissionLabel(permissionKey);
                                  const permissionDescription = permission?.description ?? permissionKey;

                                  return (
                                    <Tooltip key={permissionKey}>
                                      <TooltipTrigger asChild>
                                        <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900">
                                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                          <span className="truncate">{permissionName}</span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-[260px] text-xs leading-relaxed">
                                        <p className="font-medium text-slate-900">{permissionName}</p>
                                        <p className="mt-1 text-slate-600">{permissionDescription}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  );
                                })}

                                {hiddenPermissionKeys.length > 0 && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge
                                        variant="outline"
                                        className="cursor-default rounded-full border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                                      >
                                        +{hiddenPermissionKeys.length} more
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[280px] text-xs leading-relaxed">
                                      <div className="space-y-1.5">
                                        {hiddenPermissionKeys.map((permissionKey) => {
                                          const permission = permissionDetailsByKey.get(permissionKey);
                                          const permissionName = permission?.name ?? formatPermissionLabel(permissionKey);

                                          return (
                                            <div key={permissionKey} className="flex items-center gap-2 text-slate-700">
                                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                              <span>{permissionName}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </TooltipProvider>
                    ) : (
                      <span className="text-sm text-muted-foreground">No member access assigned</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[320px] truncate">{p.description}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(p)}
                        aria-label="Edit plan"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(p.id!)}
                        aria-label="Delete plan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {memberships.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                    No membership plans found. Create the first plan to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
