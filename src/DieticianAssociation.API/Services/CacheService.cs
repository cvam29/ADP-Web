namespace DieticianAssociation.API.Services
{
    public class CacheService(
        IMemoryCache memoryCache,
        ILogger<CacheService> logger) : ICacheService
    {
        private readonly IMemoryCache _memoryCache = memoryCache;
        private readonly ILogger<CacheService> _logger = logger;
        private readonly TimeSpan _defaultExpiration = TimeSpan.FromMinutes(30);

        public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default) where T : class
        {
            try
            {
                if (_memoryCache.TryGetValue(key, out var cachedValue))
                {
                    if (cachedValue is byte[] compressedData)
                    {
                        // Decompress and deserialize
                        var json = await DecompressAsync(compressedData);
                        return JsonSerializer.Deserialize<T>(json);
                    }
                    else if (cachedValue is T directValue)
                    {
                        return directValue;
                    }
                }

                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving cache value for key: {Key}", key);
                return null;
            }
        }

        public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default) where T : class
        {
            try
            {
                var expirationTime = expiration ?? _defaultExpiration;

                // Serialize and compress the value
                var json = JsonSerializer.Serialize(value);
                var compressedData = await CompressAsync(json);

                var cacheEntryOptions = new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = expirationTime,
                    SlidingExpiration = TimeSpan.FromMinutes(10), // Reset expiration if accessed within 10 minutes
                    Priority = CacheItemPriority.Normal
                };

                _memoryCache.Set(key, compressedData, cacheEntryOptions);

                _logger.LogDebug("Cached value for key: {Key} with expiration: {Expiration}", key, expirationTime);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting cache value for key: {Key}", key);
            }
        }

        public Task RemoveAsync(string key, CancellationToken cancellationToken = default)
        {
            try
            {
                _memoryCache.Remove(key);
                _logger.LogDebug("Removed cache entry for key: {Key}", key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing cache value for key: {Key}", key);
            }

            return Task.CompletedTask;
        }

        public Task RemoveByPatternAsync(string pattern, CancellationToken cancellationToken = default)
        {
            // Note: Memory cache doesn't support pattern-based removal easily
            // This is a simplified implementation
            _logger.LogWarning("Pattern-based cache removal not supported with IMemoryCache. Pattern: {Pattern}", pattern);
            return Task.CompletedTask;
        }

        public string GenerateKey(string prefix, params string[] identifiers)
        {
            var keyParts = new List<string> { prefix };
            keyParts.AddRange(identifiers.Where(id => !string.IsNullOrEmpty(id)));
            return string.Join(":", keyParts);
        }

        private static async Task<byte[]> CompressAsync(string data)
        {
            var bytes = Encoding.UTF8.GetBytes(data);

            using var outputStream = new MemoryStream();
            using (var gzipStream = new GZipStream(outputStream, CompressionLevel.Optimal))
            {
                await gzipStream.WriteAsync(bytes);
            }

            return outputStream.ToArray();
        }

        private static async Task<string> DecompressAsync(byte[] compressedData)
        {
            using var inputStream = new MemoryStream(compressedData);
            using var gzipStream = new GZipStream(inputStream, CompressionMode.Decompress);
            using var outputStream = new MemoryStream();

            await gzipStream.CopyToAsync(outputStream);
            return Encoding.UTF8.GetString(outputStream.ToArray());
        }

        public int GetOrCreateVersion(string key)
        {
            if (!_memoryCache.TryGetValue(key, out int version))
            {
                version = 1;
                _memoryCache.Set(key, version);
            }

            return version;
        }

        public void IncrementVersion(string key)
        {
            var version = GetOrCreateVersion(key) + 1;
            _memoryCache.Set(key, version);

            _logger.LogInformation("Cache version incremented: {Key} → v{Version}", key, version);
        }

    }
}