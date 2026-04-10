namespace DieticianAssociation.API.Services
{
    public sealed class PermissionRequirement(string permissionKey) : IAuthorizationRequirement
    {
        public string PermissionKey { get; } = permissionKey;
    }

    public sealed class PermissionPolicyProvider(IOptions<AuthorizationOptions> options) : DefaultAuthorizationPolicyProvider(options)
    {
        public const string PolicyPrefix = "Permission:";

        public override async Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
        {
            if (policyName.StartsWith(PolicyPrefix, StringComparison.OrdinalIgnoreCase))
            {
                var permissionKey = policyName[PolicyPrefix.Length..];

                return new AuthorizationPolicyBuilder()
                    .RequireAuthenticatedUser()
                    .AddRequirements(new PermissionRequirement(permissionKey))
                    .Build();
            }

            return await base.GetPolicyAsync(policyName);
        }
    }

    public sealed class PermissionAuthorizationHandler(IPermissionService permissionService) : AuthorizationHandler<PermissionRequirement>
    {
        private readonly IPermissionService _permissionService = permissionService;

        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
        {
            var userId = context.User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId))
            {
                return;
            }

            var role = context.User.FindFirstValue(System.Security.Claims.ClaimTypes.Role);
            if (string.Equals(role, nameof(UserRole.SuperAdmin), StringComparison.OrdinalIgnoreCase))
            {
                context.Succeed(requirement);
                return;
            }

            if (await _permissionService.UserHasPermissionAsync(userId, requirement.PermissionKey))
            {
                context.Succeed(requirement);
            }
        }
    }

    public sealed class HasPermissionAttribute : AuthorizeAttribute
    {
        public HasPermissionAttribute(string permissionKey)
        {
            PermissionKey = permissionKey;
            Policy = $"{PermissionPolicyProvider.PolicyPrefix}{permissionKey}";
        }

        public string PermissionKey { get; }
    }
}