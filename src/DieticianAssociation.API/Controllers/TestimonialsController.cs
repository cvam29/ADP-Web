using DieticianAssociation.API.Constants;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace DieticianAssociation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestimonialsController(ITestimonialService testimonialService) : ControllerBase
{
    private readonly ITestimonialService _testimonialService = testimonialService;
    private static readonly JsonSerializerOptions StreamJsonOptions = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    [HttpPost("paginated")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PagedResult<TestimonialDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<TestimonialDto>>> GetPublicTestimonials([FromBody] PagedRequest request, CancellationToken cancellationToken)
    {
        var result = await _testimonialService.GetPublicTestimonialsAsync(request, cancellationToken);
        return Ok(result);
    }

    [HttpGet("stream")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task StreamPublicTestimonials(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 3,
        [FromQuery] string? search = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortDirection = null,
        [FromQuery] bool featured = false,
        CancellationToken cancellationToken = default)
    {
        var request = new PagedRequest
        {
            Page = page,
            PageSize = pageSize,
            Search = search,
            SortBy = sortBy,
            SortDirection = string.IsNullOrWhiteSpace(sortDirection) ? "desc" : sortDirection
        };

        Response.StatusCode = StatusCodes.Status200OK;
        Response.ContentType = "application/x-ndjson";
        Response.Headers["Cache-Control"] = "no-cache, no-transform";
        Response.Headers["X-Accel-Buffering"] = "no";

        var pageInfo = await _testimonialService.GetPublicTestimonialsStreamPageInfoAsync(request, featured, cancellationToken);
        await WriteStreamMessageAsync(new { type = "meta", pageInfo }, cancellationToken);

        await foreach (var testimonial in _testimonialService.StreamPublicTestimonialsAsync(request, featured, cancellationToken))
        {
            await WriteStreamMessageAsync(new { type = "item", item = testimonial }, cancellationToken);
        }
    }

    [HttpGet("mine")]
    [Authorize(Roles = "Member,Admin,SuperAdmin")]
    [ProducesResponseType(typeof(List<TestimonialDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<TestimonialDto>>> GetMyTestimonials(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(new ErrorResponseDto { Code = "UNAUTHORIZED", Message = "User is not authenticated." });
        }

        var result = await _testimonialService.GetMyTestimonialsAsync(userId, cancellationToken);
        return Ok(result);
    }

    [HttpPost("submit")]
    [Authorize(Roles = "Member,Admin,SuperAdmin")]
    [ProducesResponseType(typeof(TestimonialDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<TestimonialDto>> Submit([FromBody] CreateTestimonialDto dto, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(new ErrorResponseDto { Code = "UNAUTHORIZED", Message = "User is not authenticated." });
        }

        var result = await _testimonialService.SubmitTestimonialAsync(userId, dto, cancellationToken);
        return CreatedAtAction(nameof(GetMyTestimonials), result);
    }

    [HttpPost("admin/paginated")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    [HasPermission(PermissionKeys.TestimonialsRead)]
    [ProducesResponseType(typeof(PagedResult<TestimonialDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<TestimonialDto>>> GetAdminTestimonials([FromBody] PagedRequest request, CancellationToken cancellationToken)
    {
        var result = await _testimonialService.GetAdminTestimonialsAsync(request, cancellationToken);
        return Ok(result);
    }

    [HttpPut("{id}/review")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    [HasPermission(PermissionKeys.TestimonialsReview)]
    [ProducesResponseType(typeof(TestimonialDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<TestimonialDto>> Review(string id, [FromBody] ReviewTestimonialDto dto, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(new ErrorResponseDto { Code = "UNAUTHORIZED", Message = "User is not authenticated." });
        }

        var result = await _testimonialService.ReviewTestimonialAsync(id, userId, dto, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    [HasPermission(PermissionKeys.TestimonialsDelete)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        await _testimonialService.DeleteTestimonialAsync(id, cancellationToken);
        return NoContent();
    }

    private async Task WriteStreamMessageAsync(object payload, CancellationToken cancellationToken)
    {
        var line = JsonSerializer.Serialize(payload, StreamJsonOptions);
        await Response.WriteAsync(line + "\n", cancellationToken);
        await Response.Body.FlushAsync(cancellationToken);
    }
}