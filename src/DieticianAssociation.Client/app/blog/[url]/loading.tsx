import PageLoading from "@/components/page-loading"

export default function Loading() {
  return (
    <PageLoading
      className="container mx-auto px-4 py-8"
      contentClassName="text-center"
      direction="column"
      message="Loading blog post..."
      textClassName="text-muted-foreground"
    />
  )
}
