namespace DieticianAssociation.API.Services
{
    public interface IBlobStorageService
    {
        Task<bool> DeleteFileAsync(string fileName, CancellationToken cancellationToken = default);
        Task<Stream> DownloadFileAsync(string fileName, CancellationToken cancellationToken = default);
        Task<string> UploadFileAsync(IFormFile file, string folderName, CancellationToken cancellationToken = default);
    }

    public partial class BlobStorageService : IBlobStorageService
    {
        private readonly BlobContainerClient _containerClient;

        public BlobStorageService(IConfiguration configuration)
        {
            var connectionString = configuration["AzureBlobStorage:ConnectionString"];
            var containerName = configuration["AzureBlobStorage:ContainerName"];
            _containerClient = new BlobContainerClient(connectionString, containerName);
            //_containerClient.CreateIfNotExists(PublicAccessType.Blob);
        }

        public async Task<string> UploadFileAsync(IFormFile file, string folder, CancellationToken cancellationToken = default)
        {
            folder = SanitizeFolderName(folder);
            var blobName = $"{folder}/{file.FileName}";
            var blobClient = _containerClient.GetBlobClient(blobName);

            using (var stream = file.OpenReadStream())
            {
                await blobClient.UploadAsync(stream, overwrite: true, cancellationToken: cancellationToken);
            }

            return blobClient.Uri.ToString(); // Return the public URL
        }



        public async Task<Stream> DownloadFileAsync(string fileName, CancellationToken cancellationToken = default)
        {
            var blobClient = _containerClient.GetBlobClient(fileName);
            var response = await blobClient.DownloadAsync(cancellationToken);
            return response.Value.Content;
        }

        public async Task<bool> DeleteFileAsync(string fileName, CancellationToken cancellationToken = default)
        {
            var blobClient = _containerClient.GetBlobClient(fileName);
            return await blobClient.DeleteIfExistsAsync(cancellationToken: cancellationToken);
        }

        private static string SanitizeFolderName(string folder)
        {
            if (string.IsNullOrWhiteSpace(folder))
                return "default";

            // Trim leading/trailing whitespace and slashes
            folder = folder.Trim().Trim('/');

            // Replace invalid characters with dash
            var invalidChars = MyRegex();
            folder = invalidChars.Replace(folder, "-");

            // Optionally remove multiple consecutive slashes
            folder = Regex.Replace(folder, "/{2,}", "/");

            return folder;
        }

        [GeneratedRegex(@"[^a-zA-Z0-9_\-/]")]
        private static partial Regex MyRegex();
    }
}
