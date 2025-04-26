using System;
using System.Threading.Tasks;
using EduPlatform.Domain.Interfaces;
using EduPlatform.Domain.Models;
using EduPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.Infrastructure.Services
{
    public class BasicPaymentService : IPaymentService
    {
        private readonly ApplicationDbContext _context;
        private readonly Random _random;

        public BasicPaymentService(ApplicationDbContext context)
        {
            _context = context;
            _random = new Random();
        }

        public async Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request)
        {
            try
            {
                // Simulate payment processing
                await Task.Delay(1000); // Simulate network delay

                // Generate a random payment ID
                var paymentId = Guid.NewGuid().ToString();

                // 90% chance of success, 10% chance of failure
                var isSuccess = _random.Next(100) < 90;

                if (isSuccess)
                {
                    // Create and save the payment record
                    var payment = new Domain.Entities.Payment
                    {
                        Id = Guid.Parse(paymentId),
                        CourseId = request.CourseId,
                        StudentId = request.StudentId,
                        Amount = request.Amount,
                        Currency = request.Currency,
                        TransactionId = paymentId,
                        Status = Domain.Entities.PaymentStatus.Succeeded,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _context.Payments.AddAsync(payment);
                    await _context.SaveChangesAsync();

                    return new PaymentResult
                    {
                        Success = true,
                        PaymentId = paymentId,
                        ErrorMessage = null
                    };
                }
                else
                {
                    return new PaymentResult
                    {
                        Success = false,
                        PaymentId = paymentId,
                        ErrorMessage = "Payment processing failed. Please try again."
                    };
                }
            }
            catch (Exception ex)
            {
                return new PaymentResult
                {
                    Success = false,
                    PaymentId = null,
                    ErrorMessage = $"An error occurred: {ex.Message}"
                };
            }
        }

        public async Task<PaymentStatus> GetPaymentStatusAsync(string paymentId)
        {
            try
            {
                var payment = await _context.Payments
                    .FirstOrDefaultAsync(p => p.TransactionId == paymentId);

                if (payment == null)
                {
                    return PaymentStatus.Failed;
                }

                return payment.Status;
            }
            catch (Exception)
            {
                return PaymentStatus.Failed;
            }
        }
    }
} 