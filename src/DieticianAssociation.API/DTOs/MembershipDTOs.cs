namespace DieticianAssociation.API.DTOs
{
    public class MembershipPlanDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public MembershipTier Tier { get; set; }
        public decimal Price { get; set; }
        public int Duration { get; set; }
        public List<string> Features { get; set; } = [];
        public bool Popular { get; set; }

        // Additional detailed pricing fields
        public decimal? InitialFee { get; set; }
        public decimal? RenewalFee { get; set; }
        public decimal? DiscountedPrice { get; set; }
        public decimal? DiscountedRenewalFee { get; set; }
        public string? Discount { get; set; }
        public decimal? PriceWithGST { get; set; }
        public decimal? RenewalPriceWithGST { get; set; }
        public string? Description { get; set; }
        public List<string> PermissionKeys { get; set; } = [];
    }

    public class CreateMembershipPlanDto
    {
        public string Name { get; set; } = string.Empty;
        public MembershipTier Tier { get; set; }
        public decimal Price { get; set; }
        public int Duration { get; set; }
        public List<string> Features { get; set; } = [];
        public bool Popular { get; set; }

        // Additional detailed pricing fields
        public decimal? InitialFee { get; set; }
        public decimal? RenewalFee { get; set; }
        public decimal? DiscountedPrice { get; set; }
        public decimal? DiscountedRenewalFee { get; set; }
        public string? Discount { get; set; }
        public decimal? PriceWithGST { get; set; }
        public decimal? RenewalPriceWithGST { get; set; }
        public string? Description { get; set; }
        public List<string> PermissionKeys { get; set; } = [];
    }

    public class UpdateMembershipDto
    {
        public string MembershipPlanId { get; set; } = string.Empty;
        public MembershipStatus Status { get; set; } = MembershipStatus.Pending;
        public DateTime? StartDate { get; set; }
    }

    public class MembershipDto
    {
        public string Name { get; set; } = string.Empty;
        public string Tier { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string JoinDate { get; set; } = string.Empty;
        public string ExpirationDate { get; set; } = string.Empty;
    }

    public class MembershipRegistrationRequest
    {
        public string PersonalInfo { get; set; } = string.Empty;
        public string MembershipDetails { get; set; } = string.Empty;
        public string Declaration { get; set; } = string.Empty;
        public IFormFile? Receipt { get; set; }
        public List<IFormFile>? EducationFiles { get; set; }
    }

    public class PersonalInfoDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; } = string.Empty;
        public Nationality Nationality { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;

        // Address
        public string StreetAddress { get; set; } = string.Empty;
        public string? AddressLine2 { get; set; }
        public string PostalCode { get; set; } = string.Empty;
        public long CountryId { get; set; }
        public long StateId { get; set; }
        public long CityId { get; set; }
    }
    public class EducationDto
    {
        public EducationLevel Level { get; set; }
        public string Course { get; set; } = string.Empty;
        public string University { get; set; } = string.Empty;
        public EducationStatus Status { get; set; }
        public string? Marks { get; set; }
        public IFormFile? DegreeFile { get; set; }
    }
    public class MembershipDetailsDto
    {
        public string MembershipPlanId { get; set; } = string.Empty;
        public List<EducationDto> EducationDetails { get; set; } = [];
    }

    public class DeclarationDto
    {
        public bool AgreeDeclaration { get; set; }
        public bool AgreeTerms { get; set; }
        public bool AgreePrivacy { get; set; }
        public bool AgreeDataUsage { get; set; }
    }

    public class MembershipRegistrationResultDto
    {
        public string Message { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string MembershipId { get; set; } = string.Empty;
        public string ApplicationRequestId { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public MembershipStatus MembershipStatus { get; set; } = MembershipStatus.Pending;
        public bool ConfirmationSent { get; set; }
        public bool TempPasswordSent { get; set; }
    }

    // User Membership Management DTOs
    public class UserMembershipDto
    {
        public string Id { get; set; } = string.Empty;
        public string ApplicationRequestId { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string? UserPhone { get; set; }
        public string MembershipPlanId { get; set; } = string.Empty;
        public string MembershipPlanName { get; set; } = string.Empty;
        public MembershipTier MembershipTier { get; set; }
        public MembershipStatus Status { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime? RenewedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string PaymentFilePath { get; set; } = string.Empty;
        public string PaymentRecordId { get; set; } = string.Empty;
        public PaymentStatus? PaymentStatus { get; set; }

        // Email-related flags (admin visibility)
        public bool ConfirmationSent { get; set; }
        public bool TempPasswordSent { get; set; }
        public bool RequirePasswordReset { get; set; }
    }


    public class UpdateUserMembershipStatusDto
    {
        [Required]
        public MembershipStatus Status { get; set; }
    }

    public class UpdateUserMembershipPlanDto
    {
        [Required]
        public string MembershipPlanId { get; set; } = string.Empty;
    }

}
