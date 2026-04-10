namespace DieticianAssociation.API.DTOs
{
    public class PermissionDto
    {
        public string Key { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
    }

    public class UserPermissionsDto
    {
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string UserRole { get; set; } = string.Empty;
        public List<string> AllowedPermissions { get; set; } = [];
        public List<string> DeniedPermissions { get; set; } = [];
        public List<string> EffectivePermissions { get; set; } = [];
    }

    public class UpdateUserPermissionsDto
    {
        public List<string> AllowedPermissions { get; set; } = [];
        public List<string> DeniedPermissions { get; set; } = [];
    }

    public class MembershipPlanPermissionsDto
    {
        public string MembershipPlanId { get; set; } = string.Empty;
        public string MembershipPlanName { get; set; } = string.Empty;
        public List<string> PermissionKeys { get; set; } = [];
    }

    public class UpdateMembershipPlanPermissionsDto
    {
        public List<string> PermissionKeys { get; set; } = [];
    }
}