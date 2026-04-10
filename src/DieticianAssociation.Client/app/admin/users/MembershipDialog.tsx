"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  UpdateMembershipDto,
  UpdateMembershipDtoStatus,
  MembershipPlanDto,
} from "@/services/generated";

interface MembershipDialogProps {
  open: boolean;
  onClose: () => void;
  memberships: MembershipPlanDto[];
  membershipForm: UpdateMembershipDto;
  setMembershipForm: (form: UpdateMembershipDto) => void;
  onSubmit: () => Promise<void>;
}

export default function MembershipDialog({
  open,
  onClose,
  memberships,
  membershipForm,
  setMembershipForm,
  onSubmit,
}: MembershipDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Membership</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Membership Plan</Label>
            <Select
              value={membershipForm.membershipPlanId ?? ""}
              onValueChange={(val) =>
                setMembershipForm({
                  ...membershipForm,
                  membershipPlanId: val || null,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectItem value="">None</SelectItem> */}
                {memberships.map((m) => (
                  <SelectItem key={m.id} value={m.id ?? ""}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Status</Label>
            <Select
              value={String(
                membershipForm.status ?? UpdateMembershipDtoStatus.active
              )}
              onValueChange={(val) =>
                setMembershipForm({
                  ...membershipForm,
                  status: Number(val) as UpdateMembershipDtoStatus,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={String(UpdateMembershipDtoStatus.active)}>
                  Active
                </SelectItem>
                <SelectItem value={String(UpdateMembershipDtoStatus.expired)}>
                  Expired
                </SelectItem>
                <SelectItem value={String(UpdateMembershipDtoStatus.pending)}>
                  Pending
                </SelectItem>
                <SelectItem value={String(UpdateMembershipDtoStatus.suspended)}>
                  Suspended
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Start Date</Label>
            <Input
              type="date"
              value={membershipForm.startDate ?? ""}
              onChange={(e) =>
                setMembershipForm({
                  ...membershipForm,
                  startDate: e.target.value,
                })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
