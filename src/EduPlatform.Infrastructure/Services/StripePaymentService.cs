using EduPlatform.Domain.DTOs.Payment;
using EduPlatform.Domain.Models;
using EduPlatform.Domain.Services;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Microsoft.Extensions.Configuration;
using EduPlatform.Domain.Interfaces;
using EduPlatform.Infrastructure.Data;

namespace EduPlatform.Infrastructure.Services
{
    public class StripePaymentService : IPaymentService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly string _stripeSecretKey;

        public StripePaymentService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
            _stripeSecretKey = _configuration["Stripe:SecretKey"];
            StripeConfiguration.ApiKey = _stripeSecretKey;
        }

        public async Task<PaymentResult> InitiatePaymentAsync(PaymentIntentRequest request)
        {
            try
            {
                var options = new PaymentIntentCreateOptions
                {
                    Amount = (long)(request.Amount * 100), // Convert to cents
                    Currency = "usd",
                    Description = request.Description,
                    PaymentMethodTypes = new List<string> { "card" }
                };

                var service = new PaymentIntentService();
                var intent = await service.CreateAsync(options);

                return new PaymentResult
                {
                    Success = true,
                    PaymentId = intent.Id,
                    ClientSecret = intent.ClientSecret
                };
            }
            catch (StripeException ex)
            {
                return new PaymentResult
                {
                    Success = false,
                    ErrorMessage = ex.Message
                };
            }
        }

        public async Task<PaymentStatus> GetPaymentStatusAsync(string paymentId)
        {
            try
            {
                var service = new PaymentIntentService();
                var intent = await service.GetAsync(paymentId);

                return intent.Status switch
                {
                    "succeeded" => PaymentStatus.Succeeded,
                    "processing" => PaymentStatus.Processing,
                    "requires_payment_method" => PaymentStatus.Pending,
                    "canceled" => PaymentStatus.Cancelled,
                    _ => PaymentStatus.Failed
                };
            }
            catch (StripeException)
            {
                return PaymentStatus.Failed;
            }
        }

        public async Task<Payment> ConfirmPaymentAsync(ConfirmPaymentRequest request)
        {
            var service = new PaymentIntentService();
            var intent = await service.GetAsync(request.PaymentIntentId);

            var payment = new Payment
            {
                CourseId = request.CourseId,
                StudentId = request.StudentId,
                Amount = request.Amount,
                Currency = request.Currency,
                StripeIntentId = request.PaymentIntentId,
                IsSuccessful = intent.Status == "succeeded",
                PaidAt = DateTime.UtcNow
            };

            await _context.Payments.AddAsync(payment);
            await _context.SaveChangesAsync();

            return payment;
        }

        public async Task<bool> IsCourseAlreadyPurchasedAsync(Guid courseId, Guid studentId)
        {
            return await _context.Payments
                .AnyAsync(p => p.CourseId == courseId && 
                             p.StudentId == studentId && 
                             p.IsSuccessful);
        }
    }
} 