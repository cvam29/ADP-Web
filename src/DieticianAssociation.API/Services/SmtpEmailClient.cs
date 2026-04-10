namespace DieticianAssociation.API.Services;

public class SmtpEmailClient(IConfiguration configuration) : ISmtpEmailClient
{
    private readonly IConfiguration _configuration = configuration;

    public async Task SendHtmlEmailAsync(string to, string subject, string htmlBody, IEnumerable<string>? bcc = null, CancellationToken cancellationToken = default)
    {
        var host = (_configuration["Email:Smtp:Host"] ?? string.Empty).Trim();
        var portValue = _configuration["Email:Smtp:Port"];
        var username = (_configuration["Email:Smtp:Username"] ?? string.Empty).Trim();
        var password = _configuration["Email:Smtp:Password"] ?? string.Empty;
        var fromAddress = (_configuration["Email:FromAddress"] ?? username).Trim();
        var fromName = (_configuration["Email:FromName"] ?? "Association of Dietetics Professionals").Trim();

        if (string.IsNullOrWhiteSpace(host))
        {
            throw new InvalidOperationException("SMTP host is not configured.");
        }

        if (string.IsNullOrWhiteSpace(fromAddress))
        {
            throw new InvalidOperationException("SMTP from address is not configured.");
        }

        var port = int.TryParse(portValue, out var parsedPort) ? parsedPort : 587;
        var useSsl = bool.TryParse(_configuration["Email:Smtp:UseSsl"], out var parsedUseSsl)
            ? parsedUseSsl
            : port == 465;

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(fromName, fromAddress));
        message.To.Add(MailboxAddress.Parse(to));

        if (bcc != null)
        {
            foreach (var bccAddress in bcc)
            {
                if (!string.IsNullOrWhiteSpace(bccAddress))
                {
                    message.Bcc.Add(MailboxAddress.Parse(bccAddress));
                }
            }
        }

        message.Subject = subject;

        var bodyBuilder = new BodyBuilder();
        var finalHtmlBody = htmlBody;

        if (htmlBody.Contains("cid:logoImage", StringComparison.OrdinalIgnoreCase))
        {
            var attached = TryAttachLogoInline(bodyBuilder);

            if (!attached)
            {
                var websiteBaseUrl = (_configuration["App:FeBaseUrl"] ?? "https://www.adp.org.in").TrimEnd('/');
                var fallbackLogoUrl = (_configuration["Email:Branding:LogoUrl"] ?? $"{websiteBaseUrl}/logo-final.png").Trim();
                finalHtmlBody = htmlBody.Replace("cid:logoImage", fallbackLogoUrl, StringComparison.OrdinalIgnoreCase);
            }
        }

        bodyBuilder.HtmlBody = finalHtmlBody;
        message.Body = bodyBuilder.ToMessageBody();

        using var client = new SmtpClient();
        await client.ConnectAsync(
            host,
            port,
            useSsl ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTlsWhenAvailable,
            cancellationToken);

        if (!string.IsNullOrWhiteSpace(username))
        {
            await client.AuthenticateAsync(username, password, cancellationToken);
        }

        await client.SendAsync(message, cancellationToken);
        await client.DisconnectAsync(true, cancellationToken);
    }

    private bool TryAttachLogoInline(BodyBuilder bodyBuilder)
    {
        var configuredPath = _configuration["Email:Branding:LogoPath"];
        var candidatePaths = new List<string>();

        if (!string.IsNullOrWhiteSpace(configuredPath))
        {
            candidatePaths.Add(configuredPath);

            if (!Path.IsPathRooted(configuredPath))
            {
                candidatePaths.Add(Path.Combine(Directory.GetCurrentDirectory(), configuredPath));
                candidatePaths.Add(Path.Combine(AppContext.BaseDirectory, configuredPath));
            }
        }

        candidatePaths.Add(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "logo-final.png"));
        candidatePaths.Add(Path.Combine(AppContext.BaseDirectory, "wwwroot", "images", "logo-final.png"));

        var logoPath = candidatePaths.FirstOrDefault(File.Exists);
        if (string.IsNullOrWhiteSpace(logoPath))
        {
            return false;
        }

        var logo = bodyBuilder.LinkedResources.Add(logoPath);
        logo.ContentId = "logoImage";
        logo.ContentDisposition = new ContentDisposition(ContentDisposition.Inline);
        return true;
    }
}
