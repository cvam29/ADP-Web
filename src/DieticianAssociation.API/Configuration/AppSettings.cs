namespace DieticianAssociation.API.Configuration
{
    public class JwtSettings
    {
        public string SecretKey { get; set; } = string.Empty;
        public string Issuer { get; set; } = string.Empty;
        public string Audience { get; set; } = string.Empty;
        public int ExpirationMinutes { get; set; }
    }

    public class CorsSettings
    {
        public string[] AllowedOrigins { get; set; } = [];
        public string[] AllowedMethods { get; set; } = [];
        public string[] AllowedHeaders { get; set; } = [];
        public bool AllowCredentials { get; set; }
    }

    public class DatabaseSettings
    {
        public string DefaultConnection { get; set; } = string.Empty;
        public bool EnableSensitiveDataLogging { get; set; }
        public int CommandTimeout { get; set; } = 30;
    }

    public class ApiSettings
    {
        public string Version { get; set; } = "v1";
        public string Title { get; set; } = "Dietician Association API";
        public string Description { get; set; } = "Backend API for Dietician Association application";
        public bool EnableSwagger { get; set; } = true;
    }

    public class AzureBlobStorageSettings
    {
        public string ConnectionString { get; set; } = string.Empty;
        public string ContainerName { get; set; } = string.Empty;
    }
}
