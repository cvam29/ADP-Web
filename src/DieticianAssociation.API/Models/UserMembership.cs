namespace DieticianAssociation.API.Models
{
    public class UserMembership
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [MaxLength(32)]
        public string ApplicationRequestId { get; set; } = string.Empty;

        // Foreign Key - User
        [Required]
        public string UserId { get; set; } = string.Empty;

        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; } = null!;

        // Foreign Key - Membership Plan
        [Required]
        public string MembershipPlanId { get; set; } = string.Empty;

        [ForeignKey(nameof(MembershipPlanId))]
        public virtual MembershipPlan MembershipPlan { get; set; } = null!;

        // Status of this membership
        [Required]
        public MembershipStatus Status { get; set; } = MembershipStatus.Pending;

        // Membership start & expiry dates
        [Required]
        public DateTime StartDate { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime EndDate { get; set; }

        // Renewal tracking
        public DateTime? RenewedAt { get; set; }

        // Audit fields
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
