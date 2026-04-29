"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ADPSpinner } from "@/components/ui/adp-spinner";
import { useAuth } from "@/contexts/auth-context";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { user, loading, mustResetPassword, changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});

  useEffect(() => {
    if (loading) return;
  }, [loading, router]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    const errors: { current?: string; new?: string; confirm?: string } = {};

    if (!currentPassword) {
      errors.current = "Current password is required.";
    }
    if (!newPassword) {
      errors.new = "New password is required.";
    } else if (newPassword.length < 12) {
      errors.new = "New password must be at least 12 characters long.";
    }
    if (!confirmPassword) {
      errors.confirm = "Please confirm your new password.";
    } else if (newPassword && confirmPassword !== newPassword) {
      errors.confirm = "Confirm password must match the new password.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setSubmitting(true);
    try {
      if (!user) {
        setError("Please log in first to update your password.");
        return;
      }

      const success = await changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword: confirmPassword,
      });

      if (!success) {
        return;
      }

      router.push("/login");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ADPSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              Please sign in first, then reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            {mustResetPassword
              ? "You must update your password before continuing."
              : "Update your password."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(event) => {
                  setCurrentPassword(event.target.value);
                  if (fieldErrors.current) setFieldErrors((prev) => ({ ...prev, current: undefined }));
                }}
                aria-invalid={!!fieldErrors.current}
                aria-describedby={fieldErrors.current ? "currentPassword-error" : undefined}
                className={fieldErrors.current ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {fieldErrors.current && (
                <p id="currentPassword-error" className="text-sm text-red-600">{fieldErrors.current}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value);
                  if (fieldErrors.new) setFieldErrors((prev) => ({ ...prev, new: undefined }));
                }}
                aria-invalid={!!fieldErrors.new}
                aria-describedby={fieldErrors.new ? "newPassword-error" : "newPassword-hint"}
                className={fieldErrors.new ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {fieldErrors.new ? (
                <p id="newPassword-error" className="text-sm text-red-600">{fieldErrors.new}</p>
              ) : (
                <p id="newPassword-hint" className="text-xs text-muted-foreground">Must be at least 12 characters.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  if (fieldErrors.confirm) setFieldErrors((prev) => ({ ...prev, confirm: undefined }));
                }}
                aria-invalid={!!fieldErrors.confirm}
                aria-describedby={fieldErrors.confirm ? "confirmPassword-error" : undefined}
                className={fieldErrors.confirm ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {fieldErrors.confirm && (
                <p id="confirmPassword-error" className="text-sm text-red-600">{fieldErrors.confirm}</p>
              )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
