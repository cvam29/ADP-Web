namespace DieticianAssociation.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController(IAuthService authService, IUserService userService) : ControllerBase
    {
        private readonly IAuthService _authService = authService;
        private readonly IUserService _userService = userService;

        /// <summary>
        /// Authenticate user and return JWT token
        /// </summary>
        [HttpPost("login")]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto loginRequest, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ErrorResponseDto
                {
                    Code = "VALIDATION_ERROR",
                    Message = "Invalid login request",
                    Details = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
                });
            }

            var result = await _authService.LoginAsync(loginRequest, cancellationToken);
            if (result == null)
            {
                return Unauthorized(new ErrorResponseDto
                {
                    Code = "INVALID_CREDENTIALS",
                    Message = "Invalid email or password"
                });
            }

            return Ok(result);
        }

        /// <summary>
        /// Register a new user
        /// </summary>
        [HttpPost("register")]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status409Conflict)]
        public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterRequestDto registerRequest, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ErrorResponseDto
                {
                    Code = "VALIDATION_ERROR",
                    Message = "Invalid registration request",
                    Details = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
                });
            }

            var result = await _authService.RegisterAsync(registerRequest, cancellationToken);
            if (result == null)
            {
                return Conflict(new ErrorResponseDto
                {
                    Code = "DUPLICATE_USER",
                    Message = "User with this email already exists"
                });
            }

            return Ok(result);
        }

        /// <summary>
        /// Get the current authenticated user with freshly resolved permissions.
        /// </summary>
        [HttpGet("me")]
        [Authorize]
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<UserDto>> Me(CancellationToken cancellationToken)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized(new ErrorResponseDto
                {
                    Code = "UNAUTHORIZED",
                    Message = "User ID not found in token"
                });
            }

            var user = await _userService.GetUserByIdAsync(userId, cancellationToken);
            if (user == null)
            {
                return NotFound(new ErrorResponseDto
                {
                    Code = "NOT_FOUND",
                    Message = "User not found"
                });
            }

            return Ok(user);
        }

        [HttpPost("view-as/{targetUserId}")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<AuthResponseDto>> ViewAs(string targetUserId, CancellationToken cancellationToken)
        {
            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(currentUserId))
            {
                return Unauthorized(new ErrorResponseDto
                {
                    Code = "UNAUTHORIZED",
                    Message = "User ID not found in token"
                });
            }

            if (User.HasClaim(DieticianAssociation.API.Constants.AppConstants.ClaimTypes.IsViewAs, "true"))
            {
                return BadRequest(new ErrorResponseDto
                {
                    Code = "VIEW_AS_ACTIVE",
                    Message = "Exit the current view-as session before starting another one."
                });
            }

            try
            {
                var result = await _authService.ViewAsAsync(currentUserId, targetUserId, cancellationToken);
                if (result == null)
                {
                    return NotFound(new ErrorResponseDto
                    {
                        Code = "NOT_FOUND",
                        Message = "Target member was not found"
                    });
                }

                return Ok(result);
            }
            catch (InvalidOperationException exception)
            {
                return BadRequest(new ErrorResponseDto
                {
                    Code = "INVALID_VIEW_AS_REQUEST",
                    Message = exception.Message
                });
            }
        }

        /// <summary>
        /// Change current user's password
        /// </summary>
        [HttpPost("change-password")]
        [Authorize]
        [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<MessageResponseDto>> ChangePassword([FromBody] ChangePasswordDto changePassword, CancellationToken cancellationToken)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new ErrorResponseDto
                {
                    Code = "UNAUTHORIZED",
                    Message = "User ID not found in token"
                });
            }

            var success = await _authService.ChangePasswordAsync(userId, changePassword, cancellationToken);
            if (!success)
            {
                return BadRequest(new ErrorResponseDto
                {
                    Code = "INVALID_PASSWORD",
                    Message = "Current password is incorrect"
                });
            }

            return Ok(new MessageResponseDto { Message = "Password changed successfully" });
        }

        /// <summary>
        /// Refresh an expired access token using a valid refresh token
        /// </summary>
        [HttpPost("refresh")]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<AuthResponseDto>> RefreshToken([FromBody] RefreshTokenRequestDto request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ErrorResponseDto
                {
                    Code = "VALIDATION_ERROR",
                    Message = "Invalid refresh token request"
                });
            }

            var result = await _authService.RefreshTokenAsync(request, cancellationToken);
            if (result == null)
            {
                return Unauthorized(new ErrorResponseDto
                {
                    Code = "INVALID_REFRESH_TOKEN",
                    Message = "Invalid or expired refresh token"
                });
            }

            return Ok(result);
        }
    }
}
