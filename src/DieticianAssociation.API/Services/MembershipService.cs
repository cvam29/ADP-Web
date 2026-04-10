using DieticianAssociation.API.Constants;

namespace DieticianAssociation.API.Services
{
    public class MembershipService(
        ApplicationDbContext context,
        IBlobStorageService blobStorageService,
        IDirectEmailSendService directEmailSendService,
        IConfiguration configuration,
        ILogger<MembershipService> logger) : IMembershipService
    {
        private readonly ApplicationDbContext _context = context;
        private readonly IBlobStorageService _blobStorageService = blobStorageService;
        private readonly IDirectEmailSendService _directEmailSendService = directEmailSendService;
        private readonly IConfiguration _configuration = configuration;
        private readonly ILogger<MembershipService> _logger = logger;

        private const string MembershipRequestReceivedMessage = "Membership application submitted successfully. We have emailed a confirmation and will notify you once your membership is reviewed.";

        public async Task<List<MembershipPlanDto>> GetAllPlansAsync(CancellationToken cancellationToken = default)
        {
            var plans = await _context.MembershipPlans
                .AsNoTracking()
                .Include(plan => plan.PlanPermissions)
                .ThenInclude(assignment => assignment.Permission)
                .Where(p => p.IsActive)
                .ToListAsync(cancellationToken);

            return [.. plans.Select(MapperExtensions.MapToPlanDto)];
        }

        public async Task<MembershipPlanDto?> GetPlanByIdAsync(string planId, CancellationToken cancellationToken = default)
        {
            var plan = await _context.MembershipPlans
                .AsNoTracking()
                .Include(plan => plan.PlanPermissions)
                .ThenInclude(assignment => assignment.Permission)
                .FirstOrDefaultAsync(p => p.Id == planId && p.IsActive, cancellationToken);

            return plan == null ? null : MapperExtensions.MapToPlanDto(plan);
        }

        public async Task<MembershipPlanDto?> CreatePlanAsync(CreateMembershipPlanDto createPlan, CancellationToken cancellationToken = default)
        {
            var plan = new MembershipPlan
            {
                Name = createPlan.Name,
                Tier = createPlan.Tier,
                Price = createPlan.Price,
                Duration = createPlan.Duration,
                Features = createPlan.Features,
                Popular = createPlan.Popular,
                IsActive = true,
                InitialFee = createPlan.InitialFee,
                RenewalFee = createPlan.RenewalFee,
                DiscountedPrice = createPlan.DiscountedPrice,
                DiscountedRenewalFee = createPlan.DiscountedRenewalFee,
                Discount = createPlan.Discount,
                PriceWithGST = createPlan.PriceWithGST,
                RenewalPriceWithGST = createPlan.RenewalPriceWithGST,
                Description = createPlan.Description
            };

            _context.MembershipPlans.Add(plan);
            await _context.SaveChangesAsync(cancellationToken);

            await SyncPlanPermissionsAsync(plan.Id, createPlan.PermissionKeys, cancellationToken);

            plan = await _context.MembershipPlans
                .Include(membershipPlan => membershipPlan.PlanPermissions)
                .ThenInclude(assignment => assignment.Permission)
                .FirstAsync(membershipPlan => membershipPlan.Id == plan.Id, cancellationToken);

            return MapperExtensions.MapToPlanDto(plan);
        }

        public async Task<MembershipPlanDto?> UpdatePlanAsync(string planId, CreateMembershipPlanDto updatePlan, CancellationToken cancellationToken = default)
        {
            var plan = await _context.MembershipPlans
                .Include(membershipPlan => membershipPlan.PlanPermissions)
                .ThenInclude(assignment => assignment.Permission)
                .FirstOrDefaultAsync(membershipPlan => membershipPlan.Id == planId, cancellationToken);
            if (plan == null || !plan.IsActive)
            {
                return null;
            }

            plan.Name = updatePlan.Name;
            plan.Tier = updatePlan.Tier;
            plan.Price = updatePlan.Price;
            plan.Duration = updatePlan.Duration;
            plan.Features = updatePlan.Features;
            plan.Popular = updatePlan.Popular;
            plan.InitialFee = updatePlan.InitialFee;
            plan.RenewalFee = updatePlan.RenewalFee;
            plan.DiscountedPrice = updatePlan.DiscountedPrice;
            plan.DiscountedRenewalFee = updatePlan.DiscountedRenewalFee;
            plan.Discount = updatePlan.Discount;
            plan.PriceWithGST = updatePlan.PriceWithGST;
            plan.RenewalPriceWithGST = updatePlan.RenewalPriceWithGST;
            plan.Description = updatePlan.Description;
            plan.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);
            await SyncPlanPermissionsAsync(plan.Id, updatePlan.PermissionKeys, cancellationToken);

            plan = await _context.MembershipPlans
                .Include(membershipPlan => membershipPlan.PlanPermissions)
                .ThenInclude(assignment => assignment.Permission)
                .FirstAsync(membershipPlan => membershipPlan.Id == planId, cancellationToken);

            return MapperExtensions.MapToPlanDto(plan);
        }

