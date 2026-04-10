"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function CreateArticlePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { submitNewPost, loading } = useBlogStore();

  const [form, setForm] = useState<CreateBlogPostDto>({
    title: "",
    content: "",
    excerpt: "",
    authorId: user?.id ?? "",
    category: "",
    image: "",
    readTime: "5 min",
    isPublished: false,
    tags: [],
  });

  const [tagsInput, setTagsInput] = useState("");

  const onSubmit = async () => {
    if (!form.title.trim() || !form.content.trim() || !form.excerpt.trim()) return;

    const payload: CreateBlogPostDto = {
      ...form,
      authorId: user?.id ?? "",
      image: form.image || undefined,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    await submitNewPost(payload);
    router.push("/dashboard/articles");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Article</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Write a new article and submit it for admin review.
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
          Your article will be submitted for admin review. It will be published
          once approved.
        </AlertDescription>
      </Alert>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>Write your article content</CardDescription>
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
                  placeholder="Short summary of your article"
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
        <Button
          onClick={onSubmit}
          disabled={loading || !form.title.trim() || !form.content.trim() || !form.excerpt.trim()}
        >
          {loading ? "Submitting..." : "Submit for Review"}
        </Button>
      </div>
    </div>
  );
}
