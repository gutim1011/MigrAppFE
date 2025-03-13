using Microsoft.EntityFrameworkCore;
using CosmoHosting.Models;

namespace CosmoHosting.Data
{
    public class AppDBContext : DbContext
    {
        public AppDBContext(DbContextOptions<AppDBContext> options) : base(options) { }
        public DbSet<User> Users { get; set; }
    }
}