namespace DieticianAssociation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GeoController(ApplicationDbContext context, ILogger<GeoController> logger) : ControllerBase
{
    private readonly ApplicationDbContext _context = context;
    private readonly ILogger<GeoController> _logger = logger;

    /// <summary>
    /// Get all countries
    /// </summary>
    [HttpGet("countries")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<CountryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<CountryDto>>> GetCountries(CancellationToken cancellationToken)
    {
        try
        {
            var countries = await _context.Countries
                .AsNoTracking()
                .OrderBy(c => c.Name)
                .Select(c => new CountryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Iso2 = c.Iso2,
                    Iso3 = c.Iso3,
                    PhoneCode = c.PhoneCode,
                    Emoji = c.Emoji
                })
                .ToListAsync(cancellationToken);

            return Ok(countries);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching countries");
            return StatusCode(500, new ErrorResponseDto { Message = "An error occurred while fetching countries." });
        }
    }

    /// <summary>
    /// Get states by country ID
    /// </summary>
    [HttpGet("countries/{countryId}/states")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<StateDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<StateDto>>> GetStatesByCountry(long countryId, CancellationToken cancellationToken)
    {
        try
        {
            var countryExists = await _context.Countries.AsNoTracking().AnyAsync(c => c.Id == countryId, cancellationToken);
            if (!countryExists)
            {
                return NotFound(new ErrorResponseDto { Message = "Country not found." });
            }

            var states = await _context.States
                .AsNoTracking()
                .Where(s => s.CountryId == countryId)
                .OrderBy(s => s.Name)
                .Select(s => new StateDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    CountryId = s.CountryId,
                    CountryCode = s.CountryCode,
                    Iso2 = s.Iso2
                })
                .ToListAsync(cancellationToken);

            return Ok(states);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching states for country {CountryId}", countryId);
            return StatusCode(500, new ErrorResponseDto { Message = "An error occurred while fetching states." });
        }
    }

    /// <summary>
    /// Get cities by state ID
    /// </summary>
    [HttpGet("states/{stateId}/cities")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<CityDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<CityDto>>> GetCitiesByState(long stateId, CancellationToken cancellationToken)
    {
        try
        {
            var stateExists = await _context.States.AsNoTracking().AnyAsync(s => s.Id == stateId, cancellationToken);
            if (!stateExists)
            {
                return NotFound(new ErrorResponseDto { Message = "State not found." });
            }

            var cities = await _context.Cities
                .AsNoTracking()
                .Where(c => c.StateId == stateId)
                .OrderBy(c => c.Name)
                .Select(c => new CityDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    StateId = c.StateId,
                    StateCode = c.StateCode,
                    CountryId = c.CountryId,
                    CountryCode = c.CountryCode
                })
                .ToListAsync(cancellationToken);

            return Ok(cities);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching cities for state {StateId}", stateId);
            return StatusCode(500, new ErrorResponseDto { Message = "An error occurred while fetching cities." });
        }
    }

    /// <summary>
    /// Get cities by country ID
    /// </summary>
    [HttpGet("countries/{countryId}/cities")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<CityDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<CityDto>>> GetCitiesByCountry(long countryId, CancellationToken cancellationToken)
    {
        try
        {
            var countryExists = await _context.Countries.AsNoTracking().AnyAsync(c => c.Id == countryId, cancellationToken);
            if (!countryExists)
            {
                return NotFound(new ErrorResponseDto { Message = "Country not found." });
            }

            var cities = await _context.Cities
                .AsNoTracking()
                .Where(c => c.CountryId == countryId)
                .OrderBy(c => c.Name)
                .Select(c => new CityDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    StateId = c.StateId,
                    StateCode = c.StateCode,
                    CountryId = c.CountryId,
                    CountryCode = c.CountryCode
                })
                .ToListAsync(cancellationToken);

            return Ok(cities);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching cities for country {CountryId}", countryId);
            return StatusCode(500, new ErrorResponseDto { Message = "An error occurred while fetching cities." });
        }
    }

    /// <summary>
    /// Get a specific country by ID
    /// </summary>
    [HttpGet("countries/{id}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(CountryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CountryDto>> GetCountry(long id, CancellationToken cancellationToken)
    {
        try
        {
            var country = await _context.Countries
                .AsNoTracking()
                .Where(c => c.Id == id)
                .Select(c => new CountryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Iso2 = c.Iso2,
                    Iso3 = c.Iso3,
                    PhoneCode = c.PhoneCode,
                    Emoji = c.Emoji
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (country == null)
            {
                return NotFound(new ErrorResponseDto { Message = "Country not found." });
            }

            return Ok(country);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching country {Id}", id);
            return StatusCode(500, new ErrorResponseDto { Message = "An error occurred while fetching the country." });
        }
    }

    /// <summary>
    /// Get a specific state by ID
    /// </summary>
    [HttpGet("states/{id}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(StateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<StateDto>> GetState(long id, CancellationToken cancellationToken)
    {
        try
        {
            var state = await _context.States
                .Where(s => s.Id == id)
                .Select(s => new StateDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    CountryId = s.CountryId,
                    CountryCode = s.CountryCode,
                    Iso2 = s.Iso2
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (state == null)
            {
                return NotFound(new ErrorResponseDto { Message = "State not found." });
            }

            return Ok(state);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching state {Id}", id);
            return StatusCode(500, new ErrorResponseDto { Message = "An error occurred while fetching the state." });
        }
    }

    /// <summary>
    /// Get a specific city by ID
    /// </summary>
    [HttpGet("cities/{id}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(CityDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CityDto>> GetCity(long id, CancellationToken cancellationToken)
    {
        try
        {
            var city = await _context.Cities
                .Where(c => c.Id == id)
                .Select(c => new CityDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    StateId = c.StateId,
                    StateCode = c.StateCode,
                    CountryId = c.CountryId,
                    CountryCode = c.CountryCode
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (city == null)
            {
                return NotFound(new ErrorResponseDto { Message = "City not found." });
            }

            return Ok(city);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching city {Id}", id);
            return StatusCode(500, new ErrorResponseDto { Message = "An error occurred while fetching the city." });
        }
    }
}
