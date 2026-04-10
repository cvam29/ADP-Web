using DieticianAssociation.API.Constants;

namespace DieticianAssociation.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MembershipController(IMembershipService membershipService) : ControllerBase
    {
        private readonly IMembershipService _membershipService = membershipService;

        // GET: api/membership/plans
        [HttpGet("plans")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<MembershipPlanDto>))]
        public async Task<ActionResult<IEnumerable<MembershipPlanDto>>> GetAllPlans(CancellationToken cancellationToken)
        {
            var plans = await _membershipService.GetAllPlansAsync(cancellationToken);
            return Ok(plans);
        }

        // GET: api/membership/plans/{planId}
        [HttpGet("plans/{planId}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(MembershipPlanDto))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(MessageResponseDto))]
        public async Task<ActionResult<MembershipPlanDto>> GetPlan(string planId, CancellationToken cancellationToken)
        {
            var plan = await _membershipService.GetPlanByIdAsync(planId, cancellationToken);
            if (plan == null)
            {
                return NotFound(new MessageResponseDto { Message = "Membership plan not found" });
            }

            return Ok(plan);
        }

        // POST: api/membership/plans
        [HttpPost("plans")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        [HasPermission(PermissionKeys.MembershipPlansCreate)]
        [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(MembershipPlanDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(MessageResponseDto))]
        public async Task<ActionResult<MembershipPlanDto>> CreatePlan([FromBody] CreateMembershipPlanDto createPlan, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new MessageResponseDto { Message = "Invalid request data" });
            }

            var plan = await _membershipService.CreatePlanAsync(createPlan, cancellationToken);
            return CreatedAtAction(nameof(GetPlan), new { planId = plan!.Id }, plan);
        }

        // PUT: api/membership/plans/{planId}
        [HttpPut("plans/{planId}")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        [HasPermission(PermissionKeys.MembershipPlansUpdate)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(MembershipPlanDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(MessageResponseDto))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(MessageResponseDto))]
        public async Task<ActionResult<MembershipPlanDto>> UpdatePlan(string planId, [FromBody] CreateMembershipPlanDto updatePlan, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new MessageResponseDto { Message = "Invalid request data" });
            }

            var plan = await _membershipService.UpdatePlanAsync(planId, updatePlan, cancellationToken);
            if (plan == null)
            {
                return NotFound(new MessageResponseDto { Message = "Membership plan not found" });
            }

            return Ok(plan);
        }

        // DELETE: api/membership/plans/{planId}
        [HttpDelete("plans/{planId}")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        [HasPermission(PermissionKeys.MembershipPlansDelete)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(MessageResponseDto))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(MessageResponseDto))]
        public async Task<ActionResult<MessageResponseDto>> DeletePlan(string planId, CancellationToken cancellationToken)
        {
            var success = await _membershipService.DeletePlanAsync(planId, cancellationToken);
            if (!success)
            {
                return NotFound(new MessageResponseDto { Message = "Membership plan not found" });
            }

            return Ok(new MessageResponseDto { Message = "Membership plan deleted successfully" });
        }

        [HttpPost("register")]
        [AllowAnonymous]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(MembershipRegistrationResultDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ErrorResponseDto))]
        [ProducesResponseType(StatusCodes.Status409Conflict, Type = typeof(ErrorResponseDto))]
        public async Task<ActionResult<MembershipRegistrationResultDto>> Register([FromForm] MembershipRegistrationRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ErrorResponseDto
                {
                    Code = "VALIDATION_ERROR",
                    Message = "Invalid registration data",
                    Details = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
                });
            }

            var result = await _membershipService.RegisterMemberAsync(request, cancellationToken);
            return Ok(result);
        }


        // User Membership Management Endpoints

        /// <summary>
        /// Get all user memberships with pagination, search, and dynamic filters
        /// </summary>
        [HttpPost("users")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        [HasPermission(PermissionKeys.MembershipsRead)]
        [ProducesResponseType(typeof(PagedResult<UserMembershipDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<PagedResult<UserMembershipDto>>> GetUserMemberships([FromBody] PagedRequest request, CancellationToken cancellationToken)
        {
            var result = await _membershipService.GetAllUserMembershipsAsync(request, cancellationToken);
            return Ok(result);
        }

        /// <summary>
        /// Get a specific user membership by ID
        /// </summary>
        [HttpGet("users/{id}")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        [HasPermission(PermissionKeys.MembershipsRead)]
        [ProducesResponseType(typeof(UserMembershipDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<UserMembershipDto>> GetUserMembership(string id, CancellationToken cancellationToken)
        {
            var membership = await _membershipService.GetUserMembershipByIdAsync(id, cancellationToken);
            if (membership == null)
                return NotFound(new ErrorResponseDto { Code = "NOT_FOUND", Message = "User membership not found" });

            return Ok(membership);
        }

        /// <summary>
        /// Update user membership status
        /// </summary>
        [HttpPut("users/{id}/status")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        [HasPermission(PermissionKeys.MembershipsUpdate)]
        [ProducesResponseType(typeof(UserMembershipDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<UserMembershipDto>> UpdateUserMembershipStatus(
            string id,
            [FromBody] UpdateUserMembershipStatusDto updateDto,
            CancellationToken cancellationToken)
        {
            var membership = await _membershipService.UpdateUserMembershipStatusAsync(id, updateDto, cancellationToken);
            if (membership == null)
                return NotFound(new ErrorResponseDto { Code = "NOT_FOUND", Message = "User membership not found" });

            return Ok(membership);
        }

        /// <summary>
        /// Delete (soft delete) a user membership
        /// </summary>
        [HttpDelete("users/{id}")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        [HasPermission(PermissionKeys.MembershipsDelete)]
        [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<MessageResponseDto>> DeleteUserMembership(string id, CancellationToken cancellationToken)
        {
            var success = await _membershipService.DeleteUserMembershipAsync(id, cancellationToken);
            if (!success)
                return NotFound(new ErrorResponseDto { Code = "NOT_FOUND", Message = "User membership not found" });

            return Ok(new MessageResponseDto { Message = "User membership deleted successfully" });
        }

        /// <summary>
        /// Update user membership plan/tier
        /// </summary>
        [HttpPut("users/{id}/plan")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        [HasPermission(PermissionKeys.MembershipsUpdate)]
        [ProducesResponseType(typeof(UserMembershipDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<UserMembershipDto>> UpdateUserMembershipPlan(
            string id,
            [FromBody] UpdateUserMembershipPlanDto updateDto,
            CancellationToken cancellationToken)
        {
            var membership = await _membershipService.UpdateUserMembershipPlanAsync(id, updateDto, cancellationToken);
            if (membership == null)
                return NotFound(new ErrorResponseDto { Code = "NOT_FOUND", Message = "User membership or plan not found" });

            return Ok(membership);
        }

        /// <summary>
        /// Permanently delete a user membership and related payment records
        /// </summary>
        [HttpDelete("users/{id}/permanent")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        [HasPermission(PermissionKeys.MembershipsDelete)]
        [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<MessageResponseDto>> PermanentDeleteUserMembership(string id, CancellationToken cancellationToken)
        {
            var success = await _membershipService.PermanentDeleteUserMembershipAsync(id, cancellationToken);
            if (!success)
                return NotFound(new ErrorResponseDto { Code = "NOT_FOUND", Message = "User membership not found" });

            return Ok(new MessageResponseDto { Message = "User membership permanently deleted" });
        }

        [HttpGet("plans/{planId}/permissions")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        [HasPermission(PermissionKeys.MembershipPlansPermissionsManage)]
        [ProducesResponseType(typeof(MembershipPlanPermissionsDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<MembershipPlanPermissionsDto>> GetPlanPermissions(string planId, [FromServices] IPermissionService permissionService, CancellationToken cancellationToken)
        {
            var permissions = await permissionService.GetMembershipPlanPermissionsAsync(planId, cancellationToken);
            if (permissions == null)
            {
                return NotFound(new ErrorResponseDto { Message = "Membership plan not found" });
            }

            return Ok(permissions);
        }

        [HttpPut("plans/{planId}/permissions")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        [HasPermission(PermissionKeys.MembershipPlansPermissionsManage)]
        [ProducesResponseType(typeof(MembershipPlanPermissionsDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<MembershipPlanPermissionsDto>> UpdatePlanPermissions(string planId, [FromBody] UpdateMembershipPlanPermissionsDto request, [FromServices] IPermissionService permissionService, CancellationToken cancellationToken)
        {
            var permissions = await permissionService.UpdateMembershipPlanPermissionsAsync(planId, request, cancellationToken);
            if (permissions == null)
            {
                return NotFound(new ErrorResponseDto { Message = "Membership plan not found" });
            }

            return Ok(permissions);
        }

    }
}
