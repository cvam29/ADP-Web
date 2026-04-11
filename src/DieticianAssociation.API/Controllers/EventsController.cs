using DieticianAssociation.API.Constants;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace DieticianAssociation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventsController(
    IEventService eventService

      ) : ControllerBase
{
    private readonly IEventService _eventService = eventService;
    private static readonly JsonSerializerOptions StreamJsonOptions = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    // ------------------- Events -------------------

    [HttpPost("paginated")]
    [ProducesResponseType(typeof(PagedResult<EventDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedResult<EventDto>>> GetPaginatedEvents([FromBody] PagedRequest request, CancellationToken cancellationToken)
    {
        var result = await _eventService.GetPaginatedEventsAsync(request, cancellationToken);
        return Ok(result);
    }

    [HttpGet("stream")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task StreamEvents(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? search = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortDirection = null,
        CancellationToken cancellationToken = default)
    {
        var request = new PagedRequest
        {
            Page = page,
            PageSize = pageSize,
            Search = search,
            SortBy = sortBy,
            SortDirection = string.IsNullOrWhiteSpace(sortDirection) ? "asc" : sortDirection
        };

        Response.StatusCode = StatusCodes.Status200OK;
        Response.ContentType = "application/x-ndjson";
        Response.Headers["Cache-Control"] = "no-cache, no-transform";
        Response.Headers["X-Accel-Buffering"] = "no";

        var pageInfo = await _eventService.GetPublicEventStreamPageInfoAsync(request, cancellationToken);
        await WriteStreamMessageAsync(new { type = "meta", pageInfo }, cancellationToken);

        await foreach (var eventItem in _eventService.StreamPublicEventsAsync(request, cancellationToken))
        {
            await WriteStreamMessageAsync(new { type = "item", item = eventItem }, cancellationToken);
        }
    }

    [HttpGet("by-url/{url}")]
    [ProducesResponseType(typeof(EventDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<EventDto>> GetEventByUrl(string url, CancellationToken cancellationToken)
    {
        var eventItem = await _eventService.GetEventByUrlAsync(url, cancellationToken);
        if (eventItem == null)
            return NotFound(new ErrorResponseDto { Message = "Event not found." });

        return Ok(eventItem);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(EventDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<EventDto>> GetEvent(string id, CancellationToken cancellationToken)
    {
        var eventItem = await _eventService.GetEventByIdAsync(id, cancellationToken);
        if (eventItem == null)
            return NotFound(new ErrorResponseDto { Message = "Event not found." });

        return Ok(eventItem);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,SuperAdmin")]
    [HasPermission(PermissionKeys.EventsCreate)]
    [ProducesResponseType(typeof(EventDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<EventDto>> CreateEvent([FromBody] CreateEventDto createEvent, CancellationToken cancellationToken)
    {
        var eventItem = await _eventService.CreateEventAsync(createEvent, cancellationToken);
        return CreatedAtAction(nameof(GetEvent), new { id = eventItem!.Id }, eventItem);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    [HasPermission(PermissionKeys.EventsUpdate)]
    [ProducesResponseType(typeof(EventDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EventDto>> UpdateEvent(string id, [FromBody] CreateEventDto updateEvent, CancellationToken cancellationToken)
    {
        var eventItem = await _eventService.UpdateEventAsync(id, updateEvent, cancellationToken);
        if (eventItem == null)
            return NotFound(new ErrorResponseDto { Message = "Event not found." });

        return Ok(eventItem);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    [HasPermission(PermissionKeys.EventsDelete)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteEvent(string id, CancellationToken cancellationToken)
    {
        var success = await _eventService.DeleteEventAsync(id, cancellationToken);
        if (!success)
            return NotFound(new ErrorResponseDto { Message = "Event not found." });

        return NoContent();
    }

    [HttpGet("slugs")]
    [ProducesResponseType(typeof(List<EventSlugDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<EventSlugDto>>> GetEventSlugs(CancellationToken cancellationToken)
    {
        var slugs = await _eventService.GetPublishedEventSlugsAsync(cancellationToken);
        return Ok(slugs);
    }

    private async Task WriteStreamMessageAsync(object payload, CancellationToken cancellationToken)
    {
        var line = JsonSerializer.Serialize(payload, StreamJsonOptions);
        await Response.WriteAsync(line + "\n", cancellationToken);
        await Response.Body.FlushAsync(cancellationToken);
    }



}

