"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";

interface TempPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  userName?: string | null;
  userEmail?: string | null;
  onSubmit: (data: {
    temporaryPassword: string;
    sendEmail: boolean;
    bccSupport: boolean;
    supportEmail?: string;
  }) => Promise<void>;
}

const generateTempPassword = () => {
  const randomPart = Math.random().toString(36).slice(-8);
  return `Adp@${randomPart}`;
};

export default function TempPasswordDialog({
  open,
  onClose,
  userName,
  userEmail,
  onSubmit,
}: TempPasswordDialogProps) {
  const [temporaryPassword, setTemporaryPassword] = useState(generateTempPassword());
  const [sendEmail, setSendEmail] = useState(true);
  const [bccSupport, setBccSupport] = useState(true);
  const [supportEmail, setSupportEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const handleClose = () => {
    setTemporaryPassword(generateTempPassword());
    setSendEmail(true);
    setBccSupport(true);
    setSupportEmail("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!temporaryPassword.trim()) {
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        temporaryPassword: temporaryPassword.trim(),
        sendEmail,
        bccSupport,
        supportEmail: supportEmail.trim() || undefined,
      });
      handleClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Temporary Password</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{userName || "Selected user"}</p>
            <p>{userEmail || "No email available"}</p>
          </div>

          <div>
            <Label>Temporary Password</Label>
            <Input
              type="text"
              value={temporaryPassword}
              onChange={(event) => setTemporaryPassword(event.target.value)}
              placeholder="Enter temporary password"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="sendEmail"
              checked={sendEmail}
              onCheckedChange={(checked) => setSendEmail(Boolean(checked))}
            />
            <Label htmlFor="sendEmail" className="cursor-pointer">
              Send temporary password by email
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="bccSupport"
              checked={bccSupport}
              onCheckedChange={(checked) => setBccSupport(Boolean(checked))}
            />
            <Label htmlFor="bccSupport" className="cursor-pointer">
              BCC support
            </Label>
          </div>

          {bccSupport && (
            <div>
              <Label>Support Email (optional)</Label>
              <Input
                type="email"
                value={supportEmail}
                onChange={(event) => setSupportEmail(event.target.value)}
                placeholder="support@example.com"
              />
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            User will be asked to reset password on first login.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !temporaryPassword.trim()}>
            {saving ? "Updating..." : "Update Password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
