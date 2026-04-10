

using DieticianAssociation.API.Constants;

namespace DieticianAssociation.API.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<UserService> _logger;
        private readonly IDirectEmailSendService _directEmailSendService;
        private readonly IConfiguration _configuration;
        private readonly IPermissionService _permissionService;

        public UserService(
            ApplicationDbContext context,
            ILogger<UserService> logger,
            IDirectEmailSendService directEmailSendService,
            IConfiguration configuration,
            IPermissionService permissionService)
        {
            _context = context;
            _logger = logger;
            _directEmailSendService = directEmailSendService;
            _configuration = configuration;
            _permissionService = permissionService;
        }

        // CRUD Operations
        public async Task<PagedResult<UserDto>> GetAllUsersAsync(PagedRequest request, bool includeDeleted = false, CancellationToken cancellationToken = default)
        {
            try
            {
                var query = _context.Users
                    .AsNoTracking();

                if (includeDeleted)
                {
                    query = query.IgnoreQueryFilters();
                }

                query = query
                    .Include(u => u.Memberships).ThenInclude(x => x.MembershipPlan)
                    .Where(u => u.Role != UserRole.SuperAdmin)
                    .AsQueryable();

                // 🔍 Apply search on basic fields
                if (!string.IsNullOrEmpty(request.Search))
                {
                    query = query.Where(u =>
                        (u.Name != null && u.Name.Contains(request.Search)) ||
                        (u.Email != null && u.Email.Contains(request.Search)) ||
                        (u.Organization != null && u.Organization.Contains(request.Search)));
                }

                // 📅 Date range filter (CreatedAt)
                if (request.Filters != null &&
                    request.Filters.TryGetValue("dateRange", out var dateRange))
                {
                    query = query.ApplyDateRangeFilter(dateRange?.ToString(), x => x.CreatedAt);

                    // ❗ Remove so ApplyFilters does not try equality comparison
                    request.Filters.Remove("dateRange");
                }

                // 🔎 Apply dynamic filters (supports nested props like Role.Name=Admin)
                query = query.ApplyFilters(request);
                // var sql = query.ToQueryString();
                // 📄 Convert to PagedResult<UserDto>
                var result = await query
                    .ToPagedResultAsync(request, MapperExtensions.MapToUserDto, cancellationToken);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all users");
                throw;
            }
        }

        public async Task<UserDto?> GetUserByIdAsync(string userId, CancellationToken cancellationToken = default)
        {
            try
            {
                var user = await _context.Users
                    .AsNoTracking()
                    .Include(u => u.Memberships)
                        .ThenInclude(m => m.MembershipPlan)
                    .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
                if (user == null)
                {
                    return null;
                }

                user.EffectivePermissions = await _permissionService.GetEffectivePermissionsAsync(user.Id, cancellationToken);
                return MapperExtensions.MapToUserDto(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user {UserId}", userId);
                throw;
            }
        }

        public async Task<UserDto?> GetUserByEmailAsync(string email, CancellationToken cancellationToken = default)
        {
            try
            {
                var normalizedEmail = email.Trim().ToLower();
                var user = await _context.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u =>
                        !u.IsDeleted &&
                        u.Email != null &&
                        u.Email.ToLower() == normalizedEmail, cancellationToken);

                if (user == null)
                {
                    return null;
                }

                user.EffectivePermissions = await _permissionService.GetEffectivePermissionsAsync(user.Id, cancellationToken);
                return MapperExtensions.MapToUserDto(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user by email {Email}", email);
                throw;
            }
        }

        public async Task<UserDto?> CreateUserAsync(CreateUserDto createUser, CancellationToken cancellationToken = default)
        {
            try
            {
                // Check if user already exists
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email != null && u.Email.ToLower() == createUser.Email.ToLower(), cancellationToken);

                if (existingUser != null)
                {
                    return null; // User already exists
                }

                var user = new User
                {
                    Name = createUser.Name,
                    Email = createUser.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(createUser.Password),
                    RequirePasswordReset = true,
                    Role = createUser.Role,
                    PhoneNumber = createUser.Phone,
                    Organization = createUser.Organization,
                    Specializations = createUser.Specializations,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    IsActive = true,
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync(cancellationToken);

                await TrySendWelcomeEmailAsync(user, cancellationToken);

                _logger.LogInformation("User created successfully: {UserId}", user.Id);
                user.EffectivePermissions = await _permissionService.GetEffectivePermissionsAsync(user.Id, cancellationToken);
                return MapperExtensions.MapToUserDto(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                throw;
            }
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
                var membership = user.Memberships?.FirstOrDefault(m => m.Status == MembershipStatus.Active) 
                                 ?? user.Memberships?.FirstOrDefault();

                var planName = membership?.MembershipPlan?.Name ?? "Pending";
                var status = membership?.Status.ToString() ?? "Pending";
                var startDate = membership?.StartDate.ToString("dd MMM yyyy") ?? "-";
                var expiryDate = membership?.EndDate.ToString("dd MMM yyyy") ?? "-";
                var loginUrl = _configuration["App:FeBaseUrl"] + "/login";
                var year = DateTime.UtcNow.Year.ToString();

   

                var supportEmails = _configuration["SupportSettings:Emails"];
                var bccList = supportEmails?.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

                await _directEmailSendService.SendDirectAsync(new SendDirectEmailRequestDto
                {
                    To = user.Email,
                    Subject = "Welcome to Association of Dietetics Professionals",
                    BodyHtml = EmailConstants.WelcomeEmailTemplate
                        .Replace("{{Name}}", safeName)
                        .Replace("{{MembershipPlanName}}", planName)
                        .Replace("{{MembershipStatus}}", status)
                        .Replace("{{MembershipStartDate}}", startDate)
                        .Replace("{{MembershipExpiryDate}}", expiryDate)
                        .Replace("{{LoginUrl}}", loginUrl)
                        .Replace("{{Year}}", year),
                    Bcc = bccList
                });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Welcome email failed for user {UserId}", user.Id);
            }
        }

        public async Task<UserDto?> UpdateUserAsync(string userId, UpdateUserDto updateUser, CancellationToken cancellationToken = default)
        {
            try
            {
                var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
                if (user == null)
                {
                    return null;
                }

                // Update only provided fields
                if (!string.IsNullOrWhiteSpace(updateUser.Name))
                    user.Name = updateUser.Name;

                if (!string.IsNullOrWhiteSpace(updateUser.Email))
                {
                    // Check if email is already in use by another user
                    var emailExists = await _context.Users
                        .AnyAsync(u => u.Id != userId && u.Email != null && u.Email.ToLower() == updateUser.Email.ToLower(), cancellationToken);

                    if (emailExists)
                    {
                        throw new InvalidOperationException("Email is already in use by another user");
                    }

                    user.Email = updateUser.Email;
                }

                user.Avatar = string.IsNullOrWhiteSpace(updateUser.Avatar)
                    ? updateUser.Avatar == string.Empty ? null : user.Avatar
                    : updateUser.Avatar.Trim();

                if (!string.IsNullOrWhiteSpace(updateUser.Phone))
                    user.PhoneNumber = updateUser.Phone;

                if (!string.IsNullOrWhiteSpace(updateUser.Organization))
                    user.Organization = updateUser.Organization;

                if (updateUser.Bio != null)
                {
                    user.Bio = string.IsNullOrWhiteSpace(updateUser.Bio)
                        ? null
                        : updateUser.Bio.Trim();
                }

                if (updateUser.Specializations != null)
                    user.Specializations = updateUser.Specializations;

                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("User updated successfully: {UserId}", userId);
                user.EffectivePermissions = await _permissionService.GetEffectivePermissionsAsync(user.Id, cancellationToken);
                return MapperExtensions.MapToUserDto(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> SetTemporaryPasswordAsync(string userId, SetTemporaryPasswordDto request, CancellationToken cancellationToken = default)
        {
            try
            {
                await using var tx = await _context.Database.BeginTransactionAsync(cancellationToken);

                var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == userId && !x.IsDeleted, cancellationToken);
                if (user == null)
                {
                    return false;
                }

                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.TemporaryPassword);
                user.RequirePasswordReset = request.RequirePasswordReset;
                user.TempPasswordSent = false;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync(cancellationToken);

                if (request.SendEmail && !string.IsNullOrWhiteSpace(user.Email))
                {
                    var sent = await TrySendTemporaryPasswordEmailAsync(user, request, cancellationToken);
                    if (!sent)
                    {
                        await tx.RollbackAsync(cancellationToken);
                        throw new InvalidOperationException("Temporary password email could not be sent. No changes were saved.");
                    }

                    user.TempPasswordSent = true;
                    user.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync(cancellationToken);
                }

                await tx.CommitAsync(cancellationToken);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting temporary password for user {UserId}", userId);
                throw;
            }
        }

        private async Task<bool> TrySendTemporaryPasswordEmailAsync(User user, SetTemporaryPasswordDto request, CancellationToken cancellationToken = default)
        {
            try
            {
                var safeName = string.IsNullOrWhiteSpace(user.Name) ? "Member" : user.Name;
                var loginUrl = (_configuration["App:FeBaseUrl"] ?? string.Empty).TrimEnd('/') + "/login";

                var bccList = new List<string>();
                if (request.BccSupport)
                {
                    if (!string.IsNullOrWhiteSpace(request.SupportEmail))
                    {
                        bccList.Add(request.SupportEmail.Trim());
                    }

                    var configuredSupport = _configuration["SupportSettings:Emails"];
                    if (!string.IsNullOrWhiteSpace(configuredSupport))
                    {
                        bccList.AddRange(
                            configuredSupport
                                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                        );
                    }
                }

                var htmlBody = EmailConstants.PasswordResetAdminNotificationEmailTemplate
                    .Replace("{{Name}}", safeName)
                    .Replace("{{LoginUrl}}", loginUrl)
                    .Replace("{{TemporaryPassword}}", request.TemporaryPassword)
                    .Replace("{{Year}}", DateTime.UtcNow.Year.ToString());

                await _directEmailSendService.SendDirectAsync(new SendDirectEmailRequestDto
                {
                    To = user.Email!,
                    Subject = "Your temporary ADP password",
                    BodyHtml = htmlBody,
                    Bcc = bccList.Count > 0 ? bccList.Distinct(StringComparer.OrdinalIgnoreCase).ToList() : null
                });

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Temporary password email failed for user {UserId}", user.Id);
                return false;
            }
        }

        // Export Operations
        public async Task<byte[]> ExportUsersToExcelAsync(CancellationToken cancellationToken = default)
        {
            // Placeholder implementation - would require a library like EPPlus
            await Task.CompletedTask;
            throw new NotImplementedException("Excel export requires additional dependencies");
        }

        public async Task<string> ExportUsersToCsvAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                var users = await _context.Users.AsNoTracking().OrderBy(u => u.Name).ToListAsync(cancellationToken);
                var csv = new StringBuilder();

                // CSV Header
                csv.AppendLine("Id,Name,Email,Role,MembershipTier,MembershipStatus,JoinDate,ExpirationDate,Phone,Organization");

                // CSV Data
                foreach (var user in users)
                {
                    //csv.AppendLine($"{user.Id},{user.Name},{user.Email},{user.Role},{user.MembershipTier},{user.MembershipStatus},{user.JoinDate:yyyy-MM-dd},{user.ExpirationDate:yyyy-MM-dd},{user.PhoneNumber},{user.Organization}");
                }

                return csv.ToString();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting users to CSV");
                throw;
            }
        }

        public async Task<UserDto?> UpdateUserMembershipAsync(string userId, UpdateMembershipDto updateMembership, CancellationToken cancellationToken = default)
        {
            var user = await _context.Users
                .Include(u => u.Memberships)
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

            if (user == null)
                return null;

            var membershipPlan = await _context.MembershipPlans
                .FirstOrDefaultAsync(mp => mp.Id == updateMembership.MembershipPlanId, cancellationToken);

            if (membershipPlan == null)
                return null; // Invalid membership plan

            // Check if user already has an active membership
            var existingMembership = user.Memberships
                .FirstOrDefault(m => m.MembershipPlanId == membershipPlan.Id && m.Status == MembershipStatus.Active);

            if (existingMembership != null)
            {
                // Update existing membership
                existingMembership.StartDate = updateMembership?.StartDate ?? DateTime.UtcNow;
                existingMembership.EndDate = DateTime.UtcNow.AddMonths(membershipPlan.Duration);
                existingMembership.Status = updateMembership?.Status ?? MembershipStatus.Pending;
                _context.UserMemberships.Update(existingMembership);
            }
            else
            {
                // Create new membership
                var newMembership = new UserMembership
                {
                    ApplicationRequestId = await GenerateUniqueApplicationRequestIdAsync(cancellationToken),
                    UserId = user.Id,
                    MembershipPlanId = membershipPlan.Id,
                    Status = updateMembership?.Status ?? MembershipStatus.Pending,
                    StartDate = updateMembership?.StartDate ?? DateTime.UtcNow,
                    EndDate = DateTime.UtcNow.AddMonths(membershipPlan.Duration)
                };

                _context.UserMemberships.Add(newMembership);
            }

            await _context.SaveChangesAsync(cancellationToken);

            // Reload with memberships
            user = await _context.Users
                .Include(x => x.Memberships)
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

            if (user == null)
                return null;

            return MapperExtensions.MapToUserDto(user);
        }

        public async Task<UserDetailDto?> GetUserDetailByIdAsync(string userId, CancellationToken cancellationToken = default)
        {
            var user = await _context.Users
                .AsNoTracking()
                .AsSplitQuery()
                .Include(u => u.Memberships).ThenInclude(m => m.MembershipPlan)
                .Include(u => u.Addresses).ThenInclude(a => a.Country)
                .Include(u => u.Addresses).ThenInclude(a => a.State)
                .Include(u => u.Addresses).ThenInclude(a => a.City)
                .Include(u => u.EducationQualifications)
                .Include(u => u.PaymentRecords)
                .Include(u => u.UserConsents)
                .FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted, cancellationToken);

            if (user == null) return null;

            var blogPostsCount = await _context.BlogPosts
                .CountAsync(b => b.AuthorId == userId, cancellationToken);

            return new UserDetailDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role,
                Avatar = user.Avatar,
                Organization = user.Organization,
                Specializations = user.Specializations,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt,
                JoinDate = user.JoinDate,
                IsActive = user.IsActive,
                IsFeatured = user.IsFeatured,
                ConfirmationSent = user.ConfirmationSent,
                TempPasswordSent = user.TempPasswordSent,
                Designation = user.Designation,
                Dob = user.Dob,
                Gender = user.Gender,
                Nationality = user.Nationality,

                Memberships = user.Memberships
                    .OrderByDescending(m => m.CreatedAt)
                    .Select(m => new MembershipDetailDto
                    {
                        Id = m.Id,
                        ApplicationRequestId = m.ApplicationRequestId,
                        MembershipPlanId = m.MembershipPlanId,
                        MembershipPlanName = m.MembershipPlan.Name,
                        Tier = m.MembershipPlan.Tier,
                        Status = m.Status,
                        StartDate = m.StartDate,
                        EndDate = m.EndDate,
                        RenewedAt = m.RenewedAt,
                        CreatedAt = m.CreatedAt
                    }).ToList(),

                Addresses = user.Addresses
                    .Where(a => !a.IsDeleted)
                    .OrderByDescending(a => a.IsPrimary)
                    .ThenByDescending(a => a.CreatedAt)
                    .Select(a => new AddressDetailDto
                    {
                        Id = a.Id,
                        StreetAddress = a.StreetAddress,
                        AddressLine2 = a.AddressLine2,
                        PostalCode = a.PostalCode,
                        CityName = a.City?.Name ?? "",
                        StateName = a.State?.Name ?? "",
                        CountryName = a.Country?.Name ?? "",
                        IsPrimary = a.IsPrimary,
                        CreatedAt = a.CreatedAt
                    }).ToList(),

                EducationQualifications = user.EducationQualifications
                    .Where(e => !e.IsDeleted)
                    .OrderByDescending(e => e.CreatedAt)
                    .Select(e => new EducationDetailDto
                    {
                        Id = e.Id,
                        Level = e.Level,
                        CourseOrStream = e.CourseOrStream,
                        UniversityOrBoard = e.UniversityOrBoard,
                        Status = e.Status,
                        Marks = e.Marks,
                        DegreeFilePath = e.DegreeFilePath,
                        StartYear = e.StartYear,
                        EndYear = e.EndYear,
                        CreatedAt = e.CreatedAt
                    }).ToList(),

                PaymentRecords = user.PaymentRecords
                    .OrderByDescending(p => p.CreatedAt)
                    .Select(p => new PaymentDetailDto
                    {
                        Id = p.Id,
                        ReferenceType = p.ReferenceType,
                        ReferenceId = p.ReferenceId,
                        Amount = p.Amount,
                        Method = p.Method,
                        Status = p.Status,
                        ProofFilePath = p.ProofFilePath,
                        TransactionReference = p.TransactionReference,
                        BankOrGatewayName = p.BankOrGatewayName,
                        PaidAt = p.PaidAt,
                        CreatedAt = p.CreatedAt
                    }).ToList(),

                UserConsent = user.UserConsents != null && user.UserConsents.Any() ? new UserConsentDetailDto
                {
                    AgreeToTerms = user.UserConsents.Any(c => c.ConsentType.Contains("Terms") && c.IsAccepted),
                    AgreeToPrivacyPolicy = user.UserConsents.Any(c => c.ConsentType.Contains("Privacy") && c.IsAccepted),
                    AgreeToDataUsage = user.UserConsents.Any(c => c.ConsentType.Contains("Data") && c.IsAccepted),
                    ConsentedAt = user.UserConsents.OrderByDescending(c => c.AcceptedAt).FirstOrDefault()?.AcceptedAt ?? DateTime.UtcNow
                } : null,

                BlogPostsCount = blogPostsCount
            };
        }

        public async Task<PaymentDetailDto?> UpdatePaymentStatusAsync(Guid paymentId, UpdatePaymentStatusDto updateDto, CancellationToken cancellationToken = default)
        {
            var payment = await _context.PaymentRecords
                .FirstOrDefaultAsync(p => p.Id == paymentId, cancellationToken);

            if (payment == null)
                return null;

            payment.Status = updateDto.Status;
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Payment status updated successfully: {PaymentId} to {Status}", paymentId, updateDto.Status);

            return new PaymentDetailDto
            {
                Id = payment.Id,
                ReferenceType = payment.ReferenceType,
                ReferenceId = payment.ReferenceId,
                Amount = payment.Amount,
                Method = payment.Method,
                Status = payment.Status,
                ProofFilePath = payment.ProofFilePath,
                TransactionReference = payment.TransactionReference,
                BankOrGatewayName = payment.BankOrGatewayName,
                PaidAt = payment.PaidAt,
                CreatedAt = payment.CreatedAt
            };
        }

        private async Task<string> GenerateUniqueApplicationRequestIdAsync(CancellationToken cancellationToken)
        {
            for (var attempt = 0; attempt < 5; attempt++)
            {
                var candidate = $"ADP-REQ-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}";
                var exists = await _context.UserMemberships
                    .AsNoTracking()
                    .AnyAsync(membership => membership.ApplicationRequestId == candidate, cancellationToken);

                if (!exists)
                {
                    return candidate;
                }
            }

            throw new InvalidOperationException("Unable to generate a unique application request ID.");
        }
    }
}
