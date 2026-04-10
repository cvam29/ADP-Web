using DieticianAssociation.API.Constants;

namespace DieticianAssociation.API.Data.Seeders
{
    public static class PermissionSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context, ILogger logger, CancellationToken cancellationToken = default)
        {
            var existingPermissions = await context.Permissions
                .ToDictionaryAsync(permission => permission.Key, StringComparer.OrdinalIgnoreCase, cancellationToken);

            foreach (var definition in PermissionKeys.All)
            {
                if (existingPermissions.TryGetValue(definition.Key, out var existingPermission))
                {
                    existingPermission.Name = definition.Name;
                    existingPermission.Description = definition.Description;
                    existingPermission.Category = definition.Category;
                    existingPermission.UpdatedAt = DateTime.UtcNow;
                    continue;
                }

                var permission = new Permission
                {
                    Key = definition.Key,
                    Name = definition.Name,
                    Description = definition.Description,
                    Category = definition.Category,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                context.Permissions.Add(permission);
                existingPermissions[definition.Key] = permission;
            }

            await context.SaveChangesAsync(cancellationToken);

            var adminUsers = await context.Users
                .Where(user => user.Role == UserRole.Admin)
                .Select(user => new { user.Id })
                .ToListAsync(cancellationToken);

            var currentAdminAssignments = await context.UserPermissionAssignments
                .Where(assignment => adminUsers.Select(user => user.Id).Contains(assignment.UserId))
                .Include(assignment => assignment.Permission)
                .ToListAsync(cancellationToken);

            foreach (var adminUser in adminUsers)
            {
                var assignedPermissionKeys = currentAdminAssignments
                    .Where(assignment => assignment.UserId == adminUser.Id && assignment.Effect == PermissionAssignmentEffect.Allow)
                    .Select(assignment => assignment.Permission.Key)
                    .ToHashSet(StringComparer.OrdinalIgnoreCase);

                foreach (var permissionKey in PermissionKeys.LegacyAdminPermissionKeys)
                {
                    if (assignedPermissionKeys.Contains(permissionKey) || !existingPermissions.TryGetValue(permissionKey, out var permission))
                    {
                        continue;
                    }

                    context.UserPermissionAssignments.Add(new UserPermissionAssignment
                    {
                        UserId = adminUser.Id,
                        PermissionId = permission.Id,
                        Effect = PermissionAssignmentEffect.Allow,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                }
            }

            var membershipPlans = await context.MembershipPlans
                .Where(plan => plan.IsActive)
                .Select(plan => new { plan.Id })
                .ToListAsync(cancellationToken);

            var currentPlanAssignments = await context.MembershipPlanPermissions
                .Where(assignment => membershipPlans.Select(plan => plan.Id).Contains(assignment.MembershipPlanId))
                .Include(assignment => assignment.Permission)
                .ToListAsync(cancellationToken);

            foreach (var plan in membershipPlans)
            {
                var assignedPermissionKeys = currentPlanAssignments
                    .Where(assignment => assignment.MembershipPlanId == plan.Id)
                    .Select(assignment => assignment.Permission.Key)
                    .ToHashSet(StringComparer.OrdinalIgnoreCase);

                if (assignedPermissionKeys.Count > 0)
                {
                    continue;
                }

                foreach (var permissionKey in PermissionKeys.DefaultMembershipPermissionKeys)
                {
                    if (!existingPermissions.TryGetValue(permissionKey, out var permission))
                    {
                        continue;
                    }

                    context.MembershipPlanPermissions.Add(new MembershipPlanPermission
                    {
                        MembershipPlanId = plan.Id,
                        PermissionId = permission.Id,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                }
            }

            await context.SaveChangesAsync(cancellationToken);
            logger.LogInformation("Permission catalog and default assignments are up to date.");
        }
    }
}