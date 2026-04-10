namespace DieticianAssociation.API.DTOs;

[Flags]
public enum CoursesOffered
{
    None = 0,
    UG = 1,
    PG = 2,
    PhD = 4,
    Diploma = 8,
    Certificate = 16,
    Fellowship = 32
}

public enum AcademicsEntityType
{
    Institution = 1,
    College = 2
}

public class AcademicsPagedRequest : PagedRequest
{
    public CoursesOffered? SelectedTab { get; set; }
    public long? StateId { get; set; }
    public int? DistrictId { get; set; }
    public int? UniversityId { get; set; }
    public bool IncludeInstitutions { get; set; } = true;
    public bool IncludeColleges { get; set; } = true;
}

public class AcademicsTabSummaryDto
{
    public CoursesOffered Tab { get; set; }
    public int InstitutionCount { get; set; }
    public int CollegeCount { get; set; }
    public int TotalCount { get; set; }
}

public class AcademicsEntryDto
{
    public AcademicsEntityType EntityType { get; set; }
    public int EntityId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? InstitutionTypeCategory { get; set; }
    public int? Rating { get; set; }
    public long StateId { get; set; }
    public string? StateName { get; set; }
    public int? DistrictId { get; set; }
    public string? DistrictName { get; set; }
    public int? UniversityId { get; set; }
    public string? UniversityName { get; set; }
    public CoursesOffered CoursesOffered { get; set; }
}

public class AcademicsPagedResponseDto
{
    public CoursesOffered SelectedTab { get; set; }
    public List<CoursesOffered> AvailableTabs { get; set; } = [];
    public List<AcademicsTabSummaryDto> TabSummaries { get; set; } = [];
    public PagedResult<AcademicsEntryDto> Results { get; set; } = new();
}

// University DTOs
public class UniversityDto
{
    public int Id { get; set; }
    public string UniversityCode { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? WebsiteUrl { get; set; }
    public int SurveyYear { get; set; }
    public string TypeId { get; set; } = null!;
    public string UniversityType { get; set; } = null!;
    public int Rating { get; set; }
    public long StateId { get; set; }
    public string? StateName { get; set; }
    public int? DistrictId { get; set; }
    public string? DistrictName { get; set; }
    public int CollegeCount { get; set; }
    public CoursesOffered CoursesOffered { get; set; }
}

public class CreateUniversityDto
{
    public string UniversityCode { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? WebsiteUrl { get; set; }
    public int SurveyYear { get; set; }
    public string TypeId { get; set; } = null!;
    public string UniversityType { get; set; } = null!;
    public int Rating { get; set; }
    public long StateId { get; set; }
    public int? DistrictId { get; set; }
    public CoursesOffered CoursesOffered { get; set; }
}

public class UpdateUniversityDto
{
    public string UniversityCode { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? WebsiteUrl { get; set; }
    public int SurveyYear { get; set; }
    public string TypeId { get; set; } = null!;
    public string UniversityType { get; set; } = null!;
    public int Rating { get; set; }
    public long StateId { get; set; }
    public int? DistrictId { get; set; }
    public CoursesOffered CoursesOffered { get; set; }
}

// College Type DTOs
public class CollegeTypeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
}

// College DTOs
public class CollegeDto
{
    public int Id { get; set; }
    public string AisheCode { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Website { get; set; }
    public int? YearOfEstablishment { get; set; }

    public int UniversityId { get; set; }
    public string? UniversityName { get; set; }

    public long StateId { get; set; }
    public string? StateName { get; set; }

    public int DistrictId { get; set; }
    public string? DistrictName { get; set; }

    public CoursesOffered CoursesOffered { get; set; }
}

public class CreateCollegeDto
{
    public string AisheCode { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Website { get; set; }
    public int? YearOfEstablishment { get; set; }
    public int UniversityId { get; set; }
    public long StateId { get; set; }
    public int DistrictId { get; set; }
    public CoursesOffered CoursesOffered { get; set; }
}

public class UpdateCollegeDto
{
    public string AisheCode { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Website { get; set; }
    public int? YearOfEstablishment { get; set; }
    public int UniversityId { get; set; }
    public long StateId { get; set; }
    public int DistrictId { get; set; }
    public CoursesOffered CoursesOffered { get; set; }
}

// District DTO (for dropdowns)
public class DistrictDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public long StateId { get; set; }
}
