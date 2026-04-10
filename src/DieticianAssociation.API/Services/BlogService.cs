namespace DieticianAssociation.API.Services;

public class BlogService(
    ApplicationDbContext context,
    ICacheService cacheService,
    IOptions<CacheSettings> cacheSettings,
    ILogger<BlogService> logger) : IBlogService
{
    private readonly ApplicationDbContext _context = context ?? throw new ArgumentNullException(nameof(context));
    private readonly ICacheService _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
    private readonly CacheSettings _cacheSettings = cacheSettings.Value ?? throw new ArgumentNullException(nameof(cacheSettings));
    private readonly ILogger<BlogService> _logger = logger ?? throw new ArgumentNullException(nameof(logger));

    // -------------------------
    // Helpers
    // -------------------------

    private int BlogCacheVersion =>
        _cacheService.GetOrCreateVersion(_cacheSettings.BlogVersion);

    private Task InvalidateBlogCaches()
    {
        _cacheService.IncrementVersion(_cacheSettings.BlogVersion);
        _logger.LogInformation("Blog cache version incremented");
        return Task.CompletedTask;
    }

    // -------------------------
    // Queries
    // -------------------------

    public async Task<BlogPostDto?> GetPostByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var cacheKey = _cacheService.GenerateKey(
            "blog",
            $"v{BlogCacheVersion}",
            "id",
            id
        );

        var cachedPost = await _cacheService.GetAsync<BlogPostDto>(cacheKey, cancellationToken);
        if (cachedPost != null)
            return cachedPost;

        var post = await _context.BlogPosts
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (post == null) return null;

        var postDto = MapperExtensions.MapToBlogPostDto(post);

        await _cacheService.SetAsync(
            cacheKey,
            postDto,
            TimeSpan.FromMinutes(_cacheSettings.BlogPostsDurationMinutes),
            cancellationToken
        );

        return postDto;
    }

    public async Task<BlogPostDto?> GetPostByUrlAsync(string url, CancellationToken cancellationToken = default)
    {
        var cacheKey = _cacheService.GenerateKey(
            "blog",
            $"v{BlogCacheVersion}",
            "url",
            url
        );

        var cachedPost = await _cacheService.GetAsync<BlogPostDto>(cacheKey, cancellationToken);
        if (cachedPost != null)
            return cachedPost;

        var post = await _context.BlogPosts
            .AsNoTracking()
            .Include(p => p.Author)
            .FirstOrDefaultAsync(p => p.Url == url && p.IsPublished, cancellationToken);

        // Fallback: check if the URL matches a previous URL (for redirects)
        post ??= await _context.BlogPosts
                .AsNoTracking()
                .Include(p => p.Author)
                .FirstOrDefaultAsync(p => p.PreviousUrl == url && p.IsPublished, cancellationToken);

        if (post == null) return null;

        var postDto = MapperExtensions.MapToBlogPostDto(post);

        await _cacheService.SetAsync(
            cacheKey,
            postDto,
            TimeSpan.FromMinutes(_cacheSettings.BlogPostsDurationMinutes),
            cancellationToken
        );

        return postDto;
    }

    public async Task<PagedResult<BlogPostDto>> GetPaginatedPostsAsync(PagedRequest request, CancellationToken cancellationToken = default)
    {
        var cacheKey = _cacheService.GenerateKey(
            "blog",
            $"v{BlogCacheVersion}",
            "published",
            "paginated",
            request.Page.ToString(),
            request.PageSize.ToString(),
            request.Search ?? "",
            request.SortBy ?? "",
            request.SortDirection
        );

        var cachedResult = await _cacheService.GetAsync<PagedResult<BlogPostDto>>(cacheKey, cancellationToken);
        if (cachedResult != null)
            return cachedResult;

        var query = _context.BlogPosts
            .AsNoTracking()
            .Include(p => p.Author)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(p =>
                (p.Title != null && EF.Functions.ILike(p.Title, $"%{search}%")) ||
                (p.Content != null && EF.Functions.ILike(p.Content, $"%{search}%")) ||
                (p.Excerpt != null && EF.Functions.ILike(p.Excerpt, $"%{search}%")) ||
                (p.Author != null && p.Author.Name != null &&
                 EF.Functions.ILike(p.Author.Name, $"%{search}%"))
            );
        }

        query = query
            .ApplyFilters(request)
            .ApplySorting(request.SortBy, request.SortDirection);

        var result = await query.ToPagedResultAsync(
            request,
            MapperExtensions.MapToBlogPostDto,
            cancellationToken
        );

        await _cacheService.SetAsync(
            cacheKey,
            result,
            TimeSpan.FromMinutes(_cacheSettings.BlogPostsDurationMinutes),
            cancellationToken
        );

        return result;
    }

    // -------------------------
    // Commands
    // -------------------------

    public async Task<BlogPostDto?> CreatePostAsync(CreateBlogPostDto createPost, CancellationToken cancellationToken = default)
    {
        var url = !string.IsNullOrWhiteSpace(createPost.Url)
            ? UrlHelper.GenerateSlug(createPost.Url)
            : UrlHelper.GenerateSlug(createPost.Title);

        var existingSlugs = await _context.BlogPosts
            .Where(p => p.Url.StartsWith(url))
            .Select(p => p.Url)
            .ToListAsync(cancellationToken);

        url = UrlHelper.EnsureUniqueSlug(url, existingSlugs);

        var post = new BlogPost
        {
            Id = Guid.NewGuid().ToString(),
            Title = createPost.Title,
            Url = url,
            Content = createPost.Content,
            Excerpt = createPost.Excerpt,
            Author = createPost.Author,
            AuthorId = createPost.AuthorId,
            Category = createPost.Category,
            Image = createPost.Image,
            Featured = createPost.Featured,
            ReadTime = createPost.ReadTime,
            IsPublished = createPost.IsPublished,
            Tags = createPost.Tags,
            PublishedDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.BlogPosts.Add(post);
        await _context.SaveChangesAsync(cancellationToken);

        await InvalidateBlogCaches();

        return MapperExtensions.MapToBlogPostDto(post);
    }

    public async Task<BlogPostDto?> UpdatePostAsync(string id, CreateBlogPostDto updatePost, CancellationToken cancellationToken = default)
    {
        var post = await _context.BlogPosts.FindAsync(new object[] { id }, cancellationToken);
        if (post == null) return null;

        var shouldUpdateUrl =
            !string.IsNullOrWhiteSpace(updatePost.Url) ||
            post.Title != updatePost.Title;

        if (shouldUpdateUrl)
        {
            var newUrl = !string.IsNullOrWhiteSpace(updatePost.Url)
                ? UrlHelper.GenerateSlug(updatePost.Url)
                : UrlHelper.GenerateSlug(updatePost.Title);

            var existingSlugs = await _context.BlogPosts
                .Where(p => p.Id != id && p.Url.StartsWith(newUrl))
                .Select(p => p.Url)
                .ToListAsync(cancellationToken);

            var finalUrl = UrlHelper.EnsureUniqueSlug(newUrl, existingSlugs);

            // Save old URL for redirect support before changing
            if (post.Url != finalUrl)
            {
                post.PreviousUrl = post.Url;
            }

            post.Url = finalUrl;
        }

        post.Title = updatePost.Title;
        post.Content = updatePost.Content;
        post.Excerpt = updatePost.Excerpt;
        post.Author = updatePost.Author;
        post.AuthorId = updatePost.AuthorId;
        post.Category = updatePost.Category;
        post.Image = updatePost.Image;
        post.Featured = updatePost.Featured;
        post.ReadTime = updatePost.ReadTime;
        post.IsPublished = updatePost.IsPublished;
        post.Tags = updatePost.Tags;
        post.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        await InvalidateBlogCaches();

        return MapperExtensions.MapToBlogPostDto(post);
    }

    public async Task<bool> DeletePostAsync(string id, CancellationToken cancellationToken = default)
    {
        var post = await _context.BlogPosts.FindAsync(new object[] { id }, cancellationToken);
        if (post == null) return false;

        _context.BlogPosts.Remove(post);
        await _context.SaveChangesAsync(cancellationToken);

        await InvalidateBlogCaches();

        return true;
    }

    public async Task<List<BlogSlugDto>> GetPublishedBlogSlugsAsync(CancellationToken cancellationToken = default)
    {
        var cacheKey = _cacheService.GenerateKey(
            "blog",
            $"v{BlogCacheVersion}",
            "slugs"
        );

        var cached = await _cacheService.GetAsync<List<BlogSlugDto>>(cacheKey, cancellationToken);
        if (cached != null)
            return cached;

        var slugs = await _context.BlogPosts
            .AsNoTracking()
            .Where(p => p.IsPublished)
            .Select(p => new BlogSlugDto(p.Url, p.UpdatedAt))
            .ToListAsync(cancellationToken);

        await _cacheService.SetAsync(
            cacheKey,
            slugs,
            TimeSpan.FromMinutes(_cacheSettings.BlogPostsDurationMinutes),
            cancellationToken
        );

        return slugs;
    }

    public async Task<PagedResult<BlogPostDto>> GetMyPostsAsync(string authorId, PagedRequest request, CancellationToken cancellationToken = default)
    {
        var query = _context.BlogPosts
            .AsNoTracking()
            .Include(p => p.Author)
            .Where(p => p.AuthorId == authorId);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(p =>
                (p.Title != null && EF.Functions.ILike(p.Title, $"%{search}%")) ||
                (p.Excerpt != null && EF.Functions.ILike(p.Excerpt, $"%{search}%"))
            );
        }

        query = query
            .ApplyFilters(request)
            .ApplySorting(request.SortBy ?? "UpdatedAt", request.SortDirection ?? "desc");

        return await query.ToPagedResultAsync(
            request,
            MapperExtensions.MapToBlogPostDto,
            cancellationToken
        );
    }

    public async Task<BlogPostDto?> SubmitEditAsync(string id, string authorId, CreateBlogPostDto editPost, CancellationToken cancellationToken = default)
    {
        var post = await _context.BlogPosts.FindAsync(new object[] { id }, cancellationToken);
        if (post == null || post.AuthorId != authorId) return null;

        // Store pending changes (don't apply directly)
        post.PendingTitle = editPost.Title;
        post.PendingContent = editPost.Content;
        post.PendingExcerpt = editPost.Excerpt;
        post.PendingCategory = editPost.Category;
        post.PendingImage = editPost.Image;
        post.PendingReadTime = editPost.ReadTime;
        post.EditStatus = "PendingReview";
        post.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        await InvalidateBlogCaches();

        return MapperExtensions.MapToBlogPostDto(post);
    }

    public async Task<BlogPostDto?> SubmitNewPostAsync(CreateBlogPostDto createPost, CancellationToken cancellationToken = default)
    {
        var url = !string.IsNullOrWhiteSpace(createPost.Url)
            ? UrlHelper.GenerateSlug(createPost.Url)
            : UrlHelper.GenerateSlug(createPost.Title);

        var existingSlugs = await _context.BlogPosts
            .Where(p => p.Url.StartsWith(url))
            .Select(p => p.Url)
            .ToListAsync(cancellationToken);

        url = UrlHelper.EnsureUniqueSlug(url, existingSlugs);

        var post = new BlogPost
        {
            Id = Guid.NewGuid().ToString(),
            Title = createPost.Title,
            Url = url,
            Content = createPost.Content,
            Excerpt = createPost.Excerpt,
            AuthorId = createPost.AuthorId,
            Category = createPost.Category,
            Image = createPost.Image,
            ReadTime = createPost.ReadTime,
            Tags = createPost.Tags,
            IsPublished = false,
            EditStatus = "PendingReview",
            Version = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.BlogPosts.Add(post);
        await _context.SaveChangesAsync(cancellationToken);
        await InvalidateBlogCaches();

        return MapperExtensions.MapToBlogPostDto(post);
    }

    public async Task<BlogPostDto?> ApproveEditAsync(string id, CancellationToken cancellationToken = default)
    {
        var post = await _context.BlogPosts.FindAsync(new object[] { id }, cancellationToken);
        if (post == null || post.EditStatus != "PendingReview") return null;

        if (post.Version == 0)
        {
            // New article approval — publish it
            post.IsPublished = true;
            post.PublishedDate = DateTime.UtcNow;
            post.Version = 1;
        }
        else
        {
            // Existing article edit — apply pending changes
            if (post.PendingTitle != null) post.Title = post.PendingTitle;
            if (post.PendingContent != null) post.Content = post.PendingContent;
            if (post.PendingExcerpt != null) post.Excerpt = post.PendingExcerpt;
            if (post.PendingCategory != null) post.Category = post.PendingCategory;
            if (post.PendingImage != null) post.Image = post.PendingImage;
            if (post.PendingReadTime != null) post.ReadTime = post.PendingReadTime;

            // Update URL if title changed
            if (post.PendingTitle != null)
            {
                var newUrl = UrlHelper.GenerateSlug(post.PendingTitle);
                var existingSlugs = await _context.BlogPosts
                    .Where(p => p.Id != id && p.Url.StartsWith(newUrl))
                    .Select(p => p.Url)
                    .ToListAsync(cancellationToken);

                var finalUrl = UrlHelper.EnsureUniqueSlug(newUrl, existingSlugs);
                if (post.Url != finalUrl)
                {
                    post.PreviousUrl = post.Url;
                    post.Url = finalUrl;
                }
            }

            ClearPendingFields(post);
            post.Version++;
        }

        post.EditStatus = "Published";
        post.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        await InvalidateBlogCaches();

        return MapperExtensions.MapToBlogPostDto(post);
    }

    public async Task<BlogPostDto?> RejectEditAsync(string id, CancellationToken cancellationToken = default)
    {
        var post = await _context.BlogPosts.FindAsync(new object[] { id }, cancellationToken);
        if (post == null || post.EditStatus != "PendingReview") return null;

        if (post.Version == 0)
        {
            // New article rejected — delete it
            _context.BlogPosts.Remove(post);
            await _context.SaveChangesAsync(cancellationToken);
            await InvalidateBlogCaches();

            return MapperExtensions.MapToBlogPostDto(post);
        }

        ClearPendingFields(post);
        post.EditStatus = "Published";
        post.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        await InvalidateBlogCaches();

        return MapperExtensions.MapToBlogPostDto(post);
    }

    private static void ClearPendingFields(BlogPost post)
    {
        post.PendingTitle = null;
        post.PendingContent = null;
        post.PendingExcerpt = null;
        post.PendingCategory = null;
        post.PendingImage = null;
        post.PendingReadTime = null;
    }



}
