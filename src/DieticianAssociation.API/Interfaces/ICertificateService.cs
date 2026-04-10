namespace DieticianAssociation.API.Interfaces;

public interface ICertificateService
{
    Task<List<CertificateDto>> GetUserCertificatesAsync(string userId, CancellationToken cancellationToken = default);
    Task<CertificateDto?> ValidateCertificateAsync(string certificateNumber, CancellationToken cancellationToken = default);
}
