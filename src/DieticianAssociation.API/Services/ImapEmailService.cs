using DieticianAssociation.API.DTOs;
using DieticianAssociation.API.Helper;
using DieticianAssociation.API.Interfaces;
using MailKit;
using MailKit.Net.Imap;
using MailKit.Search;
using MailKitUniqueId = MailKit.UniqueId;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;
using System.Diagnostics;

namespace DieticianAssociation.API.Services
{
    public class ImapEmailService : IImapEmailService
    {
        private static readonly TimeSpan ListCacheDuration = TimeSpan.FromSeconds(10);
        private static readonly TimeSpan DetailCacheDuration = TimeSpan.FromMinutes(5);
        private const MessageSummaryItems SummaryItems = MessageSummaryItems.UniqueId | MessageSummaryItems.Envelope | MessageSummaryItems.InternalDate;

        private readonly IConfiguration _configuration;
        private readonly ILogger<ImapEmailService> _logger;
        private readonly IMemoryCache _cache;

        public ImapEmailService(IConfiguration configuration, ILogger<ImapEmailService> logger, IMemoryCache cache)
        {
            _configuration = configuration;
            _logger = logger;
            _cache = cache;
        }

        public List<string> GetConfiguredAccounts()
        {
            var accounts = _configuration.GetSection("Email:Imap:Accounts").GetChildren();
            return accounts.Select(a => a["Email"] ?? "").Where(e => !string.IsNullOrEmpty(e)).ToList();
        }

        public async Task<PagedResult<SentEmailDto>> GetSentEmailsAsync(PagedRequest request, string? account = null, bool noCache = false, CancellationToken cancellationToken = default)
        {
            return await FetchEmailsFromFolderAsync(request, account, FolderType.Sent, noCache, cancellationToken);
        }

        public async Task<PagedResult<SentEmailDto>> GetInboxEmailsAsync(PagedRequest request, string? account = null, bool noCache = false, CancellationToken cancellationToken = default)
        {
            return await FetchEmailsFromFolderAsync(request, account, FolderType.Inbox, noCache, cancellationToken);
        }

        public async Task<SentEmailDto?> GetSentEmailByIdAsync(string id, string? account = null, CancellationToken cancellationToken = default)
        {
            return await FetchEmailByIdAsync(id, account, FolderType.Sent, cancellationToken);
        }

        public async Task<SentEmailDto?> GetInboxEmailByIdAsync(string id, string? account = null, CancellationToken cancellationToken = default)
        {
            return await FetchEmailByIdAsync(id, account, FolderType.Inbox, cancellationToken);
        }

        private enum FolderType { Sent, Inbox }

