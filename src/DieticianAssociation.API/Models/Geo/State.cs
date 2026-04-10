namespace DieticianAssociation.API.Models.Geo;

public class State
{
    public long Id { get; set; }
    public string Name { get; set; } = null!;
    public long CountryId { get; set; }
    public string CountryCode { get; set; } = null!;
    public string? FipsCode { get; set; }
    public string? Iso2 { get; set; }
    public string? Type { get; set; }
    public int? Level { get; set; }
    public int? ParentId { get; set; }
    public string? Native { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }

    public DateTime? CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public short Flag { get; set; }
    public string? WikiDataId { get; set; }

    public ICollection<City> Cities { get; set; } = [];


    public Country Country { get; set; } = null!;
}
