using EduPlatform.Domain.DTOs.Payment;
using EduPlatform.Domain.Models;

namespace EduPlatform.Domain.Services
{
    public interface IPaymentService
    {
        Task<string> InitiatePaymentAsync(PaymentIntentRequest request);
        Task<Payment> ConfirmPaymentAsync(ConfirmPaymentRequest request);
        Task<bool> IsCourseAlreadyPurchasedAsync(Guid courseId, Guid studentId);
        Task<Payment> GetPaymentStatusAsync(string transactionId);
    }
} 