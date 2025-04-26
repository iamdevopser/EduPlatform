using EduPlatform.Domain.DTOs.Payment;
using EduPlatform.Domain.Models;
using EduPlatform.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BankTransferController : ControllerBase
    {
        private readonly BankTransferPaymentService _paymentService;

        public BankTransferController(BankTransferPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpPost("initiate")]
        public async Task<IActionResult> InitiateBankTransfer([FromBody] BankTransferRequest request)
        {
            try
            {
                var bankTransfer = await _paymentService.CreateBankTransferDetailsAsync(request);
                return Ok(new
                {
                    TransactionId = bankTransfer.Payment.TransactionId,
                    ReferenceNumber = bankTransfer.ReferenceNumber,
                    BankDetails = new
                    {
                        bankTransfer.BankName,
                        bankTransfer.AccountNumber,
                        bankTransfer.AccountHolder
                    },
                    Amount = bankTransfer.Payment.Amount,
                    Currency = bankTransfer.Payment.Currency
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("confirm")]
        public async Task<IActionResult> ConfirmBankTransfer([FromBody] BankTransferConfirmationRequest request)
        {
            try
            {
                var bankTransfer = await _paymentService.ConfirmBankTransferAsync(request);
                return Ok(bankTransfer);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("verify/{transactionId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> VerifyBankTransfer(string transactionId, [FromBody] bool isVerified, [FromQuery] string? notes = null)
        {
            try
            {
                var bankTransfer = await _paymentService.VerifyBankTransferAsync(transactionId, isVerified, notes);
                return Ok(bankTransfer);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("status/{transactionId}")]
        public async Task<IActionResult> GetBankTransferStatus(string transactionId)
        {
            try
            {
                var bankTransfer = await _paymentService.GetPaymentStatusAsync(transactionId);
                if (bankTransfer == null)
                {
                    return NotFound();
                }
                return Ok(bankTransfer);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
} 