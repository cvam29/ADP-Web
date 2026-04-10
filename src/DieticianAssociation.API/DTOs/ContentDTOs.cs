using static DieticianAssociation.API.Constants.AppConstants;

namespace DieticianAssociation.API.DTOs;

// Blog DTOs
public class BlogPostDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty; // SEO-friendly URL slug
    public string? PreviousUrl { get; set; }
    public string Content { get; set; } = string.Empty;
    public string Excerpt { get; set; } = string.Empty;
    public string AuthorId { get; set; } = string.Empty;
    public UserDto? Author { get; set; } // Use DTO to avoid circular references
    public string Category { get; set; } = string.Empty;
    public string? Image { get; set; }
    public bool Featured { get; set; }
    public string ReadTime { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public string PublishedAt { get; set; } = string.Empty;
    public bool IsPublished { get; set; } = true;
    public int Version { get; set; } = 1;
    public string EditStatus { get; set; } = "Published";
    public bool HasPendingEdit { get; set; }
    public List<string> Tags { get; set; } = [];
    public string CreatedAt { get; set; } = string.Empty;
    public string UpdatedAt { get; set; } = string.Empty;
}

public class CreateBlogPostDto
{
    [Required]
    public string Title { get; set; } = string.Empty;

    public string? Url { get; set; } // Optional - will be auto-generated from title if not provided

    [Required]
    public string Content { get; set; } = string.Empty;

    [Required]
    public string Excerpt { get; set; } = string.Empty;


    public User? Author { get; set; }

    [Required]
    public string AuthorId { get; set; } = string.Empty;

    [Required]
    public string Category { get; set; } = string.Empty;

    public string? Image { get; set; }
    public bool Featured { get; set; }

    [Required]
    public string ReadTime { get; set; } = string.Empty;

    public bool IsPublished { get; set; } = true;
    public List<string> Tags { get; set; } = [];
}

// Event DTOs
public class EventDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty; // SEO-friendly URL slug
    public string Description { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Format { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Credits { get; set; } = string.Empty;
    public string Price { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public int Registered { get; set; }
    public List<UserDto> Speakers { get; set; } = [];
    public bool Recording { get; set; }
    public string? RecordingUrl { get; set; }
    public List<string> Images { get; set; } = [];
    public string CreatedAt { get; set; } = string.Empty;
    public string UpdatedAt { get; set; } = string.Empty;
}

public class CreateEventDto
{
    [Required]
    public string Title { get; set; } = string.Empty;

    // Optional - will be auto-generated from title if not provided
    public string? Url { get; set; }

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public DateTime Date { get; set; }

    [Required]
    public string Time { get; set; } = string.Empty;

    [Required]
    public string Location { get; set; } = string.Empty;

    [Required]
    public string Format { get; set; } = string.Empty;

    [Required]
    public string Type { get; set; } = string.Empty;

    [Required]
    public string Credits { get; set; } = string.Empty;

    [Required]
    public decimal Price { get; set; }

    [Required]
    public int Capacity { get; set; }

    // List of User IDs who are speakers
    public List<string> SpeakerIds { get; set; } = [];

    // Optional image URLs for the event
    public List<string> Images { get; set; } = [];

    public bool Recording { get; set; }

    public string? RecordingUrl { get; set; }
}

// Resource DTOs
public class ResourceDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Format { get; set; } = string.Empty;
    public int Downloads { get; set; }
    public bool Premium { get; set; }
    public string? DownloadUrl { get; set; }
    public string? FileSize { get; set; }
    public string Date { get; set; } = string.Empty;
}

public class CreateResourceDto
{
    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public string Category { get; set; } = string.Empty;

    [Required]
    public string Type { get; set; } = string.Empty;

    [Required]
    public string Format { get; set; } = string.Empty;

    public bool Premium { get; set; }

    [Required]
    public string DownloadUrl { get; set; } = string.Empty; // Blob storage URL

    public string? FileSize { get; set; }
}

public class FileUploadDto
{
    [Required]
    public IFormFile File { get; set; } = null!;

    public string Category { get; set; } = "general";
}

// Contact DTOs
public class ContactMessageDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? MobileNumber { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = string.Empty;
}

public class CreateContactMessageDto
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    public string? MobileNumber { get; set; }

    [Required]
    public string Subject { get; set; } = string.Empty;

    [Required]
    public string Message { get; set; } = string.Empty;

    [Required]
    public string Category { get; set; } = string.Empty;
}

