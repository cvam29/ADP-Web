namespace DieticianAssociation.API.Models.Geo;

public class District
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Code { get; set; } = null!; // district_code
    public int Status { get; set; }
    public long StateId { get; set; }
    public State State { get; set; } = null!;

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public ICollection<College> Colleges { get; set; } = [];
}
