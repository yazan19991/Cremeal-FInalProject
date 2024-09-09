using System.Threading.Tasks;
using CremealServer.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using CremealServer.Models.ConfigureOptions;


namespace CremealServer.Models.Services
{
    public class AccessTokenGenerator
    {
        private readonly AuthenticationConfiguration _configuraion;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IConfiguration _configuration_system;
        public AccessTokenGenerator(AuthenticationConfiguration configuration,IPasswordHasher passwordHasher)
        {
            _configuraion = configuration;
            _passwordHasher = passwordHasher;
        }

        public string GenerateToken(ClientDTO client, int? userId)
        {
            SecurityKey key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuraion.AccessTokenSecret));
            SigningCredentials credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            List<Claim> claims = new List<Claim>()
            {
                new Claim("id",userId.ToString()),
                new Claim(ClaimTypes.Name,client.Name),
                new Claim(ClaimTypes.Email,client.Email),
                new Claim(ClaimTypes.Role, "User")

            };
            JwtSecurityToken token = new JwtSecurityToken(
                _configuraion.Issuer,
                _configuraion.Audience,
                claims:claims,
                notBefore:DateTime.UtcNow,
                expires:DateTime.UtcNow.AddDays(_configuraion.AccessTokenExpirationDays),
                signingCredentials:credentials
             );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateTokenAdmin()
        {
            SecurityKey key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuraion.AccessTokenSecret));
            SigningCredentials credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            List<Claim> claims = new List<Claim>()
            {
                new Claim(ClaimTypes.Role, "Admin")
            };
            JwtSecurityToken token = new JwtSecurityToken(
                _configuraion.Issuer,
                _configuraion.Audience,
                claims: claims,
                notBefore: DateTime.UtcNow,
                expires: DateTime.UtcNow.AddDays(_configuraion.AccessTokenExpirationDays),
                signingCredentials: credentials
             );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
