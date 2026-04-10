namespace DieticianAssociation.API.Interfaces
{
    public interface IBlogService
    {
        Task<BlogPostDto?> GetPostByIdAsync(string id, CancellationToken cancellationToken = default);
        Task<BlogPostDto?> GetPostByUrlAsync(string url, CancellationToken cancellationToken = default);
        Task<BlogPostDto?> CreatePostAsync(CreateBlogPostDto createPost, CancellationToken cancellationToken = default);
        Task<BlogPostDto?> UpdatePostAsync(string id, CreateBlogPostDto updatePost, CancellationToken cancellationToken = default);
        Task<bool> DeletePostAsync(string id, CancellationToken cancellationToken = default);
        Task<PagedResult<BlogPostDto>> GetPaginatedPostsAsync(PagedRequest request, CancellationToken cancellationToken = default);
        Task<List<BlogSlugDto>> GetPublishedBlogSlugsAsync(CancellationToken cancellationToken = default);
        Task<PagedResult<BlogPostDto>> GetMyPostsAsync(string authorId, PagedRequest request, CancellationToken cancellationToken = default);
        Task<BlogPostDto?> SubmitEditAsync(string id, string authorId, CreateBlogPostDto editPost, CancellationToken cancellationToken = default);
        Task<BlogPostDto?> SubmitNewPostAsync(CreateBlogPostDto createPost, CancellationToken cancellationToken = default);
        Task<BlogPostDto?> ApproveEditAsync(string id, CancellationToken cancellationToken = default);
        Task<BlogPostDto?> RejectEditAsync(string id, CancellationToken cancellationToken = default);
    }
}
