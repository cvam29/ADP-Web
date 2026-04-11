namespace DieticianAssociation.API.Interfaces;

public interface IEducationService
{
    Task<AcademicsPagedResponseDto> GetAcademicsPaginatedAsync(AcademicsPagedRequest request, CancellationToken cancellationToken = default);
    Task<AcademicsPagedResponseDto> GetAcademicsStreamMetadataAsync(AcademicsPagedRequest request, CancellationToken cancellationToken = default);
    IAsyncEnumerable<AcademicsEntryDto> StreamAcademicsAsync(AcademicsPagedRequest request, CancellationToken cancellationToken = default);

    // University operations
    Task<IEnumerable<UniversityDto>> GetAllUniversitiesAsync(CancellationToken cancellationToken = default);
    Task<UniversityDto?> GetUniversityByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<UniversityDto>> GetUniversitiesByStateAsync(long stateId, CancellationToken cancellationToken = default);
    Task<UniversityDto> CreateUniversityAsync(CreateUniversityDto dto, CancellationToken cancellationToken = default);
    Task<UniversityDto> UpdateUniversityAsync(int id, UpdateUniversityDto dto, CancellationToken cancellationToken = default);
    Task DeleteUniversityAsync(int id, CancellationToken cancellationToken = default);

    // College operations
    Task<IEnumerable<CollegeDto>> GetAllCollegesAsync(CancellationToken cancellationToken = default);
    Task<CollegeDto?> GetCollegeByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<CollegeDto>> GetCollegesByUniversityAsync(int universityId, CancellationToken cancellationToken = default);
    Task<CollegeDto> CreateCollegeAsync(CreateCollegeDto dto, CancellationToken cancellationToken = default);
    Task<CollegeDto> UpdateCollegeAsync(int id, UpdateCollegeDto dto, CancellationToken cancellationToken = default);
    Task DeleteCollegeAsync(int id, CancellationToken cancellationToken = default);

    // College type operations
    Task<IEnumerable<CollegeTypeDto>> GetAllCollegeTypesAsync(CancellationToken cancellationToken = default);

    // District operations (for dropdowns)
    Task<IEnumerable<DistrictDto>> GetDistrictsByStateAsync(long stateId, CancellationToken cancellationToken = default);
}
