namespace DieticianAssociation.API.Services;

public interface IContactService
{
    Task<IEnumerable<ContactMessageDto>> GetAllMessagesAsync(CancellationToken cancellationToken = default);
    Task<PagedResult<ContactMessageDto>> GetPaginatedMessagesAsync(PagedRequest request, CancellationToken cancellationToken = default);
    Task<ContactMessageDto?> GetMessageByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<ContactMessageDto?> CreateMessageAsync(CreateContactMessageDto createMessage, CancellationToken cancellationToken = default);
    Task<ContactMessageDto?> UpdateMessageStatusAsync(string id, string status, CancellationToken cancellationToken = default);
    Task<bool> DeleteMessageAsync(string id, CancellationToken cancellationToken = default);
}

public class ContactService(ApplicationDbContext context) : IContactService
{
    private readonly ApplicationDbContext _context = context;

    public async Task<IEnumerable<ContactMessageDto>> GetAllMessagesAsync(CancellationToken cancellationToken = default)
    {
        var messages = await _context.ContactMessages
            .AsNoTracking()
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync(cancellationToken);

        return messages.Select(MapToDto);
    }

    public async Task<PagedResult<ContactMessageDto>> GetPaginatedMessagesAsync(PagedRequest request, CancellationToken cancellationToken = default)
    {
        var query = _context.ContactMessages
            .AsNoTracking()
            .ApplyFilters(request)
            .OrderByDescending(m => m.CreatedAt)
            .AsQueryable();

        // Use generic pagination extension with mapping
        var result = await query.ToPagedResultAsync(request, MapToDto, cancellationToken);
        return result;
    }

    public async Task<ContactMessageDto?> GetMessageByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var message = await _context.ContactMessages
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
        return message == null ? null : MapToDto(message);
    }

    public async Task<ContactMessageDto?> CreateMessageAsync(CreateContactMessageDto createMessage, CancellationToken cancellationToken = default)
    {
        var message = new ContactMessage
        {
            Id = Guid.NewGuid().ToString(),
            Name = createMessage.Name,
            Email = createMessage.Email,
            MobileNumber = createMessage.MobileNumber,
            Subject = createMessage.Subject,
            Message = createMessage.Message,
            Category = createMessage.Category,
            Status = "New",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.ContactMessages.Add(message);
        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(message);
    }

    public async Task<ContactMessageDto?> UpdateMessageStatusAsync(string id, string status, CancellationToken cancellationToken = default)
    {
        var message = await _context.ContactMessages.FindAsync(new object[] { id }, cancellationToken);
        if (message == null) return null;

        message.Status = status;
        message.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return MapToDto(message);
    }

    public async Task<bool> DeleteMessageAsync(string id, CancellationToken cancellationToken = default)
    {
        var message = await _context.ContactMessages.FindAsync(new object[] { id }, cancellationToken);
        if (message == null) return false;

        _context.ContactMessages.Remove(message);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static ContactMessageDto MapToDto(ContactMessage message)
    {
        return new ContactMessageDto
        {
            Id = message.Id,
            Name = message.Name,
            Email = message.Email,
            MobileNumber = message.MobileNumber,
            Subject = message.Subject,
            Message = message.Message,
            Category = message.Category,
            Status = message.Status,
            CreatedAt = message.CreatedAt.ToString("yyyy-MM-dd HH:mm")
        };
    }
}
