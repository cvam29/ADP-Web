namespace DieticianAssociation.API.Interfaces
{
    public interface IMembershipService
    {
        Task<List<MembershipPlanDto>> GetAllPlansAsync(CancellationToken cancellationToken = default);
        Task<MembershipPlanDto?> GetPlanByIdAsync(string planId, CancellationToken cancellationToken = default);
        Task<MembershipPlanDto?> CreatePlanAsync(CreateMembershipPlanDto createPlan, CancellationToken cancellationToken = default);
        Task<MembershipPlanDto?> UpdatePlanAsync(string planId, CreateMembershipPlanDto updatePlan, CancellationToken cancellationToken = default);
        Task<bool> DeletePlanAsync(string planId, CancellationToken cancellationToken = default);

        Task<MembershipRegistrationResultDto> RegisterMemberAsync(MembershipRegistrationRequest request, CancellationToken cancellationToken = default);

        // User Membership Management
        Task<PagedResult<UserMembershipDto>> GetAllUserMembershipsAsync(PagedRequest request, CancellationToken cancellationToken = default);
        Task<UserMembershipDto?> GetUserMembershipByIdAsync(string id, CancellationToken cancellationToken = default);
        Task<UserMembershipDto?> UpdateUserMembershipStatusAsync(string id, UpdateUserMembershipStatusDto updateDto, CancellationToken cancellationToken = default);
        Task<UserMembershipDto?> UpdateUserMembershipPlanAsync(string id, UpdateUserMembershipPlanDto updateDto, CancellationToken cancellationToken = default);
        Task<bool> DeleteUserMembershipAsync(string id, CancellationToken cancellationToken = default);
        Task<bool> PermanentDeleteUserMembershipAsync(string id, CancellationToken cancellationToken = default);
    }
}
