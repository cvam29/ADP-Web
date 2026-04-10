namespace DieticianAssociation.API.Interfaces
{
    public interface IPermissionService
    {
        Task<List<string>> GetEffectivePermissionsAsync(string userId, CancellationToken cancellationToken = default);
        Task<List<PermissionDto>> GetPermissionCatalogAsync(CancellationToken cancellationToken = default);
        Task<UserPermissionsDto?> GetUserPermissionsAsync(string userId, CancellationToken cancellationToken = default);
        Task<UserPermissionsDto?> UpdateUserPermissionsAsync(string userId, UpdateUserPermissionsDto request, CancellationToken cancellationToken = default);
        Task<MembershipPlanPermissionsDto?> GetMembershipPlanPermissionsAsync(string planId, CancellationToken cancellationToken = default);
        Task<MembershipPlanPermissionsDto?> UpdateMembershipPlanPermissionsAsync(string planId, UpdateMembershipPlanPermissionsDto request, CancellationToken cancellationToken = default);
        Task<bool> UserHasPermissionAsync(string userId, string permissionKey, CancellationToken cancellationToken = default);
    }
}