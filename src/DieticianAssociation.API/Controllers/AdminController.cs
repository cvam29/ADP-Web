using DieticianAssociation.API.Constants;

namespace DieticianAssociation.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public class AdminController(ApplicationDbContext context, IUserService userService, IPermissionService permissionService) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;
        private readonly IUserService _userService = userService;
        private readonly IPermissionService _permissionService = permissionService;

        /// <summary>
        /// 
        /// Update a users membership.
        /// </summary>
        [HttpPut("users/{userId}/membership")]
        [HasPermission(PermissionKeys.MembershipsAssign)]
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<UserDto>> UpdateUserMembership(string userId, [FromBody] UpdateMembershipDto request, CancellationToken cancellationToken)
        {
            var user = await _userService.UpdateUserMembershipAsync(userId, request, cancellationToken);
            return Ok(user);
        }

        /// <summary>
        /// Update a users role.
        /// </summary>
        [HttpPut("users/{userId}/role")]
        [HasPermission(PermissionKeys.UsersRolesManage)]
        [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateUserRole(string userId, [FromBody] UpdateRoleDto request, CancellationToken cancellationToken)
        {
            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == currentUserId)
            {
                return BadRequest(new ErrorResponseDto { Message = "You cannot change your own role" });
            }

            var user = await _context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
            if (user == null)
            {
                return NotFound(new ErrorResponseDto { Message = "User not found" });
            }

            user.Role = request.Role;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            return Ok(new MessageResponseDto { Message = "User role updated successfully" });
        }

        /// <summary>
        /// Delete a user by ID.
        /// </summary>
        [HttpDelete("users/{userId}")]
        [HasPermission(PermissionKeys.UsersDelete)]
        [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteUser(string userId, CancellationToken cancellationToken)
        {
            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == currentUserId)
            {
                return BadRequest(new ErrorResponseDto { Message = "You cannot delete your own account" });
            }

            var user = await _context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
            if (user == null)
            {
                return NotFound(new ErrorResponseDto { Message = "User not found" });
            }

            user.IsDeleted = true;
            user.IsActive = false;
            user.DeletedAt = DateTime.UtcNow;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            // In production, consider soft delete instead of hard delete
            //_context.Users.Remove(user);
            await _context.SaveChangesAsync(cancellationToken);

            return Ok(new MessageResponseDto { Message = "User deleted successfully" });
        }

        /// <summary>
        /// Restore a soft-deleted user by ID.
        /// </summary>
        [HttpPut("users/{userId}/restore")]
        [HasPermission(PermissionKeys.UsersDelete)]
        [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RestoreUser(string userId, CancellationToken cancellationToken)
        {
            var user = await _context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
            if (user == null)
            {
                return NotFound(new ErrorResponseDto { Message = "User not found" });
            }

            if (!user.IsDeleted)
            {
                return BadRequest(new ErrorResponseDto { Message = "User is not deleted" });
            }

            user.IsDeleted = false;
            user.IsActive = true;
            user.DeletedAt = null;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            return Ok(new MessageResponseDto { Message = "User restored successfully" });
        }

        [HttpPut("users/{userId}/status")]
        [HasPermission(PermissionKeys.UsersStatusManage)]
        [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateUserStatus(string userId, [FromBody] UpdateStatusDto request, CancellationToken cancellationToken)
        {
            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == currentUserId)
            {
                return BadRequest(new ErrorResponseDto { Message = "You cannot change your own status" });
            }

            var user = await _context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
            if (user == null)
            {
                return NotFound(new ErrorResponseDto { Message = "User not found" });
            }

            user.IsActive = request.IsActive;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            return Ok(new MessageResponseDto { Message = $"User status updated to {(user.IsActive ? "Active" : "Inactive")}" });
        }

        /// <summary>
        /// Permanently delete a user and all associated data. This action cannot be undone.
        /// </summary>
        [HttpDelete("users/{userId}/permanent")]
        [HasPermission(PermissionKeys.UsersDelete)]
        [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> PermanentDeleteUser(string userId, CancellationToken cancellationToken)
        {
            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == currentUserId)
            {
                return BadRequest(new ErrorResponseDto { Message = "You cannot permanently delete your own account" });
            }

            var user = await _context.Users
                .IgnoreQueryFilters()
                .Include(u => u.Memberships)
                .Include(u => u.Addresses)
                .Include(u => u.EducationQualifications)
                .Include(u => u.PaymentRecords)
                .Include(u => u.UserConsents)
                .Include(u => u.PermissionAssignments)
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

            if (user == null)
            {
                return NotFound(new ErrorResponseDto { Message = "User not found" });
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync(cancellationToken);

            return Ok(new MessageResponseDto { Message = "User permanently deleted" });
        }

        [HttpGet("permissions")]
        [HasPermission(PermissionKeys.UsersPermissionsManage)]
        [ProducesResponseType(typeof(List<PermissionDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<PermissionDto>>> GetPermissions(CancellationToken cancellationToken)
        {
            var permissions = await _permissionService.GetPermissionCatalogAsync(cancellationToken);
            return Ok(permissions);
        }

        [HttpGet("users/{userId}/permissions")]
        [HasPermission(PermissionKeys.UsersPermissionsManage)]
        [ProducesResponseType(typeof(UserPermissionsDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<UserPermissionsDto>> GetUserPermissions(string userId, CancellationToken cancellationToken)
        {
            var permissions = await _permissionService.GetUserPermissionsAsync(userId, cancellationToken);
            if (permissions == null)
            {
                return NotFound(new ErrorResponseDto { Message = "User not found" });
            }

            return Ok(permissions);
        }

        [HttpPut("users/{userId}/permissions")]
        [HasPermission(PermissionKeys.UsersPermissionsManage)]
        [ProducesResponseType(typeof(UserPermissionsDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<UserPermissionsDto>> UpdateUserPermissions(string userId, [FromBody] UpdateUserPermissionsDto request, CancellationToken cancellationToken)
        {
            try
            {
                var permissions = await _permissionService.UpdateUserPermissionsAsync(userId, request, cancellationToken);
                if (permissions == null)
                {
                    return NotFound(new ErrorResponseDto { Message = "User not found" });
                }

                return Ok(permissions);
            }
            catch (InvalidOperationException exception)
            {
                return BadRequest(new ErrorResponseDto { Message = exception.Message });
            }
        }

    }
}
