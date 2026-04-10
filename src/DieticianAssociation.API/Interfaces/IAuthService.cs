namespace DieticianAssociation.API.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto?> LoginAsync(LoginRequestDto loginRequest, CancellationToken cancellationToken = default);
        Task<AuthResponseDto?> RegisterAsync(RegisterRequestDto registerRequest, CancellationToken cancellationToken = default);
        Task<bool> ChangePasswordAsync(string userId, ChangePasswordDto changePassword, CancellationToken cancellationToken = default);
        Task<AuthResponseDto?> ViewAsAsync(string adminUserId, string targetUserId, CancellationToken cancellationToken = default);
        Task<AuthResponseDto?> RefreshTokenAsync(RefreshTokenRequestDto request, CancellationToken cancellationToken = default);
    }
}
