namespace DieticianAssociation.API.Interfaces;

public interface IEventRegistrationService
{
    // Registration
    Task<EventRegistrationDto?> RegisterForEventAsync(string userId, RegisterForEventDto registerDto, CancellationToken cancellationToken = default);
    Task<EventRegistrationDto?> GetRegistrationAsync(string registrationId, CancellationToken cancellationToken = default);
    Task<List<EventRegistrationDto>> GetUserRegistrationsAsync(string userId, CancellationToken cancellationToken = default);
    Task<List<EventRegistrationDto>> GetEventRegistrationsAsync(string eventId, CancellationToken cancellationToken = default);
    Task<bool> CancelRegistrationAsync(string registrationId, string cancellationReason, CancellationToken cancellationToken = default);

    // Waitlist
    Task<EventWaitlistDto?> JoinWaitlistAsync(string userId, JoinWaitlistDto waitlistDto, CancellationToken cancellationToken = default);
    Task<List<EventWaitlistDto>> GetEventWaitlistAsync(string eventId, CancellationToken cancellationToken = default);
    Task<List<EventWaitlistDto>> GetUserWaitlistAsync(string userId, CancellationToken cancellationToken = default);
    Task<bool> RemoveFromWaitlistAsync(string waitlistId, CancellationToken cancellationToken = default);
    Task<EventRegistrationDto?> PromoteFromWaitlistAsync(string waitlistId, CancellationToken cancellationToken = default);

    // Attendance
    Task<EventAttendanceDto?> CheckInToEventAsync(string userId, CheckInEventDto checkInDto, CancellationToken cancellationToken = default);
    Task<EventAttendanceDto?> CheckOutFromEventAsync(string userId, string eventId, CancellationToken cancellationToken = default);
    Task<List<EventAttendanceDto>> GetEventAttendanceAsync(string eventId, CancellationToken cancellationToken = default);
    Task<EventAttendanceDto?> GetUserAttendanceAsync(string userId, string eventId, CancellationToken cancellationToken = default);

    // Refund handling for registrations
    Task<bool> ProcessRefundAsync(string registrationId, decimal amount, string reason, CancellationToken cancellationToken = default);

    // Notifications & Reminders
    Task<bool> SendEventReminderAsync(string eventId, CancellationToken cancellationToken = default);
    Task<bool> SendWaitlistPromotionNotificationAsync(string waitlistId, CancellationToken cancellationToken = default);
    Task<bool> SendCertificateNotificationAsync(string certificateId, CancellationToken cancellationToken = default);

    // Utility
    Task<bool> IsEventFullAsync(string eventId, CancellationToken cancellationToken = default);
    Task<int> GetAvailableSpotsAsync(string eventId, CancellationToken cancellationToken = default);
    Task<bool> IsUserRegisteredAsync(string userId, string eventId, CancellationToken cancellationToken = default);
    Task<bool> IsUserOnWaitlistAsync(string userId, string eventId, CancellationToken cancellationToken = default);
}
