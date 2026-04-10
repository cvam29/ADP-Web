using DieticianAssociation.API.Constants;

namespace DieticianAssociation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BlogController(IBlogService blogService) : ControllerBase
{
    private readonly IBlogService _blogService = blogService;

    [HttpPost("paginated")]
    [ProducesResponseType(typeof(PagedResult<BlogPostDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedResult<BlogPostDto>>> GetPaginatedPosts([FromBody] PagedRequest request, CancellationToken cancellationToken)
    {
        var result = await _blogService.GetPaginatedPostsAsync(request, cancellationToken);
        return Ok(result);
    }

    [HttpGet("by-url/{url}")]
    [ProducesResponseType(typeof(BlogPostDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<BlogPostDto>> GetPostByUrl(string url, CancellationToken cancellationToken)
    {
        var post = await _blogService.GetPostByUrlAsync(url, cancellationToken);
        if (post == null)
            return NotFound(new ErrorResponseDto { Code = "NOT_FOUND", Message = "Blog post not found." });

        return Ok(post);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,SuperAdmin")]
    [HasPermission(PermissionKeys.BlogsCreate)]
    [ProducesResponseType(typeof(BlogPostDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<BlogPostDto>> CreatePost([FromBody] CreateBlogPostDto createPost, CancellationToken cancellationToken)
    {
        var post = await _blogService.CreatePostAsync(createPost, cancellationToken);
        return CreatedAtAction(nameof(GetPostByUrl), new { url = post!.Url }, post);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    [HasPermission(PermissionKeys.BlogsUpdate)]
    [ProducesResponseType(typeof(BlogPostDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<BlogPostDto>> UpdatePost(string id, [FromBody] CreateBlogPostDto updatePost, CancellationToken cancellationToken)
    {
        var post = await _blogService.UpdatePostAsync(id, updatePost, cancellationToken);
        if (post == null)
            return NotFound(new ErrorResponseDto { Code = "NOT_FOUND", Message = "Blog post not found." });

        return Ok(post);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    [HasPermission(PermissionKeys.BlogsDelete)]
    [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> DeletePost(string id, CancellationToken cancellationToken)
    {
        var success = await _blogService.DeletePostAsync(id, cancellationToken);

        if (!success)
            return NotFound(new ErrorResponseDto { Code = "NOT_FOUND", Message = "Blog post not found." });

        return Ok(new MessageResponseDto { Message = "Post delete successfully" });
    }

    [HttpGet("slugs")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(List<BlogSlugDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<BlogSlugDto>>> GetPublishedSlugs(CancellationToken cancellationToken)
    {
        var slugs = await _blogService.GetPublishedBlogSlugsAsync(cancellationToken);
        return Ok(slugs);
    }

    [HttpPost("my-posts")]
    [Authorize]
    [HasPermission(PermissionKeys.MemberBlogsWrite)]
    [ProducesResponseType(typeof(PagedResult<BlogPostDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<PagedResult<BlogPostDto>>> GetMyPosts([FromBody] PagedRequest request, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new ErrorResponseDto { Code = "UNAUTHORIZED", Message = "User not authenticated." });

        var result = await _blogService.GetMyPostsAsync(userId, request, cancellationToken);
        return Ok(result);
    }

    [HttpPut("{id}/submit-edit")]
    [Authorize]
    [HasPermission(PermissionKeys.MemberBlogsWrite)]
    [ProducesResponseType(typeof(BlogPostDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<BlogPostDto>> SubmitEdit(string id, [FromBody] CreateBlogPostDto editPost, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new ErrorResponseDto { Code = "UNAUTHORIZED", Message = "User not authenticated." });

        var post = await _blogService.SubmitEditAsync(id, userId, editPost, cancellationToken);
        if (post == null)
            return NotFound(new ErrorResponseDto { Code = "NOT_FOUND", Message = "Blog post not found or you are not the author." });

        return Ok(post);
    }

    [HttpPut("{id}/approve")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    [ProducesResponseType(typeof(BlogPostDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<BlogPostDto>> ApproveEdit(string id, CancellationToken cancellationToken)
    {
        var post = await _blogService.ApproveEditAsync(id, cancellationToken);
        if (post == null)
            return NotFound(new ErrorResponseDto { Code = "NOT_FOUND", Message = "Blog post not found or no pending edit." });

        return Ok(post);
    }

    [HttpPut("{id}/reject")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    [ProducesResponseType(typeof(BlogPostDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<BlogPostDto>> RejectEdit(string id, CancellationToken cancellationToken)
    {
        var post = await _blogService.RejectEditAsync(id, cancellationToken);
        if (post == null)
            return NotFound(new ErrorResponseDto { Code = "NOT_FOUND", Message = "Blog post not found or no pending edit." });

        return Ok(post);
    }

    [HttpPost("submit-new")]
    [Authorize]
    [HasPermission(PermissionKeys.MemberBlogsWrite)]
    [ProducesResponseType(typeof(BlogPostDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<BlogPostDto>> SubmitNewPost([FromBody] CreateBlogPostDto createPost, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new ErrorResponseDto { Code = "UNAUTHORIZED", Message = "User not authenticated." });

        createPost.AuthorId = userId;
        var post = await _blogService.SubmitNewPostAsync(createPost, cancellationToken);
        return CreatedAtAction(nameof(GetPostByUrl), new { url = post!.Url }, post);
    }

}
