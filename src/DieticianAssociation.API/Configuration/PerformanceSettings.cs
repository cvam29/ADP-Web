namespace DieticianAssociation.API.Configuration;

/// <summary>
/// Cache configuration settings
/// </summary>
public class CacheSettings
{
    public const string SectionName = "Cache";

    /// <summary>
    /// Default cache duration in minutes
    /// </summary>
    public int DefaultDurationMinutes { get; set; } = 15;

    /// <summary>
    /// Blog posts cache duration in minutes
    /// </summary>
    public int BlogPostsDurationMinutes { get; set; } = 30;

    /// <summary>
    /// Events cache duration in minutes
    /// </summary>
    public int EventsDurationMinutes { get; set; } = 60;

    /// <summary>
    /// Testimonials cache duration in minutes
    /// </summary>
    public int TestimonialsDurationMinutes { get; set; } = 30;

    /// <summary>
    /// Resources cache duration in minutes
    /// </summary>
    public int ResourcesDurationMinutes { get; set; } = 120;

    /// <summary>
    /// Maximum cache size in MB
    /// </summary>
    public int MaxSizeMB { get; set; } = 100;

    /// <summary>
    /// Enable distributed caching (Redis)
    /// </summary>
    public bool EnableDistributedCache { get; set; } = false;

    /// <summary>
    /// Redis connection string
    /// </summary>
    public string? RedisConnectionString { get; set; }

    /// <summary>
    /// Enable compression for cached data
    /// </summary>
    public bool EnableCompression { get; set; } = true;

    public string BlogVersion = "blog:version";
    public string TestimonialVersion = "testimonial:version";

}

/// <summary>
/// Compression configuration settings
/// </summary>
public class CompressionSettings
{
    public const string SectionName = "Compression";

    /// <summary>
    /// Enable Gzip compression
    /// </summary>
    public bool EnableGzip { get; set; } = true;

    /// <summary>
    /// Enable Brotli compression
    /// </summary>
    public bool EnableBrotli { get; set; } = true;

    /// <summary>
    /// Compression level (0-9)
    /// </summary>
    public int CompressionLevel { get; set; } = 6;

    /// <summary>
    /// Minimum response size to compress (bytes)
    /// </summary>
    public int MinimumSizeBytes { get; set; } = 1024;

    /// <summary>
    /// MIME types to compress
    /// </summary>
    public string[] MimeTypes { get; set; } =
    [
        "application/json",
        "application/xml",
        "text/plain",
        "text/html",
        "text/css",
        "text/javascript",
        "application/javascript",
        "image/svg+xml"
    ];
}
