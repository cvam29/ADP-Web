namespace DieticianAssociation.API.Models.Geo;

public class SubRegion
{
    public long Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Translations { get; set; }

    public long RegionId { get; set; }
    public Region Region { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public short Flag { get; set; }
    public string? WikiDataId { get; set; }
}
