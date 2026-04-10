namespace DieticianAssociation.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MediaController : ControllerBase
    {
        private readonly IBlobStorageService _blobStorageService;
        private readonly BlobContainerClient _containerClient;
        private readonly ILogger<MediaController> _logger;

        public MediaController(IBlobStorageService blobStorageService, IConfiguration configuration, ILogger<MediaController> logger)
        {
            _blobStorageService = blobStorageService;
            _logger = logger;

            var connectionString = configuration["AzureBlobStorage:ConnectionString"];
            var containerName = configuration["AzureBlobStorage:ContainerName"];
            _containerClient = new BlobContainerClient(connectionString, containerName);
        }

        private string BuildPreviewUrl(string fileName)
        {
            return $"{Request.Scheme}://{Request.Host}/api/media/file/{Uri.EscapeDataString(fileName)}";
        }

        private string BuildDownloadUrl(string fileName)
        {
            return $"{Request.Scheme}://{Request.Host}/api/media/download/{Uri.EscapeDataString(fileName)}";
        }

        /// <summary>
        /// Get all media files from blob storage
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin,SuperAdmin")]
        [ProducesResponseType(typeof(PagedResult<MediaFileDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllMedia(
            [FromQuery] string? folder = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken cancellationToken = default)
        {
            var blobs = new List<MediaFileDto>();

            await foreach (BlobItem blobItem in _containerClient.GetBlobsAsync(prefix: folder, cancellationToken: cancellationToken))
            {
                var blobClient = _containerClient.GetBlobClient(blobItem.Name);
                var properties = await blobClient.GetPropertiesAsync(cancellationToken: cancellationToken);

                blobs.Add(new MediaFileDto
                {
                    Name = blobItem.Name,
                    FileName = Path.GetFileName(blobItem.Name),
                    Folder = Path.GetDirectoryName(blobItem.Name)?.Replace("\\", "/") ?? "",
                    Url = BuildPreviewUrl(blobItem.Name),
                    Size = properties.Value.ContentLength,
                    ContentType = properties.Value.ContentType,
                    LastModified = properties.Value.LastModified.DateTime,
                    CreatedOn = blobItem.Properties.CreatedOn?.DateTime ?? DateTime.UtcNow
                });
            }

            var totalCount = blobs.Count;
            var paginatedBlobs = blobs
                .OrderByDescending(b => b.CreatedOn)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var response = new PagedResult<MediaFileDto>
            {
                Items = paginatedBlobs,
                TotalItems = totalCount,
                Page = page,
                PageSize = pageSize
            };

            return Ok(response);
        }

        /// <summary>
        /// Upload a new media file
        /// </summary>
        [HttpPost("upload")]
        [Authorize]
        [ProducesResponseType(typeof(MediaUploadResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UploadMedia([FromForm] MediaUploadDto uploadDto, CancellationToken cancellationToken)
        {
            if (uploadDto.File == null || uploadDto.File.Length == 0)
                return BadRequest(new MessageResponseDto { Message = "No file provided." });

            const long maxFileSize = 10 * 1024 * 1024;
            if (uploadDto.File.Length > maxFileSize)
                return BadRequest(new MessageResponseDto { Message = "File size exceeds 10MB limit." });

            var allowedTypes = new[] {
                "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/bmp", "image/tiff",
                "video/mp4", "video/webm", "video/avi", "video/mov", "video/wmv", "video/flv",
                "application/pdf", "text/plain", "text/csv", "application/rtf",
                "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                "application/zip", "application/x-rar-compressed", "application/x-7z-compressed",
                "application/json", "application/xml", "text/xml", "text/html", "text/css", "text/javascript"
            };

            if (!allowedTypes.Contains(uploadDto.File.ContentType))
                return BadRequest(new MessageResponseDto { Message = "File type not allowed." });

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var isAdmin = string.Equals(role, nameof(UserRole.Admin), StringComparison.OrdinalIgnoreCase)
                || string.Equals(role, nameof(UserRole.SuperAdmin), StringComparison.OrdinalIgnoreCase);

            var folder = isAdmin
                ? (string.IsNullOrEmpty(uploadDto.Folder) ? "media" : uploadDto.Folder)
                : $"profile-images/{userId}";

            var fileUrl = await _blobStorageService.UploadFileAsync(uploadDto.File, folder, cancellationToken);

            var response = new MediaUploadResponseDto
            {
                Url = BuildPreviewUrl($"{folder}/{uploadDto.File.FileName}"),
                FileName = uploadDto.File.FileName,
                Folder = folder,
                Size = uploadDto.File.Length,
                ContentType = uploadDto.File.ContentType,
                UploadedAt = DateTime.UtcNow
            };

            return Ok(response);
        }

        /// <summary>
        /// Download a media file
        /// </summary>
        [HttpGet("download/{*fileName}")]
        [ProducesResponseType(typeof(FileStreamResult), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DownloadMedia(string fileName, CancellationToken cancellationToken)
        {
            fileName = Uri.UnescapeDataString(fileName);

            var fileStream = await _blobStorageService.DownloadFileAsync(fileName, cancellationToken);
            if (fileStream == null)
                return NotFound(new MessageResponseDto { Message = "File not found." });

            var blobClient = _containerClient.GetBlobClient(fileName);
            var properties = await blobClient.GetPropertiesAsync(cancellationToken: cancellationToken);

            return File(fileStream, properties.Value.ContentType, Path.GetFileName(fileName));
        }

        /// <summary>
        /// Stream a media file inline for previews and thumbnails
        /// </summary>
        [HttpGet("file/{*fileName}")]
        [ProducesResponseType(typeof(FileStreamResult), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> StreamMedia(string fileName, CancellationToken cancellationToken)
        {
            fileName = Uri.UnescapeDataString(fileName);

            var fileStream = await _blobStorageService.DownloadFileAsync(fileName, cancellationToken);
            if (fileStream == null)
                return NotFound(new MessageResponseDto { Message = "File not found." });

            var blobClient = _containerClient.GetBlobClient(fileName);
            var properties = await blobClient.GetPropertiesAsync(cancellationToken: cancellationToken);

            return File(fileStream, properties.Value.ContentType);
        }

        /// <summary>
        /// Delete a media file
        /// </summary>
        [HttpDelete("{*fileName}")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteMedia(string fileName, CancellationToken cancellationToken)
        {
            var deleted = await _blobStorageService.DeleteFileAsync(fileName, cancellationToken);

            if (!deleted)
                return NotFound(new MessageResponseDto { Message = "File not found." });

            return Ok(new MessageResponseDto { Message = "File deleted successfully." });
        }

        /// <summary>
        /// Get media file info
        /// </summary>
        [HttpGet("info/{*fileName}")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        [ProducesResponseType(typeof(MediaFileDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetMediaInfo(string fileName, CancellationToken cancellationToken)
        {
            var blobClient = _containerClient.GetBlobClient(fileName);
            var exists = await blobClient.ExistsAsync(cancellationToken);

            if (!exists.Value)
                return NotFound(new MessageResponseDto { Message = "File not found." });

            var properties = await blobClient.GetPropertiesAsync(cancellationToken: cancellationToken);

            var response = new MediaFileDto
            {
                Name = fileName,
                FileName = Path.GetFileName(fileName),
                Folder = Path.GetDirectoryName(fileName)?.Replace("\\", "/") ?? "",
                Url = BuildPreviewUrl(fileName),
                Size = properties.Value.ContentLength,
                ContentType = properties.Value.ContentType,
                LastModified = properties.Value.LastModified.DateTime,
                CreatedOn = properties.Value.CreatedOn.DateTime
            };

            return Ok(response);
        }

        /// <summary>
        /// Get all folders in blob storage
        /// </summary>
        [HttpGet("folders")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        [ProducesResponseType(typeof(IEnumerable<string>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetFolders(CancellationToken cancellationToken)
        {
            var folders = new HashSet<string>();

            await foreach (BlobItem blobItem in _containerClient.GetBlobsAsync(cancellationToken: cancellationToken))
            {
                var folder = Path.GetDirectoryName(blobItem.Name)?.Replace("\\", "/");
                if (!string.IsNullOrEmpty(folder))
                {
                    folders.Add(folder);
                }
            }

            return Ok(folders.OrderBy(f => f).ToList());
        }

        /// <summary>
        /// Get folder structure with file counts
        /// </summary>
        [HttpGet("folder-tree")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        [ProducesResponseType(typeof(IEnumerable<MediaFolderDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetFolderTree(CancellationToken cancellationToken)
        {
            var folderInfo = new Dictionary<string, MediaFolderDto>();

            await foreach (BlobItem blobItem in _containerClient.GetBlobsAsync(cancellationToken: cancellationToken))
            {
                var blobClient = _containerClient.GetBlobClient(blobItem.Name);
                var properties = await blobClient.GetPropertiesAsync(cancellationToken: cancellationToken);

                var folder = Path.GetDirectoryName(blobItem.Name)?.Replace("\\", "/") ?? "root";

                if (!folderInfo.TryGetValue(folder, out MediaFolderDto? value))
                {
                    value = new MediaFolderDto
                    {
                        Name = folder,
                        FileCount = 0,
                        TotalSize = 0
                    };
                    folderInfo[folder] = value;
                }

                value.FileCount++;
                value.TotalSize += properties.Value.ContentLength;
            }

            return Ok(folderInfo.Values.OrderBy(f => f.Name).ToList());
        }

        /// <summary>
        /// Create a new folder
        /// </summary>
        [HttpPost("folders")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreateFolder([FromBody] CreateFolderDto createFolderDto, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(createFolderDto.Name))
                return BadRequest(new MessageResponseDto { Message = "Folder name is required." });

            var placeholderName = $"{createFolderDto.Name}/.placeholder";
            var blobClient = _containerClient.GetBlobClient(placeholderName);

            using (var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes("placeholder")))
            {
                await blobClient.UploadAsync(stream, overwrite: true, cancellationToken: cancellationToken);
            }

            return Ok(new MessageResponseDto { Message = $"Folder '{createFolderDto.Name}' created successfully." });
        }

        /// <summary>
        /// Delete a folder and all its contents
        /// </summary>
        [HttpDelete("folders/{*folderName}")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteFolder(string folderName, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(folderName))
                return BadRequest(new MessageResponseDto { Message = "Folder name is required." });

            var deletedCount = 0;

            await foreach (BlobItem blobItem in _containerClient.GetBlobsAsync(prefix: folderName, cancellationToken: cancellationToken))
            {
                var blobClient = _containerClient.GetBlobClient(blobItem.Name);
                await blobClient.DeleteIfExistsAsync(cancellationToken: cancellationToken);
                deletedCount++;
            }

            if (deletedCount == 0)
                return NotFound(new MessageResponseDto { Message = "Folder not found or already empty." });

            return Ok(new MessageResponseDto { Message = $"Folder deleted successfully. {deletedCount} files removed." });
        }

        /// <summary>
        /// Get shareable URL for a media file
        /// </summary>
        [HttpGet("url/{*fileName}")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        [ProducesResponseType(typeof(MediaUrlResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetMediaUrl(string fileName, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(fileName))
                return BadRequest(new MessageResponseDto { Message = "File name is required." });

            fileName = Uri.UnescapeDataString(fileName);

            var blobClient = _containerClient.GetBlobClient(fileName);
            var exists = await blobClient.ExistsAsync(cancellationToken);

            if (!exists.Value)
                return NotFound(new MessageResponseDto { Message = "File not found." });

            var response = new MediaUrlResponseDto
            {
                FileName = fileName,
                Url = BuildPreviewUrl(fileName),
                DirectUrl = blobClient.Uri.ToString(),
                DownloadUrl = BuildDownloadUrl(fileName)
            };

            return Ok(response);
        }


        /// <summary>
        /// Get multiple media file info
        /// </summary>
        [HttpGet("info")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        [ProducesResponseType(typeof(IEnumerable<MediaFileDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetMultipleMediaInfo([FromQuery] string fileNames, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(fileNames))
                return BadRequest(new MessageResponseDto { Message = "No file names provided." });

            var fileNameList = fileNames.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            var result = new List<MediaFileDto>();

            foreach (var fileName in fileNameList)
            {
                var blobClient = _containerClient.GetBlobClient(fileName);
                var exists = await blobClient.ExistsAsync(cancellationToken);

                if (!exists.Value)
                {
                    result.Add(new MediaFileDto
                    {
                        Name = fileName,
                        FileName = Path.GetFileName(fileName),
                        Folder = Path.GetDirectoryName(fileName)?.Replace("\\", "/") ?? "",
                        Size = 0,
                        ContentType = "Not Found"
                    });
                    continue;
                }

                var properties = await blobClient.GetPropertiesAsync(cancellationToken: cancellationToken);

                result.Add(new MediaFileDto
                {
                    Name = fileName,
                    FileName = Path.GetFileName(fileName),
                    Folder = Path.GetDirectoryName(fileName)?.Replace("\\", "/") ?? "",
                    Url = BuildPreviewUrl(fileName),
                    Size = properties.Value.ContentLength,
                    ContentType = properties.Value.ContentType,
                    LastModified = properties.Value.LastModified.DateTime,
                    CreatedOn = properties.Value.CreatedOn.DateTime
                });
            }

            return Ok(result);
        }
    }
}
