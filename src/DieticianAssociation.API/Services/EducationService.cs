namespace DieticianAssociation.API.Services;

using System.Runtime.CompilerServices;

public class EducationService(ApplicationDbContext context, ILogger<EducationService> logger) : IEducationService
{
    private readonly ApplicationDbContext _context = context;
    private readonly ILogger<EducationService> _logger = logger;
    private static readonly List<CoursesOffered> AvailableCourseTabs =
    [
        CoursesOffered.UG,
        CoursesOffered.PG,
        CoursesOffered.PhD,
        CoursesOffered.Diploma,
        CoursesOffered.Certificate,
        CoursesOffered.Fellowship
    ];

    private async Task<(CoursesOffered SelectedTab, List<AcademicsTabSummaryDto> TabSummaries, List<AcademicsEntryDto> Ordered)> BuildAcademicsResultAsync(
        AcademicsPagedRequest request,
        CancellationToken cancellationToken)
    {
        if (!request.IsValid)
        {
            throw new ArgumentException("Invalid pagination parameters.", nameof(request));
        }

        var selectedTab = request.SelectedTab.GetValueOrDefault(CoursesOffered.UG);
        if (selectedTab == CoursesOffered.None)
        {
            selectedTab = CoursesOffered.UG;
        }

        var entries = new List<AcademicsEntryDto>();

        if (request.IncludeInstitutions)
        {
            var institutions = await GetInstitutionEntriesAsync(request, cancellationToken);
            entries.AddRange(institutions);
        }

        if (request.IncludeColleges)
        {
            var colleges = await GetCollegeEntriesAsync(request, cancellationToken);
            entries.AddRange(colleges);
        }

        if (request.Filters != null &&
            request.Filters.TryGetValue("institutionTypeCategory", out var institutionTypeValue) &&
            !string.IsNullOrWhiteSpace(institutionTypeValue?.ToString()))
        {
            var institutionType = institutionTypeValue.ToString()!;
            entries = entries
                .Where(e => string.Equals(e.InstitutionTypeCategory, institutionType, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            entries = entries.Where(e =>
                    e.Name.Contains(search, StringComparison.OrdinalIgnoreCase)
                    || (!string.IsNullOrWhiteSpace(e.Code) && e.Code.Contains(search, StringComparison.OrdinalIgnoreCase))
                    || (!string.IsNullOrWhiteSpace(e.UniversityName) && e.UniversityName.Contains(search, StringComparison.OrdinalIgnoreCase))
                    || (!string.IsNullOrWhiteSpace(e.StateName) && e.StateName.Contains(search, StringComparison.OrdinalIgnoreCase)))
                .ToList();
        }

        var tabSummaries = AvailableCourseTabs
            .Select(tab =>
            {
                var institutionsCount = entries.Count(e => e.EntityType == AcademicsEntityType.Institution && HasAnyFlag(e.CoursesOffered, tab));
                var collegesCount = entries.Count(e => e.EntityType == AcademicsEntityType.College && HasAnyFlag(e.CoursesOffered, tab));
                return new AcademicsTabSummaryDto
                {
                    Tab = tab,
                    InstitutionCount = institutionsCount,
                    CollegeCount = collegesCount,
                    TotalCount = institutionsCount + collegesCount
                };
            })
            .ToList();

        var tabFiltered = entries
            .Where(e => HasAnyFlag(e.CoursesOffered, selectedTab))
            .ToList();

        var ordered = ApplySorting(tabFiltered, request.SortBy, request.SortDirection);
        return (selectedTab, tabSummaries, ordered);
    }

    public async Task<AcademicsPagedResponseDto> GetAcademicsPaginatedAsync(AcademicsPagedRequest request, CancellationToken cancellationToken = default)
    {
        var (selectedTab, tabSummaries, ordered) = await BuildAcademicsResultAsync(request, cancellationToken);
        var pageItems = ordered
            .Skip(request.Skip)
            .Take(request.PageSize)
            .ToList();

        return new AcademicsPagedResponseDto
        {
            SelectedTab = selectedTab,
            AvailableTabs = AvailableCourseTabs,
            TabSummaries = tabSummaries,
            Results = PagedResult<AcademicsEntryDto>.Create(pageItems, request.Page, request.PageSize, ordered.Count)
        };
    }

    public async Task<AcademicsPagedResponseDto> GetAcademicsStreamMetadataAsync(AcademicsPagedRequest request, CancellationToken cancellationToken = default)
    {
        var (selectedTab, tabSummaries, ordered) = await BuildAcademicsResultAsync(request, cancellationToken);

        return new AcademicsPagedResponseDto
        {
            SelectedTab = selectedTab,
            AvailableTabs = AvailableCourseTabs,
            TabSummaries = tabSummaries,
            Results = PagedResult<AcademicsEntryDto>.Create([], request.Page, request.PageSize, ordered.Count)
        };
    }

    public async IAsyncEnumerable<AcademicsEntryDto> StreamAcademicsAsync(
        AcademicsPagedRequest request,
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        var (_, _, ordered) = await BuildAcademicsResultAsync(request, cancellationToken);

        foreach (var item in ordered.Skip(request.Skip).Take(request.PageSize))
        {
            cancellationToken.ThrowIfCancellationRequested();
            yield return item;
        }
    }

    // University operations
    public async Task<IEnumerable<UniversityDto>> GetAllUniversitiesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Universities
            .AsNoTracking()
            .Include(u => u.State)
            .Include(u => u.District)
            .Include(u => u.Colleges)
            .Select(u => new UniversityDto
            {
                Id = u.Id,
                UniversityCode = u.UniversityCode,
                Name = u.Name,
                WebsiteUrl = u.WebsiteUrl,
                Rating = u.Rating,
                SurveyYear = u.SurveyYear,
                TypeId = u.TypeId,
                UniversityType = u.UniversityType,
                StateId = u.StateId,
                StateName = u.State.Name,
                DistrictId = u.DistrictId,
                DistrictName = u.District != null ? u.District.Name : null,
                CollegeCount = u.Colleges.Count,
                CoursesOffered = GetCoursesOffered(u.CoursesOfferedFlags, InferCoursesOffered(u.UniversityType, u.TypeId, u.Name))
            })
            .OrderBy(u => u.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<UniversityDto?> GetUniversityByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Universities
            .AsNoTracking()
            .Include(u => u.State)
            .Include(u => u.District)
            .Include(u => u.Colleges)
            .Where(u => u.Id == id)
            .Select(u => new UniversityDto
            {
                Id = u.Id,
                UniversityCode = u.UniversityCode,
                Name = u.Name,
                WebsiteUrl = u.WebsiteUrl,
                Rating = u.Rating,
                SurveyYear = u.SurveyYear,
                TypeId = u.TypeId,
                UniversityType = u.UniversityType,
                StateId = u.StateId,
                StateName = u.State.Name,
                DistrictId = u.DistrictId,
                DistrictName = u.District != null ? u.District.Name : null,
                CollegeCount = u.Colleges.Count,
                CoursesOffered = GetCoursesOffered(u.CoursesOfferedFlags, InferCoursesOffered(u.UniversityType, u.TypeId, u.Name))
            })
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IEnumerable<UniversityDto>> GetUniversitiesByStateAsync(long stateId, CancellationToken cancellationToken = default)
    {
        return await _context.Universities
            .AsNoTracking()
            .Include(u => u.State)
            .Include(u => u.District)
            .Include(u => u.Colleges)
            .Where(u => u.StateId == stateId)
            .Select(u => new UniversityDto
            {
                Id = u.Id,
                UniversityCode = u.UniversityCode,
                Name = u.Name,
                WebsiteUrl = u.WebsiteUrl,
                Rating = u.Rating,
                SurveyYear = u.SurveyYear,
                TypeId = u.TypeId,
                UniversityType = u.UniversityType,
                StateId = u.StateId,
                StateName = u.State.Name,
                DistrictId = u.DistrictId,
                DistrictName = u.District != null ? u.District.Name : null,
                CollegeCount = u.Colleges.Count,
                CoursesOffered = GetCoursesOffered(u.CoursesOfferedFlags, InferCoursesOffered(u.UniversityType, u.TypeId, u.Name))
            })
            .OrderBy(u => u.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<UniversityDto> CreateUniversityAsync(CreateUniversityDto dto, CancellationToken cancellationToken = default)
    {
        // Check if university code already exists
        var exists = await _context.Universities.AnyAsync(u => u.UniversityCode == dto.UniversityCode, cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException($"University with code {dto.UniversityCode} already exists.");
        }

        var university = new University
        {
            UniversityCode = dto.UniversityCode,
            Name = dto.Name,
            WebsiteUrl = dto.WebsiteUrl,
            Rating = ClampRating(dto.Rating),
            SurveyYear = dto.SurveyYear,
            TypeId = dto.TypeId,
            UniversityType = dto.UniversityType,
            CoursesOfferedFlags = (int)dto.CoursesOffered,
            StateId = dto.StateId,
            DistrictId = dto.DistrictId
        };

        _context.Universities.Add(university);
        await _context.SaveChangesAsync(cancellationToken);

        return (await GetUniversityByIdAsync(university.Id, cancellationToken))!;
    }

    public async Task<UniversityDto> UpdateUniversityAsync(int id, UpdateUniversityDto dto, CancellationToken cancellationToken = default)
    {
        var university = await _context.Universities.FindAsync(new object[] { id }, cancellationToken) ?? throw new KeyNotFoundException($"University with ID {id} not found.");

        // Check if new code conflicts with existing university
        if (university.UniversityCode != dto.UniversityCode)
        {
            var exists = await _context.Universities.AnyAsync(u => u.UniversityCode == dto.UniversityCode && u.Id != id, cancellationToken);
            if (exists)
            {
                throw new InvalidOperationException($"University with code {dto.UniversityCode} already exists.");
            }
        }

        university.UniversityCode = dto.UniversityCode;
        university.Name = dto.Name;
        university.WebsiteUrl = dto.WebsiteUrl;
        university.Rating = ClampRating(dto.Rating);
        university.SurveyYear = dto.SurveyYear;
        university.TypeId = dto.TypeId;
        university.UniversityType = dto.UniversityType;
        university.CoursesOfferedFlags = (int)dto.CoursesOffered;
        university.StateId = dto.StateId;
        university.DistrictId = dto.DistrictId;

        await _context.SaveChangesAsync(cancellationToken);

        return (await GetUniversityByIdAsync(id, cancellationToken))!;
    }

    public async Task DeleteUniversityAsync(int id, CancellationToken cancellationToken = default)
    {
        var university = await _context.Universities.FindAsync(new object[] { id }, cancellationToken) ?? throw new KeyNotFoundException($"University with ID {id} not found.");
        _context.Universities.Remove(university);
        await _context.SaveChangesAsync(cancellationToken);
    }

    // College operations
    public async Task<IEnumerable<CollegeDto>> GetAllCollegesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Colleges
            .AsNoTracking()
            .Include(c => c.University)
            .Include(c => c.State)
            .Include(c => c.District)
            .Select(c => new CollegeDto
            {
                Id = c.Id,
                AisheCode = c.AisheCode,
                Name = c.Name,
                Website = c.Website,
                YearOfEstablishment = c.YearOfEstablishment,
                UniversityId = c.UniversityId,
                UniversityName = c.University.Name,
                StateId = c.StateId,
                StateName = c.State.Name,
                DistrictId = c.DistrictId,
                DistrictName = c.District.Name,
                CoursesOffered = GetCoursesOffered(c.CoursesOfferedFlags, InferCoursesOffered(c.Name, c.University.Name))
            })
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<CollegeDto?> GetCollegeByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Colleges
            .AsNoTracking()
            .Include(c => c.University)
            .Include(c => c.State)
            .Include(c => c.District)
            .Where(c => c.Id == id)
            .Select(c => new CollegeDto
            {
                Id = c.Id,
                AisheCode = c.AisheCode,
                Name = c.Name,
                Website = c.Website,
                YearOfEstablishment = c.YearOfEstablishment,
                UniversityId = c.UniversityId,
                UniversityName = c.University.Name,
                StateId = c.StateId,
                StateName = c.State.Name,
                DistrictId = c.DistrictId,
                DistrictName = c.District.Name,
                CoursesOffered = GetCoursesOffered(c.CoursesOfferedFlags, InferCoursesOffered(c.Name, c.University.Name))
            })
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IEnumerable<CollegeDto>> GetCollegesByUniversityAsync(int universityId, CancellationToken cancellationToken = default)
    {
        return await _context.Colleges
            .AsNoTracking()
            .Include(c => c.University)
            .Include(c => c.State)
            .Include(c => c.District)
            .Where(c => c.UniversityId == universityId)
            .Select(c => new CollegeDto
            {
                Id = c.Id,
                AisheCode = c.AisheCode,
                Name = c.Name,
                Website = c.Website,
                YearOfEstablishment = c.YearOfEstablishment,
                UniversityId = c.UniversityId,
                UniversityName = c.University.Name,
                StateId = c.StateId,
                StateName = c.State.Name,
                DistrictId = c.DistrictId,
                DistrictName = c.District.Name,
                CoursesOffered = GetCoursesOffered(c.CoursesOfferedFlags, InferCoursesOffered(c.Name, c.University.Name))
            })
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<CollegeDto> CreateCollegeAsync(CreateCollegeDto dto, CancellationToken cancellationToken = default)
    {
        // Check if AISHE code already exists
        var exists = await _context.Colleges.AnyAsync(c => c.AisheCode == dto.AisheCode, cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException($"College with AISHE code {dto.AisheCode} already exists.");
        }

        var college = new College
        {
            AisheCode = dto.AisheCode,
            Name = dto.Name,
            Website = dto.Website,
            YearOfEstablishment = dto.YearOfEstablishment,
            CoursesOfferedFlags = (int)dto.CoursesOffered,
            UniversityId = dto.UniversityId,
            StateId = dto.StateId,
            DistrictId = dto.DistrictId
        };

        _context.Colleges.Add(college);
        await _context.SaveChangesAsync(cancellationToken);

        return (await GetCollegeByIdAsync(college.Id, cancellationToken))!;
    }

    public async Task<CollegeDto> UpdateCollegeAsync(int id, UpdateCollegeDto dto, CancellationToken cancellationToken = default)
    {
        var college = await _context.Colleges.FindAsync(new object[] { id }, cancellationToken) ?? throw new KeyNotFoundException($"College with ID {id} not found.");

        // Check if new AISHE code conflicts with existing college
        if (college.AisheCode != dto.AisheCode)
        {
            var exists = await _context.Colleges.AnyAsync(c => c.AisheCode == dto.AisheCode && c.Id != id, cancellationToken);
            if (exists)
            {
                throw new InvalidOperationException($"College with AISHE code {dto.AisheCode} already exists.");
            }
        }

        college.AisheCode = dto.AisheCode;
        college.Name = dto.Name;
        college.Website = dto.Website;
        college.YearOfEstablishment = dto.YearOfEstablishment;
        college.CoursesOfferedFlags = (int)dto.CoursesOffered;
        college.UniversityId = dto.UniversityId;
        college.StateId = dto.StateId;
        college.DistrictId = dto.DistrictId;

        await _context.SaveChangesAsync(cancellationToken);

        return (await GetCollegeByIdAsync(id, cancellationToken))!;
    }

    public async Task DeleteCollegeAsync(int id, CancellationToken cancellationToken = default)
    {
        var college = await _context.Colleges.FindAsync(new object[] { id }, cancellationToken) ?? throw new KeyNotFoundException($"College with ID {id} not found.");
        _context.Colleges.Remove(college);
        await _context.SaveChangesAsync(cancellationToken);
    }

    // College type operations
    public async Task<IEnumerable<CollegeTypeDto>> GetAllCollegeTypesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.CollegeTypes
            .AsNoTracking()
            .Select(ct => new CollegeTypeDto
            {
                Id = ct.Id,
                Name = ct.Name
            })
            .OrderBy(ct => ct.Name)
            .ToListAsync(cancellationToken);
    }

    // District operations
    public async Task<IEnumerable<DistrictDto>> GetDistrictsByStateAsync(long stateId, CancellationToken cancellationToken = default)
    {
        var districts = await _context.Districts
            .AsNoTracking()
            .Where(d => d.StateId == stateId)
            .Select(d => new DistrictDto
            {
                Id = d.Id,
                Name = d.Name,
                StateId = d.StateId
            })
            .OrderBy(d => d.Name)
            .ToListAsync(cancellationToken);

        if (districts.Count > 0)
        {
            return districts;
        }

        // Fallback for legacy district seed data where District.StateId uses a different id-space.
        var state = await _context.States
            .AsNoTracking()
            .Where(s => s.Id == stateId)
            .Select(s => new { s.Iso2, s.Name })
            .FirstOrDefaultAsync(cancellationToken);

        if (state == null)
        {
            return [];
        }

        var stateCode = ResolveStateCodePrefix(state.Iso2, state.Name);
        if (string.IsNullOrWhiteSpace(stateCode))
        {
            return [];
        }

        return await _context.Districts
            .AsNoTracking()
            .Where(d => d.Code.StartsWith(stateCode + "-"))
            .Select(d => new DistrictDto
            {
                Id = d.Id,
                Name = d.Name,
                StateId = d.StateId
            })
            .OrderBy(d => d.Name)
            .ToListAsync(cancellationToken);
    }

    private static string ResolveStateCodePrefix(string? iso2, string? stateName)
    {
        if (!string.IsNullOrWhiteSpace(iso2))
        {
            var normalizedIso = iso2.Trim().ToUpperInvariant();
            if (normalizedIso.Contains('-'))
            {
                var split = normalizedIso.Split('-', StringSplitOptions.RemoveEmptyEntries);
                var suffix = split.LastOrDefault();
                if (!string.IsNullOrWhiteSpace(suffix))
                {
                    return suffix;
                }
            }

            if (normalizedIso.Length >= 2)
            {
                return normalizedIso;
            }
        }

        if (string.IsNullOrWhiteSpace(stateName))
        {
            return string.Empty;
        }

        var tokens = stateName
            .Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Where(token => token.Length > 0)
            .ToList();

        if (tokens.Count == 0)
        {
            return string.Empty;
        }

        if (tokens.Count == 1)
        {
            return tokens[0].Length >= 2
                ? tokens[0][..2].ToUpperInvariant()
                : tokens[0].ToUpperInvariant();
        }

        return string.Concat(tokens.Select(token => char.ToUpperInvariant(token[0])));
    }

    private async Task<List<AcademicsEntryDto>> GetInstitutionEntriesAsync(AcademicsPagedRequest request, CancellationToken cancellationToken)
    {
        var query = _context.Universities
            .AsNoTracking()
            .Include(u => u.State)
            .Include(u => u.District)
            .AsQueryable();

        if (request.StateId.HasValue)
        {
            query = query.Where(u => u.StateId == request.StateId.Value);
        }

        if (request.DistrictId.HasValue)
        {
            query = query.Where(u => u.DistrictId == request.DistrictId.Value);
        }

        if (request.UniversityId.HasValue)
        {
            query = query.Where(u => u.Id == request.UniversityId.Value);
        }

        var rows = await query
            .Select(u => new
            {
                u.Id,
                u.Name,
                u.UniversityCode,
                u.WebsiteUrl,
                u.Rating,
                u.UniversityType,
                u.TypeId,
                u.CoursesOfferedFlags,
                u.StateId,
                StateName = u.State.Name,
                u.DistrictId,
                DistrictName = u.District != null ? u.District.Name : null
            })
            .ToListAsync(cancellationToken);

        return rows.Select(u => new AcademicsEntryDto
            {
                EntityType = AcademicsEntityType.Institution,
                EntityId = u.Id,
                Name = u.Name,
                Code = u.UniversityCode,
                WebsiteUrl = u.WebsiteUrl,
                Rating = u.Rating,
                InstitutionTypeCategory = u.UniversityType,
                StateId = u.StateId,
                StateName = u.StateName,
                DistrictId = u.DistrictId,
                DistrictName = u.DistrictName,
                CoursesOffered = GetCoursesOffered(u.CoursesOfferedFlags, InferCoursesOffered(u.UniversityType, u.TypeId, u.Name))
            })
            .ToList();
    }

    private async Task<List<AcademicsEntryDto>> GetCollegeEntriesAsync(AcademicsPagedRequest request, CancellationToken cancellationToken)
    {
        var query = _context.Colleges
            .AsNoTracking()
            .Include(c => c.State)
            .Include(c => c.District)
            .Include(c => c.University)
            .AsQueryable();

        if (request.StateId.HasValue)
        {
            query = query.Where(c => c.StateId == request.StateId.Value);
        }

        if (request.DistrictId.HasValue)
        {
            query = query.Where(c => c.DistrictId == request.DistrictId.Value);
        }

        if (request.UniversityId.HasValue)
        {
            query = query.Where(c => c.UniversityId == request.UniversityId.Value);
        }

        var rows = await query
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.AisheCode,
                c.Website,
                c.CoursesOfferedFlags,
                c.StateId,
                StateName = c.State.Name,
                c.DistrictId,
                DistrictName = c.District.Name,
                c.UniversityId,
                UniversityName = c.University.Name,
                UniversityRating = c.University.Rating
            })
            .ToListAsync(cancellationToken);

        return rows.Select(c => new AcademicsEntryDto
            {
                EntityType = AcademicsEntityType.College,
                EntityId = c.Id,
                Name = c.Name,
                Code = c.AisheCode,
                WebsiteUrl = c.Website,
                Rating = c.UniversityRating,
                StateId = c.StateId,
                StateName = c.StateName,
                DistrictId = c.DistrictId,
                DistrictName = c.DistrictName,
                UniversityId = c.UniversityId,
                UniversityName = c.UniversityName,
                CoursesOffered = GetCoursesOffered(c.CoursesOfferedFlags, InferCoursesOffered(c.Name, c.UniversityName))
            })
            .ToList();
    }

    private static List<AcademicsEntryDto> ApplySorting(List<AcademicsEntryDto> entries, string? sortBy, string? sortDirection)
    {
        var descending = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);
        var key = sortBy?.Trim().ToLowerInvariant();

        return key switch
        {
            "state" => descending
                ? entries.OrderByDescending(e => e.StateName).ThenBy(e => e.Name).ToList()
                : entries.OrderBy(e => e.StateName).ThenBy(e => e.Name).ToList(),
            "district" => descending
                ? entries.OrderByDescending(e => e.DistrictName).ThenBy(e => e.Name).ToList()
                : entries.OrderBy(e => e.DistrictName).ThenBy(e => e.Name).ToList(),
            "code" => descending
                ? entries.OrderByDescending(e => e.Code).ThenBy(e => e.Name).ToList()
                : entries.OrderBy(e => e.Code).ThenBy(e => e.Name).ToList(),
            _ => descending
                ? entries.OrderByDescending(e => e.Name).ToList()
                : entries.OrderBy(e => e.Name).ToList()
        };
    }

    private static bool HasAnyFlag(CoursesOffered value, CoursesOffered mask)
    {
        return (value & mask) != CoursesOffered.None;
    }

    private static CoursesOffered GetCoursesOffered(int persistedFlags, CoursesOffered fallback)
    {
        if (persistedFlags > 0)
        {
            return (CoursesOffered)persistedFlags;
        }

        return fallback;
    }

    private static CoursesOffered InferCoursesOffered(params string?[] textBlocks)
    {
        var text = string.Join(' ', textBlocks.Where(t => !string.IsNullOrWhiteSpace(t))).ToLowerInvariant();
        var result = CoursesOffered.None;

        if (text.Contains("undergraduate") || Regex.IsMatch(text, @"\bug\b") || text.Contains("bachelor"))
        {
            result |= CoursesOffered.UG;
        }

        if (text.Contains("postgraduate") || Regex.IsMatch(text, @"\bpg\b") || text.Contains("master"))
        {
            result |= CoursesOffered.PG;
        }

        if (Regex.IsMatch(text, @"\bph\.?d\b") || text.Contains("doctor"))
        {
            result |= CoursesOffered.PhD;
        }

        if (text.Contains("diploma"))
        {
            result |= CoursesOffered.Diploma;
        }

        if (text.Contains("certificate") || text.Contains("certification"))
        {
            result |= CoursesOffered.Certificate;
        }

        if (text.Contains("fellowship") || text.Contains("fellow"))
        {
            result |= CoursesOffered.Fellowship;
        }

        // Keep entities visible in academics tabs even when source fields are sparse.
        if (result == CoursesOffered.None)
        {
            result = CoursesOffered.UG | CoursesOffered.PG;
        }

        return result;
    }

    private static int ClampRating(int rating)
    {
        return Math.Clamp(rating, 0, 5);
    }
}
