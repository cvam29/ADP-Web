namespace DieticianAssociation.API.Models
{
    public enum UserRole
    {
        [EnumMember(Value = "student")]
        Student = 0,

        [EnumMember(Value = "member")]
        Member = 3,

        [EnumMember(Value = "superAdmin")]
        SuperAdmin = 1,

        [EnumMember(Value = "admin")]
        Admin = 2
    }

    public enum Nationality
    {
        [EnumMember(Value = "indian")]
        Indian = 0,


        [EnumMember(Value = "other")]
        Other = 99
    }

    public enum MembershipTier
    {
        [EnumMember(Value = "student")]
        Student = 0,

        [EnumMember(Value = "professional")]
        Professional = 1,

        [EnumMember(Value = "premium")]
        Premium = 2
    }

    public enum MembershipStatus
    {
        [EnumMember(Value = "active")]
        Active = 0,

        [EnumMember(Value = "expired")]
        Expired = 1,

        [EnumMember(Value = "pending")]
        Pending = 2,

        [EnumMember(Value = "suspended")]
        Suspended = 3
    }

    public class User
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        public string Name { get; set; } = string.Empty;

        public string? PhoneNumber { get; set; }

        public UserRole Role { get; set; } = UserRole.Student;

        public string? Avatar { get; set; }

        public string? Organization { get; set; }

        public string? Bio { get; set; }

        public List<string>? Specializations { get; set; }

        public bool RequirePasswordReset { get; set; } = false;

        public bool ConfirmationSent { get; set; } = false;

        public bool TempPasswordSent { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public DateTime JoinDate { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
        public bool IsFeatured { get; set; } = false;
        public string Designation { get; set; } = string.Empty;
        public DateTime Dob { get; set; }
        public string Gender { get; set; } = string.Empty;

        public Nationality Nationality { get; set; } = Nationality.Indian;

        // ✅ Soft Delete
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }

        // Refresh Token
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }

        [NotMapped]
        public List<string> EffectivePermissions { get; set; } = [];


        [NotMapped]
        public UserMembership? LatestMembership
        {
            get
            {
                return Memberships?
                    .OrderByDescending(m => m.CreatedAt) // Or use ExpirationDate if that's the criteria
                    .FirstOrDefault(x => x.Status == MembershipStatus.Active);
            }
        }

        [NotMapped]
        public PaymentRecord? LatestPaymentRecord
        {
            get
            {
                return PaymentRecords?
                    .OrderByDescending(m => m.CreatedAt) // Or use ExpirationDate if that's the criteria
                    .FirstOrDefault(x => !string.IsNullOrWhiteSpace(x.ProofFilePath));

            }
        }

        public virtual ICollection<UserMembership> Memberships { get; set; } = [];

        public virtual ICollection<BlogPost> BlogPosts { get; set; } = [];

        public virtual ICollection<Address> Addresses { get; set; } = [];

        public virtual ICollection<EducationQualification> EducationQualifications { get; set; } = [];

        public virtual ICollection<PaymentRecord> PaymentRecords { get; set; } = [];

        public virtual ICollection<UserConsent> UserConsents { get; set; } = [];

        public virtual ICollection<UserPermissionAssignment> PermissionAssignments { get; set; } = [];
    }
}