        private async Task<PagedResult<SentEmailDto>> FetchEmailsFromFolderAsync(PagedRequest request, string? account, FolderType folderType, bool noCache = false, CancellationToken cancellationToken = default)
        {
            var normalizedRequest = NormalizeRequest(request);
            var accountConfig = ResolveAccountConfiguration(account);

            if (accountConfig == null)
            {
                _logger.LogWarning("No IMAP account found for: {Account}", account ?? "default");
                return PagedResult<SentEmailDto>.Create([], normalizedRequest.Page, normalizedRequest.PageSize, 0);
            }

            var accountEmail = accountConfig["Email"] ?? accountConfig["Name"] ?? "default";
            var cacheKey = BuildListCacheKey(folderType, accountEmail, normalizedRequest);
            if (!noCache && _cache.TryGetValue(cacheKey, out PagedResult<SentEmailDto>? cachedResult) && cachedResult is not null)
            {
                return cachedResult;
            }

            var totalStopwatch = Stopwatch.StartNew();
            using var client = new ImapClient();
            try
            {
                await ConnectAndAuthenticateAsync(client, accountConfig, cancellationToken);

                var folder = await ResolveFolderAsync(client, folderType, cancellationToken);

                await folder.OpenAsync(FolderAccess.ReadOnly, cancellationToken);

                var searchStopwatch = Stopwatch.StartNew();
                var uids = await folder.SearchAsync(BuildSearchQuery(normalizedRequest.Search, folderType), cancellationToken);
                searchStopwatch.Stop();

                var totalItems = uids.Count;
                var sortedUids = string.Equals(normalizedRequest.SortDirection, "asc", StringComparison.OrdinalIgnoreCase)
                    ? uids.OrderBy(u => u.Id)
                    : uids.OrderByDescending(u => u.Id);
                var pagedUids = sortedUids.Skip(normalizedRequest.Skip).Take(normalizedRequest.PageSize).ToList();

                if (pagedUids.Count == 0)
                {
                    var emptyResult = PagedResult<SentEmailDto>.Create([], normalizedRequest.Page, normalizedRequest.PageSize, totalItems);
                    _cache.Set(cacheKey, emptyResult, ListCacheDuration);
                    return emptyResult;
                }

                var fetchStopwatch = Stopwatch.StartNew();
                var summaries = await folder.FetchAsync(pagedUids, SummaryItems, cancellationToken);
                fetchStopwatch.Stop();

                var summaryLookup = summaries
                    .Where(summary => summary.UniqueId.IsValid)
                    .ToDictionary(summary => summary.UniqueId.Id);

                var results = pagedUids
                    .Select(uid => summaryLookup.TryGetValue(uid.Id, out var summary) ? MapSummary(summary) : null)
                    .Where(email => email is not null)
                    .Select(email => email!)
                    .ToList();

                await client.DisconnectAsync(true, cancellationToken);

                totalStopwatch.Stop();

                var result = PagedResult<SentEmailDto>.Create(results, normalizedRequest.Page, normalizedRequest.PageSize, totalItems);
                _cache.Set(cacheKey, result, ListCacheDuration);

                _logger.LogInformation(
                    "Fetched {FolderType} email summaries for {Account} in {ElapsedMs}ms (search {SearchMs}ms, fetch {FetchMs}ms, page {Page}, size {PageSize}, total {TotalItems}).",
                    folderType,
                    accountEmail,
                    totalStopwatch.ElapsedMilliseconds,
                    searchStopwatch.ElapsedMilliseconds,
                    fetchStopwatch.ElapsedMilliseconds,
                    normalizedRequest.Page,
                    normalizedRequest.PageSize,
                    totalItems);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching {FolderType} emails from IMAP for account {Account}", folderType, accountEmail);
                return PagedResult<SentEmailDto>.Create([], normalizedRequest.Page, normalizedRequest.PageSize, 0);
            }
        }

        private async Task<SentEmailDto?> FetchEmailByIdAsync(string id, string? account, FolderType folderType, CancellationToken cancellationToken)
        {
            if (!uint.TryParse(id, out var parsedId))
            {
                return null;
            }

            var accountConfig = ResolveAccountConfiguration(account);
            if (accountConfig == null)
            {
                _logger.LogWarning("No IMAP account found for detail lookup: {Account}", account ?? "default");
                return null;
            }

            var accountEmail = accountConfig["Email"] ?? accountConfig["Name"] ?? "default";
            var cacheKey = BuildDetailCacheKey(folderType, accountEmail, id);
            if (_cache.TryGetValue(cacheKey, out SentEmailDto? cachedEmail) && cachedEmail is not null)
            {
                return cachedEmail;
            }

            using var client = new ImapClient();
            try
            {
                await ConnectAndAuthenticateAsync(client, accountConfig, cancellationToken);

                var folder = await ResolveFolderAsync(client, folderType, cancellationToken);
                await folder.OpenAsync(FolderAccess.ReadOnly, cancellationToken);

                var message = await folder.GetMessageAsync(new MailKitUniqueId(parsedId), cancellationToken);
                await client.DisconnectAsync(true, cancellationToken);

                var email = MapMessage(parsedId, message);
                _cache.Set(cacheKey, email, DetailCacheDuration);
                return email;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching {FolderType} email {EmailId} from IMAP for account {Account}", folderType, id, accountEmail);
                return null;
            }
        }

        private IConfigurationSection? ResolveAccountConfiguration(string? account)
        {
            var accounts = _configuration.GetSection("Email:Imap:Accounts").GetChildren().ToList();
            if (string.IsNullOrWhiteSpace(account))
            {
                return accounts.FirstOrDefault();
            }

            return accounts.FirstOrDefault(a => a["Email"]?.Equals(account, StringComparison.OrdinalIgnoreCase) == true)
                ?? accounts.FirstOrDefault(a => a["Name"]?.Equals(account, StringComparison.OrdinalIgnoreCase) == true);
        }

