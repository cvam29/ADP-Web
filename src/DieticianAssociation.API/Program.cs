var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers(options =>
{
    options.Conventions.Add(
        new RouteTokenTransformerConvention(new LowercaseParameterTransformer()));
}).AddJsonOptions(options =>
{
    // Default: numeric enums
}); ;

// Configure routing options for lowercase URLs
builder.Services.Configure<RouteOptions>(options =>
{
    options.LowercaseUrls = true;
    options.LowercaseQueryStrings = true;
});

builder.Services.AddEndpointsApiExplorer();

// Configure routing
builder.Services.AddRoutingConfiguration();

// Add Swagger documentation
builder.Services.AddSwaggerDocumentation();

// Add Health Checks and Memory Cache
builder.Services.AddHealthAndCaching();

// Add Response Compression
builder.Services.AddResponseCompressionServices();

// Add Database Configuration
builder.Services.AddApplicationDbContext(builder.Configuration);

// Add JWT Authentication
builder.Services.AddJwtAuthentication(builder.Configuration);

// Add CORS Configuration
builder.Services.AddCustomCors(builder.Environment);

// Add Localization
builder.Services.AddLocalizationServices();

// Add SignalR
builder.Services.AddSignalRServices();

// Register all application services
builder.Services.AddApplicationServices();

var app = builder.Build();

// Forward headers from Azure reverse proxy (correct scheme/IP)
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedFor |
                       Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedProto
});

// Configure the HTTP request pipeline.
app.UseSwaggerDocumentation();

// Add global exception handling
app.UseGlobalExceptionHandling();

// Add response compression (should be early in pipeline)
app.UseCompressionMiddleware();

// Security headers
app.UseSecurityHeaders();

// Configure localization
app.UseLocalization();

// Use appropriate CORS policy based on environment
app.UseCustomCors(app.Environment);

// Add Hangfire dashboard (temporarily disabled for testing)
// app.UseHangfireDashboard("/hangfire", new DashboardOptions
// {
//     Authorization = new[] { new HangfireAuthorizationFilter() }
// });

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Map Health Check endpoints
app.MapHealthChecks("/health");

// Create database and apply migrations
// Create database and apply migrations
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    var env = scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>();

    try
    {
        // Apply pending migrations automatically
        var pendingMigrations = await context.Database.GetPendingMigrationsAsync();

        if (pendingMigrations.Any())
        {
            logger.LogInformation("Applying {Count} pending migrations...", pendingMigrations.Count());
            foreach (var migration in pendingMigrations)
            {
                logger.LogInformation("Pending migration: {Migration}", migration);
            }

            await context.Database.MigrateAsync();
            logger.LogInformation("✅ All pending migrations applied successfully.");
        }
        else
        {
            logger.LogInformation("✅ No pending migrations. Database schema is up to date.");
        }

        // Just check if we can connect to the database
        try
        {
            await context.Database.CanConnectAsync();
            logger.LogInformation("Database connection successful.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to connect to database.");
        }

        // ✅ Use UserSeeder here instead of inline admin user creation
        logger.LogInformation("Seeding default users (SuperAdmin, Admin, Student) if not exist...");

        //await UserSeeder.Seed(context);
        logger.LogInformation("User seeding completed.");

        logger.LogInformation("Seeding permission catalog and default permission assignments...");
        await PermissionSeeder.SeedAsync(context, logger);
        logger.LogInformation("Permission seeding completed.");

        //Geo seeder
        //
        logger.LogInformation("Seeding GeoSeeder");

        await GeoSeeder.SeedAsync(context, env, logger);

        logger.LogInformation("Geo seeding completed.");


    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while initializing the database.");

        if (!app.Environment.IsDevelopment())
        {
            logger.LogError(ex, "An error occurred while initializing the database.");
        }
    }
}

if (app.Environment.IsDevelopment())
{
    try
    {
        var swaggerGen = app.Services.GetRequiredService<ISwaggerProvider>();
        var swaggerDoc = swaggerGen.GetSwagger("v1"); // "v1" must match your SwaggerDoc name

        var filePath = Path.GetFullPath(
            Path.Combine(AppContext.BaseDirectory, @"..\..\..\..\DieticianAssociation.Client\openapi.json")
        );

        Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);

        using (var writer = new StreamWriter(filePath))
        {
            var jsonWriter = new Microsoft.OpenApi.Writers.OpenApiJsonWriter(writer);
            swaggerDoc.SerializeAsV3(jsonWriter);
        }

        Console.WriteLine($"✅ OpenAPI spec exported to {filePath}");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"⚠️ Failed to export OpenAPI spec: {ex.Message}");
    }
}

app.Run();
