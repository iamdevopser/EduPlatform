using System;
using System.Threading.Tasks;
using EduPlatform.API.Models.DTOs;
using Stripe;

namespace EduPlatform.API.Services
{
    public interface IStripeService
    {
        Task<string> CreatePaymentIntentAsync(PaymentIntentRequest request);
        Task<bool> ConfirmPaymentAsync(ConfirmPaymentRequest request);
    }

    public class StripeService : IStripeService
    {
        private readonly string _stripeSecretKey;

        public StripeService(string stripeSecretKey)
        {
            _stripeSecretKey = stripeSecretKey;
            StripeConfiguration.ApiKey = _stripeSecretKey;
        }

        public async Task<string> CreatePaymentIntentAsync(PaymentIntentRequest request)
        {
            var options = new PaymentIntentCreateOptions
            {
                Amount = (long)(request.Amount * 100), // Convert to cents
                Currency = request.Currency.ToLower(),
                PaymentMethodTypes = new List<string> { "card" },
            };

            var service = new PaymentIntentService();
            var intent = await service.CreateAsync(options);

            return intent.ClientSecret;
        }

        public async Task<bool> ConfirmPaymentAsync(ConfirmPaymentRequest request)
        {
            try
            {
                var service = new PaymentIntentService();
                var intent = await service.GetAsync(request.PaymentIntentId);

                return intent.Status == "succeeded";
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
} 