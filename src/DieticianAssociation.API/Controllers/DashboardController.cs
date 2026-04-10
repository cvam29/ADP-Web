using DieticianAssociation.API.Constants;

namespace DieticianAssociation.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public class DashboardController(ApplicationDbContext context, ILogger<AdminController> logger) : Controller
    {
        private readonly ApplicationDbContext _context = context;
        private readonly ILogger<AdminController> _logger = logger;

        [HttpGet("stats")]
        [HasPermission(PermissionKeys.AnalyticsView)]
        [ProducesResponseType(typeof(AdminDashboardStatsDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<AdminDashboardStatsDto>> GetAdminStats(CancellationToken cancellationToken)
        {
            try
            {
                var stats = new AdminDashboardStatsDto
                {
                    TotalUsers = await _context.Users.AsNoTracking().CountAsync(cancellationToken),
                    ActiveUsers = await _context.UserMemberships.AsNoTracking().CountAsync(m => m.Status == MembershipStatus.Active, cancellationToken),
                    ExpiredUsers = await _context.UserMemberships.AsNoTracking().CountAsync(m => m.Status == MembershipStatus.Expired, cancellationToken),
                    TotalEvents = await _context.AssociationEvents.AsNoTracking().CountAsync(cancellationToken),
                    UpcomingEvents = await _context.AssociationEvents.AsNoTracking().CountAsync(e => e.Date >= DateTime.UtcNow, cancellationToken),
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting admin stats");
                return StatusCode(500, new ErrorResponseDto { Message = "An error occurred while retrieving statistics" });
            }
        }

    }
}
