namespace DieticianAssociation.API.Models;

public class University
{
    public int Id { get; set; }
    public string UniversityCode { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? WebsiteUrl { get; set; }
    public int SurveyYear { get; set; }
    public string TypeId { get; set; } = null!;
    public string UniversityType { get; set; } = null!;
    public int Rating { get; set; }
    public int CoursesOfferedFlags { get; set; }

    public long StateId { get; set; }
    public State State { get; set; } = null!;

    public int? DistrictId { get; set; }
    public District? District { get; set; }

    public ICollection<College> Colleges { get; set; } = [];
}
