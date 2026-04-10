"use client";

import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import {
  EmailTemplateDto,
  SendTemplatedEmailRequestDto,
  SendDirectEmailRequestDto,
  UserRole,
} from "@/services/generated";
import { useToast } from "@/hooks/use-toast";
import { useEmailStore } from "@/store/useEmailStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function EmailManagement() {
  const { loading: authLoading, hasAnyRole } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Use Email Store
  const {
    templates,
    loading: storeLoading,
    error: storeError,
    fetchTemplates,
    deleteTemplate,
    sendTemplatedEmail,
    sendDirectEmail,
    removeError,
  } = useEmailStore();

  // State
  const [activeTab, setActiveTab] = useState("templates");
  const [searchTerm, setSearchTerm] = useState("");

  // Templates State
  const [filteredTemplates, setFilteredTemplates] = useState<
    EmailTemplateDto[]
  >([]);
  const [previewTemplate, setPreviewTemplate] =
    useState<EmailTemplateDto | null>(null);

  // Send Email State
  const [sendEmailType, setSendEmailType] = useState<"template" | "direct">(
    "template",
  );
  const [emailForm, setEmailForm] = useState({
    to: "",
    subject: "",
    htmlBody: "",
    templateKey: "",
  });

  const [templatePlaceholders, setTemplatePlaceholders] = useState<
    Record<string, string>
  >({});

  // Helper to check permission
  const hasPermission = useCallback(() => {
    return hasAnyRole([UserRole.admin, UserRole.superAdmin]);
  }, [hasAnyRole]);

  // Auth Check
  useEffect(() => {
    if (!authLoading && !hasPermission()) {
      router.push("/unauthorized");
    }
  }, [authLoading, router, hasPermission]);

  // Initial Data Load
  useEffect(() => {
    if (hasPermission()) {
      fetchTemplates().catch(() => {
        // Error toast is handled by storeError effect
      });
    }
  }, [hasPermission, fetchTemplates]);

  // Error Handling
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

  // Search Filter
  useEffect(() => {
    if (activeTab === "templates") {
      const filtered = templates.filter(
        (template) =>
          (template.key?.toLowerCase() || "").includes(
            searchTerm.toLowerCase(),
          ) ||
          (template.subject?.toLowerCase() || "").includes(
            searchTerm.toLowerCase(),
          ),
      );
      setFilteredTemplates(filtered);
    }
  }, [searchTerm, templates, activeTab]);

  // Extract placeholders when template changes
  useEffect(() => {
    if (emailForm.templateKey) {
      const template = templates.find((t) => t.key === emailForm.templateKey);
      if (template && template.htmlBody) {
        // Regex to match {{variableName}}
        const regex = /{{([a-zA-Z0-9_]+)}}/g;
        const matches = [...template.htmlBody.matchAll(regex)];
        const uniqueVars = Array.from(new Set(matches.map((m) => m[1])));

        // Initialize state for new placeholders, keeping existing values if compatible
        setTemplatePlaceholders((prev) => {
          const nextState: Record<string, string> = {};
          uniqueVars.forEach((v) => {
            nextState[v] = prev[v] || "";
          });
          return nextState;
        });
      } else {
        setTemplatePlaceholders({});
      }
    }
  }, [emailForm.templateKey, templates]);

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      await deleteTemplate(id);
      toast({ title: "Success", description: "Template deleted successfully" });
    } catch (error) {
      // Error handled by store effect
    }
  };

  // Email Handlers
  const handleSendEmail = async () => {
    if (!emailForm.to) {
      toast({
        title: "Validation Error",
        description: "Please specify at least one recipient",
        variant: "error",
      });
      return;
    }

    try {
      if (sendEmailType === "template") {
        if (!emailForm.templateKey) {
          toast({
            title: "Validation Error",
            description: "Please select a template",
            variant: "error",
          });
          return;
        }

        const request: SendTemplatedEmailRequestDto = {
          to: emailForm.to,
          templateKey: emailForm.templateKey,
          placeholders: templatePlaceholders,
        };

        await sendTemplatedEmail(request);
      } else {
        if (!emailForm.subject || !emailForm.htmlBody) {
          toast({
            title: "Validation Error",
            description: "Please provide subject and body",
            variant: "error",
          });
          return;
        }

        const request: SendDirectEmailRequestDto = {
          to: emailForm.to,
          subject: emailForm.subject,
          bodyHtml: emailForm.htmlBody,
        };

        await sendDirectEmail(request);
      }

      toast({ title: "Success", description: "Email sent successfully" });
      // Reset form partially
      setEmailForm((prev) => ({ ...prev, to: "" }));
      setTemplatePlaceholders({});
    } catch (error) {
      // Error handled by store effect
    }
  };

  const handlePlaceholderChange = (key: string, value: string) => {
    setTemplatePlaceholders((prev) => ({
      ...prev,
      [key]: value,
    }));
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Management</h1>
          <p className="text-gray-600">
            Create templates and send emails to users
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="send">Send Email</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Email Templates</CardTitle>
                  <CardDescription>
                    Manage reusable email templates
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-full md:w-60">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search templates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    onClick={() => router.push("/admin/emails/add-edit")}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    New Template
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-gray-500"
                      >
                        No templates found. Create one to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTemplates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium font-mono text-xs">
                          {template.key}
                        </TableCell>
                        <TableCell>{template.subject}</TableCell>
                        <TableCell>
                          {template.isActive ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {template.createdAt
                            ? new Date(template.createdAt).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPreviewTemplate(template)}
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/admin/emails/add-edit?id=${template.id}`,
                                )
                              }
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                template.id && handleDeleteTemplate(template.id)
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Send Email Tab */}
        <TabsContent value="send" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
            {/* Form Column */}
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Send Email</CardTitle>
                <CardDescription>
                  Send an email manually or using a template
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={
                      sendEmailType === "template" ? "default" : "outline"
                    }
                    onClick={() => setSendEmailType("template")}
                    className="w-full"
                  >
                    Use Template
                  </Button>
                  <Button
                    variant={sendEmailType === "direct" ? "default" : "outline"}
                    onClick={() => setSendEmailType("direct")}
                    className="w-full"
                  >
                    Direct Email
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Recipient(s)
                    </label>
                    <Input
                      placeholder="email@example.com"
                      value={emailForm.to}
                      onChange={(e) =>
                        setEmailForm((prev) => ({
                          ...prev,
                          to: e.target.value,
                        }))
                      }
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter a single email address.
                    </p>
                  </div>

                  {sendEmailType === "template" ? (
                    <>
                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          Select Template
                        </label>
                        <Select
                          value={emailForm.templateKey}
                          onValueChange={(value) =>
                            setEmailForm((prev) => ({
                              ...prev,
                              templateKey: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a template..." />
                          </SelectTrigger>
                          <SelectContent>
                            {templates.map((t) => (
                              <SelectItem key={t.id} value={t.key || ""}>
                                {t.subject} ({t.key})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Dynamic Placeholders */}
                      {Object.keys(templatePlaceholders).length > 0 && (
                        <div className="space-y-4 bg-gray-50 p-4 rounded-md border">
                          <label className="text-sm font-medium block text-gray-700 border-b pb-2 mb-2">
                            Template Variables
                          </label>
                          <div className="space-y-3">
                            {Object.keys(templatePlaceholders).map((key) => (
                              <div
                                key={key}
                                className="flex items-center gap-3"
                              >
                                <label
                                  className="text-sm font-medium text-gray-600 capitalize w-1/3 text-left truncate"
                                  title={key}
                                >
                                  {key.replace(/_/g, " ")}:
                                </label>
                                <Input
                                  value={templatePlaceholders[key]}
                                  onChange={(e) =>
                                    handlePlaceholderChange(key, e.target.value)
                                  }
                                  className="bg-white flex-1"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {emailForm.templateKey &&
                        Object.keys(templatePlaceholders).length === 0 && (
                          <div className="p-4 bg-gray-50 rounded-md border text-sm text-gray-500 text-center">
                            No variables found in this template.
                          </div>
                        )}
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          Subject
                        </label>
                        <Input
                          placeholder="Email subject"
                          value={emailForm.subject}
                          onChange={(e) =>
                            setEmailForm((prev) => ({
                              ...prev,
                              subject: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          Body (HTML)
                        </label>
                        <Textarea
                          placeholder="<p>Hello,</p>..."
                          rows={12}
                          value={emailForm.htmlBody}
                          onChange={(e) =>
                            setEmailForm((prev) => ({
                              ...prev,
                              htmlBody: e.target.value,
                            }))
                          }
                          className="font-mono text-sm"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleSendEmail}
                    disabled={storeLoading}
                    className="w-full"
                  >
                    {storeLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Send Email
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview Column */}
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
                  title="Email Preview"
                  className="w-full h-full border-0 absolute inset-0"
                  srcDoc={(() => {
                    let html = "";
                    if (sendEmailType === "template") {
                      const template = templates.find(
                        (t) => t.key === emailForm.templateKey,
                      );
                      if (template) {
                        html = template.htmlBody || "";
                        // Replace placeholders from state
                        Object.entries(templatePlaceholders).forEach(
                          ([key, val]) => {
                            html = html.replace(
                              new RegExp(`{{${key}}}`, "g"),
                              String(val),
                            );
                          },
                        );
                      } else {
                        return `<div style="display:flex;height:100%;align-items:center;justify-content:center;color:#9ca3af;font-family:sans-serif;">Select a template to preview</div>`;
                      }
                    } else {
                      html = emailForm.htmlBody;
                      if (!html) {
                        return `<div style="display:flex;height:100%;align-items:center;justify-content:center;color:#9ca3af;font-family:sans-serif;">Enter HTML content to preview</div>`;
                      }
                    }
                    return html;
                  })()}
                />
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Template Preview Dialog */}
      <Dialog
        open={!!previewTemplate}
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {previewTemplate?.subject}
            </DialogTitle>
            <div className="text-sm text-gray-500 space-y-1 mt-2">
              <p>
                <strong>Key:</strong>{" "}
                <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                  {previewTemplate?.key}
                </code>
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {previewTemplate?.isActive ? "Active" : "Inactive"}
              </p>
            </div>
          </DialogHeader>
          <div className="border rounded-lg mt-4 bg-white overflow-hidden">
            <iframe
              title="Template Preview"
              className="w-full border-0"
              style={{ minHeight: "400px" }}
              srcDoc={previewTemplate?.htmlBody || "<p>No content</p>"}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