        private async Task ConnectAndAuthenticateAsync(ImapClient client, IConfigurationSection accountConfig, CancellationToken cancellationToken)
        {
            var host = _configuration["Email:Imap:Host"];
            var port = int.Parse(_configuration["Email:Imap:Port"] ?? "993");
            var username = accountConfig["Username"];
            var password = accountConfig["Password"];

            await client.ConnectAsync(host, port, true, cancellationToken);
            await client.AuthenticateAsync(username, password, cancellationToken);
        }

        private async Task<IMailFolder> ResolveFolderAsync(ImapClient client, FolderType folderType, CancellationToken cancellationToken)
        {
            if (folderType == FolderType.Inbox)
            {
                return client.Inbox;
            }

            try
            {
                return client.GetFolder(SpecialFolder.Sent);
            }
            catch (FolderNotFoundException)
            {
                if (client.PersonalNamespaces.Count == 0)
                {
                    throw new InvalidOperationException("Sent folder not found on the IMAP server.");
                }

                var personalFolder = client.GetFolder(client.PersonalNamespaces[0]);
                return await TryResolveSubfolderAsync(personalFolder, cancellationToken)
                    ?? throw new InvalidOperationException("Sent folder not found on the IMAP server.");
            }
        }

        private static async Task<IMailFolder?> TryResolveSubfolderAsync(IMailFolder parentFolder, CancellationToken cancellationToken)
        {
            foreach (var folderName in new[] { "Sent", "Sent Items" })
            {
                try
                {
                    return await parentFolder.GetSubfolderAsync(folderName, cancellationToken);
                }
                catch (FolderNotFoundException)
                {
                }
            }

            return null;
        }

        private static PagedRequest NormalizeRequest(PagedRequest request)
        {
            return new PagedRequest
            {
                Page = request.Page,
                PageSize = request.PageSize,
                Search = string.IsNullOrWhiteSpace(request.Search) ? null : request.Search.Trim(),
                SortBy = request.SortBy,
                SortDirection = request.SortDirection,
                Filters = request.Filters
            };
        }

        private static SearchQuery BuildSearchQuery(string? search, FolderType folderType)
        {
            if (string.IsNullOrWhiteSpace(search))
            {
                return SearchQuery.All;
            }

            return SearchQuery.Or(
                SearchQuery.SubjectContains(search),
                folderType == FolderType.Inbox
                    ? SearchQuery.FromContains(search)
                    : SearchQuery.ToContains(search));
        }

        private static SentEmailDto MapSummary(IMessageSummary summary)
        {
            return new SentEmailDto
            {
                Id = summary.UniqueId.Id.ToString(),
                FromAddress = JoinAddresses(summary.Envelope?.From),
                ToAddress = JoinAddresses(summary.Envelope?.To),
                Subject = summary.Envelope?.Subject ?? string.Empty,
                DateSent = summary.InternalDate?.DateTime ?? summary.Date.DateTime,
                BodyHtml = string.Empty
            };
        }

        private static SentEmailDto MapMessage(uint uniqueId, MimeMessage message)
        {
            return new SentEmailDto
            {
                Id = uniqueId.ToString(),
                FromAddress = JoinAddresses(message.From),
                ToAddress = JoinAddresses(message.To),
                Subject = message.Subject ?? string.Empty,
                DateSent = message.Date.DateTime,
                BodyHtml = message.HtmlBody ?? message.TextBody ?? string.Empty
            };
        }

        private static string JoinAddresses(InternetAddressList? addresses)
        {
            if (addresses == null || addresses.Count == 0)
            {
                return string.Empty;
            }

            return string.Join(", ", addresses.Mailboxes.Select(mailbox => mailbox.Address));
        }

        private static string BuildListCacheKey(FolderType folderType, string account, PagedRequest request)
        {
            return $"imap:list:{folderType}:{account.Trim().ToLowerInvariant()}:{request.Page}:{request.PageSize}:{request.Search?.Trim().ToLowerInvariant() ?? "all"}";
        }

        private static string BuildDetailCacheKey(FolderType folderType, string account, string id)
        {
            return $"imap:detail:{folderType}:{account.Trim().ToLowerInvariant()}:{id}";
        }
    }
}
