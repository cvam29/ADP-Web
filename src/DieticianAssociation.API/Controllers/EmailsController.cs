using DieticianAssociation.API.Constants;

namespace DieticianAssociation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SuperAdmin")]
public class EmailsController(
    ITemplateEmailSendService templateEmailSendService,
    IDirectEmailSendService directEmailSendService,
    IImapEmailService imapEmailService) : ControllerBase
{
    private readonly ITemplateEmailSendService _templateEmailSendService = templateEmailSendService;
    private readonly IDirectEmailSendService _directEmailSendService = directEmailSendService;
    private readonly IImapEmailService _imapEmailService = imapEmailService;

    [HttpPost("send-template")]
    [HasPermission(PermissionKeys.EmailsSend)]
    [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MessageResponseDto>> SendTemplateEmail([FromBody] SendTemplatedEmailRequestDto request, CancellationToken cancellationToken)
    {
        await _templateEmailSendService.SendByTemplateKeyAsync(request, cancellationToken);
        return Ok(new MessageResponseDto { Message = "Template email sent successfully." });
    }

    [HttpPost("send-direct")]
    [HasPermission(PermissionKeys.EmailsSend)]
    [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<MessageResponseDto>> SendDirectEmail([FromBody] SendDirectEmailRequestDto request, CancellationToken cancellationToken)
    {
        await _directEmailSendService.SendDirectAsync(request, cancellationToken);
        return Ok(new MessageResponseDto { Message = "Direct email sent successfully." });
    }

    [HttpPost("outbox")]
    [HasPermission(PermissionKeys.EmailsRead)]
    [ProducesResponseType(typeof(PagedResult<SentEmailDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<SentEmailDto>>> GetOutbox([FromBody] PagedRequest request, [FromQuery] string? account = null, [FromQuery] bool noCache = false, CancellationToken cancellationToken = default)
    {
        var result = await _imapEmailService.GetSentEmailsAsync(request, account, noCache, cancellationToken);
        return Ok(result);
    }

    [HttpPost("inbox")]
    [HasPermission(PermissionKeys.EmailsRead)]
    [ProducesResponseType(typeof(PagedResult<SentEmailDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<SentEmailDto>>> GetInbox([FromBody] PagedRequest request, [FromQuery] string? account = null, [FromQuery] bool noCache = false, CancellationToken cancellationToken = default)
    {
        var result = await _imapEmailService.GetInboxEmailsAsync(request, account, noCache, cancellationToken);
        return Ok(result);
    }

    [HttpGet("outbox/{id}")]
    [HasPermission(PermissionKeys.EmailsRead)]
    [ProducesResponseType(typeof(SentEmailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SentEmailDto>> GetOutboxEmailById(string id, [FromQuery] string? account = null, CancellationToken cancellationToken = default)
    {
        var result = await _imapEmailService.GetSentEmailByIdAsync(id, account, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("inbox/{id}")]
    [HasPermission(PermissionKeys.EmailsRead)]
    [ProducesResponseType(typeof(SentEmailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SentEmailDto>> GetInboxEmailById(string id, [FromQuery] string? account = null, CancellationToken cancellationToken = default)
    {
        var result = await _imapEmailService.GetInboxEmailByIdAsync(id, account, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("accounts")]
    [HasPermission(PermissionKeys.EmailsRead)]
    [ProducesResponseType(typeof(List<string>), StatusCodes.Status200OK)]
    public ActionResult<List<string>> GetAccounts()
    {
        var accounts = _imapEmailService.GetConfiguredAccounts();
        return Ok(accounts);
    }
}
