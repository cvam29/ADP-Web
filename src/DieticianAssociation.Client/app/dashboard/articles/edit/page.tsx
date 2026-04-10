"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useBlogStore } from "@/store/useBlogStore";
import { useAuthStore } from "@/store/useAuthStore";
import type { CreateBlogPostDto } from "@/services/generated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Info } from "lucide-react";
import PageLoading from "@/components/page-loading";

export default function EditArticlePage() {
  const router = useRouter();
  const params = useSearchParams();
  const id = useMemo(() => String(params?.get("id") ?? ""), [params]);
  const { user } = useAuthStore();
  const { myPosts, fetchMyPosts, submitEdit, loading } = useBlogStore();
  const existing = myPosts.find((p) => String(p.id) === id);

  const [form, setForm] = useState<CreateBlogPostDto>({
    title: existing?.title ?? "",
    content: existing?.content ?? "",
    excerpt: existing?.excerpt ?? "",
    authorId: user?.id ?? "",
    category: existing?.category ?? "",
    image: existing?.image ?? "",
    readTime: existing?.readTime ?? "5 min",
    isPublished: existing?.isPublished ?? true,
    tags: existing?.tags ?? [],
  });

  const [tagsInput, setTagsInput] = useState(
    (existing?.tags ?? []).join(", ")
  );

  useEffect(() => {
    if (!existing) {
      fetchMyPosts({ page: 1, pageSize: 50 });
    }
  }, [existing, fetchMyPosts]);

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title ?? "",
        content: existing.content ?? "",
        excerpt: existing.excerpt ?? "",
        authorId: user?.id ?? existing.authorId ?? "",
        category: existing.category ?? "",
        image: existing.image ?? "",
        readTime: existing.readTime ?? "5 min",
        isPublished: existing.isPublished ?? true,
        tags: existing.tags ?? [],
      });
      setTagsInput((existing.tags ?? []).join(", "));
    }
  }, [existing, user?.id]);

  if (!id) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No article specified.</p>
        <Link href="/dashboard/articles">
          <Button variant="outline" className="mt-4">
            Back to My Articles
          </Button>
        </Link>
      </div>
    );
  }

  if (!existing && loading) {
    return <PageLoading message="Loading article..." />;
  }

  if (!existing) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Article not found.</p>
        <Link href="/dashboard/articles">
          <Button variant="outline" className="mt-4">
            Back to My Articles
          </Button>
        </Link>
      </div>
    );
  }

  const onSubmit = async () => {
    const payload: CreateBlogPostDto = {
      ...form,
      image: form.image || undefined,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    await submitEdit(id, payload);
    router.push("/dashboard/articles");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Edit Article
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Submit changes for admin review. Current version: v{existing.version ?? 1}
          </p>
        </div>
        <Link href="/dashboard/articles">
          <Button variant="outline" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </Link>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {existing.version === 0
            ? "This article is awaiting initial approval. You can update it and resubmit."
            : "Your edits will be submitted for admin review. The current published version will remain live until your changes are approved."}
        </AlertDescription>
      </Alert>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>Edit your article content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="Article title"
                />
              </div>
              <div>
                <Label>Excerpt</Label>
                <Textarea
                  value={form.excerpt}
                  onChange={(e) =>
                    setForm({ ...form, excerpt: e.target.value })
                  }
                  placeholder="Short summary"
                />
              </div>
              <div>
                <Label>Content</Label>
                <RichTextEditor
                  content={form.content}
                  onChange={(val) => setForm({ ...form, content: val })}
                  placeholder="Write your article..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meta */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>Article metadata</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Category</Label>
                <Input
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  placeholder="Category"
                />
              </div>
              <div>
                <Label>Cover Image URL</Label>
                <Input
                  value={form.image ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, image: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label>Read Time</Label>
                <Input
                  value={form.readTime}
                  onChange={(e) =>
                    setForm({ ...form, readTime: e.target.value })
                  }
                  placeholder="e.g., 6 min"
                />
              </div>
              <div>
                <Label>Tags (comma separated)</Label>
                <Input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="nutrition, diet, health"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-4">
        <Button onClick={onSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Submit for Review"}
        </Button>
      </div>
    </div>
  );
}
