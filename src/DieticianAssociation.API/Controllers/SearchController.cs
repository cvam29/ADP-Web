using DieticianAssociation.API.Constants;

namespace DieticianAssociation.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SearchController(ApplicationDbContext context, ILogger<SearchController> logger) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;
        private readonly ILogger<SearchController> _logger = logger;

        [HttpGet("blog-posts")]
        public async Task<IActionResult> SearchBlogPosts(
            [FromQuery] string? q = null,
            [FromQuery] int limit = 20,
            [FromQuery] int offset = 0,
            [FromQuery] string? filter_category = null,
            [FromQuery] string? sortBy = null,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var query = _context.BlogPosts.AsNoTracking()
                    .Where(bp => bp.IsPublished)
                    .AsQueryable();

                // Apply search filter
                if (!string.IsNullOrWhiteSpace(q))
                {
                    var searchTerm = q.ToLower();
                    query = query.Where(bp =>
                        EF.Functions.ILike(bp.Title, $"%{searchTerm}%") ||
                        EF.Functions.ILike(bp.Content, $"%{searchTerm}%") ||
                        EF.Functions.ILike(bp.Excerpt, $"%{searchTerm}%"));
                }

                // Apply category filter
                if (!string.IsNullOrWhiteSpace(filter_category) && filter_category != "All")
                {
                    query = query.Where(bp => bp.Category == filter_category);
                }

                // Apply sorting
                query = sortBy?.ToLower() switch
                {
                    "publisheddate" => query.OrderBy(bp => bp.PublishedDate),
                    "publisheddate:desc" => query.OrderByDescending(bp => bp.PublishedDate),
                    "title" => query.OrderBy(bp => bp.Title),
                    "title:desc" => query.OrderByDescending(bp => bp.Title),
                    _ => query.OrderByDescending(bp => bp.PublishedDate)
                };

                var totalCount = await query.CountAsync(cancellationToken);
                var results = await query
                    .Skip(offset)
                    .Take(limit)
                    .Select(bp => new
                    {
                        id = bp.Id,
                        title = bp.Title,
                        content = bp.Content,
                        excerpt = bp.Excerpt,
                        category = bp.Category,
                        publishedDate = bp.PublishedDate,
                        author = bp.Author,
                        image = bp.Image,
                        tags = bp.Tags
                    })
                    .ToListAsync(cancellationToken);

                return Ok(new
                {
                    results = results.Select(r => new { document = r }),
                    totalCount,
                    facets = new
                    {
                        category = await _context.BlogPosts
                            .AsNoTracking()
                            .GroupBy(bp => bp.Category)
                            .Select(g => new { name = g.Key, count = g.Count() })
                            .ToListAsync(cancellationToken)
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while searching blog posts");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpGet("events")]
        public async Task<IActionResult> SearchEvents(
            [FromQuery] string? q = null,
            [FromQuery] int limit = 20,
            [FromQuery] int offset = 0,
            [FromQuery] string? filter_type = null,
            [FromQuery] string? filter_format = null,
            [FromQuery] string? sortBy = null,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var query = _context.AssociationEvents.AsNoTracking().AsQueryable();

                // Apply search filter
                if (!string.IsNullOrWhiteSpace(q))
                {
                    var searchTerm = q.ToLower();
                    query = query.Where(e =>
                        EF.Functions.ILike(e.Title, $"%{searchTerm}%") ||
                        EF.Functions.ILike(e.Description, $"%{searchTerm}%") ||
                        EF.Functions.ILike(e.Location, $"%{searchTerm}%"));
                }

                // Apply type filter
                if (!string.IsNullOrWhiteSpace(filter_type) && filter_type != "All")
                {
                    query = query.Where(e => e.Type == filter_type);
                }

                // Apply format filter
                if (!string.IsNullOrWhiteSpace(filter_format) && filter_format != "All")
                {
                    query = query.Where(e => e.Format == filter_format);
                }

                // Apply sorting
                query = sortBy?.ToLower() switch
                {
                    "date" => query.OrderBy(e => e.Date),
                    "date:desc" => query.OrderByDescending(e => e.Date),
                    "title" => query.OrderBy(e => e.Title),
                    "title:desc" => query.OrderByDescending(e => e.Title),
                    _ => query.OrderBy(e => e.Date)
                };

                var totalCount = await query.CountAsync(cancellationToken);
                var results = await query
                    .Skip(offset)
                    .Take(limit)
                    .Select(e => new
                    {
                        id = e.Id,
                        title = e.Title,
                        description = e.Description,
                        location = e.Location,
                        date = e.Date,
                        time = e.Time,
                        type = e.Type,
                        format = e.Format,
                        capacity = e.Capacity,
                        registered = e.Registered,
                        price = e.Price,
                        speakers = e.Speakers,
                        credits = e.Credits
                    })
                    .ToListAsync(cancellationToken);

                return Ok(new
                {
                    results = results.Select(r => new { document = r }),
                    totalCount,
                    facets = new
                    {
                        type = await _context.AssociationEvents
                            .AsNoTracking()
                            .GroupBy(e => e.Type)
                            .Select(g => new { name = g.Key, count = g.Count() })
                            .ToListAsync(cancellationToken),
                        format = await _context.AssociationEvents
                            .AsNoTracking()
                            .GroupBy(e => e.Format)
                            .Select(g => new { name = g.Key, count = g.Count() })
                            .ToListAsync(cancellationToken)
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while searching events");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpGet("resources")]
        public async Task<IActionResult> SearchResources(
            [FromQuery] string? q = null,
            [FromQuery] int limit = 20,
            [FromQuery] int offset = 0,
            [FromQuery] string? filter_category = null,
            [FromQuery] string? filter_type = null,
            [FromQuery] string? sortBy = null,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var query = _context.Resources.AsNoTracking().AsQueryable();

                // Apply search filter
                if (!string.IsNullOrWhiteSpace(q))
                {
                    var searchTerm = q.ToLower();
                    query = query.Where(r =>
                        EF.Functions.ILike(r.Title, $"%{searchTerm}%") ||
                        EF.Functions.ILike(r.Description, $"%{searchTerm}%"));
                }

                // Apply category filter
                if (!string.IsNullOrWhiteSpace(filter_category) && filter_category != "All")
                {
                    query = query.Where(r => r.Category == filter_category);
                }

                // Apply type filter
                if (!string.IsNullOrWhiteSpace(filter_type) && filter_type != "All")
                {
                    query = query.Where(r => r.Type.ToString() == filter_type);
                }

                // Apply sorting
                query = sortBy?.ToLower() switch
                {
                    "createdat" => query.OrderBy(r => r.CreatedAt),
                    "createdat:desc" => query.OrderByDescending(r => r.CreatedAt),
                    "title" => query.OrderBy(r => r.Title),
                    "title:desc" => query.OrderByDescending(r => r.Title),
                    _ => query.OrderByDescending(r => r.CreatedAt)
                };

                var totalCount = await query.CountAsync(cancellationToken);
                var results = await query
                    .Skip(offset)
                    .Take(limit)
                    .Select(r => new
                    {
                        id = r.Id,
                        title = r.Title,
                        description = r.Description,
                        category = r.Category,
                        type = r.Type,
                        downloadUrl = r.DownloadUrl,
                        downloads = r.Downloads,
                        premium = r.Premium,
                        publishedDate = r.PublishedDate,
                        fileSize = r.FileSize
                    })
                    .ToListAsync(cancellationToken);

                return Ok(new
                {
                    results = results.Select(r => new { document = r }),
                    totalCount,
                    facets = new
                    {
                        category = await _context.Resources
                            .AsNoTracking()
                            .GroupBy(r => r.Category)
                            .Select(g => new { name = g.Key, count = g.Count() })
                            .ToListAsync(cancellationToken),
                        type = await _context.Resources
                            .AsNoTracking()
                            .GroupBy(r => r.Type)
                            .Select(g => new { name = g.Key.ToString(), count = g.Count() })
                            .ToListAsync(cancellationToken)
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while searching resources");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpGet("member-directory")]
        [Authorize]
        [HasPermission(PermissionKeys.MemberDirectoryAccess)]
        [ProducesResponseType(typeof(MemberDirectoryResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<MemberDirectoryResponseDto>> SearchMemberDirectory(
            [FromQuery] string? q = null,
            [FromQuery] int limit = 20,
            [FromQuery] int offset = 0,
            [FromQuery] string? filter_membershipTier = null,
            [FromQuery] string? sortBy = null,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrWhiteSpace(currentUserId))
                {
                    return Unauthorized(new ErrorResponseDto { Code = "UNAUTHORIZED", Message = "User ID not found in token" });
                }

                var hasDirectoryAccess = await _context.Users
                    .AsNoTracking()
                    .Where(u => u.Id == currentUserId && !u.IsDeleted)
                    .AnyAsync(u =>
                        u.Role == UserRole.Admin ||
                        u.Role == UserRole.SuperAdmin ||
                        u.Memberships.Any(m => m.Status == MembershipStatus.Active), cancellationToken);

                if (!hasDirectoryAccess)
                {
                    return StatusCode(StatusCodes.Status403Forbidden, new ErrorResponseDto
                    {
                        Code = "FORBIDDEN",
                        Message = "An active membership is required to access the member directory"
                    });
                }

                var activeMembers = _context.Users
                    .AsNoTracking()
                    .Include(u => u.Memberships)
                    .ThenInclude(m => m.MembershipPlan)
                    .Where(u => !u.IsDeleted && u.IsActive && u.Role == UserRole.Member)
                    .Select(u => new
                    {
                        User = u,
                        LatestMembership = u.Memberships
                            .OrderByDescending(m => m.CreatedAt)
                            .FirstOrDefault(m => m.Status == MembershipStatus.Active)
                    })
                    .Where(x => x.LatestMembership != null);

                if (!string.IsNullOrWhiteSpace(q))
                {
                    var searchTerm = q.Trim().ToLower();
                    activeMembers = activeMembers.Where(x =>
                        (x.User.Name != null && EF.Functions.ILike(x.User.Name, $"%{searchTerm}%")) ||
                        (x.User.Organization != null && EF.Functions.ILike(x.User.Organization, $"%{searchTerm}%")) ||
                        (x.User.Designation != null && EF.Functions.ILike(x.User.Designation, $"%{searchTerm}%")));
                }

                if (!string.IsNullOrWhiteSpace(filter_membershipTier) && filter_membershipTier != "All")
                {
                    if (Enum.TryParse<MembershipTier>(filter_membershipTier, true, out var tierEnum))
                    {
                        activeMembers = activeMembers.Where(x =>
                            x.LatestMembership != null &&
                            x.LatestMembership.MembershipPlan.Tier == tierEnum);
                    }
                }

                activeMembers = sortBy?.ToLower() switch
                {
                    "name" => activeMembers.OrderBy(x => x.User.Name),
                    "name:desc" => activeMembers.OrderByDescending(x => x.User.Name),
                    "joindate" => activeMembers.OrderBy(x => x.LatestMembership!.StartDate),
                    "joindate:desc" => activeMembers.OrderByDescending(x => x.LatestMembership!.StartDate),
                    _ => activeMembers.OrderBy(x => x.User.Name)
                };

                var totalCount = await activeMembers.CountAsync(cancellationToken);

                var rawItems = await activeMembers
                    .Skip(offset)
                    .Take(limit)
                    .Select(x => new
                    {
                        x.User.Id,
                        x.User.Name,
                        x.User.Avatar,
                        x.User.Designation,
                        x.User.Organization,
                        x.User.Specializations,
                        x.User.JoinDate,
                        MembershipTierEnum = x.LatestMembership != null
                            ? (MembershipTier?)x.LatestMembership.MembershipPlan.Tier
                            : null,
                        MembershipStartDate = x.LatestMembership != null
                            ? (DateTime?)x.LatestMembership.StartDate
                            : null
                    })
                    .ToListAsync(cancellationToken);

                var items = rawItems.Select(x => new MemberDirectoryItemDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Avatar = x.Avatar,
                    Designation = x.Designation,
                    Organization = x.Organization,
                    Specializations = x.Specializations,
                    MembershipTier = x.MembershipTierEnum.HasValue
                        ? x.MembershipTierEnum.Value.ToString()
                        : string.Empty,
                    JoinDate = x.MembershipStartDate ?? x.JoinDate
                }).ToList();

                var tierGroups = await _context.UserMemberships
                    .AsNoTracking()
                    .Include(m => m.MembershipPlan)
                    .Where(m => m.Status == MembershipStatus.Active)
                    .GroupBy(m => m.MembershipPlan.Tier)
                    .Select(g => new { Tier = g.Key, Count = g.Count() })
                    .ToListAsync(cancellationToken);

                var membershipTiers = tierGroups
                    .Select(g => new MemberDirectoryFacetDto
                    {
                        Name = g.Tier.ToString(),
                        Count = g.Count
                    })
                    .OrderBy(g => g.Name)
                    .ToList();

                return Ok(new MemberDirectoryResponseDto
                {
                    Items = items,
                    TotalCount = totalCount,
                    MembershipTiers = membershipTiers
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while loading the member directory");
                return StatusCode(StatusCodes.Status500InternalServerError, new ErrorResponseDto
                {
                    Code = "INTERNAL_SERVER_ERROR",
                    Message = "Unable to load the member directory"
                });
            }
        }

        [HttpGet("members")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SearchMembers(
    [FromQuery] string? q = null,
    [FromQuery] int limit = 20,
    [FromQuery] int offset = 0,
    [FromQuery] string? filter_membershipTier = null,
    [FromQuery] string? filter_membershipStatus = null,
    [FromQuery] string? sortBy = null,
    CancellationToken cancellationToken = default)
        {
            try
            {
                var query = _context.Users
                    .AsNoTracking()
                    .Include(u => u.Memberships)
                    .ThenInclude(m => m.MembershipPlan)
                    .AsQueryable();

                // 🔎 Apply search filter
                if (!string.IsNullOrWhiteSpace(q))
                {
                    var searchTerm = q.ToLower();
                    query = query.Where(u =>
                        (u.Name != null && EF.Functions.ILike(u.Name, $"%{searchTerm}%")) ||
                        (u.Email != null && EF.Functions.ILike(u.Email, $"%{searchTerm}%")));
                }

                // 🧭 Work with latest membership
                var membersWithLatestMembership = query
                    .Select(u => new
                    {
                        User = u,
                        LatestMembership = u.Memberships
                            .OrderByDescending(m => m.CreatedAt)
                            .FirstOrDefault()
                    });

                // 🎯 Filter by membership tier
                if (!string.IsNullOrWhiteSpace(filter_membershipTier) && filter_membershipTier != "All")
                {
                    if (Enum.TryParse<MembershipTier>(filter_membershipTier, true, out var tierEnum))
                    {
                        membersWithLatestMembership = membersWithLatestMembership
                            .Where(x => x.LatestMembership != null &&
                                        x.LatestMembership.MembershipPlan.Tier == tierEnum);
                    }
                }

                // 🎯 Filter by membership status
                if (!string.IsNullOrWhiteSpace(filter_membershipStatus) && filter_membershipStatus != "All")
                {
                    if (Enum.TryParse<MembershipStatus>(filter_membershipStatus, true, out var statusEnum))
                    {
                        membersWithLatestMembership = membersWithLatestMembership
                            .Where(x => x.LatestMembership != null &&
                                        x.LatestMembership.Status == statusEnum);
                    }
                }

                // 📌 Apply sorting
                membersWithLatestMembership = sortBy?.ToLower() switch
                {
                    "name" => membersWithLatestMembership.OrderBy(x => x.User.Name),
                    "name:desc" => membersWithLatestMembership.OrderByDescending(x => x.User.Name),
                    "email" => membersWithLatestMembership.OrderBy(x => x.User.Email),
                    "email:desc" => membersWithLatestMembership.OrderByDescending(x => x.User.Email),
                    "joindate" => membersWithLatestMembership.OrderBy(x => x.LatestMembership != null ? x.LatestMembership.StartDate : DateTime.MaxValue),
                    "joindate:desc" => membersWithLatestMembership.OrderByDescending(x => x.LatestMembership != null ? x.LatestMembership.StartDate : DateTime.MinValue),
                    _ => membersWithLatestMembership.OrderByDescending(x => x.User.CreatedAt)
                };

                var totalCount = await membersWithLatestMembership.CountAsync(cancellationToken);

                var rawResults = await membersWithLatestMembership
                    .Skip(offset)
                    .Take(limit)
                    .Select(x => new
                    {
                        id = x.User.Id,
                        name = x.User.Name,
                        email = x.User.Email,
                        avatar = x.User.Avatar,
                        membershipTierEnum = x.LatestMembership != null
                            ? (MembershipTier?)x.LatestMembership.MembershipPlan.Tier
                            : null,
                        membershipStatusEnum = x.LatestMembership != null
                            ? (MembershipStatus?)x.LatestMembership.Status
                            : null,
                        joinDate = x.LatestMembership != null
                            ? (DateTime?)x.LatestMembership.StartDate
                            : null,
                        expirationDate = x.LatestMembership != null
                            ? (DateTime?)x.LatestMembership.EndDate
                            : null
                    })
                    .ToListAsync(cancellationToken);

                var results = rawResults.Select(x => new
                {
                    x.id,
                    x.name,
                    x.email,
                    x.avatar,
                    membershipTier = x.membershipTierEnum.HasValue ? x.membershipTierEnum.Value.ToString() : null,
                    membershipStatus = x.membershipStatusEnum.HasValue ? x.membershipStatusEnum.Value.ToString() : null,
                    x.joinDate,
                    x.expirationDate
                }).ToList();

                // 📊 Build facets from latest memberships
                var tierFacets = await _context.UserMemberships
                    .AsNoTracking()
                    .Include(m => m.MembershipPlan)
                    .GroupBy(m => m.MembershipPlan.Tier)
                    .Select(g => new { tier = g.Key, count = g.Count() })
                    .ToListAsync(cancellationToken);

                var statusFacets = await _context.UserMemberships
                    .AsNoTracking()
                    .GroupBy(m => m.Status)
                    .Select(g => new { status = g.Key, count = g.Count() })
                    .ToListAsync(cancellationToken);

                var facets = new
                {
                    membershipTier = tierFacets.Select(g => new { name = g.tier.ToString(), count = g.count }),
                    membershipStatus = statusFacets.Select(g => new { name = g.status.ToString(), count = g.count })
                };

                return Ok(new
                {
                    results = results.Select(r => new { document = r }),
                    totalCount,
                    facets
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while searching members");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

    }
}
