using DieticianAssociation.API.Constants;

namespace DieticianAssociation.API.Services
{
    public class JwtService(IConfiguration configuration, IPermissionService permissionService, ILogger<JwtService> logger) : IJwtService
    {
        private readonly IConfiguration _configuration = configuration;
        private readonly IPermissionService _permissionService = permissionService;
        private readonly ILogger<JwtService> _logger = logger;

        public async Task<string> GenerateTokenAsync(User user, IEnumerable<Claim>? additionalClaims = null, bool? mustResetPassword = null)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["JwtSettings:SecretKey"]!);

            var claims = new List<Claim>
            {
                new(System.Security.Claims.ClaimTypes.NameIdentifier, user.Id),
                new(System.Security.Claims.ClaimTypes.Email, user.Email ?? string.Empty),
                new(System.Security.Claims.ClaimTypes.Name, user.Name ?? string.Empty),
                new(System.Security.Claims.ClaimTypes.Role, user.Role.ToString()),
                new("mustResetPassword", (mustResetPassword ?? user.RequirePasswordReset) ? "true" : "false"),
                new(DieticianAssociation.API.Constants.AppConstants.ClaimTypes.MembershipTier, user.LatestMembership?.MembershipPlan?.Tier.ToString() ?? string.Empty),
                new(DieticianAssociation.API.Constants.AppConstants.ClaimTypes.MembershipStatus, user.LatestMembership?.Status.ToString() ?? string.Empty)
            };

            var effectivePermissions = user.EffectivePermissions.Count > 0
                ? user.EffectivePermissions
                : await _permissionService.GetEffectivePermissionsAsync(user.Id);

            claims.AddRange(effectivePermissions.Select(permissionKey => new Claim("permission", permissionKey)));

            if (additionalClaims != null)
            {
                claims.AddRange(additionalClaims);
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(
                    double.Parse(_configuration["JwtSettings:ExpirationMinutes"]!)
                    + ((mustResetPassword ?? user.RequirePasswordReset) ? 30 : 0)
                ),
                Issuer = _configuration["JwtSettings:Issuer"],
                Audience = _configuration["JwtSettings:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public string GenerateRefreshToken()
        {
            var randomBytes = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            return Convert.ToBase64String(randomBytes);
        }

        public ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_configuration["JwtSettings:SecretKey"]!);

                var tokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _configuration["JwtSettings:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = _configuration["JwtSettings:Audience"],
                    ValidateLifetime = false,
                    ClockSkew = TimeSpan.Zero
                };

                var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken validatedToken);

                if (validatedToken is not JwtSecurityToken jwtToken ||
                    !jwtToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                {
                    return null;
                }

                return principal;
            }
            catch (SecurityTokenException ex)
            {
                _logger.LogWarning(ex, "Expired token validation failed");
                return null;
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid expired token format");
                return null;
            }
        }

        public ClaimsPrincipal? ValidateToken(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_configuration["JwtSettings:SecretKey"]!);

                var tokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _configuration["JwtSettings:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = _configuration["JwtSettings:Audience"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken validatedToken);
                return principal;
            }
            catch (SecurityTokenException ex)
            {
                _logger.LogWarning(ex, "Token validation failed");
                return null;
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid token format");
                return null;
            }
        }
    }
}
