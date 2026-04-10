namespace DieticianAssociation.API.Interfaces;

public interface ICalendarService
{
    Task<EventCalendarDto?> CreateCalendarEventAsync(string eventId, CancellationToken cancellationToken = default);
    Task<string> GenerateICalendarAsync(string eventId, CancellationToken cancellationToken = default);
    Task<string> GenerateGoogleCalendarUrlAsync(string eventId, CancellationToken cancellationToken = default);
    Task<string> GenerateOutlookCalendarUrlAsync(string eventId, CancellationToken cancellationToken = default);
    Task<bool> SendCalendarInviteAsync(string eventId, List<string> attendees, CancellationToken cancellationToken = default);
}
