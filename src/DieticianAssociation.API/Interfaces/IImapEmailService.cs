using DieticianAssociation.API.DTOs;
using DieticianAssociation.API.Helper;

namespace DieticianAssociation.API.Interfaces
{
    public interface IImapEmailService
    {
        Task<PagedResult<SentEmailDto>> GetSentEmailsAsync(PagedRequest request, string? account = null, bool noCache = false, CancellationToken cancellationToken = default);
        Task<PagedResult<SentEmailDto>> GetInboxEmailsAsync(PagedRequest request, string? account = null, bool noCache = false, CancellationToken cancellationToken = default);
        Task<SentEmailDto?> GetSentEmailByIdAsync(string id, string? account = null, CancellationToken cancellationToken = default);
        Task<SentEmailDto?> GetInboxEmailByIdAsync(string id, string? account = null, CancellationToken cancellationToken = default);
        List<string> GetConfiguredAccounts();
    }
}
