import { Metadata } from 'next'
import { getDieticianAssociationAPI, type BlogPostDto } from '@/services/generated'
const api = getDieticianAssociationAPI()
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.adp.org.in'

function toAbsoluteUrl(value?: string | null) {
  if (!value) {
    return undefined
  }

  try {
    return new URL(value, SITE_URL).toString()
  } catch {
    return undefined
  }
}

type Props = {
  params: Promise<{ url: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { url } = await params
    const postRes = await api.getApiBlogByUrlUrl(url)
    const post: BlogPostDto | undefined = postRes.data
    const canonicalPath = `/blog/${encodeURIComponent(url)}`
    const imageUrl = toAbsoluteUrl(post?.image) ?? `${SITE_URL}/ADP.jpg`
    
    const safeTitle = post?.title ?? 'Blog Post'
    const safeExcerpt = post?.excerpt ?? 'Read the latest insights and research from nutrition professionals.'
    const safeAuthor = post?.author?.name
    const safeTags = (post?.tags ?? []).filter((t): t is string => !!t)

    return {
      title: `${safeTitle} | Association of Dietetics Professionals Blog`,
      description: safeExcerpt,
      keywords: safeTags.length ? safeTags.join(', ') : undefined,
      authors: safeAuthor ? [{ name: safeAuthor }] : undefined,
      alternates: {
        canonical: canonicalPath,
      },
      openGraph: {
        title: safeTitle,
        description: safeExcerpt,
        type: 'article',
        url: canonicalPath,
        publishedTime: post?.publishedAt ?? undefined,
        modifiedTime: post?.updatedAt ?? undefined,
        authors: safeAuthor ? [safeAuthor] : undefined,
        images: [{ url: imageUrl, width: 1200, height: 630, alt: safeTitle }],
      },
      twitter: {
        card: 'summary_large_image',
        title: safeTitle,
        description: safeExcerpt,
        images: [imageUrl],
      },
      robots: {
        index: true,
        follow: true,
      },
    }
  } catch (error) {
    // Fallback metadata for when post is not found
    return {
      title: 'Blog Post | Association of Dietetics Professionals',
      description: 'Read the latest insights and research from nutrition professionals.',
    }
  }
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
