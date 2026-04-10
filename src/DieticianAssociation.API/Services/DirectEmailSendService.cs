using DieticianAssociation.API.Constants;

namespace DieticianAssociation.API.Services;

public class DirectEmailSendService(ISmtpEmailClient smtpEmailClient, IConfiguration configuration) : IDirectEmailSendService
{
    private readonly ISmtpEmailClient _smtpEmailClient = smtpEmailClient;
    private readonly IConfiguration _configuration = configuration;

    public async Task SendDirectAsync(SendDirectEmailRequestDto request, CancellationToken cancellationToken = default)
    {
        var finalHtml = BuildHtmlWithHeaderFooter(request.BodyHtml, _configuration);
        await _smtpEmailClient.SendHtmlEmailAsync(request.To, request.Subject, finalHtml, request.Bcc, cancellationToken);
    }

    private static string BuildHtmlWithHeaderFooter(string bodyHtml, IConfiguration configuration)
    {
        var websiteName = "Association of Dietetics Professionals";
        var currentYear = DateTime.UtcNow.Year;

        var header = $@"
<div style='background:#f8fafc;padding:18px 20px;border-bottom:1px solid #e2e8f0;'>
  <table role='presentation' cellpadding='0' cellspacing='0' width='100%' style='border-collapse:collapse;'>
    <tr>
      <td style='vertical-align:middle;width:1%;white-space:nowrap;'>
        <img src='{EmailConstants.LogoDataUri}' alt='ADP Logo' width='42' height='42' style='height:42px;width:42px;display:block;border:0;outline:none;text-decoration:none;border-radius:6px;' />
      </td>
      <td style='text-align:right;vertical-align:middle;padding-left:10px;'>
        <span style='font-size:14px;color:#0f172a;font-family:Arial,sans-serif;font-weight:600;'>{websiteName}</span>
      </td>
    </tr>
  </table>
</div>";

        var footer = $@"
<div style='background:#0f172a;padding:18px 20px;border-top:1px solid #1e293b;'>
  <p style='margin:0 0 8px 0;color:#e2e8f0;font-size:13px;font-family:Arial,sans-serif;font-weight:600;'>{websiteName}</p>
  <p style='margin:0 0 6px 0;color:#cbd5e1;font-size:12px;font-family:Arial,sans-serif;'>Empowering nutrition professionals worldwide through education, resources, and community support.</p>
  <p style='margin:0 0 6px 0;color:#cbd5e1;font-size:12px;font-family:Arial,sans-serif;'>Email: <a href='mailto:info@adp.org.in' style='color:#86efac;text-decoration:none;'>info@adp.org.in</a> | Phone: <a href='tel:+918059655000' style='color:#86efac;text-decoration:none;'>+91 80596 55000</a></p>
  <p style='margin:0 0 10px 0;color:#cbd5e1;font-size:12px;font-family:Arial,sans-serif;'>New Delhi - 110059</p>
  <p style='margin:0;color:#94a3b8;font-size:11px;font-family:Arial,sans-serif;'>© {currentYear} {websiteName}. All rights reserved.</p>
</div>";

        return $@"
<div style='max-width:680px;margin:0 auto;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;background:#ffffff;'>
  {header}
  <div style='padding:22px;font-family:Arial,sans-serif;color:#1d2939;'>
    {bodyHtml}
  </div>
  {footer}
</div>";
    }
}
