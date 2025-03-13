namespace CosmoHosting.Services
{
  public interface IOtpCode
  {
      string GenerateOtp(string secretKey);
      bool ValidateOtp(string secretKey, string otpCode);
  }
}
