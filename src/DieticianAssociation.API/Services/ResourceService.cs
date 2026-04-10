namespace DieticianAssociation.API.Services;

public interface IResourceService
{
    Task<IEnumerable<ResourceDto>> GetAllResourcesAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<ResourceDto>> GetResourcesByCategoryAsync(string category, CancellationToken cancellationToken = default);
    Task<IEnumerable<ResourceDto>> GetResourcesByTypeAsync(string type, CancellationToken cancellationToken = default);
    Task<IEnumerable<ResourceDto>> SearchResourcesAsync(string searchTerm, CancellationToken cancellationToken = default);
    Task<ResourceDto?> GetResourceByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<ResourceDto?> CreateResourceAsync(CreateResourceDto createResource, CancellationToken cancellationToken = default);
    Task<ResourceDto?> UpdateResourceAsync(string id, CreateResourceDto updateResource, CancellationToken cancellationToken = default);
    Task<bool> DeleteResourceAsync(string id, CancellationToken cancellationToken = default);
    Task<bool> IncrementDownloadAsync(string id, CancellationToken cancellationToken = default);
    Task<PagedResult<ResourceDto>> GetPaginatedResourcesAsync(PagedRequest request, CancellationToken cancellationToken = default);

    // Public methods for free resources (no authentication required)
    Task<IEnumerable<ResourceDto>> GetFreeResourcesAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<ResourceDto>> GetFreeResourcesByCategoryAsync(string category, CancellationToken cancellationToken = default);
    Task<IEnumerable<ResourceDto>> GetFreeResourcesByTypeAsync(string type, CancellationToken cancellationToken = default);
    Task<IEnumerable<ResourceDto>> SearchFreeResourcesAsync(string searchTerm, CancellationToken cancellationToken = default);
    Task<PagedResult<ResourceDto>> GetPaginatedFreeResourcesAsync(PagedRequest request, CancellationToken cancellationToken = default);
}

public class ResourceService(ApplicationDbContext context) : IResourceService
{
    private readonly ApplicationDbContext _context = context;

    public async Task<IEnumerable<ResourceDto>> GetAllResourcesAsync(CancellationToken cancellationToken = default)
    {
        var resources = await _context.Resources
            .AsNoTracking()
            .OrderByDescending(r => r.PublishedDate)
            .ToListAsync(cancellationToken);

        return resources.Select(MapToDto);
    }

    public async Task<PagedResult<ResourceDto>> GetPaginatedResourcesAsync(PagedRequest request, CancellationToken cancellationToken = default)
    {
        if (!request.IsValid)
            throw new ArgumentException("Invalid pagination parameters", nameof(request));

        var query = _context.Resources.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var term = request.Search.ToLower();
            query = query.Where(r =>
                (r.Title != null && r.Title.ToLower().Contains(term)) ||
                (r.Description != null && r.Description.ToLower().Contains(term)) ||
                (r.Category != null && r.Category.ToLower().Contains(term)) ||
                (r.Type != null && r.Type.ToLower().Contains(term))
            );
        }

