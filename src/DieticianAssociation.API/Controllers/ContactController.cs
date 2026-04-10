using DieticianAssociation.API.Constants;

[ApiController]
[Route("api/[controller]")]
public class ContactController(IContactService contactService) : ControllerBase
{
    private readonly IContactService _contactService = contactService;

    /// <summary>
    /// Get contact messages with pagination, sorting and filtering.
    /// </summary>
    [HttpPost("paginated")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    [HasPermission(PermissionKeys.ContactsRead)]
    [ProducesResponseType(typeof(PagedResult<ContactMessageDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedResult<ContactMessageDto>>> GetPaginatedMessages([FromBody] PagedRequest request, CancellationToken cancellationToken)
    {
        var result = await _contactService.GetPaginatedMessagesAsync(request, cancellationToken);
        return Ok(result);
    }

    [HttpGet]
    [Authorize(Roles = "Admin,SuperAdmin")]
    [HasPermission(PermissionKeys.ContactsRead)]
    [ProducesResponseType(typeof(IEnumerable<ContactMessageDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<ContactMessageDto>>> GetAllMessages(CancellationToken cancellationToken)
    {
        var messages = await _contactService.GetAllMessagesAsync(cancellationToken);
        return Ok(messages);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    [HasPermission(PermissionKeys.ContactsRead)]
    [ProducesResponseType(typeof(ContactMessageDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ContactMessageDto>> GetMessage(string id, CancellationToken cancellationToken)
    {
        var message = await _contactService.GetMessageByIdAsync(id, cancellationToken);
        if (message == null)
            return NotFound(new ErrorResponseDto { Code = "NOT_FOUND", Message = "Contact message not found." });

        return Ok(message);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ContactMessageDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ContactMessageDto>> CreateMessage([FromBody] CreateContactMessageDto createMessage, CancellationToken cancellationToken)
    {
        var message = await _contactService.CreateMessageAsync(createMessage, cancellationToken);
        return CreatedAtAction(nameof(GetMessage), new { id = message!.Id }, message);
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    [HasPermission(PermissionKeys.ContactsUpdate)]
    [ProducesResponseType(typeof(ContactMessageDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ContactMessageDto>> UpdateMessageStatus(string id, [FromBody] UpdateMessageStatusDto updateStatus, CancellationToken cancellationToken)
    {
        var message = await _contactService.UpdateMessageStatusAsync(id, updateStatus.Status, cancellationToken);
        if (message == null)
            return NotFound(new ErrorResponseDto { Code = "NOT_FOUND", Message = "Contact message not found." });

        return Ok(message);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    [HasPermission(PermissionKeys.ContactsDelete)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> DeleteMessage(string id, CancellationToken cancellationToken)
    {
        var success = await _contactService.DeleteMessageAsync(id, cancellationToken);
        if (!success)
            return NotFound(new ErrorResponseDto { Code = "NOT_FOUND", Message = "Contact message not found." });

        return NoContent();
    }
}

public class UpdateMessageStatusDto
{
    [Required]
    public string Status { get; set; } = string.Empty;
}
