namespace DieticianAssociation.API.Models
{
    public enum PermissionAssignmentEffect
    {
        Allow = 0,
        Deny = 1
    }

    public class Permission
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [MaxLength(120)]
        public string Key { get; set; } = string.Empty;

        [Required]
        [MaxLength(160)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(80)]
        public string Category { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<UserPermissionAssignment> UserAssignments { get; set; } = [];

        public virtual ICollection<MembershipPlanPermission> MembershipPlanAssignments { get; set; } = [];
    }

    public class UserPermissionAssignment
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string UserId { get; set; } = string.Empty;

        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; } = null!;

        [Required]
        public string PermissionId { get; set; } = string.Empty;

        [ForeignKey(nameof(PermissionId))]
        public virtual Permission Permission { get; set; } = null!;

        [Required]
        public PermissionAssignmentEffect Effect { get; set; } = PermissionAssignmentEffect.Allow;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class MembershipPlanPermission
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string MembershipPlanId { get; set; } = string.Empty;

        [ForeignKey(nameof(MembershipPlanId))]
        public virtual MembershipPlan MembershipPlan { get; set; } = null!;

        [Required]
        public string PermissionId { get; set; } = string.Empty;

        [ForeignKey(nameof(PermissionId))]
        public virtual Permission Permission { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}