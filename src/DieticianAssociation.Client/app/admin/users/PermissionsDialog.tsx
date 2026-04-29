"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PermissionDto } from "@/services/generated";

type PermissionMode = "inherit" | "allow" | "deny";

interface PermissionsDialogProps {
  open: boolean;
  onClose: () => void;
  userName?: string;
  permissions: PermissionDto[];
  selections: Record<string, PermissionMode>;
  setSelections: (value: Record<string, PermissionMode>) => void;
  onSubmit: () => Promise<void>;
}

export default function PermissionsDialog({
  open,
  onClose,
  userName,
  permissions,
  selections,
  setSelections,
  onSubmit,
}: PermissionsDialogProps) {
  const groupedPermissions = permissions.reduce<Record<string, PermissionDto[]>>((groups, permission) => {
    const category = permission.category?.trim() || "Other";
    groups[category] = [...(groups[category] ?? []), permission];
    return groups;
  }, {});

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl lg:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Manage Permissions {userName ? `for ${userName}` : ""}</DialogTitle>
        </DialogHeader>

        <div className="max-h-[65vh] space-y-6 overflow-y-auto pr-2">
          {Object.entries(groupedPermissions)
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([category, entries]) => (
              <div key={category} className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{category}</h3>
                  <p className="text-xs text-muted-foreground">Use inherit to rely on membership-plan defaults, allow for a direct grant, and deny for an explicit override.</p>
                </div>

                <div className="space-y-2">
                  {entries
                    .sort((left, right) => (left.name ?? "").localeCompare(right.name ?? ""))
                    .map((permission) => {
                      const key = permission.key ?? "";
                      const currentValue = selections[key] ?? "inherit";

                      return (
                        <div key={key} className="grid gap-3 rounded-lg border border-border px-3 py-3 md:grid-cols-[1fr_180px] md:items-center">
                          <div>
                            <p className="text-sm font-medium text-foreground">{permission.name}</p>
                            <p className="text-xs text-muted-foreground">{permission.description}</p>
                            <p className="mt-1 text-[11px] text-muted-foreground/60">{key}</p>
                          </div>

                          <Select
                            value={currentValue}
                            onValueChange={(value) =>
                              setSelections({
                                ...selections,
                                [key]: value as PermissionMode,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="inherit">Inherit</SelectItem>
                              <SelectItem value="allow">Allow</SelectItem>
                              <SelectItem value="deny">Deny</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>Save Permissions</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
