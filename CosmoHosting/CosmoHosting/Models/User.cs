namespace CosmoHosting.Models
{
    public class User
    {
        public int Id { get; set; }

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public required string Email { get; set; }

        public required string PhoneNumber { get; set; }

        public required string PasswordHash { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
