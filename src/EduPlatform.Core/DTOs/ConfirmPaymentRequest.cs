namespace EduPlatform.Core.DTOs
{
    public class ConfirmPaymentRequest
    {
        public Guid CourseId { get; set; }
        public Guid StudentId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public string PaymentIntentId { get; set; }
    }
} 