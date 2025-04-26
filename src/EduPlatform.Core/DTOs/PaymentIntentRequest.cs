namespace EduPlatform.Core.DTOs
{
    public class PaymentIntentRequest
    {
        public Guid CourseId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
    }
} 