

namespace DieticianAssociation.API.Interfaces
{
    public interface IUserService
    {
        // CRUD Operations
        Task<PagedResult<UserDto>> GetAllUsersAsync(PagedRequest request, bool includeDeleted = false, CancellationToken cancellationToken = default);
        Task<UserDto?> GetUserByIdAsync(string userId, CancellationToken cancellationToken = default);
        Task<UserDto?> GetUserByEmailAsync(string email, CancellationToken cancellationToken = default);
        Task<UserDto?> CreateUserAsync(CreateUserDto createUser, CancellationToken cancellationToken = default);
        Task<UserDto?> UpdateUserAsync(string userId, UpdateUserDto updateUser, CancellationToken cancellationToken = default);
        Task<bool> SetTemporaryPasswordAsync(string userId, SetTemporaryPasswordDto request, CancellationToken cancellationToken = default);

        // Export Operations
        Task<byte[]> ExportUsersToExcelAsync(CancellationToken cancellationToken = default);
        Task<string> ExportUsersToCsvAsync(CancellationToken cancellationToken = default);
        Task<UserDetailDto?> GetUserDetailByIdAsync(string userId, CancellationToken cancellationToken = default);
        Task<UserDto?> UpdateUserMembershipAsync(string userId, UpdateMembershipDto updateMembershi, CancellationToken cancellationToken = default);
        Task<PaymentDetailDto?> UpdatePaymentStatusAsync(Guid paymentId, UpdatePaymentStatusDto updateDto, CancellationToken cancellationToken = default);
    }
}
