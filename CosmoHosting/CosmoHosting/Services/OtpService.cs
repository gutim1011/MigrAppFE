// Services/OtpService.cs

using OtpNet;
using System;

namespace CosmoHosting.Services {
public class OtpService : IOtpCode
{
    public string GenerateOtp(string secretKey)
    {
        Console.WriteLine($"Generating OTP for {secretKey} secretKey.");
        // Convertir la clave secreta de string a byte array
        var secretKeyBytes = Base32Encoding.ToBytes(secretKey);

        // Crear un objeto TOTP con la clave secreta
        var totp = new Totp(secretKeyBytes, step: 300);
        
        // Generar el código OTP
        var otpCode = totp.ComputeTotp();
        Console.WriteLine($"Sended OTP (Client): {otpCode}"); 
        return otpCode;
    }

    public bool ValidateOtp(string secretKey, string otpCode)
    {
        // Convertir la clave secreta de string a byte array
        var secretKeyBytes = Base32Encoding.ToBytes(secretKey);

        // Crear un objeto TOTP con la clave secreta
        
        var totp = new Totp(secretKeyBytes, step: 300); // OTP válido por 60 segundos

        // Imprimir información para debug
        Console.WriteLine($"Secret Key: {secretKey}");
        Console.WriteLine($"Received OTP (client): {otpCode}");

        // Validar el código OTP
        long timeWindowUsed;
        
        bool isValid = totp.VerifyTotp(otpCode, out timeWindowUsed, new VerificationWindow(1, 1));

        Console.WriteLine($"Is valid?: {isValid}");
        return isValid;
    }
}
}
