namespace DieticianAssociation.API.Models
{
    public class MembershipPlan
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string Name { get; set; } = string.Empty;

        public MembershipTier Tier { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int Duration { get; set; } // in months

        // Additional detailed pricing fields (optional)
        public decimal? InitialFee { get; set; }
        public decimal? RenewalFee { get; set; }
        public decimal? DiscountedPrice { get; set; }
        public decimal? DiscountedRenewalFee { get; set; }
        public string? Discount { get; set; }
        public decimal? PriceWithGST { get; set; }
        public decimal? RenewalPriceWithGST { get; set; }
        public string? Description { get; set; }

        public List<string> Features { get; set; } = [];

        public bool Popular { get; set; } = false;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property - Users with this membership plan
        public virtual ICollection<UserMembership> UserMemberships { get; set; } = [];

        public virtual ICollection<MembershipPlanPermission> PlanPermissions { get; set; } = [];

    }
}
