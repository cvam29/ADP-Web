"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useBlogStore } from "@/store/useBlogStore";
import { useUserStore } from "@/store/useUsersStore";
import { getDieticianAssociationAPI, type CreateBlogPostDto } from "@/services/generated";
import { generateSlug } from "@/lib/blog-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function BlogFormPage() {
  const router = useRouter();
  const params = useSearchParams();
  const id = useMemo(() => String(params?.get("id") ?? ""), [params]);
  const isEdit = Boolean(id);

  const { posts, fetchPosts, createPost, updatePost, loading } = useBlogStore();
  const { users, fetchUsers, loading: usersLoading } = useUserStore();
  const existing = isEdit ? posts.find((p) => String(p.id) === id) : undefined;

  const [form, setForm] = useState<CreateBlogPostDto>({
    title: existing?.title ?? "",
    url: existing?.url ?? "",
    content: existing?.content ?? "",
    excerpt: existing?.excerpt ?? "",
    authorId: existing?.author?.id ?? "",
    category: existing?.category ?? "",
    image: existing?.image ?? "",
    featured: existing?.featured ?? false,
    readTime: existing?.readTime ?? "5 min",
    isPublished: existing?.isPublished ?? false,
    tags: existing?.tags ?? [],
  });

  const [tagsInput, setTagsInput] = useState((existing?.tags ?? []).join(", "));
  const [urlTouched, setUrlTouched] = useState(false);

  const apiRef = useRef(getDieticianAssociationAPI());
  const genRunIdRef = useRef(0);

  const ensureUniqueSlug = async (base: string): Promise<string> => {
    let candidate = base;
    let suffix = 2;
    for (let i = 0; i < 50; i++) {
      try {
        await apiRef.current.getApiBlogByUrlUrl(candidate);
        candidate = `${base}-${suffix++}`;
      } catch {
        return candidate;
      }
    }
    return candidate;
  };

  useEffect(() => {
    fetchUsers({ page: 1, pageSize: 50, filters: { isActive: true } });
    if (isEdit && !existing) {
      fetchPosts({ Page: 1, PageSize: 1, Filters: { id } });
    }
  }, [existing, fetchPosts, fetchUsers, id, isEdit]);

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title ?? "",
        url: existing.url ?? "",
        content: existing.content ?? "",
        excerpt: existing.excerpt ?? "",
        authorId: existing.author?.id ?? "",
        category: existing.category ?? "",
        image: existing.image ?? "",
        featured: existing.featured ?? false,
        readTime: existing.readTime ?? "5 min",
        isPublished: existing.isPublished ?? false,
        tags: existing.tags ?? [],
      });
      setTagsInput((existing.tags ?? []).join(", "));
    }
  }, [existing]);

  useEffect(() => {
    if (isEdit || urlTouched) return;
    const base = generateSlug(form.title || "");
    const runId = ++genRunIdRef.current;
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (!base) {
        if (!cancelled && genRunIdRef.current === runId) {
          setForm((f) => ({ ...f, url: "" }));
        }
        return;
      }
      const unique = await ensureUniqueSlug(base);
      if (!cancelled && genRunIdRef.current === runId) {
        setForm((f) => ({ ...f, url: unique }));
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form.title, urlTouched, isEdit]);

  const onSubmit = async () => {
    const payload: CreateBlogPostDto = {
      ...form,
      url: form.url || undefined,
      image: form.image || undefined,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    if (isEdit) {
      await updatePost(id, payload);
    } else {
      const created = await createPost(payload);
      if (!created?.id) return;
    }
    router.push("/admin/blogs");
  };

  return (
    <div className="w-full px-6 py-8 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {isEdit ? "Edit Blog Post" : "Create Blog Post"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEdit
              ? "Update blog content, settings, and publishing options."
              : "Compose a new blog post for your readers."}
          </p>
        </div>
        <Link href="/admin/blogs">
          <Button variant="outline" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </Link>
      </div>

      {/* Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Main Content</CardTitle>
              <CardDescription>
                Title, excerpt, and main blog body
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter title"
                />
              </div>
              <div>
                <Label>URL Slug</Label>
                <Input
                  value={form.url ?? ""}
                  onChange={(e) => {
                    if (!isEdit && !urlTouched) setUrlTouched(true);
                    setForm({ ...form, url: generateSlug(e.target.value) });
                  }}
                  placeholder="auto-generated if left blank"
                />
              </div>
              <div>
                <Label>Excerpt</Label>
                <Textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="Short summary"
                />
              </div>
              <div>
                <Label>Content</Label>
                <RichTextEditor
                  content={form.content}
                  onChange={(val) => setForm({ ...form, content: val })}
                  placeholder="Write your post..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Meta */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meta Information</CardTitle>
              <CardDescription>Details and categorization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Author</Label>
                <Select
                  value={form.authorId}
                  onValueChange={(val) => setForm({ ...form, authorId: val })}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={usersLoading ? "Loading..." : "Select author"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      ?.filter((u) => u.id && (u.name || u.email))
                      .map((u) => (
                        <SelectItem key={u.id!} value={u.id!}>
                          {u.name ?? u.email}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Category"
                />
              </div>
              <div>
                <Label>Cover Image URL</Label>
                <Input
                  value={form.image ?? ""}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label>Read Time</Label>
                <Input
                  value={form.readTime}
                  onChange={(e) => setForm({ ...form, readTime: e.target.value })}
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

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Publishing options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Featured</Label>
                  <p className="text-xs text-muted-foreground">
                    Showcase on landing sections
                  </p>
                </div>
                <Switch
                  checked={!!form.featured}
                  onCheckedChange={(v) => setForm({ ...form, featured: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Publish</Label>
                  <p className="text-xs text-muted-foreground">
                    Make post visible to users
                  </p>
                </div>
                <Switch
                  checked={!!form.isPublished}
                  onCheckedChange={(v) => setForm({ ...form, isPublished: v })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save button at bottom */}
      <div className="flex justify-end pt-6">
        <Button onClick={onSubmit} disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Update Post" : "Create Post"}
        </Button>
      </div>
    </div>
  );
}
