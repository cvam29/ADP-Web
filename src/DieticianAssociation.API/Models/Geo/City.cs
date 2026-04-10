namespace DieticianAssociation.API.Models.Geo;

public class City
{
    public long Id { get; set; }

    public string Name { get; set; } = null!;

    public long StateId { get; set; }
    public string StateCode { get; set; } = null!;

    public long CountryId { get; set; }
    public string CountryCode { get; set; } = null!;

    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public short Flag { get; set; }
    public string? WikiDataId { get; set; }

    public State State { get; set; } = null!;
    public Country Country { get; set; } = null!;
}
