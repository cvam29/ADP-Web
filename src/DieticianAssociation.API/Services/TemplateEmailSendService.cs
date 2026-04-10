namespace DieticianAssociation.API.Services;

public partial class TemplateEmailSendService(ApplicationDbContext context, ISmtpEmailClient smtpEmailClient) : ITemplateEmailSendService
{
    private static readonly Regex PlaceholderRegex = MyRegex();

    private readonly ApplicationDbContext _context = context;
    private readonly ISmtpEmailClient _smtpEmailClient = smtpEmailClient;

    public async Task SendByTemplateKeyAsync(SendTemplatedEmailRequestDto request, CancellationToken cancellationToken = default)
    {
        var templateKey = request.TemplateKey.Trim();

        var template = await _context.EmailTemplates
            .FirstOrDefaultAsync(t => t.IsActive && t.Key != null && templateKey != null && t.Key.ToLower() == templateKey.ToLower(), cancellationToken) ?? throw new KeyNotFoundException($"Active email template with key '{templateKey}' was not found.");
        var placeholders = request.Placeholders?.ToDictionary(k => k.Key, v => v.Value, StringComparer.OrdinalIgnoreCase)
            ?? new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        var subject = ReplacePlaceholders(template.Subject, placeholders);
        var htmlBody = ReplacePlaceholders(template.HtmlBody, placeholders);

        await _smtpEmailClient.SendHtmlEmailAsync(request.To, subject, htmlBody, null, cancellationToken);
    }

    private static string ReplacePlaceholders(string value, IReadOnlyDictionary<string, string> placeholders)
    {
        if (string.IsNullOrEmpty(value) || placeholders.Count == 0)
        {
            return value;
        }

        return PlaceholderRegex.Replace(value, match =>
        {
            var key = match.Groups["key"].Value;
            return placeholders.TryGetValue(key, out var replacement)
                ? replacement
                : match.Value;
        });
    }

    [GeneratedRegex(@"\{\{\s*(?<key>[\w\.\-]+)\s*\}\}", RegexOptions.Compiled)]
    private static partial Regex MyRegex();
}
