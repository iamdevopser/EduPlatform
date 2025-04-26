namespace EduPlatform.Domain.DTOs.Payment
{
    public class PaymentIntentRequest
    {
        public Guid CourseId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string PaymentProvider { get; set; } = string.Empty;
    }
} 