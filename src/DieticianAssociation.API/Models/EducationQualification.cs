namespace DieticianAssociation.API.Models
{
    public enum EducationLevel
    {
        [EnumMember(Value = "ug")]
        Undergraduate = 0,

        [EnumMember(Value = "pg")]
        Postgraduate = 1,

        [EnumMember(Value = "phd")]
        Doctorate = 2,

        [EnumMember(Value = "phd")]
        Unknown = 99
    }

    public enum EducationStatus
    {
        [EnumMember(Value = "pursuing")]
        Pursuing = 0,

        [EnumMember(Value = "completed")]
        Completed = 1
    }

    public class EducationQualification
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        // 🔗 Owner
        [Required]
        public string UserId { get; set; } = string.Empty;

        // 🎓 Qualification Level (UG / PG / PhD)
        [Required]
        public EducationLevel Level { get; set; }

        // 📘 Course / Stream
        [Required]
        [MaxLength(150)]
        public string CourseOrStream { get; set; } = string.Empty;

        // 🏫 University / Board
        [Required]
        [MaxLength(200)]
        public string UniversityOrBoard { get; set; } = string.Empty;

        // 📌 Status (Pursuing / Completed)
        [Required]
        public EducationStatus Status { get; set; }

        // 📊 Marks (Percentage / SGPA)
        [MaxLength(20)]
        public string? Marks { get; set; }

        // 📄 Degree File (Photo/PDF of degree certificate)
        [MaxLength(500)]
        public string? DegreeFilePath { get; set; }

        // 🕒 Dates (optional but useful)
        public int? StartYear { get; set; }
        public int? EndYear { get; set; }

        // 🕒 Audit
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // ❌ Soft Delete
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }

        // 🔗 Navigation
        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }
    }
}