        public async Task<bool> DeletePlanAsync(string planId, CancellationToken cancellationToken = default)
        {
            var plan = await _context.MembershipPlans.FindAsync(new object[] { planId }, cancellationToken);
            if (plan == null)
            {
                return false;
            }

            // Soft delete
            plan.IsActive = false;
            plan.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        private async Task SyncPlanPermissionsAsync(string planId, IEnumerable<string>? permissionKeys, CancellationToken cancellationToken)
        {
            var desiredKeys = new HashSet<string>((permissionKeys ?? []).Where(PermissionKeys.IsMembershipPlanAssignable), StringComparer.OrdinalIgnoreCase);
            var permissionsByKey = await _context.Permissions
                .Where(permission => desiredKeys.Contains(permission.Key))
                .ToDictionaryAsync(permission => permission.Key, StringComparer.OrdinalIgnoreCase, cancellationToken);

            var existingAssignments = await _context.MembershipPlanPermissions
                .Where(assignment => assignment.MembershipPlanId == planId)
                .Include(assignment => assignment.Permission)
                .ToListAsync(cancellationToken);

            foreach (var assignment in existingAssignments.Where(assignment => !desiredKeys.Contains(assignment.Permission.Key)))
            {
                _context.MembershipPlanPermissions.Remove(assignment);
            }

            foreach (var permissionKey in desiredKeys)
            {
                if (!permissionsByKey.TryGetValue(permissionKey, out var permission))
                {
                    continue;
                }

                var assignment = existingAssignments.FirstOrDefault(existing => string.Equals(existing.Permission.Key, permissionKey, StringComparison.OrdinalIgnoreCase));
                if (assignment != null)
                {
                    assignment.UpdatedAt = DateTime.UtcNow;
                    continue;
                }

                _context.MembershipPlanPermissions.Add(new MembershipPlanPermission
                {
                    MembershipPlanId = planId,
                    PermissionId = permission.Id,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task<MembershipRegistrationResultDto> RegisterMemberAsync(MembershipRegistrationRequest request, CancellationToken cancellationToken = default)
        {
            await using var tx = await _context.Database.BeginTransactionAsync(cancellationToken);

            try
            {
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                var personal = DeserializeRequiredSection<PersonalInfoDto>(request.PersonalInfo, options, nameof(request.PersonalInfo));
                var membership = DeserializeRequiredSection<MembershipDetailsDto>(request.MembershipDetails, options, nameof(request.MembershipDetails));
                var declaration = DeserializeRequiredSection<DeclarationDto>(request.Declaration, options, nameof(request.Declaration));

                ValidateRegistrationRequest(personal, membership, declaration);

                var normalizedEmail = personal.Email.Trim().ToLower();
                var existingUser = await _context.Users.FirstOrDefaultAsync(u =>
                    u.Email != null && u.Email.ToLower() == normalizedEmail, cancellationToken);

                if (existingUser != null && !existingUser.IsDeleted)
                    throw new InvalidOperationException("A user with this email already exists");

                var plan = await _context.MembershipPlans
                    .FirstOrDefaultAsync(p => p.Id == membership.MembershipPlanId && p.IsActive, cancellationToken)
                    ?? throw new ArgumentException("Invalid membership plan", nameof(request.MembershipDetails));

                var temporaryPassword = GenerateDefaultPassword();

                User user;
                if (existingUser != null && existingUser.IsDeleted)
                {
                    user = existingUser;
                    user.IsDeleted = false;
                    user.DeletedAt = null;
                    user.Name = $"{personal.FirstName} {personal.LastName}";
                    user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(temporaryPassword);
                    user.RequirePasswordReset = true;
                    user.PhoneNumber = personal.Phone;
                    user.Dob = personal.DateOfBirth;
                    user.Gender = personal.Gender;
                    user.Nationality = personal.Nationality;
                    user.Role = UserRole.Member;
                    user.IsActive = true;
                    user.ConfirmationSent = false;
                    user.TempPasswordSent = false;
                }
                else
                {
                    user = new User
                    {
                        Email = personal.Email.Trim(),
                        Name = $"{personal.FirstName} {personal.LastName}",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword(temporaryPassword),
                        RequirePasswordReset = true,
                        PhoneNumber = personal.Phone,
                        Dob = personal.DateOfBirth,
                        Gender = personal.Gender,
                        Nationality = personal.Nationality,
                        Role = UserRole.Member,
                        IsActive = true,
                        ConfirmationSent = false,
                        TempPasswordSent = false
                    };
                    _context.Users.Add(user);
                }

                await _context.SaveChangesAsync(cancellationToken);

                // 2️⃣ Address
                _context.Addresses.Add(new Address
                {
                    UserId = user.Id,
                    StreetAddress = personal.StreetAddress,
                    AddressLine2 = personal.AddressLine2,
                    PostalCode = personal.PostalCode,
                    CountryId = personal.CountryId,
                    StateId = personal.StateId,
                    CityId = personal.CityId,
                    IsPrimary = true
                });

                // 3️⃣ Education Qualifications
                const long maxFileSize = 10 * 1024 * 1024;
                var allowedTypes = new[]
                {
                    "image/jpeg", "image/png", "image/gif", "image/webp",
                    "application/pdf"
                };

                for (int i = 0; i < membership.EducationDetails.Count; i++)
                {
                    var edu = membership.EducationDetails[i];
                    string? degreeFileUrl = null;

                    // Upload degree file if provided
                    if (request.EducationFiles != null && i < request.EducationFiles.Count)
                    {
                        var file = request.EducationFiles[i];
                        if (file != null && file.Length > 0 && file.Length < maxFileSize && allowedTypes.Contains(file.ContentType))
                        {
                            var folder = "education-degrees";
                            degreeFileUrl = await _blobStorageService.UploadFileAsync(file, folder);
                        }
                    }

                    _context.EducationQualifications.Add(new EducationQualification
                    {
                        UserId = user.Id,
                        Level = edu.Level,
                        CourseOrStream = edu.Course,
                        UniversityOrBoard = edu.University,
                        Status = edu.Status,
                        Marks = edu.Marks,
                        DegreeFilePath = degreeFileUrl
                    });
                }

                // 4️⃣ Membership
                var userMembership = new UserMembership
                {
                    ApplicationRequestId = await GenerateUniqueApplicationRequestIdAsync(cancellationToken),
                    UserId = user.Id,
                    MembershipPlanId = plan.Id,
                    Status = MembershipStatus.Pending,
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.UtcNow.AddMonths(plan.Duration)
                };

                _context.UserMemberships.Add(userMembership);

                //const long maxFileSize = 10 * 1024 * 1024;
                //var allowedTypes = new[]
                //   {
                //        "image/jpeg", "image/png", "image/gif", "image/webp",
                //        "application/pdf"
                //   };

                // 5️⃣ Payment (optional)
                if (request.Receipt != null && request.Receipt.Length < maxFileSize && allowedTypes.Contains(request.Receipt.ContentType))
                {
                    // Upload to Blob Storage
                    var folder = "receipts";
                    var proofFileUrl = await _blobStorageService.UploadFileAsync(
                        request.Receipt,
                        folder
                    );

                    // Save payment record
                    _context.PaymentRecords.Add(new PaymentRecord
                    {
                        UserId = user.Id,
                        ReferenceType = "Membership",
                        ReferenceId = Guid.Parse(userMembership.Id),
                        Amount = plan.PriceWithGST > 0 ? plan.PriceWithGST.Value : plan.Price,
                        Method = PaymentMethod.Upi,
                        Status = PaymentStatus.Pending,
                        ProofFilePath = proofFileUrl // Blob URL
                    });

                    await _context.SaveChangesAsync(cancellationToken);

                }

                // 6️⃣ Consent - Declaration
                _context.UserConsents.Add(new UserConsent
                {
                    UserId = user.Id,
                    ConsentType = "MembershipDeclaration",
                    ContentSnapshot = "Accepted membership declaration",
                    IsAccepted = declaration.AgreeDeclaration,
                    IpAddress = null,
                    UserAgent = null
                });

                // Consent - Terms
                _context.UserConsents.Add(new UserConsent
                {
                    UserId = user.Id,
                    ConsentType = "MembershipTerms",
                    ContentSnapshot = "Accepted membership terms and conditions",
                    IsAccepted = declaration.AgreeTerms,
                    IpAddress = null,
                    UserAgent = null
                });

                // Consent - Privacy
                _context.UserConsents.Add(new UserConsent
                {
                    UserId = user.Id,
                    ConsentType = "PrivacyPolicy",
                    ContentSnapshot = "Accepted privacy policy",
                    IsAccepted = declaration.AgreePrivacy,
                    IpAddress = null,
                    UserAgent = null
                });

                // Consent - Data Usage
                _context.UserConsents.Add(new UserConsent
                {
                    UserId = user.Id,
                    ConsentType = "DataUsage",
                    ContentSnapshot = "Accepted data usage policy",
                    IsAccepted = declaration.AgreeDataUsage,
                    IpAddress = null,
                    UserAgent = null
                });

                await _context.SaveChangesAsync(cancellationToken);
                await tx.CommitAsync(cancellationToken);

                var confirmationSent = await TrySendWelcomeEmailAsync(user, plan.Name, userMembership, cancellationToken);
                if (confirmationSent)
                {
                    user.ConfirmationSent = true;
                    user.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync(cancellationToken);
                }

                return BuildRegistrationResult(user, userMembership, confirmationSent);
            }
            catch
            {
                await tx.RollbackAsync(cancellationToken);
                throw;
            }
        }

        private static string GenerateDefaultPassword()
        {
            var random = Guid.NewGuid().ToString("N")[..8];
            return $"Adp@{random}";
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

        private async Task<bool> TrySendMembershipJoinCredentialsEmailAsync(User user, string temporaryPassword, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(user.Email))
            {
                return false;
            }

            try
            {
                var safeName = string.IsNullOrWhiteSpace(user.Name) ? "Member" : user.Name;
                var loginUrl = (_configuration["App:FeBaseUrl"] ?? string.Empty).TrimEnd('/') + "/login";
                var subject = "Welcome to ADP - Your Membership Credentials";
                var htmlBody = EmailConstants.TempPasswordResetEmailTemplate
                    .Replace("{{Name}}", safeName)
                    .Replace("{{UserId}}", user.Email?? "N/A")
                    .Replace("{{TemporaryPassword}}", temporaryPassword)
                    ;

                await _directEmailSendService.SendDirectAsync(new SendDirectEmailRequestDto
                {
                    To = user.Email,
                    Subject = subject,
                    BodyHtml = htmlBody,
                }, cancellationToken);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Membership credentials email failed for user {UserId}", user.Id);
                return false;
            }
        }

        private async Task<bool> TrySendWelcomeEmailAsync(User user, string membershipPlanName, UserMembership membership, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(user.Email))
            {
                return false;
            }

            try
            {
                var safeName = string.IsNullOrWhiteSpace(user.Name) ? "Member" : user.Name;
                var subject = "Welcome to Association of Dietetics Professionals (ADP)";
                var htmlBody = EmailConstants.WelcomeEmailTemplate
                    .Replace("{{Name}}", safeName)
                    .Replace("{{MembershipPlanName}}", membershipPlanName)
                    .Replace("{{MembershipStatus}}", membership.Status.ToString())
                    .Replace("{{MembershipStartDate}}", membership.StartDate.ToString("MMM dd, yyyy"))
                    .Replace("{{MembershipExpiryDate}}", membership.EndDate.ToString("MMM dd, yyyy"))
                    .Replace("{{Year}}", DateTime.UtcNow.Year.ToString());

                await _directEmailSendService.SendDirectAsync(new SendDirectEmailRequestDto
                {
                    To = user.Email,
                    Subject = subject,
                    BodyHtml = htmlBody,
                }, cancellationToken);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Welcome email failed for user {UserId}", user.Id);
                return false;
            }
        }

        // User Membership Management Methods
        public async Task<PagedResult<UserMembershipDto>> GetAllUserMembershipsAsync(PagedRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                var query = _context.UserMemberships
                    .AsNoTracking()
                    .Include(um => um.User)
                    .ThenInclude(u => u.PaymentRecords)
                    .Include(um => um.MembershipPlan)
                    .AsQueryable();

                // 🔍 Apply search on basic fields (user name, email, plan name)
                if (!string.IsNullOrEmpty(request.Search))
                {
                    query = query.Where(um =>
                        (um.User.Name != null && um.User.Name.Contains(request.Search)) ||
                        (um.User.Email != null && um.User.Email.Contains(request.Search)) ||
                        (um.MembershipPlan.Name != null && um.MembershipPlan.Name.Contains(request.Search)));
                }

                // 📅 Date range filter (CreatedAt)
                if (request.Filters != null &&
                    request.Filters.TryGetValue("dateRange", out var dateRange))
                {
                    query = query.ApplyDateRangeFilter(dateRange?.ToString(), x => x.CreatedAt);
                    request.Filters.Remove("dateRange");
                }

                // 🔎 Apply dynamic filters (supports nested props like Status, MembershipPlan.Id)
                query = query.ApplyFilters(request);

                // 📄 Convert to PagedResult<UserMembershipDto>
                var result = await query.ToPagedResultAsync(request, MapToUserMembershipDto, cancellationToken);

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting all user memberships: {ex.Message}", ex);
            }
        }

        public async Task<UserMembershipDto?> GetUserMembershipByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            var membership = await _context.UserMemberships
                .AsNoTracking()
                .Include(um => um.User)
                .Include(um => um.MembershipPlan)
                .FirstOrDefaultAsync(um => um.Id == id, cancellationToken);

            return membership == null ? null : MapToUserMembershipDto(membership);
        }

        public async Task<UserMembershipDto?> UpdateUserMembershipStatusAsync(string id, UpdateUserMembershipStatusDto updateDto, CancellationToken cancellationToken = default)
        {
            await using var tx = await _context.Database.BeginTransactionAsync(cancellationToken);

            var membership = await _context.UserMemberships
                .Include(um => um.User)
                    .ThenInclude(u => u.PaymentRecords)
                .Include(um => um.MembershipPlan)
                .FirstOrDefaultAsync(um => um.Id == id, cancellationToken);

            if (membership == null) return null;

            if (updateDto.Status == MembershipStatus.Active && membership.Status != MembershipStatus.Active)
            {
                var latestPayment = membership.User.PaymentRecords
                    .OrderByDescending(p => p.CreatedAt)
                    .FirstOrDefault();

                if (latestPayment == null || latestPayment.Status != PaymentStatus.Verified)
                {
                    throw new Exception("Cannot activate membership. Payment is not verified.");
                }
                membership.StartDate = DateTime.UtcNow;
                membership.EndDate = DateTime.UtcNow.AddMonths(membership.MembershipPlan.Duration);

                if (!membership.User.TempPasswordSent)
                {
                    var tempPassword = GenerateDefaultPassword();
                    membership.User.PasswordHash = BCrypt.Net.BCrypt.HashPassword(tempPassword);
                    membership.User.RequirePasswordReset = true;
                    membership.User.TempPasswordSent = false;
                    membership.User.UpdatedAt = DateTime.UtcNow;

                    var sent = await TrySendMembershipJoinCredentialsEmailAsync(membership.User, tempPassword, cancellationToken);
                    if (!sent)
                    {
                        await tx.RollbackAsync(cancellationToken);
                        throw new InvalidOperationException("Membership could not be activated because the temporary password email failed.");
                    }

                    membership.User.TempPasswordSent = true;
                }
            }

            membership.Status = updateDto.Status;
            membership.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);
            await tx.CommitAsync(cancellationToken);

            return MapToUserMembershipDto(membership);
        }

        private static T DeserializeRequiredSection<T>(string payload, JsonSerializerOptions options, string sectionName)
        {
            if (string.IsNullOrWhiteSpace(payload))
            {
                throw new ArgumentException($"{sectionName} is required.", sectionName);
            }

            var result = JsonSerializer.Deserialize<T>(payload, options);
            return result ?? throw new ArgumentException($"{sectionName} is invalid.", sectionName);
        }

        private static void ValidateRegistrationRequest(PersonalInfoDto personal, MembershipDetailsDto membership, DeclarationDto declaration)
        {
            if (string.IsNullOrWhiteSpace(personal.FirstName) || string.IsNullOrWhiteSpace(personal.LastName))
            {
                throw new ArgumentException("First name and last name are required.", nameof(personal));
            }

            if (string.IsNullOrWhiteSpace(personal.Email))
            {
                throw new ArgumentException("Email is required.", nameof(personal.Email));
            }

            if (string.IsNullOrWhiteSpace(membership.MembershipPlanId))
            {
                throw new ArgumentException("Membership plan is required.", nameof(membership.MembershipPlanId));
            }

            if (membership.EducationDetails == null || membership.EducationDetails.Count == 0)
            {
                throw new ArgumentException("At least one education record is required.", nameof(membership.EducationDetails));
            }

            if (!declaration.AgreeDeclaration || !declaration.AgreeTerms || !declaration.AgreePrivacy || !declaration.AgreeDataUsage)
            {
                throw new ArgumentException("All required consents must be accepted before submitting a membership request.", nameof(declaration));
            }
        }

        private static MembershipRegistrationResultDto BuildRegistrationResult(User user, UserMembership membership, bool confirmationSent)
        {
            return new MembershipRegistrationResultDto
            {
                Message = confirmationSent
                    ? MembershipRequestReceivedMessage
                    : "Membership application submitted successfully. Your request is pending review, but we could not send the confirmation email right now.",
                UserId = user.Id,
                MembershipId = membership.Id,
                ApplicationRequestId = membership.ApplicationRequestId,
                Email = user.Email ?? string.Empty,
                MembershipStatus = membership.Status,
                ConfirmationSent = confirmationSent,
                TempPasswordSent = user.TempPasswordSent
            };
        }

        public async Task<bool> DeleteUserMembershipAsync(string id, CancellationToken cancellationToken = default)
        {
            var membership = await _context.UserMemberships.FindAsync(new object[] { id }, cancellationToken);
            if (membership == null) return false;

            // Soft delete by setting status to Suspended
            membership.Status = MembershipStatus.Suspended;
            membership.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<UserMembershipDto?> UpdateUserMembershipPlanAsync(string id, UpdateUserMembershipPlanDto updateDto, CancellationToken cancellationToken = default)
        {
            var membership = await _context.UserMemberships
                .Include(um => um.User)
                .Include(um => um.MembershipPlan)
                .FirstOrDefaultAsync(um => um.Id == id, cancellationToken);

            if (membership == null) return null;

            var newPlan = await _context.MembershipPlans.FindAsync(new object[] { updateDto.MembershipPlanId }, cancellationToken);
            if (newPlan == null) return null;

            membership.MembershipPlanId = newPlan.Id;
            membership.MembershipPlan = newPlan;

            // Recalculate end date based on new plan duration from current start date
            if (membership.Status == MembershipStatus.Active)
            {
                membership.EndDate = membership.StartDate.AddMonths(newPlan.Duration);
            }

            membership.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);

            return MapToUserMembershipDto(membership);
        }

        public async Task<bool> PermanentDeleteUserMembershipAsync(string id, CancellationToken cancellationToken = default)
        {
            await using var tx = await _context.Database.BeginTransactionAsync(cancellationToken);

            var membership = await _context.UserMemberships
                .Include(um => um.User)
                    .ThenInclude(u => u.PaymentRecords)
                .FirstOrDefaultAsync(um => um.Id == id, cancellationToken);

            if (membership == null) return false;

            // Remove payment records associated with this user's membership
            var paymentRecords = membership.User.PaymentRecords
                .Where(p => p.CreatedAt >= membership.CreatedAt)
                .ToList();

            if (paymentRecords.Count > 0)
            {
                _context.PaymentRecords.RemoveRange(paymentRecords);
            }

            _context.UserMemberships.Remove(membership);

            await _context.SaveChangesAsync(cancellationToken);
            await tx.CommitAsync(cancellationToken);

            return true;
        }

        // Mapper method for UserMembership
        private static UserMembershipDto MapToUserMembershipDto(UserMembership um)
        {
            return new UserMembershipDto
            {
                Id = um.Id,
                ApplicationRequestId = um.ApplicationRequestId,
                UserId = um.UserId,
                UserName = um.User.Name,
                UserEmail = um.User.Email,
                UserPhone = um.User.PhoneNumber,
                MembershipPlanId = um.MembershipPlanId,
                MembershipPlanName = um.MembershipPlan.Name,
                MembershipTier = um.MembershipPlan.Tier,
                Status = um.Status,
                StartDate = um.StartDate,
                EndDate = um.EndDate,
                RenewedAt = um.RenewedAt,
                CreatedAt = um.CreatedAt,
                UpdatedAt = um.UpdatedAt,
                PaymentFilePath = um?.User?.LatestPaymentRecord?.ProofFilePath ?? string.Empty,
                PaymentRecordId = um?.User?.LatestPaymentRecord?.Id.ToString() ?? string.Empty,
                PaymentStatus = um?.User?.LatestPaymentRecord?.Status,
                ConfirmationSent = um?.User?.ConfirmationSent ?? false,
                TempPasswordSent = um?.User?.TempPasswordSent ?? false,
                RequirePasswordReset = um?.User?.RequirePasswordReset ?? false
            };
        }
    }

}
