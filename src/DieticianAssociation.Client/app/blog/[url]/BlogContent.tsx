import DOMPurify from "isomorphic-dompurify";

interface BlogContentProps {
  content: string;
}

export function BlogContent({ content }: BlogContentProps) {
  const sanitizedHtml = DOMPurify.sanitize(content, {
    USE_PROFILES: { html: true },
  });

  return (
    <div
      className="prose prose-slate max-w-none prose-headings:scroll-mt-24 prose-img:rounded-lg prose-img:shadow-sm"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
