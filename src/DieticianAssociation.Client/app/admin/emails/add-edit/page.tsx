"use client";

import { useAuth } from "@/contexts/auth-context";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import {
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
  UserRole,
} from "@/services/generated";
import { useToast } from "@/hooks/use-toast";
import { useEmailStore } from "@/store/useEmailStore";

export default function EmailTemplateAddEditPage() {
  const { user, loading: authLoading, hasAnyRole } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams?.get("id") ?? "";
  const isEdit = Boolean(templateId);
  const { toast } = useToast();

  const {
    templates,
    loading: storeLoading,
    error: storeError,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    removeError,
  } = useEmailStore();

  const [templateForm, setTemplateForm] = useState<CreateEmailTemplateDto>({
    key: "",
    subject: "",
    htmlBody: "",
  });

  const hasPermission = useCallback(() => {
    return hasAnyRole([UserRole.admin, UserRole.superAdmin]);
  }, [hasAnyRole]);

  useEffect(() => {
    if (!authLoading && !hasPermission()) {
      router.push("/unauthorized");
    }
  }, [authLoading, hasPermission, router]);

  useEffect(() => {
    if (hasPermission()) {
      fetchTemplates().catch(() => {
        // Error toast handled by storeError effect
      });
    }
  }, [hasPermission, fetchTemplates]);

  useEffect(() => {
    if (storeError) {
      toast({
        title: "Error",
        description: storeError,
        variant: "error",
      });
      removeError();
    }
  }, [storeError, toast, removeError]);

  useEffect(() => {
    if (!isEdit) return;

    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    setTemplateForm({
      key: template.key || "",
      subject: template.subject || "",
      htmlBody: template.htmlBody || "",
    });
  }, [isEdit, templateId, templates]);

  const templatePreviewHtml = useMemo(() => {
    if (!templateForm.htmlBody.trim()) {
      return `<div style="display:flex;height:100%;align-items:center;justify-content:center;color:#9ca3af;font-family:sans-serif;">Enter HTML content to preview</div>`;
    }

    return templateForm.htmlBody;
  }, [templateForm.htmlBody]);

  const handleSaveTemplate = async () => {
    if (!templateForm.key || !templateForm.subject || !templateForm.htmlBody) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "error",
      });
      return;
    }

    try {
      if (isEdit) {
        const updateDto: UpdateEmailTemplateDto = {
          subject: templateForm.subject,
          htmlBody: templateForm.htmlBody,
          isActive: true,
        };
        await updateTemplate(templateId, updateDto);
        toast({
          title: "Success",
          description: "Template updated successfully",
        });
      } else {
        await createTemplate(templateForm);
        toast({
          title: "Success",
          description: "Template created successfully",
        });
      }

      router.push("/admin/emails");
    } catch {
      // Error handled by storeError effect
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!hasPermission()) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? "Edit Email Template" : "Create Email Template"}
          </h1>
          <p className="text-gray-600">
            {isEdit
              ? "Update the template and validate with live preview"
              : "Create a reusable template with live preview"}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/admin/emails")}> 
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Template Form</CardTitle>
            <CardDescription>
              Provide key, subject, and HTML body
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Template Key
              </label>
              <Input
                placeholder="e.g. welcome-email"
                value={templateForm.key}
                onChange={(e) =>
                  setTemplateForm((prev) => ({ ...prev, key: e.target.value }))
                }
                disabled={isEdit}
              />
              <p className="text-xs text-gray-500 mt-1">
                Unique identifier used to reference this template in API calls.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Subject Line
              </label>
              <Input
                placeholder="Welcome to Dietician Association!"
                value={templateForm.subject}
                onChange={(e) =>
                  setTemplateForm((prev) => ({
                    ...prev,
                    subject: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                HTML Body
              </label>
              <Textarea
                placeholder="<html><body>...</body></html>"
                value={templateForm.htmlBody}
                onChange={(e) =>
                  setTemplateForm((prev) => ({
                    ...prev,
                    htmlBody: e.target.value,
                  }))
                }
                rows={18}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can use placeholders like {"{{name}}"} in the body.
              </p>
            </div>

            <div className="pt-2">
              <Button
                onClick={handleSaveTemplate}
                disabled={storeLoading}
                className="w-full"
              >
                {storeLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Update Template" : "Save Template"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full flex flex-col overflow-hidden bg-white border shadow-sm">
          <CardHeader className="bg-gray-50/50 border-b py-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-500" /> Preview
              </CardTitle>
              <Badge variant="outline" className="text-xs font-normal">
                HTML View
              </Badge>
            </div>
          </CardHeader>
          <div className="flex-1 bg-white relative">
            <iframe
              title="Template Preview"
              className="w-full h-full border-0 absolute inset-0"
              srcDoc={templatePreviewHtml}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
