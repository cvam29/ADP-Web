using DieticianAssociation.API.Constants;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace DieticianAssociation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ResourcesController(IResourceService resourceService, IBlobStorageService blobStorageService) : ControllerBase
{
    private readonly IResourceService _resourceService = resourceService;
    private readonly IBlobStorageService _blobStorageService = blobStorageService;
    private static readonly JsonSerializerOptions StreamJsonOptions = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    [HttpPost("paginated")]
    [Authorize]
    [ProducesResponseType(typeof(PagedResult<ResourceDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PagedResult<ResourceDto>>> GetPaginatedResources([FromBody] PagedRequest request, CancellationToken cancellationToken)
    {
        var result = await _resourceService.GetPaginatedResourcesAsync(request, cancellationToken);
        return Ok(result);
    }

    [HttpGet("stream")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task StreamResources(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? search = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortDirection = null,
        CancellationToken cancellationToken = default)
    {
        var request = new PagedRequest
        {
            Page = page,
            PageSize = pageSize,
            Search = search,
            SortBy = sortBy,
            SortDirection = string.IsNullOrWhiteSpace(sortDirection) ? "desc" : sortDirection
        };

        Response.StatusCode = StatusCodes.Status200OK;
        Response.ContentType = "application/x-ndjson";
        Response.Headers["Cache-Control"] = "no-cache, no-transform";
        Response.Headers["X-Accel-Buffering"] = "no";

        var pageInfo = await _resourceService.GetResourceStreamPageInfoAsync(request, cancellationToken);
        await WriteStreamMessageAsync(new { type = "meta", pageInfo }, cancellationToken);

        await foreach (var resource in _resourceService.StreamResourcesAsync(request, cancellationToken))
        {
            await WriteStreamMessageAsync(new { type = "item", item = resource }, cancellationToken);
        }
    }

    [HttpPost("public/free/paginated")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PagedResult<ResourceDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PagedResult<ResourceDto>>> GetPaginatedFreeResources([FromBody] PagedRequest request, CancellationToken cancellationToken)
    {
        var result = await _resourceService.GetPaginatedFreeResourcesAsync(request, cancellationToken);
        return Ok(result);
    }

    [HttpGet("public/free/stream")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task StreamFreeResources(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? search = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortDirection = null,
        CancellationToken cancellationToken = default)
    {
        var request = new PagedRequest
        {
            Page = page,
            PageSize = pageSize,
            Search = search,
            SortBy = sortBy,
            SortDirection = string.IsNullOrWhiteSpace(sortDirection) ? "desc" : sortDirection
        };

        Response.StatusCode = StatusCodes.Status200OK;
        Response.ContentType = "application/x-ndjson";
        Response.Headers["Cache-Control"] = "no-cache, no-transform";
        Response.Headers["X-Accel-Buffering"] = "no";

        var pageInfo = await _resourceService.GetFreeResourceStreamPageInfoAsync(request, cancellationToken);
        await WriteStreamMessageAsync(new { type = "meta", pageInfo }, cancellationToken);

        await foreach (var resource in _resourceService.StreamFreeResourcesAsync(request, cancellationToken))
        {
            await WriteStreamMessageAsync(new { type = "item", item = resource }, cancellationToken);
        }
    }

    // Removed non-paginated list endpoints to standardize on POST paginated pattern

    [HttpGet("{id}")]
    [Authorize]
    [ProducesResponseType(typeof(ResourceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ResourceDto>> GetResource(string id, CancellationToken cancellationToken)
    {
        var resource = await _resourceService.GetResourceByIdAsync(id, cancellationToken);
        if (resource == null)
            return NotFound(new ErrorResponseDto { Message = "Resource not found." });

        return Ok(resource);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,SuperAdmin")]
    [HasPermission(PermissionKeys.ResourcesCreate)]
    [ProducesResponseType(typeof(ResourceDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ResourceDto>> CreateResource([FromBody] CreateResourceDto createResource, CancellationToken cancellationToken)
    {
        var resource = await _resourceService.CreateResourceAsync(createResource, cancellationToken);
        return CreatedAtAction(nameof(GetResource), new { id = resource!.Id }, resource);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    [HasPermission(PermissionKeys.ResourcesUpdate)]
    [ProducesResponseType(typeof(ResourceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ResourceDto>> UpdateResource(string id, [FromBody] CreateResourceDto updateResource, CancellationToken cancellationToken)
    {
        var resource = await _resourceService.UpdateResourceAsync(id, updateResource, cancellationToken);
        if (resource == null)
            return NotFound(new ErrorResponseDto { Message = "Resource not found." });

        return Ok(resource);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    [HasPermission(PermissionKeys.ResourcesDelete)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteResource(string id, CancellationToken cancellationToken)
    {
        var success = await _resourceService.DeleteResourceAsync(id, cancellationToken);
        if (!success)
            return NotFound(new ErrorResponseDto { Message = "Resource not found." });

        return NoContent();
    }

    [HttpPost("{id}/download")]
    [Authorize]
    [ProducesResponseType(typeof(MessageResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DownloadResource(string id, CancellationToken cancellationToken)
    {
        var success = await _resourceService.IncrementDownloadAsync(id, cancellationToken);
        if (!success)
            return NotFound(new ErrorResponseDto { Message = "Resource not found." });

        return Ok(new MessageResponseDto { Message = "Download count incremented." });
    }

    [HttpGet("{id}/file")]
    [Authorize]
    [ProducesResponseType(typeof(FileStreamResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> GetResourceFile(string id, CancellationToken cancellationToken)
    {
        var resource = await _resourceService.GetResourceByIdAsync(id, cancellationToken);
        if (resource == null)
            return NotFound(new ErrorResponseDto { Message = "Resource not found." });

        if (string.IsNullOrEmpty(resource.DownloadUrl))
            return NotFound(new ErrorResponseDto { Message = "No file associated with this resource." });

        var fileName = ExtractFileNameFromUrl(resource.DownloadUrl);
        if (string.IsNullOrEmpty(fileName))
            return BadRequest(new ErrorResponseDto { Message = "Invalid file URL." });

        var fileStream = await _blobStorageService.DownloadFileAsync(fileName);
        var contentType = GetContentType(fileName);

        await _resourceService.IncrementDownloadAsync(id, cancellationToken);

        return File(fileStream, contentType, Path.GetFileName(fileName));
    }

    [HttpGet("public/free/{id}/download")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(FileStreamResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DownloadFreeResource(string id, CancellationToken cancellationToken)
    {
        var resource = await _resourceService.GetResourceByIdAsync(id, cancellationToken);
        if (resource == null)
            return NotFound(new ErrorResponseDto { Message = "Resource not found." });

        if (resource.Premium)
            return Unauthorized(new ErrorResponseDto { Message = "This is a premium resource. Please login to access." });

        if (string.IsNullOrEmpty(resource.DownloadUrl))
            return NotFound(new ErrorResponseDto { Message = "No file associated with this resource." });

        var fileName = ExtractFileNameFromUrl(resource.DownloadUrl);
        if (string.IsNullOrEmpty(fileName))
            return BadRequest(new ErrorResponseDto { Message = "Invalid file URL." });

        var fileStream = await _blobStorageService.DownloadFileAsync(fileName);
        var contentType = GetContentType(fileName);

        return File(fileStream, contentType, Path.GetFileName(fileName));
    }

    [HttpPost("upload")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    [HasPermission(PermissionKeys.ResourcesUpload)]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> UploadResourceFile([FromForm] FileUploadDto uploadDto, CancellationToken cancellationToken)
    {
        if (uploadDto.File == null || uploadDto.File.Length == 0)
            return BadRequest(new ErrorResponseDto { Message = "No file provided." });

        var folderPath = $"resources/{uploadDto.Category}";
        var fileUrl = await _blobStorageService.UploadFileAsync(uploadDto.File, folderPath, cancellationToken);
        var fileSize = GetHumanReadableFileSize(uploadDto.File.Length);

        return Ok(new
        {
            message = "File uploaded successfully.",
            fileUrl,
            fileName = uploadDto.File.FileName,
            fileSize,
            category = uploadDto.Category
        });
    }

    private static string ExtractFileNameFromUrl(string url)
    {
        try
        {
            var uri = new Uri(url);
            var segments = uri.Segments;
            if (segments.Length > 1)
            {
                return string.Join("", segments.Skip(2));
            }
            return string.Empty;
        }
        catch
        {
            return string.Empty;
        }
    }

    private static string GetContentType(string fileName)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        return extension switch
        {
            ".pdf" => "application/pdf",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".xls" => "application/vnd.ms-excel",
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".ppt" => "application/vnd.ms-powerpoint",
            ".pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            ".txt" => "text/plain",
            ".csv" => "text/csv",
            ".zip" => "application/zip",
            ".rar" => "application/x-rar-compressed",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".mp4" => "video/mp4",
            ".mp3" => "audio/mpeg",
            _ => "application/octet-stream"
        };
    }

    private static string GetHumanReadableFileSize(long bytes)
    {
        string[] sizes = ["B", "KB", "MB", "GB", "TB"];
        double len = bytes;
        int order = 0;
        while (len >= 1024 && order < sizes.Length - 1)
        {
            order++;
            len /= 1024;
        }
        return $"{len:0.##} {sizes[order]}";
    }

    private async Task WriteStreamMessageAsync(object payload, CancellationToken cancellationToken)
    {
        var line = JsonSerializer.Serialize(payload, StreamJsonOptions);
        await Response.WriteAsync(line + "\n", cancellationToken);
        await Response.Body.FlushAsync(cancellationToken);
    }
}

