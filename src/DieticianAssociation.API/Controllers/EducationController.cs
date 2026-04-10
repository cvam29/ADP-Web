namespace DieticianAssociation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EducationController(IEducationService educationService, ILogger<EducationController> logger) : ControllerBase
{
    private readonly IEducationService _educationService = educationService;
    private readonly ILogger<EducationController> _logger = logger;

    /// <summary>
    /// Get academics data grouped by course tabs with pagination.
    /// </summary>
    [HttpPost("academics/paginated")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AcademicsPagedResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AcademicsPagedResponseDto>> GetAcademicsPaginated([FromBody] AcademicsPagedRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _educationService.GetAcademicsPaginatedAsync(request, cancellationToken);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ErrorResponseDto { Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching paginated academics data");
            return StatusCode(500, new ErrorResponseDto { Message = "An error occurred while fetching academics data." });
        }
    }

    // University endpoints
    /// <summary>
    /// Get all universities
    /// </summary>
    [HttpGet("universities")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<UniversityDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<UniversityDto>>> GetUniversities(CancellationToken cancellationToken)
    {
        try
        {
            var universities = await _educationService.GetAllUniversitiesAsync(cancellationToken);
            return Ok(universities);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching universities");
            return StatusCode(500, new ErrorResponseDto { Message = "An error occurred while fetching universities." });
        }
    }

    /// <summary>
    /// Get university by ID
    /// </summary>
    [HttpGet("universities/{id}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(UniversityDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UniversityDto>> GetUniversity(int id, CancellationToken cancellationToken)
    {
        try
        {
            var university = await _educationService.GetUniversityByIdAsync(id, cancellationToken);
            if (university == null)
            {
                return NotFound(new ErrorResponseDto { Message = $"University with ID {id} not found." });
            }
            return Ok(university);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching university {Id}", id);
            return StatusCode(500, new ErrorResponseDto { Message = "An error occurred while fetching the university." });
        }
    }

    /// <summary>
    /// Get universities by state
    /// </summary>
    [HttpGet("universities/state/{stateId}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<UniversityDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<UniversityDto>>> GetUniversitiesByState(long stateId, CancellationToken cancellationToken)
    {
        try
        {
            var universities = await _educationService.GetUniversitiesByStateAsync(stateId, cancellationToken);
            return Ok(universities);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching universities for state {StateId}", stateId);
            return StatusCode(500, new ErrorResponseDto { Message = "An error occurred while fetching universities." });
        }
    }

    /// <summary>
    /// Create a new university
    /// </summary>
    [HttpPost("universities")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(UniversityDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<UniversityDto>> CreateUniversity([FromBody] CreateUniversityDto dto, CancellationToken cancellationToken)
    {
        try
        {
            var university = await _educationService.CreateUniversityAsync(dto, cancellationToken);
            return CreatedAtAction(nameof(GetUniversity), new { id = university.Id }, university);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ErrorResponseDto { Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating university");
            return StatusCode(500, new ErrorResponseDto { Message = "An error occurred while creating the university." });
        }
    }

    /// <summary>
    /// Update an existing university
    /// </summary>
    [HttpPut("universities/{id}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(UniversityDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UniversityDto>> UpdateUniversity(int id, [FromBody] UpdateUniversityDto dto, CancellationToken cancellationToken)
    {
        try
        {
            var university = await _educationService.UpdateUniversityAsync(id, dto, cancellationToken);
            return Ok(university);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ErrorResponseDto { Message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ErrorResponseDto { Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating university {Id}", id);
            return StatusCode(500, new ErrorResponseDto { Message = "An error occurred while updating the university." });
        }
    }

    /// <summary>
    /// Delete a university
    /// </summary>
    [HttpDelete("universities/{id}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteUniversity(int id, CancellationToken cancellationToken)
    {
        try
        {
            await _educationService.DeleteUniversityAsync(id, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ErrorResponseDto { Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting university {Id}", id);
            return StatusCode(500, new ErrorResponseDto { Message = "An error occurred while deleting the university." });
        }
    }

    // College endpoints
    /// <summary>
    /// Get all colleges
    /// </summary>
    [HttpGet("colleges")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<CollegeDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<CollegeDto>>> GetColleges(CancellationToken cancellationToken)
    {
        try
        {
            var colleges = await _educationService.GetAllCollegesAsync(cancellationToken);
            return Ok(colleges);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching colleges");
            return StatusCode(500, new ErrorResponseDto { Message = "An error occurred while fetching colleges." });
        }
    }

    /// <summary>
    /// Get college by ID
    /// </summary>
    [HttpGet("colleges/{id}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(CollegeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CollegeDto>> GetCollege(int id, CancellationToken cancellationToken)
    {
        try
        {
            var college = await _educationService.GetCollegeByIdAsync(id, cancellationToken);
            if (college == null)
            {
                return NotFound(new ErrorResponseDto { Message = $"College with ID {id} not found." });
            }
            return Ok(college);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching college {Id}", id);
            return StatusCode(500, new ErrorResponseDto { Message = "An error occurred while fetching the college." });
        }
    }

    /// <summary>
    /// Get colleges by university
    /// </summary>
    [HttpGet("colleges/university/{universityId}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<CollegeDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<CollegeDto>>> GetCollegesByUniversity(int universityId, CancellationToken cancellationToken)
    {
        try
        {
            var colleges = await _educationService.GetCollegesByUniversityAsync(universityId, cancellationToken);
            return Ok(colleges);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching colleges for university {UniversityId}", universityId);
            return StatusCode(500, new ErrorResponseDto { Message = "An error occurred while fetching colleges." });
        }
    }

    /// <summary>
    /// Create a new college
    /// </summary>
    [HttpPost("colleges")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(CollegeDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CollegeDto>> CreateCollege([FromBody] CreateCollegeDto dto, CancellationToken cancellationToken)
    {
        try
        {
            var college = await _educationService.CreateCollegeAsync(dto, cancellationToken);
            return CreatedAtAction(nameof(GetCollege), new { id = college.Id }, college);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ErrorResponseDto { Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating college");
            return StatusCode(500, new ErrorResponseDto { Message = "An error occurred while creating the college." });
        }
    }

    /// <summary>
    /// Update an existing college
    /// </summary>
    [HttpPut("colleges/{id}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(CollegeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CollegeDto>> UpdateCollege(int id, [FromBody] UpdateCollegeDto dto, CancellationToken cancellationToken)
    {
        try
        {
            var college = await _educationService.UpdateCollegeAsync(id, dto, cancellationToken);
            return Ok(college);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ErrorResponseDto { Message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ErrorResponseDto { Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating college {Id}", id);
            return StatusCode(500, new ErrorResponseDto { Message = "An error occurred while updating the college." });
        }
    }

    /// <summary>
    /// Delete a college
    /// </summary>
    [HttpDelete("colleges/{id}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCollege(int id, CancellationToken cancellationToken)
    {
        try
        {
            await _educationService.DeleteCollegeAsync(id, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ErrorResponseDto { Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting college {Id}", id);
            return StatusCode(500, new ErrorResponseDto { Message = "An error occurred while deleting the college." });
        }
    }

    // College type endpoints
    /// <summary>
    /// Get all college types
    /// </summary>
    [HttpGet("college-types")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<CollegeTypeDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<CollegeTypeDto>>> GetCollegeTypes(CancellationToken cancellationToken)
    {
        try
        {
            var collegeTypes = await _educationService.GetAllCollegeTypesAsync(cancellationToken);
            return Ok(collegeTypes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching college types");
            return StatusCode(500, new ErrorResponseDto { Message = "An error occurred while fetching college types." });
        }
    }

    // District endpoints
    /// <summary>
    /// Get districts by state
    /// </summary>
    [HttpGet("districts/state/{stateId}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<DistrictDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<DistrictDto>>> GetDistrictsByState(long stateId, CancellationToken cancellationToken)
    {
        try
        {
            var districts = await _educationService.GetDistrictsByStateAsync(stateId, cancellationToken);
            return Ok(districts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching districts for state {StateId}", stateId);
            return StatusCode(500, new ErrorResponseDto { Message = "An error occurred while fetching districts." });
        }
    }
}
