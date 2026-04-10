namespace DieticianAssociation.API.Services
{
    public class AuthService(
        ApplicationDbContext context,
        IJwtService jwtService,
        IPermissionService permissionService,
        IDirectEmailSendService directEmailSendService,
        ILogger<AuthService> logger) : IAuthService
    {
        private readonly ApplicationDbContext _context = context;
        private readonly IJwtService _jwtService = jwtService;
        private readonly IPermissionService _permissionService = permissionService;
        private readonly IDirectEmailSendService _directEmailSendService = directEmailSendService;
        private readonly ILogger<AuthService> _logger = logger;

        public async Task<AuthResponseDto?> LoginAsync(LoginRequestDto loginRequest, CancellationToken cancellationToken = default)
        {
           var user = await _context.Users
        .Include(u => u.Memberships)
        .Where(u => !u.IsDeleted && u.IsActive && u.Email != null)
        .FirstOrDefaultAsync(u => u.Email!.ToLower() == loginRequest.Email.ToLower(), cancellationToken);
            if (user == null || !BCrypt.Net.BCrypt.Verify(loginRequest.Password, user.PasswordHash))
            {
                return null;
            }

            if (user.Role == UserRole.Member)
            {
                var hasActiveMembership = user.Memberships?.Any(m => m.Status == MembershipStatus.Active) ?? false;
                var hasPendingMembership = user.Memberships?.Any(m => m.Status == MembershipStatus.Pending) ?? false;
                
                if (!hasActiveMembership && hasPendingMembership)
                {
                    throw new UnauthorizedAccessException("Your membership is pending approval. You cannot login yet.");
                }
            }

            user.EffectivePermissions = await _permissionService.GetEffectivePermissionsAsync(user.Id, cancellationToken);

            var token = await _jwtService.GenerateTokenAsync(user);
            var refreshToken = _jwtService.GenerateRefreshToken();
            var userDto = MapperExtensions.MapToUserDto(user);

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await _context.SaveChangesAsync(cancellationToken);

            return new AuthResponseDto
            {
                Token = token,
                RefreshToken = refreshToken,
                User = userDto,
                MustResetPassword = user.RequirePasswordReset
            };
        }

        public async Task<AuthResponseDto?> RegisterAsync(RegisterRequestDto registerRequest, CancellationToken cancellationToken = default)
        {
            // Check if user already exists
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email != null && registerRequest.Email != null && u.Email.ToLower() == registerRequest.Email.ToLower(), cancellationToken);

            if (existingUser != null)
            {
                return null; // User already exists
            }

            // Create new user
            var user = new User
            {
                Email = registerRequest.Email,
                Name = registerRequest.Name,
                Role = UserRole.Student, // Start as guest, will be upgraded based on membership
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerRequest.Password),
                Organization = registerRequest.Organization,
                PhoneNumber = registerRequest.Phone,
            };

            // Set role based on membership tier
            user.Role = UserRole.Student;
            _context.Users.Add(user);
            await _context.SaveChangesAsync(cancellationToken);

            await TrySendWelcomeEmailAsync(user, cancellationToken);

            user.EffectivePermissions = await _permissionService.GetEffectivePermissionsAsync(user.Id, cancellationToken);

            var token = await _jwtService.GenerateTokenAsync(user);
            var refreshToken = _jwtService.GenerateRefreshToken();
            var userDto = MapperExtensions.MapToUserDto(user);

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await _context.SaveChangesAsync(cancellationToken);

            return new AuthResponseDto
            {
                Token = token,
                RefreshToken = refreshToken,
                User = userDto,
                MustResetPassword = false
            };
        }


        public async Task<bool> ChangePasswordAsync(string userId, ChangePasswordDto changePassword, CancellationToken cancellationToken = default)
        {
            var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
            if (user == null)
            {
                return false;
            }

            // Verify current password
            if (!BCrypt.Net.BCrypt.Verify(changePassword.CurrentPassword, user.PasswordHash))
            {
                return false;
            }

            // Hash and update new password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(changePassword.NewPassword);
            user.RequirePasswordReset = false;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<AuthResponseDto?> ViewAsAsync(string adminUserId, string targetUserId, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(adminUserId) || string.IsNullOrWhiteSpace(targetUserId))
            {
                return null;
            }

            if (string.Equals(adminUserId, targetUserId, StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("You cannot view your own dashboard.");
            }

            var adminUser = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == adminUserId && !u.IsDeleted && u.IsActive, cancellationToken);

            if (adminUser == null)
            {
                return null;
            }

            var targetUser = await _context.Users
                .Include(u => u.Memberships)
                    .ThenInclude(m => m.MembershipPlan)
                .FirstOrDefaultAsync(u => u.Id == targetUserId && !u.IsDeleted && u.IsActive, cancellationToken);

            if (targetUser == null)
            {
                return null;
            }

            if (targetUser.Role is UserRole.Admin or UserRole.SuperAdmin)
            {
                throw new InvalidOperationException("Only member dashboards can be viewed with this action.");
            }

            targetUser.EffectivePermissions = await _permissionService.GetEffectivePermissionsAsync(targetUser.Id, cancellationToken);

            var token = await _jwtService.GenerateTokenAsync(
                targetUser,
                [
                    new Claim(DieticianAssociation.API.Constants.AppConstants.ClaimTypes.IsViewAs, "true"),
                    new Claim(DieticianAssociation.API.Constants.AppConstants.ClaimTypes.ImpersonatorUserId, adminUserId)
                ],
                mustResetPassword: false);

            var userDto = MapperExtensions.MapToUserDto(targetUser);

            return new AuthResponseDto
            {
                Token = token,
                RefreshToken = string.Empty,
                User = userDto,
                MustResetPassword = false
            };
        }

        public async Task<AuthResponseDto?> RefreshTokenAsync(RefreshTokenRequestDto request, CancellationToken cancellationToken = default)
        {
            var principal = _jwtService.GetPrincipalFromExpiredToken(request.Token);
            if (principal == null)
            {
                return null;
            }

            var userId = principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId))
            {
                return null;
            }

            var user = await _context.Users
                .Include(u => u.Memberships)
                    .ThenInclude(m => m.MembershipPlan)
                .FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted && u.IsActive, cancellationToken);

            if (user == null ||
                user.RefreshToken != request.RefreshToken ||
                user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                return null;
            }

            user.EffectivePermissions = await _permissionService.GetEffectivePermissionsAsync(user.Id, cancellationToken);

            var newToken = await _jwtService.GenerateTokenAsync(user);
            var newRefreshToken = _jwtService.GenerateRefreshToken();

            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await _context.SaveChangesAsync(cancellationToken);

            return new AuthResponseDto
            {
                Token = newToken,
                RefreshToken = newRefreshToken,
                User = MapperExtensions.MapToUserDto(user),
                MustResetPassword = user.RequirePasswordReset
            };
        }

        private async Task TrySendWelcomeEmailAsync(User user, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(user.Email))
            {
                return;
            }

            try
            {
                var safeName = string.IsNullOrWhiteSpace(user.Name) ? "Member" : user.Name;

                var bodyHtml = $@"
<p style='margin:0 0 12px 0;font-size:15px;'>Dear {safeName},</p>
<p style='margin:0 0 12px 0;font-size:14px;line-height:1.6;'>Welcome to the Association of Dietetics Professionals. Your registration is complete.</p>
<p style='margin:0 0 14px 0;font-size:14px;line-height:1.6;'>You can now log in and access member resources, events, and updates.</p>
<p style='margin:0;font-size:14px;line-height:1.6;'>Regards,<br/>Team ADP</p>";

                await _directEmailSendService.SendDirectAsync(new SendDirectEmailRequestDto
                {
                    To = user.Email,
                    Subject = "Welcome to Association of Dietetics Professionals",
                    BodyHtml = bodyHtml
                }, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Welcome email failed for registered user {UserId}", user.Id);
            }
        }


    }
}
