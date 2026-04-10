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
  CreateUserDto,
  CreateUserDtoRole as UserRole,
} from "@/services/generated";

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  formData: CreateUserDto;
  setFormData: (data: CreateUserDto) => void;
  editingUser: any;
  onSubmit: () => Promise<void>;
}

export default function UserFormDialog({
  open,
  onClose,
  formData,
  setFormData,
  editingUser,
  onSubmit,
}: UserFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingUser ? "Edit User" : "Create User"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Full name"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Email address"
            />
          </div>
          {!editingUser && (
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Password"
              />
            </div>
          )}
          <div>
            <Label>Role</Label>
            <Select
              value={formData.role?.toString() ?? UserRole.student.toString()}
              onValueChange={(val) =>
                setFormData({ ...formData, role: Number(val) as UserRole })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Student</SelectItem>
                <SelectItem value="2">Admin</SelectItem>
                <SelectItem value="3">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={formData.phone ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="Phone"
            />
          </div>
          <div>
            <Label>Organization</Label>
            <Input
              value={formData.organization ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, organization: e.target.value })
              }
              placeholder="Organization"
            />
          </div>
            <div>
            <Label>Designation</Label>
            <Input
              value={formData.designation ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, designation: e.target.value })
              }
              placeholder="Designation"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            {editingUser ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
