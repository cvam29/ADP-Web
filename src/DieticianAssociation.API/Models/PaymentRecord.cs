namespace DieticianAssociation.API.Models
{
    public enum PaymentMethod
    {
        Upi = 0,
        BankTransfer = 1,
    }

    public enum PaymentStatus
    {
        Pending = 0,
        Verified = 1,
        Rejected = 2,
        Refunded = 3
    }

    public class PaymentRecord
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        // 🔗 Who paid
        [Required]
        public string UserId { get; set; } = string.Empty;

        // 🔗 What this payment is for
        [Required]
        [MaxLength(50)]
        public string ReferenceType { get; set; } = string.Empty; // e.g. Membership, Event, Course

        [Required]
        public Guid ReferenceId { get; set; }

        // 💰 Amount
        [Required]
        public decimal Amount { get; set; }

        // 💳 Payment Mode
        [Required]
        public PaymentMethod Method { get; set; }

        // 📌 Status
        [Required]
        public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

        // 📎 Proof / Receipt
        [Required]
        public string ProofFilePath { get; set; } = string.Empty;

        public string? TransactionReference { get; set; }

        // 🏦 Counterparty Snapshot
        [MaxLength(150)]
        public string? BankOrGatewayName { get; set; }

        // 🕒 Audit
        public DateTime PaidAt { get; set; } = DateTime.UtcNow;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // 🔗 Navigation
        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }
    }
}
