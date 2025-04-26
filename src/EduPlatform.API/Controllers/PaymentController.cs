using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduPlatform.Domain.Interfaces;
using EduPlatform.Domain.Models;

namespace EduPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpPost("initiate")]
        public async Task<IActionResult> InitiatePayment([FromBody] PaymentIntentRequest request)
        {
            var result = await _paymentService.InitiatePaymentAsync(request);
            if (!result.Success)
            {
                return BadRequest(new { error = result.ErrorMessage });
            }
            return Ok(result);
        }

        [HttpGet("status/{paymentId}")]
        public async Task<IActionResult> GetPaymentStatus(string paymentId)
        {
            var status = await _paymentService.GetPaymentStatusAsync(paymentId);
            return Ok(new { status });
        }
    }
} 