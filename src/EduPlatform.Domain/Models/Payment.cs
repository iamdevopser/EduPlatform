using System;

namespace EduPlatform.Domain.Models
{
    public class Payment
    {
        public Guid Id { get; set; }
        public Guid CourseId { get; set; }
        public Guid StudentId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string PaymentProvider { get; set; } = string.Empty; // e.g., "BankTransfer", "PayPal", etc.
        public string TransactionId { get; set; } = string.Empty; // Reference number from payment provider
        public string Status { get; set; } = string.Empty; // Pending, Completed, Failed
        public DateTime PaidAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? Notes { get; set; } // Additional payment information
    }
} 