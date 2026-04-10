namespace DieticianAssociation.API.DTOs
{
    public class LoginRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterRequestDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(12)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [Compare("Password")]
        public string ConfirmPassword { get; set; } = string.Empty;

        public string? Organization { get; set; }

        [RegularExpression(@"^\+?[0-9]{7,15}$", ErrorMessage = "Phone number must be 7–15 digits, optionally prefixed with +.")]
        public string? Phone { get; set; }
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public UserDto User { get; set; } = new UserDto();
        public bool MustResetPassword { get; set; }
    }

    public class RefreshTokenRequestDto
    {
        [Required]
        public string Token { get; set; } = string.Empty;

        [Required]
        public string RefreshToken { get; set; } = string.Empty;
    }

    public class UserDto
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public int RoleId { get; set; } = 0;
        public string? Avatar { get; set; }
        public string? Phone { get; set; }
        public string? Organization { get; set; }
        public string? Bio { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        public bool IsFeatured { get; set; }
        public bool ConfirmationSent { get; set; }
        public bool TempPasswordSent { get; set; }
        public bool RequirePasswordReset { get; set; }
        public string Designation { get; set; } = string.Empty;
        public List<string>? Specializations { get; set; }
        public List<string> EffectivePermissions { get; set; } = [];
        public MembershipDto Membership { get; set; } = new MembershipDto();
    }

    public class ChangePasswordDto
    {
        [Required]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required]
        [MinLength(12)]
        public string NewPassword { get; set; } = string.Empty;

        [Required]
        [Compare("NewPassword")]
        public string ConfirmNewPassword { get; set; } = string.Empty;
    }

    // Admin DTOs for user management
    //public class UpdateMembershipDto
    //{
    //    [Required]
    //    public MembershipTier MembershipTier { get; set; }

    //    [Required]
    //    public MembershipStatus MembershipStatus { get; set; }

    //    public DateTime? ExpirationDate { get; set; }
    //}

    public class UpdateRoleDto
    {
        [Required]
        public UserRole Role { get; set; }
    }

    public class UpdateStatusDto
    {
        [Required]
        public bool IsActive { get; set; }
    }

    // DTOs for complete user CRUD operations
    public class CreateUserDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        public UserRole Role { get; set; } = UserRole.Student;

        public string? Phone { get; set; }
        public string? Organization { get; set; }

        public string? Designation { get; set; }
        public List<string>? Specializations { get; set; }
    }

    public class UpdateUserDto
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        //public UserRole? Role { get; set; }
        public string? Avatar { get; set; }
        public string? Phone { get; set; }
        public string? Organization { get; set; }
        public string? Bio { get; set; }
        public List<string>? Specializations { get; set; }
    }

    public class SetTemporaryPasswordDto
    {
        [Required]
        [MinLength(6)]
        public string TemporaryPassword { get; set; } = string.Empty;

        public bool SendEmail { get; set; } = true;

        public bool BccSupport { get; set; } = false;

        [EmailAddress]
        public string? SupportEmail { get; set; }

        public bool RequirePasswordReset { get; set; } = true;
    }

    public class UsersListDto
    {
        public List<UserDto> Users { get; set; } = [];
        public int TotalUsers { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class UserStatsDto
    {
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int PendingUsers { get; set; }
        public int SuspendedUsers { get; set; }
        public int ExpiredUsers { get; set; }
        public int AdminUsers { get; set; }
        public int ProfessionalUsers { get; set; }
        public int StudentUsers { get; set; }
        public int PremiumUsers { get; set; }
    }

    public class MemberDirectoryItemDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Avatar { get; set; }
        public string? Designation { get; set; }
        public string? Organization { get; set; }
        public List<string>? Specializations { get; set; }
        public string MembershipTier { get; set; } = string.Empty;
        public DateTime JoinDate { get; set; }
    }

    public class MemberDirectoryFacetDto
    {
        public string Name { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class MemberDirectoryResponseDto
    {
        public List<MemberDirectoryItemDto> Items { get; set; } = [];
        public int TotalCount { get; set; }
        public List<MemberDirectoryFacetDto> MembershipTiers { get; set; } = [];
    }
}
