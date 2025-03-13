// Controllers/OtpController.cs
using Microsoft.AspNetCore.Mvc;
using CosmoHosting.Data;
using CosmoHosting.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Security.Claims;
using CosmoHosting.Services;

[ApiController]
[Route("api/otp")] // Cambiamos la ruta base a "api/otp"
public class OtpController : ControllerBase
{
    private readonly IOtpCode _otpService;
    private readonly AppDBContext _appDbContext;
    public OtpController(IOtpCode otpService, AppDBContext appDbContext)
    {
        _otpService = otpService;
        _appDbContext = appDbContext;
    }

    [HttpPost("generate")]
    public async Task<IActionResult> GenerateOtp([FromBody] GenerateOtpRequest request) // Agrega async y Task<IActionResult>
    {
    // Buscar al usuario en la base de datos por su Email
    var userFound = await _appDbContext.Users
        .FirstOrDefaultAsync(u => u.Email == request.Email && u.PasswordHash == request.PasswordHash);

    if (userFound == null)
    {
        return NotFound("Usuario no encontrado");
    }

    // Verificar que el PasswordHash proporcionado coincida con el almacenado
    if (userFound.PasswordHash != request.PasswordHash)
    {
        return Unauthorized("Credenciales inválidas");
    }

    // Generar el código OTP usando el secretKey del usuario
    var otpCode = _otpService.GenerateOtp(userFound.OtpSecretKey);

    return Ok(new { OtpCode = otpCode });
    }

    [HttpPost("validate")]
    public async Task<IActionResult> ValidateOtp([FromBody] ValidateOtpRequest request) // Agrega async y Task<IActionResult>
    {
    var userFound = await _appDbContext.Users
        .FirstOrDefaultAsync(u => u.Email == request.Email && u.PasswordHash == request.PasswordHash);

    if (userFound == null)
    {
        return NotFound("Usuario no encontrado");
    }

    // Verificar que el PasswordHash proporcionado coincida con el almacenado
    if (userFound.PasswordHash != request.PasswordHash)
    {
        return Unauthorized("Credenciales inválidas");
    }

    var isValid = _otpService.ValidateOtp(userFound.OtpSecretKey, request.OtpCode);
    return Ok(new { IsValid = isValid });
    }

    public class GenerateOtpRequest {
        public required string Email { get; set; }       // Email del usuario
        public required string PasswordHash { get; set; } // Hash de la contraseña
    }

    public class ValidateOtpRequest
    {
        public required string Email { get; set; }       // Email del usuario
        public required string PasswordHash { get; set; } // Hash de la contraseña
        public required string OtpCode { get; set; }     // Código OTP a validar
    }
}