        var result = await query.ToPagedResultAsync(request, MapToDto, cancellationToken);
        return result;
    }

    public async Task<IEnumerable<ResourceDto>> GetResourcesByCategoryAsync(string category, CancellationToken cancellationToken = default)
    {
        var resources = await _context.Resources
            .AsNoTracking()
            .Where(r => r.Category != null && category != null && r.Category.ToLower() == category.ToLower())
            .OrderByDescending(r => r.PublishedDate)
            .ToListAsync(cancellationToken);

        return resources.Select(MapToDto);
    }

    public async Task<IEnumerable<ResourceDto>> GetResourcesByTypeAsync(string type, CancellationToken cancellationToken = default)
    {
        var resources = await _context.Resources
            .AsNoTracking()
            .Where(r => r.Type != null && type != null && r.Type.ToLower() == type.ToLower())
            .OrderByDescending(r => r.PublishedDate)
            .ToListAsync(cancellationToken);

        return resources.Select(MapToDto);
    }

    public async Task<IEnumerable<ResourceDto>> SearchResourcesAsync(string searchTerm, CancellationToken cancellationToken = default)
    {
        var resources = await _context.Resources
            .AsNoTracking()
            .Where(r => r.Title.Contains(searchTerm) || r.Description.Contains(searchTerm))
            .OrderByDescending(r => r.PublishedDate)
            .ToListAsync(cancellationToken);

        return resources.Select(MapToDto);
    }

    public async Task<ResourceDto?> GetResourceByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var resource = await _context.Resources
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
        return resource == null ? null : MapToDto(resource);
    }

    public async Task<ResourceDto?> CreateResourceAsync(CreateResourceDto createResource, CancellationToken cancellationToken = default)
    {
        var resource = new Resource
        {
            Id = Guid.NewGuid().ToString(),
            Title = createResource.Title,
            Description = createResource.Description,
            Category = createResource.Category,
            Type = createResource.Type,
            Format = createResource.Format,
            Downloads = 0,
            Premium = createResource.Premium,
            DownloadUrl = createResource.DownloadUrl,
            FileSize = createResource.FileSize,
            PublishedDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Resources.Add(resource);
        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(resource);
    }

    public async Task<ResourceDto?> UpdateResourceAsync(string id, CreateResourceDto updateResource, CancellationToken cancellationToken = default)
    {
        var resource = await _context.Resources.FindAsync(new object[] { id }, cancellationToken);
        if (resource == null) return null;

        resource.Title = updateResource.Title;
        resource.Description = updateResource.Description;
        resource.Category = updateResource.Category;
        resource.Type = updateResource.Type;
        resource.Format = updateResource.Format;
        resource.Premium = updateResource.Premium;
        resource.DownloadUrl = updateResource.DownloadUrl;
        resource.FileSize = updateResource.FileSize;
        resource.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return MapToDto(resource);
    }

    public async Task<bool> DeleteResourceAsync(string id, CancellationToken cancellationToken = default)
    {
        var resource = await _context.Resources.FindAsync(new object[] { id }, cancellationToken);
        if (resource == null) return false;

        _context.Resources.Remove(resource);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> IncrementDownloadAsync(string id, CancellationToken cancellationToken = default)
    {
        var resource = await _context.Resources.FindAsync(new object[] { id }, cancellationToken);
        if (resource == null) return false;

        resource.Downloads++;
        resource.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static ResourceDto MapToDto(Resource resource)
    {
        return new ResourceDto
        {
            Id = resource.Id,
            Title = resource.Title,
            Description = resource.Description,
            Category = resource.Category,
            Type = resource.Type,
            Format = resource.Format,
            Downloads = resource.Downloads,
            Premium = resource.Premium,
            DownloadUrl = resource.DownloadUrl,
            FileSize = resource.FileSize,
            Date = resource.PublishedDate.ToString("yyyy-MM-dd")
        };
    }

    /// <summary>
    /// Converts file size in bytes to human-readable format
    /// </summary>
    private static string GetHumanReadableFileSize(long bytes)
    {
        string[] sizes = ["B", "KB", "MB", "GB", "TB"];
        double len = bytes;
        int order = 0;
        while (len >= 1024 && order < sizes.Length - 1)
        {
            order++;
            len /= 1024;
        }
        return $"{len:0.##} {sizes[order]}";
    }

    /// <summary>
    /// Extracts the blob file name from a blob storage URL
    /// </summary>
    private static string ExtractFileNameFromUrl(string url)
    {
        try
        {
            var uri = new Uri(url);
            var segments = uri.Segments;
            if (segments.Length > 1)
            {
                // Get everything after the container name
                return string.Join("", segments.Skip(2));
            }
            return string.Empty;
        }
        catch
        {
            return string.Empty;
        }
    }

    // Public methods for free resources (no authentication required)
    public async Task<IEnumerable<ResourceDto>> GetFreeResourcesAsync(CancellationToken cancellationToken = default)
    {
        var resources = await _context.Resources
            .AsNoTracking()
            .Where(r => !r.Premium) // Only free resources
            .OrderByDescending(r => r.PublishedDate)
            .ToListAsync(cancellationToken);

        return resources.Select(MapToDto);
    }

    public async Task<PagedResult<ResourceDto>> GetPaginatedFreeResourcesAsync(PagedRequest request, CancellationToken cancellationToken = default)
    {
        if (!request.IsValid)
            throw new ArgumentException("Invalid pagination parameters", nameof(request));

        var query = _context.Resources
            .AsNoTracking()
            .Where(r => !r.Premium)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var term = request.Search.ToLower();
            query = query.Where(r =>
                (r.Title != null && r.Title.ToLower().Contains(term)) ||
                (r.Description != null && r.Description.ToLower().Contains(term)) ||
                (r.Category != null && r.Category.ToLower().Contains(term)) ||
                (r.Type != null && r.Type.ToLower().Contains(term))
            );
        }

        var result = await query.ToPagedResultAsync(request, MapToDto, cancellationToken);
        return result;
    }

    public async Task<IEnumerable<ResourceDto>> GetFreeResourcesByCategoryAsync(string category, CancellationToken cancellationToken = default)
    {
        var resources = await _context.Resources
            .AsNoTracking()
            .Where(r => !r.Premium && r.Category != null && category != null && r.Category.ToLower() == category.ToLower())
            .OrderByDescending(r => r.PublishedDate)
            .ToListAsync(cancellationToken);

        return resources.Select(MapToDto);
    }

    public async Task<IEnumerable<ResourceDto>> GetFreeResourcesByTypeAsync(string type, CancellationToken cancellationToken = default)
    {
        var resources = await _context.Resources
            .AsNoTracking()
            .Where(r => !r.Premium && r.Type != null && type != null && r.Type.ToLower() == type.ToLower())
            .OrderByDescending(r => r.PublishedDate)
            .ToListAsync(cancellationToken);

        return resources.Select(MapToDto);
    }

    public async Task<IEnumerable<ResourceDto>> SearchFreeResourcesAsync(string searchTerm, CancellationToken cancellationToken = default)
    {
        var resources = await _context.Resources
            .AsNoTracking()
            .Where(r => !r.Premium &&
                       (r.Title.Contains(searchTerm) || r.Description.Contains(searchTerm)))
            .OrderByDescending(r => r.PublishedDate)
            .ToListAsync(cancellationToken);

        return resources.Select(MapToDto);
    }
}
