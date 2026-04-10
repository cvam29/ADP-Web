using DieticianAssociation.API.Constants;

namespace DieticianAssociation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CertificatesController(ICertificateService certificateService) : ControllerBase
{
    private readonly ICertificateService _certificateService = certificateService;

    /// <summary>
    /// Get all certificates for the logged-in user.
    /// </summary>
    [HttpGet("my-certificates")]
    [Authorize]
    [HasPermission(PermissionKeys.MemberCertificatesAccess)]
    [ProducesResponseType(typeof(List<CertificateDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<List<CertificateDto>>> GetMyCertificates(CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new MessageResponseDto { Message = "User not authenticated." });

        var certificates = await _certificateService.GetUserCertificatesAsync(userId, cancellationToken);
        return Ok(certificates);
    }

    /// <summary>
    /// Verify a certificate�s validity.
    /// </summary>
    [HttpGet("verify")]
    [ProducesResponseType(typeof(CertificateDto), StatusCodes.Status200OK)]
    public async Task<ActionResult> VerifyCertificate([FromQuery] string certificateNumber, CancellationToken cancellationToken)
    {
        var certificate = await _certificateService.ValidateCertificateAsync(certificateNumber, cancellationToken);
        return Ok(certificate);
    }
    /// <summary>
    /// Get all certificates for a specific user (admin only).
    /// </summary>
    [HttpGet("user/{userId}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    [HasPermission(PermissionKeys.MembershipsRead)]
    [ProducesResponseType(typeof(List<CertificateDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<List<CertificateDto>>> GetUserCertificatesAdmin(string userId, CancellationToken cancellationToken)
    {
        var certificates = await _certificateService.GetUserCertificatesAsync(userId, cancellationToken);
        return Ok(certificates);
    }}
