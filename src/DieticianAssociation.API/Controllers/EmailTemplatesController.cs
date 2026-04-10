using DieticianAssociation.API.Constants;

namespace DieticianAssociation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SuperAdmin")]
public class EmailTemplatesController(IEmailTemplateService emailTemplateService) : ControllerBase
{
    private readonly IEmailTemplateService _emailTemplateService = emailTemplateService;

    [HttpGet]
    [HasPermission(PermissionKeys.EmailTemplatesRead)]
    [ProducesResponseType(typeof(IEnumerable<EmailTemplateDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<EmailTemplateDto>>> GetAll(CancellationToken cancellationToken)
    {
        var templates = await _emailTemplateService.GetAllAsync(cancellationToken);
        return Ok(templates);
    }

    [HttpGet("{id}")]
    [HasPermission(PermissionKeys.EmailTemplatesRead)]
    [ProducesResponseType(typeof(EmailTemplateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EmailTemplateDto>> GetById(string id, CancellationToken cancellationToken)
    {
        var template = await _emailTemplateService.GetByIdAsync(id, cancellationToken);
        if (template == null)
        {
            return NotFound(new ErrorResponseDto { Code = "NOT_FOUND", Message = "Email template not found." });
        }

        return Ok(template);
    }

    [HttpPost]
    [HasPermission(PermissionKeys.EmailTemplatesCreate)]
    [ProducesResponseType(typeof(EmailTemplateDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<EmailTemplateDto>> Create([FromBody] CreateEmailTemplateDto request, CancellationToken cancellationToken)
    {
        var template = await _emailTemplateService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = template.Id }, template);
    }

    [HttpPut("{id}")]
    [HasPermission(PermissionKeys.EmailTemplatesUpdate)]
    [ProducesResponseType(typeof(EmailTemplateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EmailTemplateDto>> Update(string id, [FromBody] UpdateEmailTemplateDto request, CancellationToken cancellationToken)
    {
        var template = await _emailTemplateService.UpdateAsync(id, request, cancellationToken);
        if (template == null)
        {
            return NotFound(new ErrorResponseDto { Code = "NOT_FOUND", Message = "Email template not found." });
        }

        return Ok(template);
    }

    [HttpDelete("{id}")]
    [HasPermission(PermissionKeys.EmailTemplatesDelete)]
    [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MessageResponseDto>> Delete(string id, CancellationToken cancellationToken)
    {
        var deleted = await _emailTemplateService.DeleteAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound(new ErrorResponseDto { Code = "NOT_FOUND", Message = "Email template not found." });
        }

        return Ok(new MessageResponseDto { Message = "Email template deleted successfully." });
    }
}
