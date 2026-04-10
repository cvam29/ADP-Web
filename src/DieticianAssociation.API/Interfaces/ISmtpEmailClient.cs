namespace DieticianAssociation.API.Interfaces;

public interface ISmtpEmailClient
{
    Task SendHtmlEmailAsync(string to, string subject, string htmlBody, IEnumerable<string>? bcc = null, CancellationToken cancellationToken = default);
}
