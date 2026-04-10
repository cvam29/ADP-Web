namespace DieticianAssociation.API.Services;

public class TestimonialService(
    ApplicationDbContext context,
    ICacheService cacheService,
    IOptions<CacheSettings> cacheSettings,
    ILogger<TestimonialService> logger) : ITestimonialService
{
    private readonly ApplicationDbContext _context = context ?? throw new ArgumentNullException(nameof(context));
    private readonly ICacheService _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
    private readonly CacheSettings _cacheSettings = cacheSettings.Value ?? throw new ArgumentNullException(nameof(cacheSettings));
    private readonly ILogger<TestimonialService> _logger = logger ?? throw new ArgumentNullException(nameof(logger));

    private int TestimonialCacheVersion => _cacheService.GetOrCreateVersion(_cacheSettings.TestimonialVersion);

    private Task InvalidatePublicCachesAsync()
    {
        _cacheService.IncrementVersion(_cacheSettings.TestimonialVersion);
        _logger.LogInformation("Testimonial cache version incremented");
        return Task.CompletedTask;
    }

    public async Task<PagedResult<TestimonialDto>> GetPublicTestimonialsAsync(PagedRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedRequest = request ?? new PagedRequest();
        var cacheKey = _cacheService.GenerateKey(
            "testimonials",
            $"v{TestimonialCacheVersion}",
            "public",
            normalizedRequest.Page.ToString(),
            normalizedRequest.PageSize.ToString(),
            normalizedRequest.Search ?? string.Empty,
            normalizedRequest.SortBy ?? string.Empty,
            normalizedRequest.SortDirection,
            normalizedRequest.Filters?.Count.ToString() ?? "0");

        var cachedResult = await _cacheService.GetAsync<PagedResult<TestimonialDto>>(cacheKey, cancellationToken);
        if (cachedResult != null)
        {
            return cachedResult;
        }

        var query = _context.Testimonials
            .AsNoTracking()
            .Include(x => x.SubmittedBy)
            .Where(x => x.Status == TestimonialStatuses.Approved);

        if (!string.IsNullOrWhiteSpace(normalizedRequest.Search))
        {
            var search = normalizedRequest.Search.Trim();
            query = query.Where(x =>
                EF.Functions.ILike(x.Content, $"%{search}%") ||
                EF.Functions.ILike(x.MemberName, $"%{search}%") ||
                EF.Functions.ILike(x.ProfessionalTitle, $"%{search}%"));
        }

        query = query.ApplyFilters(normalizedRequest);

        if (string.IsNullOrWhiteSpace(normalizedRequest.SortBy))
        {
            query = query
                .OrderByDescending(x => x.IsFeatured)
                .ThenByDescending(x => x.SubmittedAt);
        }
        else
        {
            query = query.ApplySorting(normalizedRequest.SortBy, normalizedRequest.SortDirection);
        }

        var result = await query.ToPagedResultAsync(normalizedRequest, MapperExtensions.MapToTestimonialDto, cancellationToken);

        await _cacheService.SetAsync(
            cacheKey,
            result,
            TimeSpan.FromMinutes(_cacheSettings.TestimonialsDurationMinutes),
            cancellationToken);

        return result;
    }

    public async Task<PagedResult<TestimonialDto>> GetAdminTestimonialsAsync(PagedRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedRequest = request ?? new PagedRequest();
        var query = _context.Testimonials
            .AsNoTracking()
            .Include(x => x.SubmittedBy)
            .Include(x => x.ReviewedBy)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(normalizedRequest.Search))
        {
            var search = normalizedRequest.Search.Trim();
            query = query.Where(x =>
                EF.Functions.ILike(x.Content, $"%{search}%") ||
                EF.Functions.ILike(x.MemberName, $"%{search}%") ||
                EF.Functions.ILike(x.ProfessionalTitle, $"%{search}%"));
        }

        query = query.ApplyFilters(normalizedRequest);

        if (string.IsNullOrWhiteSpace(normalizedRequest.SortBy))
        {
            query = query
                .OrderBy(x => x.Status == TestimonialStatuses.Pending ? 0 : x.Status == TestimonialStatuses.Rejected ? 1 : 2)
                .ThenByDescending(x => x.SubmittedAt);
        }
        else
        {
            query = query.ApplySorting(normalizedRequest.SortBy, normalizedRequest.SortDirection);
        }

        return await query.ToPagedResultAsync(normalizedRequest, MapperExtensions.MapToTestimonialDto, cancellationToken);
    }

    public async Task<List<TestimonialDto>> GetMyTestimonialsAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _context.Testimonials
            .AsNoTracking()
            .Include(x => x.ReviewedBy)
            .Where(x => x.SubmittedByUserId == userId)
            .OrderByDescending(x => x.SubmittedAt)
            .Select(x => MapperExtensions.MapToTestimonialDto(x))
            .ToListAsync(cancellationToken);
    }

    public async Task<TestimonialDto> SubmitTestimonialAsync(string userId, CreateTestimonialDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users
            .Include(x => x.Memberships)
            .FirstOrDefaultAsync(x => x.Id == userId, cancellationToken)
            ?? throw new KeyNotFoundException("User not found.");

        var hasActiveMembership = user.Role == UserRole.Admin ||
                                  user.Role == UserRole.SuperAdmin ||
                                  user.Memberships.Any(x => x.Status == MembershipStatus.Active);

        if (!hasActiveMembership)
        {
            throw new InvalidOperationException("An active membership is required to submit a testimonial.");
        }

        var existingPending = await _context.Testimonials.AnyAsync(
            x => x.SubmittedByUserId == userId && x.Status == TestimonialStatuses.Pending,
            cancellationToken);

        if (existingPending)
        {
            throw new InvalidOperationException("You already have a testimonial pending review.");
        }

        if (!dto.ConsentToPublish)
        {
            throw new ValidationException("Consent to publish is required.");
        }

        var testimonial = new Testimonial
        {
            Id = Guid.NewGuid().ToString(),
            Content = dto.Content.Trim(),
            MemberName = user.Name?.Trim() ?? string.Empty,
            ProfessionalTitle = dto.ProfessionalTitle.Trim(),
            PhotoUrl = string.IsNullOrWhiteSpace(dto.PhotoUrl) ? user.Avatar : dto.PhotoUrl.Trim(),
            Rating = dto.Rating,
            ConsentToPublish = dto.ConsentToPublish,
            Status = TestimonialStatuses.Pending,
            SubmittedByUserId = userId,
            SubmittedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _context.Testimonials.Add(testimonial);
        await _context.SaveChangesAsync(cancellationToken);

        testimonial.SubmittedBy = user;

        return MapperExtensions.MapToTestimonialDto(testimonial);
    }

    public async Task<TestimonialDto> ReviewTestimonialAsync(string id, string reviewerUserId, ReviewTestimonialDto dto, CancellationToken cancellationToken = default)
    {
        var testimonial = await _context.Testimonials
            .Include(x => x.SubmittedBy)
            .Include(x => x.ReviewedBy)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException("Testimonial not found.");

        if (!TestimonialStatuses.All.Contains(dto.Status))
        {
            throw new ValidationException("Invalid testimonial status.");
        }

        if (string.Equals(dto.Status, TestimonialStatuses.Pending, StringComparison.OrdinalIgnoreCase))
        {
            throw new ValidationException("Testimonials cannot be moved back to pending through review.");
        }

        if (string.Equals(dto.Status, TestimonialStatuses.Rejected, StringComparison.OrdinalIgnoreCase) && string.IsNullOrWhiteSpace(dto.RejectionReason))
        {
            throw new ValidationException("A rejection reason is required when rejecting a testimonial.");
        }

        testimonial.Status = dto.Status.Trim();
        testimonial.RejectionReason = string.Equals(dto.Status, TestimonialStatuses.Rejected, StringComparison.OrdinalIgnoreCase)
            ? dto.RejectionReason?.Trim()
            : null;
        testimonial.IsFeatured = string.Equals(testimonial.Status, TestimonialStatuses.Approved, StringComparison.OrdinalIgnoreCase) && dto.IsFeatured;
        testimonial.ReviewedByUserId = reviewerUserId;
        testimonial.ReviewedAt = DateTime.UtcNow;
        testimonial.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        testimonial.ReviewedBy = await _context.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == reviewerUserId, cancellationToken);

        await InvalidatePublicCachesAsync();

        return MapperExtensions.MapToTestimonialDto(testimonial);
    }

    public async Task DeleteTestimonialAsync(string id, CancellationToken cancellationToken = default)
    {
        var testimonial = await _context.Testimonials
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException("Testimonial not found.");

        _context.Testimonials.Remove(testimonial);
        await _context.SaveChangesAsync(cancellationToken);

        await InvalidatePublicCachesAsync();
    }
}