namespace DieticianAssociation.API.Interfaces;

public interface IDirectEmailSendService
{
    Task SendDirectAsync(SendDirectEmailRequestDto request, CancellationToken cancellationToken = default);
}
