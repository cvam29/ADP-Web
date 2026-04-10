namespace DieticianAssociation.API.DTOs;

/// <summary>
/// DTO for Country data
/// </summary>
public class CountryDto
{
    public long Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Iso2 { get; set; }
    public string? Iso3 { get; set; }
    public string? PhoneCode { get; set; }
    public string? Emoji { get; set; }
}

/// <summary>
/// DTO for State data
/// </summary>
public class StateDto
{
    public long Id { get; set; }
    public string Name { get; set; } = null!;
    public long CountryId { get; set; }
    public string CountryCode { get; set; } = null!;
    public string? Iso2 { get; set; }
}

/// <summary>
/// DTO for City data
/// </summary>
public class CityDto
{
    public long Id { get; set; }
    public string Name { get; set; } = null!;
    public long StateId { get; set; }
    public string StateCode { get; set; } = null!;
    public long CountryId { get; set; }
    public string CountryCode { get; set; } = null!;
}
