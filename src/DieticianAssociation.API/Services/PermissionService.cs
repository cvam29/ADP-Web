using DieticianAssociation.API.Constants;

namespace DieticianAssociation.API.Services
{
    public class PermissionService(ApplicationDbContext context) : IPermissionService
    {
        private readonly ApplicationDbContext _context = context;

        public async Task<List<PermissionDto>> GetPermissionCatalogAsync(CancellationToken cancellationToken = default)
        {
            var permissions = await _context.Permissions
                .AsNoTracking()
                .OrderBy(permission => permission.Category)
                .ThenBy(permission => permission.Name)
                .Select(permission => new PermissionDto
                {
                    Key = permission.Key,
                    Name = permission.Name,
                    Description = permission.Description,
                    Category = permission.Category
                })
                .ToListAsync(cancellationToken);

            return permissions;
        }

        public async Task<List<string>> GetEffectivePermissionsAsync(string userId, CancellationToken cancellationToken = default)
        {
            var user = await _context.Users
                .AsNoTracking()
                .Where(candidate => candidate.Id == userId)
                .Select(candidate => new
                {
                    candidate.Id,
                    candidate.Role
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (user == null)
            {
                return [];
            }

            if (user.Role == UserRole.SuperAdmin)
            {
                return [.. PermissionKeys.AllKeys.OrderBy(permission => permission)];
            }

            var effectivePermissions = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            var activeMembershipPlanId = await _context.UserMemberships
                .AsNoTracking()
                .Where(membership => membership.UserId == userId && membership.Status == MembershipStatus.Active)
                .OrderByDescending(membership => membership.CreatedAt)
                .Select(membership => membership.MembershipPlanId)
                .FirstOrDefaultAsync(cancellationToken);

            if (!string.IsNullOrWhiteSpace(activeMembershipPlanId))
            {
                var planPermissionKeys = await _context.MembershipPlanPermissions
                    .AsNoTracking()
                    .Where(assignment => assignment.MembershipPlanId == activeMembershipPlanId)
                    .Select(assignment => assignment.Permission.Key)
                    .ToListAsync(cancellationToken);

                effectivePermissions.UnionWith(planPermissionKeys);
            }

            var directAssignments = await _context.UserPermissionAssignments
                .AsNoTracking()
                .Where(assignment => assignment.UserId == userId)
                .Select(assignment => new
                {
                    assignment.Effect,
                    PermissionKey = assignment.Permission.Key
                })
                .ToListAsync(cancellationToken);

            foreach (var permissionKey in directAssignments
                .Where(assignment => assignment.Effect == PermissionAssignmentEffect.Allow)
                .Select(assignment => assignment.PermissionKey))
            {
                effectivePermissions.Add(permissionKey);
            }

            foreach (var permissionKey in directAssignments
                .Where(assignment => assignment.Effect == PermissionAssignmentEffect.Deny)
                .Select(assignment => assignment.PermissionKey))
            {
                effectivePermissions.Remove(permissionKey);
            }

            return [.. effectivePermissions.OrderBy(permission => permission)];
        }

        public async Task<UserPermissionsDto?> GetUserPermissionsAsync(string userId, CancellationToken cancellationToken = default)
        {
            var user = await _context.Users
                .AsNoTracking()
                .Where(candidate => candidate.Id == userId)
                .Select(candidate => new
                {
                    candidate.Id,
                    candidate.Name,
                    candidate.Role
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (user == null)
            {
                return null;
            }

            var assignments = await _context.UserPermissionAssignments
                .AsNoTracking()
                .Where(assignment => assignment.UserId == userId)
                .OrderBy(assignment => assignment.Permission.Key)
                .Select(assignment => new
                {
                    assignment.Effect,
                    PermissionKey = assignment.Permission.Key
                })
                .ToListAsync(cancellationToken);

            return new UserPermissionsDto
            {
                UserId = user.Id,
                UserName = user.Name,
                UserRole = user.Role.ToString(),
                AllowedPermissions = [.. assignments.Where(assignment => assignment.Effect == PermissionAssignmentEffect.Allow).Select(assignment => assignment.PermissionKey)],
                DeniedPermissions = [.. assignments.Where(assignment => assignment.Effect == PermissionAssignmentEffect.Deny).Select(assignment => assignment.PermissionKey)],
                EffectivePermissions = await GetEffectivePermissionsAsync(userId, cancellationToken)
            };
        }

        public async Task<UserPermissionsDto?> UpdateUserPermissionsAsync(string userId, UpdateUserPermissionsDto request, CancellationToken cancellationToken = default)
        {
            var user = await _context.Users
                .Include(candidate => candidate.PermissionAssignments)
                .FirstOrDefaultAsync(candidate => candidate.Id == userId, cancellationToken);

            if (user == null)
            {
                return null;
            }

            if (user.Role == UserRole.SuperAdmin)
            {
                throw new InvalidOperationException("Super admin permissions are implicit and cannot be modified.");
            }

            var allowedKeys = NormalizePermissionKeys(request.AllowedPermissions);
            var deniedKeys = NormalizePermissionKeys(request.DeniedPermissions);

            deniedKeys.ExceptWith(allowedKeys);

            var desiredKeys = new HashSet<string>(allowedKeys, StringComparer.OrdinalIgnoreCase);
            desiredKeys.UnionWith(deniedKeys);

            var permissionsByKey = await _context.Permissions
                .Where(permission => desiredKeys.Contains(permission.Key))
                .ToDictionaryAsync(permission => permission.Key, StringComparer.OrdinalIgnoreCase, cancellationToken);

            var existingAssignments = await _context.UserPermissionAssignments
                .Where(assignment => assignment.UserId == userId)
                .Include(assignment => assignment.Permission)
                .ToListAsync(cancellationToken);

            foreach (var assignment in existingAssignments.Where(assignment => !desiredKeys.Contains(assignment.Permission.Key)))
            {
                _context.UserPermissionAssignments.Remove(assignment);
            }

            foreach (var permissionKey in desiredKeys)
            {
                if (!permissionsByKey.TryGetValue(permissionKey, out var permission))
                {
                    continue;
                }

                var effect = allowedKeys.Contains(permissionKey)
                    ? PermissionAssignmentEffect.Allow
                    : PermissionAssignmentEffect.Deny;

                var assignment = existingAssignments.FirstOrDefault(existing => string.Equals(existing.Permission.Key, permissionKey, StringComparison.OrdinalIgnoreCase));
                if (assignment == null)
                {
                    _context.UserPermissionAssignments.Add(new UserPermissionAssignment
                    {
                        UserId = userId,
                        PermissionId = permission.Id,
                        Effect = effect,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                    continue;
                }

                assignment.Effect = effect;
                assignment.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync(cancellationToken);
            return await GetUserPermissionsAsync(userId, cancellationToken);
        }

        public async Task<MembershipPlanPermissionsDto?> GetMembershipPlanPermissionsAsync(string planId, CancellationToken cancellationToken = default)
        {
            var plan = await _context.MembershipPlans
                .AsNoTracking()
                .Where(candidate => candidate.Id == planId)
                .Select(candidate => new
                {
                    candidate.Id,
                    candidate.Name
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (plan == null)
            {
                return null;
            }

            var permissionKeys = await _context.MembershipPlanPermissions
                .AsNoTracking()
                .Where(assignment => assignment.MembershipPlanId == planId)
                .OrderBy(assignment => assignment.Permission.Key)
                .Select(assignment => assignment.Permission.Key)
                .ToListAsync(cancellationToken);

            return new MembershipPlanPermissionsDto
            {
                MembershipPlanId = plan.Id,
                MembershipPlanName = plan.Name,
                PermissionKeys = permissionKeys
            };
        }

        public async Task<MembershipPlanPermissionsDto?> UpdateMembershipPlanPermissionsAsync(string planId, UpdateMembershipPlanPermissionsDto request, CancellationToken cancellationToken = default)
        {
            var plan = await _context.MembershipPlans.FirstOrDefaultAsync(candidate => candidate.Id == planId, cancellationToken);
            if (plan == null)
            {
                return null;
            }

            var desiredKeys = NormalizeMembershipPlanPermissionKeys(request.PermissionKeys);
            var permissionsByKey = await _context.Permissions
                .Where(permission => desiredKeys.Contains(permission.Key))
                .ToDictionaryAsync(permission => permission.Key, StringComparer.OrdinalIgnoreCase, cancellationToken);

            var existingAssignments = await _context.MembershipPlanPermissions
                .Where(assignment => assignment.MembershipPlanId == planId)
                .Include(assignment => assignment.Permission)
                .ToListAsync(cancellationToken);

            foreach (var assignment in existingAssignments.Where(assignment => !desiredKeys.Contains(assignment.Permission.Key)))
            {
                _context.MembershipPlanPermissions.Remove(assignment);
            }

            foreach (var permissionKey in desiredKeys)
            {
                if (!permissionsByKey.TryGetValue(permissionKey, out var permission))
                {
                    continue;
                }

                var assignment = existingAssignments.FirstOrDefault(existing => string.Equals(existing.Permission.Key, permissionKey, StringComparison.OrdinalIgnoreCase));
                if (assignment != null)
                {
                    assignment.UpdatedAt = DateTime.UtcNow;
                    continue;
                }

                _context.MembershipPlanPermissions.Add(new MembershipPlanPermission
                {
                    MembershipPlanId = planId,
                    PermissionId = permission.Id,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
            }

            plan.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
            return await GetMembershipPlanPermissionsAsync(planId, cancellationToken);
        }

        public async Task<bool> UserHasPermissionAsync(string userId, string permissionKey, CancellationToken cancellationToken = default)
        {
            var effectivePermissions = await GetEffectivePermissionsAsync(userId, cancellationToken);
            return effectivePermissions.Contains(permissionKey, StringComparer.OrdinalIgnoreCase);
        }

        private static HashSet<string> NormalizePermissionKeys(IEnumerable<string>? permissionKeys)
        {
            var normalized = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            if (permissionKeys == null)
            {
                return normalized;
            }

            foreach (var permissionKey in permissionKeys)
            {
                if (string.IsNullOrWhiteSpace(permissionKey))
                {
                    continue;
                }

                var value = permissionKey.Trim();
                if (PermissionKeys.IsKnown(value))
                {
                    normalized.Add(value);
                }
            }

            return normalized;
        }

        private static HashSet<string> NormalizeMembershipPlanPermissionKeys(IEnumerable<string>? permissionKeys)
        {
            var normalized = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            if (permissionKeys == null)
            {
                return normalized;
            }

            foreach (var permissionKey in permissionKeys)
            {
                if (string.IsNullOrWhiteSpace(permissionKey))
                {
                    continue;
                }

                var value = permissionKey.Trim();
                if (PermissionKeys.IsMembershipPlanAssignable(value))
                {
                    normalized.Add(value);
                }
            }

            return normalized;
        }
    }
}