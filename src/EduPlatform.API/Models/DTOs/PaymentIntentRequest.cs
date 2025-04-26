namespace EduPlatform.API.Models.DTOs
{
    public class PaymentIntentRequest
    {
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public Guid CourseId { get; set; }
    }
} 