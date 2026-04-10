namespace DieticianAssociation.API.Interfaces;

public interface ITemplateEmailSendService
{
    Task SendByTemplateKeyAsync(SendTemplatedEmailRequestDto request, CancellationToken cancellationToken = default);
}
