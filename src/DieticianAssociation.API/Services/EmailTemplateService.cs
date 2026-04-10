namespace DieticianAssociation.API.Services;

public class EmailTemplateService(ApplicationDbContext context) : IEmailTemplateService
{
    private readonly ApplicationDbContext _context = context;

    public async Task<IEnumerable<EmailTemplateDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var templates = await _context.EmailTemplates
            .AsNoTracking()
            .OrderBy(t => t.Key)
            .ToListAsync(cancellationToken);

        return templates.Select(MapToDto);
    }

    public async Task<EmailTemplateDto?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var template = await _context.EmailTemplates
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
        return template == null ? null : MapToDto(template);
    }

    public async Task<EmailTemplateDto> CreateAsync(CreateEmailTemplateDto request, CancellationToken cancellationToken = default)
    {
        var normalizedKey = request.Key.Trim().ToLower();
        var exists = await _context.EmailTemplates
            .AnyAsync(t => t.Key.ToLower() == normalizedKey, cancellationToken);

        if (exists)
        {
            throw new InvalidOperationException($"Email template with key '{normalizedKey}' already exists.");
        }

        var template = new EmailTemplate
        {
            Id = Guid.NewGuid().ToString(),
            Key = normalizedKey,
            Subject = request.Subject,
            HtmlBody = request.HtmlBody,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.EmailTemplates.Add(template);
        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(template);
    }

    public async Task<EmailTemplateDto?> UpdateAsync(string id, UpdateEmailTemplateDto request, CancellationToken cancellationToken = default)
    {
        var template = await _context.EmailTemplates.FindAsync(new object[] { id }, cancellationToken);
        if (template == null)
        {
            return null;
        }

        template.Subject = request.Subject;
        template.HtmlBody = request.HtmlBody;
        template.IsActive = request.IsActive;
        template.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return MapToDto(template);
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        var template = await _context.EmailTemplates.FindAsync(new object[] { id }, cancellationToken);
        if (template == null)
        {
            return false;
        }

        _context.EmailTemplates.Remove(template);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static EmailTemplateDto MapToDto(EmailTemplate template)
    {
        return new EmailTemplateDto
        {
            Id = template.Id,
            Key = template.Key,
            Subject = template.Subject,
            HtmlBody = template.HtmlBody,
            IsActive = template.IsActive,
            CreatedAt = template.CreatedAt,
            UpdatedAt = template.UpdatedAt
        };
    }
}
