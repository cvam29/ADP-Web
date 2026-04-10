namespace DieticianAssociation.API.Models;

public class BlogPost
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Title { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty; // SEO-friendly URL slug
    public string? PreviousUrl { get; set; } // Previous URL slug for redirect support
    public string Content { get; set; } = string.Empty;
    public string Excerpt { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;
    public string? Image { get; set; }
    public bool Featured { get; set; }
    public string ReadTime { get; set; } = string.Empty;
    public DateTime PublishedDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public bool IsPublished { get; set; } = true;
    public int Version { get; set; } = 1;
    public string EditStatus { get; set; } = "Published"; // Published, PendingReview, Draft
    public string? PendingContent { get; set; } // Pending edit content awaiting approval
    public string? PendingTitle { get; set; }
    public string? PendingExcerpt { get; set; }
    public string? PendingCategory { get; set; }
    public string? PendingImage { get; set; }
    public string? PendingReadTime { get; set; }
    public List<string> Tags { get; set; } = [];
    [ForeignKey(nameof(Author))]
    public string AuthorId { get; set; } = string.Empty;
    public virtual User? Author { get; set; }
}

public class Event
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty; // SEO-friendly URL slug    
    public DateTime Date { get; set; }
    public string Time { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Format { get; set; } = "Virtual"; // Virtual, In-Person
    public string Type { get; set; } = string.Empty; // Conference, Webinar, Workshop
    public string Credits { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Capacity { get; set; }
    public int Registered { get; set; }
    public List<User> Speakers { get; set; } = [];
    public bool Recording { get; set; }
    public string? RecordingUrl { get; set; }
    public List<string> Images { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class Resource
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // PDF, Video, Document
    public string Format { get; set; } = string.Empty;
    public int Downloads { get; set; }
    public bool Premium { get; set; }
    public string? DownloadUrl { get; set; }
    public string? FileSize { get; set; }
    public DateTime PublishedDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class ContactMessage
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? MobileNumber { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Status { get; set; } = "New"; // New, In Progress, Resolved
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public static class TestimonialStatuses
{
    public const string Pending = "Pending";
    public const string Approved = "Approved";
    public const string Rejected = "Rejected";

    public static readonly IReadOnlySet<string> All = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        Pending,
        Approved,
        Rejected,
    };
}

public class Testimonial
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [MaxLength(3000)]
    public string Content { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string MemberName { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string ProfessionalTitle { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? PhotoUrl { get; set; }

    [Range(1, 5)]
    public int Rating { get; set; } = 5;

    public bool ConsentToPublish { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = TestimonialStatuses.Pending;

    [MaxLength(1000)]
    public string? RejectionReason { get; set; }

    public bool IsFeatured { get; set; }

    [ForeignKey(nameof(SubmittedBy))]
    public string SubmittedByUserId { get; set; } = string.Empty;
    public virtual User? SubmittedBy { get; set; }

    [ForeignKey(nameof(ReviewedBy))]
    public string? ReviewedByUserId { get; set; }
    public virtual User? ReviewedBy { get; set; }

    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReviewedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

