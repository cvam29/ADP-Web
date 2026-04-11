namespace DieticianAssociation.API.Services;

using System.Runtime.CompilerServices;

public interface IEventService
{
    Task<EventDto?> GetEventByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<EventDto?> GetEventByUrlAsync(string url, CancellationToken cancellationToken = default);
    Task<EventDto?> CreateEventAsync(CreateEventDto createEvent, CancellationToken cancellationToken = default);
    Task<EventDto?> UpdateEventAsync(string id, CreateEventDto updateEvent, CancellationToken cancellationToken = default);
    Task<bool> DeleteEventAsync(string id, CancellationToken cancellationToken = default);
    Task<List<EventSlugDto>> GetPublishedEventSlugsAsync(CancellationToken cancellationToken = default);

    // Paginated methods
    Task<PagedResult<EventDto>> GetPaginatedEventsAsync(PagedRequest request, CancellationToken cancellationToken = default);
    Task<DieticianAssociation.API.Helper.PageInfo> GetPublicEventStreamPageInfoAsync(PagedRequest request, CancellationToken cancellationToken = default);
    IAsyncEnumerable<EventDto> StreamPublicEventsAsync(PagedRequest request, CancellationToken cancellationToken = default);
}

public class EventService(ApplicationDbContext context, ILogger<BlogService> logger) : IEventService
{
    private readonly ApplicationDbContext _context = context;
    private readonly ILogger<BlogService> _logger = logger;

    private IQueryable<Event> BuildPublicEventQuery(PagedRequest request)
    {
        var query = _context.AssociationEvents
            .AsNoTracking()
            .Include(e => e.Speakers)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchTerm = request.Search.ToLower();
            query = query.Where(e =>
                (e.Title != null && e.Title.ToLower().Contains(searchTerm)) ||
                (e.Description != null && e.Description.ToLower().Contains(searchTerm)) ||
                (e.Location != null && e.Location.ToLower().Contains(searchTerm)) ||
                (e.Type != null && e.Type.ToLower().Contains(searchTerm)));
        }

        var sortBy = string.IsNullOrWhiteSpace(request.SortBy) ? "Date" : request.SortBy;
        var sortDirection = string.IsNullOrWhiteSpace(request.SortBy) ? "asc" : request.SortDirection;

