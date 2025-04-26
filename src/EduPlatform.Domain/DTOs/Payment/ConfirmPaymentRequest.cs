namespace EduPlatform.Domain.DTOs.Payment
{
    public class ConfirmPaymentRequest
    {
        public Guid CourseId { get; set; }
        public Guid StudentId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string PaymentProvider { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }
} 