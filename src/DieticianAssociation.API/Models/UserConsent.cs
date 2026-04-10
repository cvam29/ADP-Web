namespace DieticianAssociation.API.Models
{
    public class UserConsent
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        // 🔗 Who accepted
        [Required]
        public string UserId { get; set; } = string.Empty;

        // 📜 What was accepted
        [Required]
        [MaxLength(100)]
        public string ConsentType { get; set; } = string.Empty;
        // e.g. MembershipTerms, PrivacyPolicy, ExamDeclaration

        // 📄 Snapshot of content
        [Required]
        public string ContentSnapshot { get; set; } = string.Empty;

        // ✅ Confirmation
        [Required]
        public bool IsAccepted { get; set; }

        // 🌐 Audit Info
        [MaxLength(45)]
        public string? IpAddress { get; set; }

        [MaxLength(255)]
        public string? UserAgent { get; set; }

        public DateTime AcceptedAt { get; set; } = DateTime.UtcNow;

        // 🔗 Navigation
        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }
    }
}
