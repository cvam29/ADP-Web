namespace DieticianAssociation.API.DTOs
{
    // Nested DTOs for User Detail
    public class MembershipDetailDto
    {
        public string Id { get; set; } = string.Empty;
        public string ApplicationRequestId { get; set; } = string.Empty;
        public string MembershipPlanId { get; set; } = string.Empty;
        public string MembershipPlanName { get; set; } = string.Empty;
        public MembershipTier Tier { get; set; }
        public MembershipStatus Status { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime? RenewedAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AddressDetailDto
    {
        public Guid Id { get; set; }
        public string StreetAddress { get; set; } = string.Empty;
        public string? AddressLine2 { get; set; }
        public string PostalCode { get; set; } = string.Empty;
        public string CityName { get; set; } = string.Empty;
        public string StateName { get; set; } = string.Empty;
        public string CountryName { get; set; } = string.Empty;
        public bool IsPrimary { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class EducationDetailDto
    {
        public Guid Id { get; set; }
        public EducationLevel Level { get; set; }
        public string CourseOrStream { get; set; } = string.Empty;
        public string UniversityOrBoard { get; set; } = string.Empty;
        public EducationStatus Status { get; set; }
        public string? Marks { get; set; }
        public string? DegreeFilePath { get; set; }
        public int? StartYear { get; set; }
        public int? EndYear { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class PaymentDetailDto
    {
        public Guid Id { get; set; }
        public string ReferenceType { get; set; } = string.Empty;
        public Guid ReferenceId { get; set; }
        public decimal Amount { get; set; }
        public PaymentMethod Method { get; set; }
        public PaymentStatus Status { get; set; }
        public string ProofFilePath { get; set; } = string.Empty;
        public string? TransactionReference { get; set; }
        public string? BankOrGatewayName { get; set; }
        public DateTime PaidAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class UserConsentDetailDto
    {
        public bool AgreeToTerms { get; set; }
        public bool AgreeToPrivacyPolicy { get; set; }
        public bool AgreeToDataUsage { get; set; }
        public DateTime ConsentedAt { get; set; }
    }

    // Main User Detail DTO
    public class UserDetailDto
    {
        // Basic Info
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public UserRole Role { get; set; }
        public string? Avatar { get; set; }
        public string? Organization { get; set; }
        public List<string>? Specializations { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime JoinDate { get; set; }
        public bool IsActive { get; set; }
        public bool IsFeatured { get; set; }
        public bool ConfirmationSent { get; set; }
        public bool TempPasswordSent { get; set; }
        public string Designation { get; set; } = string.Empty;
        public DateTime Dob { get; set; }
        public string Gender { get; set; } = string.Empty;
        public Nationality Nationality { get; set; }

        // Related Collections
        public List<MembershipDetailDto> Memberships { get; set; } = [];
        public List<AddressDetailDto> Addresses { get; set; } = [];
        public List<EducationDetailDto> EducationQualifications { get; set; } = [];
        public List<PaymentDetailDto> PaymentRecords { get; set; } = [];
        public UserConsentDetailDto? UserConsent { get; set; }

        // Statistics
        public int BlogPostsCount { get; set; }
    }

    // Update DTOs
    public class UpdatePaymentStatusDto
    {
        [Required]
        public PaymentStatus Status { get; set; }
    }
}
