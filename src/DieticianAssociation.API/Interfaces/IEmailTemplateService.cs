namespace DieticianAssociation.API.Interfaces;

public interface IEmailTemplateService
{
    Task<IEnumerable<EmailTemplateDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<EmailTemplateDto?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<EmailTemplateDto> CreateAsync(CreateEmailTemplateDto request, CancellationToken cancellationToken = default);
    Task<EmailTemplateDto?> UpdateAsync(string id, UpdateEmailTemplateDto request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default);
}
