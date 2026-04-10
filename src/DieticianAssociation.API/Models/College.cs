

namespace DieticianAssociation.API.Models;

public class College
{
    public int Id { get; set; }
    public string AisheCode { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Website { get; set; }
    public int? YearOfEstablishment { get; set; }
    public int CoursesOfferedFlags { get; set; }


    public int UniversityId { get; set; }
    public University University { get; set; } = null!;

    public long StateId { get; set; }
    public State State { get; set; } = null!;

    public int DistrictId { get; set; }
    public District District { get; set; } = null!;
}
