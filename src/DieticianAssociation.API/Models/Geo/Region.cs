namespace DieticianAssociation.API.Models.Geo;

public class Region
{
    public long Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Translations { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public short Flag { get; set; }
    public string? WikiDataId { get; set; }

    public ICollection<SubRegion> SubRegions { get; set; } = [];
}
