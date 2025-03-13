using Microsoft.AspNetCore.Mvc;
using CosmoHosting.Data;
using CosmoHosting.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System;

namespace CosmoHosting.Controllers
{
    public class AuthController : Controller
    {
        private readonly AppDBContext _appDbContext;
        public AuthController(AppDBContext appDbContext)
        {
            _appDbContext = appDbContext;
        }

        [HttpPost]
        [Route("api/auth/register")]
        public async Task<IActionResult> Register([FromBody] User model)
        {
            if (model == null)
                return BadRequest(new { message = "Datos inválidos" });

            var user = new User()
            {
                Email = model.Email,
                PhoneNumber = model.PhoneNumber,
                PasswordHash = model.PasswordHash
            };

            await _appDbContext.Users.AddAsync(user);
            await _appDbContext.SaveChangesAsync();

            if (user.Id != 0)
            {
                return Ok(new { message = "Usuario registrado exitosamente" });
            }

            return BadRequest(new { message = "No se pudo crear el usuario" });
        }

        [HttpPost]
        [Route("api/auth/login")]
        public async Task<IActionResult> Login([FromBody] User model)
        {
            if (model == null)
                return BadRequest(new { message = "Datos inválidos" });

            var userFound = await _appDbContext.Users
                .FirstOrDefaultAsync(u => u.Email == model.Email && u.PasswordHash == model.PasswordHash);

            if (userFound == null)
                return Unauthorized(new { message = "Credenciales incorrectas" });

            var claims = new List<Claim>
            {
            new Claim(ClaimTypes.Name, userFound.FirstName),
            new Claim(ClaimTypes.Email, userFound.Email)
            };

            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var properties = new AuthenticationProperties { AllowRefresh = true };

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(claimsIdentity),
                properties
            );

            return Ok(new { message = "Inicio de sesión exitoso", user = userFound });
        }


    }
}