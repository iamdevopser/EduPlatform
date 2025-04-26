using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EduPlatform.API.Models.DTOs;
using EduPlatform.API.Services;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Stripe;
using EduPlatform.Core.DTOs;
using EduPlatform.Domain.Models;
using EduPlatform.Infrastructure.Services;
using EduPlatform.Domain.DTOs.Payment;
using EduPlatform.Domain.Services;

namespace EduPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentsController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpPost("initiate")]
        public async Task<IActionResult> InitiatePayment([FromBody] PaymentIntentRequest request)
        {
            try
            {
                var transactionId = await _paymentService.InitiatePaymentAsync(request);
                return Ok(new { transactionId });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("confirm")]
        public async Task<IActionResult> ConfirmPayment([FromBody] ConfirmPaymentRequest request)
        {
            try
            {
                // Check if course is already purchased
                if (await _paymentService.IsCourseAlreadyPurchasedAsync(request.CourseId, request.StudentId))
                {
                    return BadRequest(new { error = "Course already purchased" });
                }

                var payment = await _paymentService.ConfirmPaymentAsync(request);
                return Ok(payment);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("status/{transactionId}")]
        public async Task<IActionResult> GetPaymentStatus(string transactionId)
        {
            try
            {
                var payment = await _paymentService.GetPaymentStatusAsync(transactionId);
                if (payment == null)
                {
                    return NotFound();
                }
                return Ok(payment);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
} 