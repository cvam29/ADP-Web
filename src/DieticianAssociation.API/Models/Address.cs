namespace DieticianAssociation.API.Models
{
    public class Address
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        // 🔗 Owner
        [Required]
        public string UserId { get; set; } = string.Empty;

        // 🏠 Address Lines
        [Required]
        [MaxLength(255)]
        public string StreetAddress { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? AddressLine2 { get; set; }

        [Required]
        [MaxLength(20)]
        public string PostalCode { get; set; } = string.Empty;

        // 🌍 GEO REFERENCES (MANDATORY)
        [Required]
        public long CountryId { get; set; }

        [Required]
        public long StateId { get; set; }

        [Required]
        public long CityId { get; set; }

        // 📌 Flags
        public bool IsPrimary { get; set; } = true;

        // 🕒 Audit
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // ❌ Soft delete
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }

        // 🔗 Navigation Properties
        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }

        [ForeignKey(nameof(CountryId))]
        public virtual Country? Country { get; set; }

        [ForeignKey(nameof(StateId))]
        public virtual State? State { get; set; }

        [ForeignKey(nameof(CityId))]
        public virtual City? City { get; set; }

    }
}