public class TestimonialDto
{
    public string Id { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string MemberName { get; set; } = string.Empty;
    public string ProfessionalTitle { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
    public int Rating { get; set; }
    public bool ConsentToPublish { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool IsFeatured { get; set; }
    public string SubmittedByUserId { get; set; } = string.Empty;
    public string? ReviewedByUserId { get; set; }
    public string SubmittedAt { get; set; } = string.Empty;
    public string? ReviewedAt { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
    public string UpdatedAt { get; set; } = string.Empty;
    public string? RejectionReason { get; set; }
    public UserDto? SubmittedBy { get; set; }
    public UserDto? ReviewedBy { get; set; }
}

public class CreateTestimonialDto
{
    [Required]
    [StringLength(3000, MinimumLength = 30)]
    public string Content { get; set; } = string.Empty;

    [Required]
    [StringLength(200, MinimumLength = 2)]
    public string ProfessionalTitle { get; set; } = string.Empty;

    [Url]
    [StringLength(1000)]
    public string? PhotoUrl { get; set; }

    [Range(1, 5)]
    public int Rating { get; set; } = 5;

    [Range(typeof(bool), "true", "true", ErrorMessage = "Consent to publish is required.")]
    public bool ConsentToPublish { get; set; }
}

public class ReviewTestimonialDto
{
    [Required]
    public string Status { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? RejectionReason { get; set; }

    public bool IsFeatured { get; set; }
}

// Event Registration DTOs
public class EventRegistrationDto
{
    public string Id { get; set; } = string.Empty;
    public string EventId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public decimal AmountPaid { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string? PaymentTransactionId { get; set; }
    public string RegistrationStatus { get; set; } = string.Empty;
    public string RegistrationDate { get; set; } = string.Empty;
    public DateTime? CancellationDate { get; set; }
    public string? CancellationReason { get; set; }
    public bool CheckedIn { get; set; }
    public DateTime? CheckInTime { get; set; }
    public bool CertificateGenerated { get; set; }
    public string? CertificateUrl { get; set; }
    public string? SpecialRequests { get; set; }
    public EventDto? Event { get; set; }
}

public class RegisterForEventDto
{
    // EventId is set by the controller from the route parameter, so not required in the DTO
    public string EventId { get; set; } = string.Empty;

    public string? SpecialRequests { get; set; }

    [Required]
    public string PaymentMethod { get; set; } = "Razorpay";
}

public class EventWaitlistDto
{
    public string Id { get; set; } = string.Empty;
    public string EventId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public int Position { get; set; }
    public string JoinedWaitlistDate { get; set; } = string.Empty;
    public bool NotificationSent { get; set; }
    public DateTime? PromotedDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public EventDto? Event { get; set; }
}

public class JoinWaitlistDto
{
    [Required]
    public string EventId { get; set; } = string.Empty;
}

public class EventAttendanceDto
{
    public string Id { get; set; } = string.Empty;
    public string EventId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string RegistrationId { get; set; } = string.Empty;
    public string CheckInTime { get; set; } = string.Empty;
    public string? CheckOutTime { get; set; }
    public int DurationMinutes { get; set; }
    public bool EligibleForCertificate { get; set; }
    public string? FeedbackRating { get; set; }
    public string? FeedbackComments { get; set; }
}

public class CheckInEventDto
{
    [Required]
    public string EventId { get; set; } = string.Empty;

    [Required]
    public string RegistrationId { get; set; } = string.Empty;
}

public class EventCertificateDto
{
    public string Id { get; set; } = string.Empty;
    public string EventId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string CertificateNumber { get; set; } = string.Empty;
    public string ParticipantName { get; set; } = string.Empty;
    public string EventTitle { get; set; } = string.Empty;
    public string EventDate { get; set; } = string.Empty;
    public string Credits { get; set; } = string.Empty;
    public string IssueDate { get; set; } = string.Empty;
    public string CertificateUrl { get; set; } = string.Empty;
    public bool IsValid { get; set; }
    public DateTime? RevokedDate { get; set; }
    public string? RevokedReason { get; set; }
}

public class GenerateCertificateDto
{
    [Required]
    public string EventId { get; set; } = string.Empty;

    [Required]
    public string RegistrationId { get; set; } = string.Empty;
}

public class PaymentResponseDto
{
    public string PaymentId { get; set; } = string.Empty;
    public string OrderId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "INR";
    public string PaymentMethod { get; set; } = string.Empty;
    public DateTime PaymentDate { get; set; }
}

public class CreatePaymentOrderDto
{
    [Required]
    public string EventId { get; set; } = string.Empty;

    [Required]
    public decimal Amount { get; set; }

    [Required]
    public string Currency { get; set; } = "INR";
}

public class EventCalendarDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Location { get; set; } = string.Empty;
    public string TimeZone { get; set; } = "UTC";
    public bool IsAllDay { get; set; }
    public string RecurrenceRule { get; set; } = string.Empty;
    public List<string> Attendees { get; set; } = [];
}

public class EventReminderDto
{
    public string Id { get; set; } = string.Empty;
    public string EventId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string ReminderType { get; set; } = string.Empty;
    public string ScheduledTime { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool Sent { get; set; }
    public string? SentTime { get; set; }
    public string? DeliveryStatus { get; set; }
}

public class CreateReminderDto
{
    [Required]
    public string EventId { get; set; } = string.Empty;

    [Required]
    public string ReminderType { get; set; } = string.Empty; // Email, SMS, Push

    [Required]
    public DateTime ScheduledTime { get; set; }

    [Required]
    public string Content { get; set; } = string.Empty;
}

public class BulkReminderDto
{
    [Required]
    public string EventId { get; set; } = string.Empty;

    [Required]
    public string ReminderType { get; set; } = string.Empty;

    [Required]
    public List<DateTime> ScheduledTimes { get; set; } = [];

    public string? CustomMessage { get; set; }
}

public class EventFeedbackDto
{
    [Required]
    public string EventId { get; set; } = string.Empty;

    [Required]
    public string RegistrationId { get; set; } = string.Empty;

    [Required]
    [Range(1, 5)]
    public int Rating { get; set; }

    public string? Comments { get; set; }

    public Dictionary<string, string> CustomFields { get; set; } = [];
}

public class RefundRequestDto
{
    [Required]
    public string RegistrationId { get; set; } = string.Empty;

    [Required]
    public decimal Amount { get; set; }

    [Required]
    public string Reason { get; set; } = string.Empty;

    public bool PartialRefund { get; set; }
}

public class EventStatisticsDto
{
    public string EventId { get; set; } = string.Empty;
    public string EventTitle { get; set; } = string.Empty;
    public int TotalRegistrations { get; set; }
    public int TotalAttendees { get; set; }
    public int WaitlistCount { get; set; }
    public int CertificatesIssued { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal RefundAmount { get; set; }
    public double AttendanceRate { get; set; }
    public double AverageRating { get; set; }
    public Dictionary<string, int> PaymentMethodStats { get; set; } = [];
    public Dictionary<string, int> RegistrationsByDate { get; set; } = [];
}



public class CertificateDto
{
    public string CertificateNumber { get; set; } = string.Empty;
    public string ParticipantName { get; set; } = string.Empty;
    public string OrgRegistrationNumber { get; set; } = CertificateConstants.OrgRegistrationNumber;
    public string DarpanId { get; set; } = CertificateConstants.DarpanId;
    public string IssueDate { get; set; } = string.Empty;
    public string ExpireDate { get; set; } = string.Empty;
    public string QrCodeBase64 { get; set; } = string.Empty; // Base64-encoded QR code image
    public bool IsValid { get; set; }
    public string MemberShipName { get; set; } = string.Empty;
}

// Media DTOs
public class MediaFileDto
{
    public string Name { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string Folder { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public long Size { get; set; }
    public string? ContentType { get; set; }
    public DateTime LastModified { get; set; }
    public DateTime CreatedOn { get; set; }
}

public class MediaUploadDto
{
    [Required]
    public IFormFile File { get; set; } = null!;

    public string? Folder { get; set; }
}

public class MediaFolderDto
{
    public string Name { get; set; } = string.Empty;
    public int FileCount { get; set; }
    public long TotalSize { get; set; }
    public DateTime LastModified { get; set; }
}

public class CreateFolderDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
}

public class MediaUrlResponseDto
{
    public string FileName { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string DirectUrl { get; set; } = string.Empty;
    public string DownloadUrl { get; set; } = string.Empty;
}

public class MediaUploadResponseDto
{
    public string Url { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string Folder { get; set; } = string.Empty;
    public long Size { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; }
}

public record BlogSlugDto(string Url, DateTime UpdatedAt);

public record EventSlugDto(string Url, DateTime UpdatedAt);


