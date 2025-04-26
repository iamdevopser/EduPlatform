using System;

namespace EduPlatform.Domain.Models
{
    public class BankTransferPayment
    {
        public Guid Id { get; set; }
        public Guid PaymentId { get; set; }
        public string BankName { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string AccountHolder { get; set; } = string.Empty;
        public string ReferenceNumber { get; set; } = string.Empty;
        public DateTime? TransferDate { get; set; }
        public string? ReceiptImageUrl { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, Verified, Rejected
        public string? VerificationNotes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? VerifiedAt { get; set; }

        // Navigation property
        public Payment Payment { get; set; } = null!;
    }
} 