        return query.ApplySorting(sortBy, sortDirection);
    }

    public async Task<EventDto?> GetEventByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var eventItem = await _context.AssociationEvents
            .AsNoTracking()
            .Include(e => e.Speakers)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
        return eventItem == null ? null : MapperExtensions.MapToEventDto(eventItem);
    }

    public async Task<EventDto?> GetEventByUrlAsync(string url, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(url)) return null;

        // Normalize provided URL to slug to match stored format
        var normalized = UrlHelper.GenerateSlug(url);

        var eventItem = await _context.AssociationEvents
            .AsNoTracking()
            .Include(e => e.Speakers)
            .FirstOrDefaultAsync(e => e.Url == normalized, cancellationToken);

        return eventItem == null ? null : MapperExtensions.MapToEventDto(eventItem);
    }

    public async Task<EventDto?> CreateEventAsync(CreateEventDto createEvent, CancellationToken cancellationToken = default)
    {
        // Generate URL slug if not provided
        var baseSlug = !string.IsNullOrWhiteSpace(createEvent.Url)
            ? UrlHelper.GenerateSlug(createEvent.Url)
            : UrlHelper.GenerateSlug(createEvent.Title);

        // Ensure URL is unique among events
        var existingSlugs = await _context.AssociationEvents
            .Where(e => e.Url.StartsWith(baseSlug))
            .Select(e => e.Url)
            .ToListAsync(cancellationToken);

        var finalSlug = UrlHelper.EnsureUniqueSlug(baseSlug, existingSlugs);

        var eventItem = new Event
        {
            Id = Guid.NewGuid().ToString(),
            Title = createEvent.Title,
            Url = finalSlug,
            Description = createEvent.Description,
            Date = DateTime.SpecifyKind(createEvent.Date, DateTimeKind.Utc),
            Time = createEvent.Time,
            Location = createEvent.Location,
            Format = createEvent.Format,
            Type = createEvent.Type,
            Credits = createEvent.Credits,
            Price = createEvent.Price,
            Capacity = createEvent.Capacity,
            Registered = 0,
            Images = createEvent.Images ?? [],
            Recording = createEvent.Recording,
            RecordingUrl = createEvent.RecordingUrl,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Resolve speakers from SpeakerIds, if any
        if (createEvent.SpeakerIds != null && createEvent.SpeakerIds.Count > 0)
        {
            var speakers = await _context.Users
                .Where(u => createEvent.SpeakerIds.Contains(u.Id))
                .ToListAsync(cancellationToken);
            eventItem.Speakers = speakers;
        }

        _context.AssociationEvents.Add(eventItem);
        await _context.SaveChangesAsync(cancellationToken);

        return MapperExtensions.MapToEventDto(eventItem);
    }

    public async Task<EventDto?> UpdateEventAsync(string id, CreateEventDto updateEvent, CancellationToken cancellationToken = default)
    {
        var eventItem = await _context.AssociationEvents
            .Include(e => e.Speakers)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
        if (eventItem == null) return null;

        // Handle URL update if title changed or URL explicitly provided
        var shouldUpdateUrl = !string.IsNullOrWhiteSpace(updateEvent.Url) || eventItem.Title != updateEvent.Title;
        if (shouldUpdateUrl)
        {
            var baseSlug = !string.IsNullOrWhiteSpace(updateEvent.Url)
                ? UrlHelper.GenerateSlug(updateEvent.Url)
                : UrlHelper.GenerateSlug(updateEvent.Title);

            var existingSlugs = await _context.AssociationEvents
                .Where(e => e.Id != id && e.Url.StartsWith(baseSlug))
                .Select(e => e.Url)
                .ToListAsync(cancellationToken);

            eventItem.Url = UrlHelper.EnsureUniqueSlug(baseSlug, existingSlugs);
        }

        eventItem.Title = updateEvent.Title;
        eventItem.Description = updateEvent.Description;
        eventItem.Date = DateTime.SpecifyKind(updateEvent.Date, DateTimeKind.Utc);
        eventItem.Time = updateEvent.Time;
        eventItem.Location = updateEvent.Location;
        eventItem.Format = updateEvent.Format;
        eventItem.Type = updateEvent.Type;
        eventItem.Credits = updateEvent.Credits;
        eventItem.Price = updateEvent.Price;
        eventItem.Capacity = updateEvent.Capacity;
        // Update images
        eventItem.Images = updateEvent.Images ?? [];
        eventItem.Recording = updateEvent.Recording;
        eventItem.RecordingUrl = updateEvent.RecordingUrl;

        // Update speakers if provided
        if (updateEvent.SpeakerIds != null)
        {
            var speakers = await _context.Users
                .Where(u => updateEvent.SpeakerIds.Contains(u.Id))
                .ToListAsync(cancellationToken);
            eventItem.Speakers = speakers;
        }
        eventItem.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return MapperExtensions.MapToEventDto(eventItem);
    }

    public async Task<bool> DeleteEventAsync(string id, CancellationToken cancellationToken = default)
    {
        var eventItem = await _context.AssociationEvents.FindAsync(new object[] { id }, cancellationToken);
        if (eventItem == null) return false;

        _context.AssociationEvents.Remove(eventItem);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<List<EventSlugDto>> GetPublishedEventSlugsAsync(CancellationToken cancellationToken = default)
    {
        var slugs = await _context.AssociationEvents
            .AsNoTracking()
            .Select(e => new EventSlugDto(e.Url, e.UpdatedAt))
            .ToListAsync(cancellationToken);

        return slugs;
    }


    public async Task<PagedResult<EventDto>> GetPaginatedEventsAsync(PagedRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            if (!request.IsValid)
            {
                throw new ArgumentException("Invalid pagination parameters", nameof(request));
            }

            // ✅ Base query with mapping
            var query = _context.AssociationEvents
                .AsNoTracking()
                .Include(e => e.Speakers)
                .AsQueryable();

            // 🔍 Apply search across multiple fields
            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var searchTerm = request.Search.ToLower();
                query = query.Where(e =>
                    (e.Title != null && e.Title.ToLower().Contains(searchTerm)) ||
                    (e.Description != null && e.Description.ToLower().Contains(searchTerm)) ||
                    (e.Location != null && e.Location.ToLower().Contains(searchTerm)) ||
                    (e.Type != null && e.Type.ToLower().Contains(searchTerm)));
            }

            // 📄 Apply pagination + sorting in one step
            var result = await query.ToPagedResultAsync(request, MapperExtensions.MapToEventDto, cancellationToken);

            _logger.LogDebug("Retrieved {Count} events (page {Page})",
                result.Items.Count(), request.Page);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting paginated events");
            throw;
        }
    }

    public async Task<DieticianAssociation.API.Helper.PageInfo> GetPublicEventStreamPageInfoAsync(PagedRequest request, CancellationToken cancellationToken = default)
    {
        if (!request.IsValid)
        {
            throw new ArgumentException("Invalid pagination parameters", nameof(request));
        }

        var totalItems = await BuildPublicEventQuery(request).CountAsync(cancellationToken);

        return new DieticianAssociation.API.Helper.PageInfo
        {
            CurrentPage = request.Page,
            PageSize = request.PageSize,
            TotalItems = totalItems,
            TotalPages = (int)Math.Ceiling((double)totalItems / request.PageSize),
            HasPrevious = request.Page > 1,
            HasNext = request.Page * request.PageSize < totalItems,
        };
    }

    public async IAsyncEnumerable<EventDto> StreamPublicEventsAsync(
        PagedRequest request,
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        if (!request.IsValid)
        {
            throw new ArgumentException("Invalid pagination parameters", nameof(request));
        }

        var query = BuildPublicEventQuery(request)
            .Skip(request.Skip)
            .Take(request.PageSize)
            .AsAsyncEnumerable();

        await foreach (var eventItem in query.WithCancellation(cancellationToken))
        {
            yield return MapperExtensions.MapToEventDto(eventItem);
        }
    }
}
