namespace DieticianAssociation.API.Interfaces
{
    public interface IJwtService
    {
        Task<string> GenerateTokenAsync(User user, IEnumerable<Claim>? additionalClaims = null, bool? mustResetPassword = null);
        string GenerateRefreshToken();
        ClaimsPrincipal? ValidateToken(string token);
        ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
    }
}
