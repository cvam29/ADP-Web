namespace DieticianAssociation.API.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationDbContext(this IServiceCollection services, IConfiguration configuration)
        {
            var dbConnectionString = Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING")
                ?? configuration.GetConnectionString("DefaultConnection");

            // Configure Npgsql to handle DateTime properly
            AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

            services.AddDbContextPool<ApplicationDbContext>(options =>
                options.UseNpgsql(dbConnectionString));

            return services;
        }

        public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
        {
            var jwtSettings = configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"];

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings["Issuer"],
                    ValidAudience = jwtSettings["Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!)),
                    ClockSkew = TimeSpan.Zero
                };
            });

            services.AddAuthorization();
            services.AddHttpContextAccessor();
            services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();
            services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
            return services;
        }

        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            // Core Services
            services.AddScoped<IJwtService, JwtService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IMembershipService, MembershipService>();
            services.AddScoped<IPermissionService, PermissionService>();
            services.AddScoped<IBlogService, BlogService>();
            services.AddScoped<ITestimonialService, TestimonialService>();
            services.AddScoped<IEventService, EventService>();
            services.AddScoped<IResourceService, ResourceService>();
            services.AddScoped<IContactService, ContactService>();


            // User management service
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<ICertificateService, CertificateService>();
            services.AddScoped<ICalendarService, CalendarService>();
            services.AddScoped<IEmailTemplateService, EmailTemplateService>();
            services.AddScoped<ISmtpEmailClient, SmtpEmailClient>();
            services.AddScoped<ITemplateEmailSendService, TemplateEmailSendService>();
            services.AddScoped<IDirectEmailSendService, DirectEmailSendService>();
            services.AddScoped<IImapEmailService, ImapEmailService>();

            // Education service
            services.AddScoped<IEducationService, EducationService>();

            // Blob storage service
            services.AddSingleton<IBlobStorageService, BlobStorageService>();

            // Cache service
            services.AddScoped<ICacheService, Services.CacheService>();

            return services;
        }

        public static IServiceCollection AddSwaggerDocumentation(this IServiceCollection services)
        {
            services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo { Title = "Dietician Association API", Version = "v1" });

                // 🔐 Define JWT Bearer scheme
                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Enter JWT token in the format: Bearer {your token}"
                });

                // ✅ Add security requirement
                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Id = "Bearer",
                                Type = ReferenceType.SecurityScheme
                            }
                        },
                        Array.Empty<string>()
                    }
                });

                // 📁 Configure file upload support
                options.MapType<IFormFile>(() => new OpenApiSchema
                {
                    Type = "string",
                    Format = "binary"
                });

                // make Swagger schema use EnumMember values
                options.SchemaFilter<EnumSchemaFilter>();
                options.UseInlineDefinitionsForEnums();
            });

            return services;
        }

        public static IServiceCollection AddCustomCors(this IServiceCollection services, IWebHostEnvironment environment)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.WithOrigins(
                            "http://localhost:3000",
                            "https://localhost:3000",
                            "http://localhost:3001",
                            "https://localhost:3001",
                            "http://localhost:8080",
                            "https://localhost:8080",
                            "http://127.0.0.1:3000",
                            "http://127.0.0.1:3001",
                            "http://127.0.0.1:8080",
                            "https://www.adp.org.in",
                            "https://adp.org.in"
                          )
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });

                // Add a more permissive policy for development
                if (environment.IsDevelopment())
                {
                    options.AddPolicy("Development", policy =>
                    {
                        policy.AllowAnyOrigin()
                              .AllowAnyHeader()
                              .AllowAnyMethod();
                    });
                }
            });

            return services;
        }

        public static IServiceCollection AddHealthAndCaching(this IServiceCollection services)
        {
            // Add Health Checks
            services.AddHealthChecks();

            // Add Memory Cache for caching
            services.AddMemoryCache();

            return services;
        }

        private static readonly string[] configureOptions = new[]
                {
                    "application/json",
                    "text/json",
                    "text/plain",
                    "text/html",
                    "text/css",
                    "application/javascript",
                    "text/javascript",
                    "application/xml",
                    "text/xml"
                };

        public static IServiceCollection AddResponseCompressionServices(this IServiceCollection services)
        {
            // Add Response Compression
            services.AddResponseCompression(options =>
            {
                options.EnableForHttps = true;
                options.Providers.Add<GzipCompressionProvider>();
                options.Providers.Add<BrotliCompressionProvider>();
                options.MimeTypes = configureOptions;
            });

            services.Configure<GzipCompressionProviderOptions>(options =>
            {
                options.Level = CompressionLevel.Optimal;
            });

            services.Configure<BrotliCompressionProviderOptions>(options =>
            {
                options.Level = CompressionLevel.Optimal;
            });

            return services;
        }

        public static IServiceCollection AddLocalizationServices(this IServiceCollection services)
        {
            // Configure localization for India
            services.Configure<RequestLocalizationOptions>(options =>
            {
                var supportedCultures = new[] { new CultureInfo("en-IN") };
                options.DefaultRequestCulture = new RequestCulture("en-IN");
                options.SupportedCultures = supportedCultures;
                options.SupportedUICultures = supportedCultures;
            });

            return services;
        }

        public static IServiceCollection AddSignalRServices(this IServiceCollection services)
        {
            // Add SignalR for real-time notifications
            services.AddSignalR();

            return services;
        }

        public static IServiceCollection AddRoutingConfiguration(this IServiceCollection services)
        {
            // Configure routing options for lowercase URLs
            services.Configure<RouteOptions>(options =>
            {
                options.LowercaseUrls = true;
                options.LowercaseQueryStrings = true;
            });

            return services;
        }
    }

    public static class ApplicationBuilderExtensions
    {
        public static IApplicationBuilder UseSwaggerDocumentation(this IApplicationBuilder app)
        {
            app.UseSwagger();
            app.UseSwaggerUI(options =>
            {
                options.SwaggerEndpoint("/swagger/v1/swagger.json", "Dietician Association API v1");
                options.RoutePrefix = "swagger";
                options.DocumentTitle = "Dietician Association API Docs";
            });

            return app;
        }

        public static IApplicationBuilder UseGlobalExceptionHandling(this IApplicationBuilder app)
        {
            app.UseMiddleware<GlobalExceptionMiddleware>();
            return app;
        }

        public static IApplicationBuilder UseCustomCors(this IApplicationBuilder app, IWebHostEnvironment environment)
        {
            // Use appropriate CORS policy based on environment
            if (environment.IsDevelopment())
            {
                app.UseCors("Development");
            }
            else
            {
                app.UseCors("AllowFrontend");
            }

            return app;
        }

        public static IApplicationBuilder UseLocalization(this IApplicationBuilder app)
        {
            // Configure localization
            app.UseRequestLocalization();
            return app;
        }

        public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app)
        {
            app.UseHttpsRedirection();

            app.Use(async (context, next) =>
            {
                context.Response.Headers.XContentTypeOptions = "nosniff";
                context.Response.Headers.XFrameOptions = "DENY";
                context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
                context.Response.Headers.XXSSProtection = "0";
                context.Response.Headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
                context.Response.Headers.StrictTransportSecurity = "max-age=31536000; includeSubDomains";
                context.Response.Headers.ContentSecurityPolicy = "default-src 'none'; frame-ancestors 'none'";
                context.Response.Headers.Remove("Server");
                await next(context);
            });

            return app;
        }

        public static IApplicationBuilder UseCompressionMiddleware(this IApplicationBuilder app)
        {
            // Add response compression (should be early in pipeline)
            app.UseResponseCompression();
            return app;
        }
    }
}
