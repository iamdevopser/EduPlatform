using System.Threading.Tasks;
using EduPlatform.Domain.Models;

namespace EduPlatform.Domain.Interfaces
{
    public interface IPaymentService
    {
        Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request);
        Task<PaymentStatus> GetPaymentStatusAsync(string paymentId);
    }
} 