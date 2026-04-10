using DieticianAssociation.API.Constants;

namespace DieticianAssociation.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController(IUserService userService) : ControllerBase
    {
        private readonly IUserService _userService = userService;

        /// <summary>
        /// Get all users with pagination, search, and dynamic filters
        /// </summary>
        [HttpPost("GetUsers")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        [HasPermission(PermissionKeys.UsersRead)]
        [ProducesResponseType(typeof(PagedResult<UserDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<PagedResult<UserDto>>> GetUsers([FromBody] PagedRequest request, [FromQuery] bool includeDeleted = false, CancellationToken cancellationToken = default)
        {
            var result = await _userService.GetAllUsersAsync(request, includeDeleted, cancellationToken);
            return Ok(result);
        }

        /// <summary>
        /// Get a specific user by ID
        /// </summary>
        [HttpGet("{userId}")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        [HasPermission(PermissionKeys.UsersRead)]
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<UserDto>> GetUser(string userId, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(userId))
                return BadRequest(new ErrorResponseDto { Code = "INVALID_INPUT", Message = "UserId cannot be null or empty" });

            var user = await _userService.GetUserByIdAsync(userId, cancellationToken);
            if (user == null)
                return NotFound(new ErrorResponseDto { Code = "NOT_FOUND", Message = "User not found" });

            return Ok(user);
        }

        /// <summary>
        /// Get a specific user by email
        /// </summary>
        [HttpGet("by-email")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<MessageResponseDto>> GetUserByEmail([FromQuery] string email, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(email))
                return BadRequest(new ErrorResponseDto { Code = "INVALID_INPUT", Message = "Email cannot be null or empty" });

            var user = await _userService.GetUserByEmailAsync(email, cancellationToken);
            if (user == null)
                return NotFound(new ErrorResponseDto { Code = "NOT_FOUND", Message = "User not found" });

            return Ok(new MessageResponseDto { Message = "Email already registered" });
        }

        /// <summary>
        /// Create a new user
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin,SuperAdmin")]
        [HasPermission(PermissionKeys.UsersCreate)]
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status409Conflict)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserDto createUser, CancellationToken cancellationToken)
        {
            var user = await _userService.CreateUserAsync(createUser, cancellationToken);
            if (user == null)
                return Conflict(new ErrorResponseDto { Code = "CONFLICT", Message = "User with this email already exists" });

            return CreatedAtAction(nameof(GetUser), new { userId = user.Id }, user);
        }

        /// <summary>
        /// Update an existing user
        /// </summary>
        [HttpPut("{userId}")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        [HasPermission(PermissionKeys.UsersUpdate)]
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<UserDto>> UpdateUser(string userId, [FromBody] UpdateUserDto updateUser, CancellationToken cancellationToken)
        {
            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(currentUserId))
                return Unauthorized(new ErrorResponseDto { Code = "UNAUTHORIZED", Message = "User ID not found in token" });

            var user = await _userService.UpdateUserAsync(userId, updateUser, cancellationToken);
            if (user == null)
                return NotFound(new ErrorResponseDto { Code = "NOT_FOUND", Message = "User not found" });

            return Ok(user);
        }

        /// <summary>
        /// Set a temporary password for a user and force password reset on next login.
        /// </summary>
        [HttpPut("{userId}/temporary-password")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        [HasPermission(PermissionKeys.UsersUpdate)]
        [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<MessageResponseDto>> SetTemporaryPassword(
            string userId,
            [FromBody] SetTemporaryPasswordDto request,
            CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ErrorResponseDto
                {
                    Code = "VALIDATION_ERROR",
                    Message = "Invalid temporary password request",
                    Details = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
                });
            }

            var success = await _userService.SetTemporaryPasswordAsync(userId, request, cancellationToken);
            if (!success)
            {
                return NotFound(new ErrorResponseDto
                {
                    Code = "NOT_FOUND",
                    Message = "User not found"
                });
            }

            return Ok(new MessageResponseDto { Message = "Temporary password updated successfully" });
        }

        [HttpGet("profile")]
        [Authorize]
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<UserDto>> GetProfile(CancellationToken cancellationToken)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new ErrorResponseDto { Code = "UNAUTHORIZED", Message = "User ID not found in token" });

            var user = await _userService.GetUserByIdAsync(userId, cancellationToken);
            if (user == null)
                return NotFound(new ErrorResponseDto { Code = "NOT_FOUND", Message = "User not found" });

            return Ok(user);
        }

        [HttpPut("profile")]
        [Authorize]
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<UserDto>> UpdateProfile([FromBody] UpdateUserDto updateProfile, CancellationToken cancellationToken)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new ErrorResponseDto { Code = "UNAUTHORIZED", Message = "User ID not found in token" });

            var result = await _userService.UpdateUserAsync(userId, updateProfile, cancellationToken);
            if (result == null)
                return NotFound(new ErrorResponseDto { Code = "NOT_FOUND", Message = "User not found" });

            return Ok(result);
        }

        [HttpGet("export")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        [HasPermission(PermissionKeys.UsersRead)]
        [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<FileResult>> ExportUsers([FromQuery] string format = "csv", CancellationToken cancellationToken = default)
        {
            return format.ToLower() switch
            {
                "csv" => File(
                    System.Text.Encoding.UTF8.GetBytes(await _userService.ExportUsersToCsvAsync(cancellationToken)),
                    "text/csv",
                    $"users-export-{DateTime.UtcNow:yyyy-MM-dd}.csv"),

                "excel" => File(
                    await _userService.ExportUsersToExcelAsync(cancellationToken),
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    $"users-export-{DateTime.UtcNow:yyyy-MM-dd}.xlsx"),

                _ => BadRequest(new ErrorResponseDto { Code = "INVALID_FORMAT", Message = "Supported formats: csv, excel" })
            };
        }

        /// <summary>
        /// Get comprehensive user details including all related data
        /// </summary>
        [HttpGet("{id}/detail")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        [HasPermission(PermissionKeys.UsersRead)]
        [ProducesResponseType(typeof(UserDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<UserDetailDto>> GetUserDetail(string id, CancellationToken cancellationToken)
        {
            var userDetail = await _userService.GetUserDetailByIdAsync(id, cancellationToken);
            if (userDetail == null)
                return NotFound(new ErrorResponseDto { Code = "NOT_FOUND", Message = "User not found" });

            return Ok(userDetail);
        }

        /// <summary>
        /// Update payment status for a specific payment record
        /// </summary>
        [HttpPut("payments/{paymentId}/status")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        [HasPermission(PermissionKeys.MembershipsReview)]
        [ProducesResponseType(typeof(PaymentDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PaymentDetailDto>> UpdatePaymentStatus(
            Guid paymentId,
            [FromBody] UpdatePaymentStatusDto updateDto,
            CancellationToken cancellationToken)
        {
            var payment = await _userService.UpdatePaymentStatusAsync(paymentId, updateDto, cancellationToken);
            if (payment == null)
                return NotFound(new ErrorResponseDto { Code = "NOT_FOUND", Message = "Payment record not found" });

            return Ok(payment);
        }
    }
}
