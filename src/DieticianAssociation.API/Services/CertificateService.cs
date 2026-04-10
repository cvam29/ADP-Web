
namespace DieticianAssociation.API.Services;

public class CertificateService(
    ApplicationDbContext context,
    IConfiguration configuration) : ICertificateService
{
    private readonly ApplicationDbContext _context = context;
    private readonly IConfiguration _configuration = configuration;

    /// <summary>
    /// Generate formatted certificate number.
    /// </summary>
    private string GenerateCertificateNumber(UserMembership membership)
    {
        // Prefix
        var prefix = "ADP";

        // Year (last 2 digits)
        var year = membership.StartDate.Year % 100;

        // Registration + Lifetime check
        var lifetimeFlag = (membership.EndDate - membership.StartDate).TotalDays > 3650; // ~10 years
        var regPart = lifetimeFlag ? "RL" : "R";

        // Month
        var month = membership.StartDate.Month;

        // Generate unique 0�99 code from GUID
        var numericCode = GenerateTwoDigitCode(membership.Id);

        return $"{prefix}/{year}/{regPart}{month}/{numericCode:D2}";
    }

    /// <summary>
    /// Create deterministic two-digit code from Guid.
    /// </summary>
    private static int GenerateTwoDigitCode(string guid)
    {
        // Hash Guid into an integer
        var hash = MD5.HashData(Encoding.UTF8.GetBytes(guid));
        var intVal = BitConverter.ToInt32(hash, 0);

        // Map to 0�99
        return Math.Abs(intVal % 100);
    }

    /// <summary>
    /// Get all certificates for a user based on memberships.
    /// </summary>
    public async Task<List<CertificateDto>> GetUserCertificatesAsync(string userId, CancellationToken cancellationToken = default)
    {
        var memberships = await _context.UserMemberships
            .AsNoTracking()
            .Include(m => m.User)
            .Include(m => m.MembershipPlan)
            .Where(m => m.UserId == userId)
            .OrderByDescending(m => m.StartDate)
            .ToListAsync(cancellationToken);

        var result = new List<CertificateDto>();

        foreach (var membership in memberships)
        {
            var dto = await MapCertificateToDtoAsync(membership);
            result.Add(dto);
        }

        return result;
    }

    /// <summary>
    /// Validate a certificate.
    /// </summary>
    public async Task<CertificateDto?> ValidateCertificateAsync(string certificateNumber, CancellationToken cancellationToken = default)
    {
        if (!certificateNumber.StartsWith("ADP/"))
            return null;

        // Could extract year/month/code here if needed to match membership
        // For now keep simple: search all memberships and recompute cert number
        var memberships = await _context.UserMemberships
            .AsNoTracking()
            .Include(m => m.User)
            .Include(m => m.MembershipPlan)
            .ToListAsync(cancellationToken);

        foreach (var m in memberships)
        {
            var generated = GenerateCertificateNumber(m);
            if (generated == certificateNumber)
                return await MapCertificateToDtoAsync(m);
        }

        return null;
    }

    /// <summary>
    /// Generate a QR Code for certificate verification (Base64).
    /// </summary>
    private Task<string> GenerateQRCodeAsync(string certificateNumber)
    {
        var qrBase64 = GenerateQRCodeWithLogo(certificateNumber);
        return Task.FromResult(qrBase64);
    }

    private string GenerateQRCodeWithLogo(string certificateNumber)
    {
        var qrGenerator = new QRCodeGenerator();
        var verificationUrl = $"{_configuration["App:FeBaseUrl"]}/verify-certificate?certificateNumber={certificateNumber}";
        var qrCodeData = qrGenerator.CreateQrCode(verificationUrl, QRCodeGenerator.ECCLevel.Q);

        // Generate QR as raw byte[] (PNG)
        var qrCode = new PngByteQRCode(qrCodeData);
        byte[] qrBytes = qrCode.GetGraphic(20);

        // Load QR image into SkiaSharp
        using var qrBitmap = SKBitmap.Decode(qrBytes);
        var qrCanvasImage = new SKImageInfo(qrBitmap.Width, qrBitmap.Height);
        using var surface = SKSurface.Create(qrCanvasImage);
        var canvas = surface.Canvas;
        canvas.Clear(SKColors.White);

        // Draw QR code onto canvas
        canvas.DrawBitmap(qrBitmap, 0, 0);

        // Load and resize logo
        using var logoBitmap = SKBitmap.Decode("wwwroot/images/logo-final.png");
        int logoSize = qrBitmap.Width / 5;
        using var logoResized = logoBitmap.Resize(new SKImageInfo(logoSize, logoSize), SKFilterQuality.High);

        // Draw logo in the center
        int x = (qrBitmap.Width - logoResized.Width) / 2;
        int y = (qrBitmap.Height - logoResized.Height) / 2;
        canvas.DrawBitmap(logoResized, x, y);

        // Finalize image
        canvas.Flush();
        using var finalImage = surface.Snapshot();
        using var data = finalImage.Encode(SKEncodedImageFormat.Png, 100);

        // Convert to Base64
        return Convert.ToBase64String(data.ToArray());
    }


    /// <summary>
    /// Map a UserMembership to CertificateDto including QR code.
    /// </summary>
    private async Task<CertificateDto> MapCertificateToDtoAsync(UserMembership userMembership)
    {
        var certificateNumber = GenerateCertificateNumber(userMembership);
        var qrCode = await GenerateQRCodeAsync(certificateNumber);

        return new CertificateDto
        {
            CertificateNumber = certificateNumber,
            ParticipantName = userMembership.User?.Name ?? "Unknown",
            OrgRegistrationNumber = CertificateConstants.OrgRegistrationNumber,
            DarpanId = CertificateConstants.DarpanId,
            IssueDate = userMembership.StartDate.ToString("yyyy-MM-dd"),
            ExpireDate = userMembership.EndDate.ToString("yyyy-MM-dd"),
            QrCodeBase64 = qrCode,
            MemberShipName = userMembership.MembershipPlan.Name,
            IsValid = userMembership.Status == MembershipStatus.Active
                      && userMembership.EndDate >= DateTime.UtcNow
        };
    }
}
