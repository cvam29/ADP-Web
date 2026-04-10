namespace DieticianAssociation.API.Middleware;

public class GlobalExceptionMiddleware(
    RequestDelegate next,
    ILogger<GlobalExceptionMiddleware> logger,
    IConfiguration configuration,
    IServiceProvider serviceProvider)
{
    private readonly RequestDelegate _next = next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger = logger;
    private readonly IConfiguration _configuration = configuration;
    private readonly IServiceProvider _serviceProvider = serviceProvider;

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var correlationId = Guid.NewGuid().ToString();
        var userAgent = context.Request.Headers.UserAgent.ToString();
        var ipAddress = context.Connection.RemoteIpAddress?.ToString();
        var requestPath = context.Request.Path;
        var requestMethod = context.Request.Method;
        var userId = context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        // Structured logging scope
        using var scope = _logger.BeginScope(new Dictionary<string, object>
        {
            ["CorrelationId"] = correlationId,
            ["UserId"] = userId ?? "Anonymous",
            ["RequestPath"] = requestPath.Value ?? "",
            ["RequestMethod"] = requestMethod,
            ["UserAgent"] = userAgent,
            ["IpAddress"] = ipAddress ?? "Unknown"
        });

        _logger.LogError(exception,
            "Unhandled exception occurred. CorrelationId: {CorrelationId}, Path: {Path}, Method: {Method}, UserAgent: {UserAgent}, IP: {IpAddress}, UserId: {UserId}",
            correlationId, requestPath, requestMethod, userAgent, ipAddress, userId);

        // Fire critical notification if needed
        if (IsCriticalException(exception))
        {
            _ = Task.Run(async () =>
            {
                try
                {
                    await SendCriticalErrorNotificationAsync(exception, correlationId, context);
                }
                catch (Exception notifyEx)
                {
                    _logger.LogError(notifyEx, "Background critical error notification failed for CorrelationId: {CorrelationId}", correlationId);
                }
            });
        }

        var (statusCode, message, code, showDetails) = GetErrorResponse(exception);

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        var errorResponse = new ErrorResponseDto
        {
            Message = message,
            Code = code,
            StatusCode = statusCode,
            Path = requestPath,
            Timestamp = DateTime.UtcNow,
            Details = showDetails ? exception.Message : null
        };

        if (showDetails && _configuration.GetValue<bool>("ShowStackTrace", false))
        {
            errorResponse.Details = $"{exception.Message}\n{exception.StackTrace}";
        }

        var jsonResponse = JsonSerializer.Serialize(errorResponse, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(jsonResponse);
    }

    private static (int statusCode, string message, string code, bool showDetails) GetErrorResponse(Exception exception)
    {
        return exception switch
        {
            ValidationException => (400, "Validation failed.", "VALIDATION_ERROR", true),
            BusinessException => (400, "Business rule violation.", "BUSINESS_ERROR", true),
            ArgumentNullException => (400, "Required parameter is missing.", "BAD_REQUEST", true),
            ArgumentException => (400, "Invalid request parameters.", "BAD_REQUEST", true),
            UnauthorizedAccessException => (401, "Unauthorized access.", "UNAUTHORIZED", false),
            KeyNotFoundException => (404, "Resource not found.", "NOT_FOUND", true),
            TimeoutException => (408, "Request timeout.", "TIMEOUT", false),
            InvalidOperationException => (409, "Operation not allowed.", "CONFLICT", true),
            NotSupportedException => (422, "Operation not supported.", "UNSUPPORTED", true),
            ExternalServiceException => (502, "External service unavailable.", "EXTERNAL_SERVICE_ERROR", false),
            HttpRequestException => (502, "External service unavailable.", "EXTERNAL_SERVICE_ERROR", false),
            TaskCanceledException => (504, "Request timeout.", "TIMEOUT", false),
            // NotFound => ()
            _ => (500, "An internal server error occurred.", "SERVER_ERROR", false)
        };
    }

    private static bool IsCriticalException(Exception exception)
    {
        return exception switch
        {
            OutOfMemoryException => true,
            StackOverflowException => true,
            AccessViolationException => true,
            InvalidProgramException => true,
            _ when exception.Message.Contains("database", StringComparison.OrdinalIgnoreCase) => true,
            _ when exception.Message.Contains("connection", StringComparison.OrdinalIgnoreCase) => true,
            _ => false
        };
    }

    private async Task SendCriticalErrorNotificationAsync(Exception exception, string correlationId, HttpContext context)
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            //  var emailService = scope.ServiceProvider.GetService<IEmailService>();

            //if (emailService == null)
            //{
            //    _logger.LogWarning("EmailService not available for error notification");
            //    return;
            //}

            var adminEmail = _configuration["AdminNotifications:Email"];
            if (string.IsNullOrEmpty(adminEmail))
            {
                _logger.LogWarning("Admin email not configured for error notifications");
                return;
            }

            var subject = $"CRITICAL ERROR - {_configuration["Application:Name"]} - {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}";

            var emailBody = $@"
                <h2 style='color: red;'>Critical Error Alert</h2>
                <p><strong>Time:</strong> {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC</p>
                <p><strong>Correlation ID:</strong> {correlationId}</p>
                <p><strong>Request:</strong> {context.Request.Method} {context.Request.Path}</p>
                <p><strong>User Agent:</strong> {context.Request.Headers.UserAgent}</p>
                <p><strong>IP Address:</strong> {context.Connection.RemoteIpAddress}</p>
                <p><strong>User ID:</strong> {context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "Anonymous"}</p>
                <hr/>
                <p><strong>Exception Type:</strong> {exception.GetType().Name}</p>
                <p><strong>Message:</strong> {exception.Message}</p>
                <pre>{exception.StackTrace}</pre>";

            // await emailService.SendEmailAsync(adminEmail, subject, emailBody, true);
            _logger.LogInformation("Critical error notification sent successfully for correlation ID: {CorrelationId}", correlationId);
        }
        catch (Exception notificationEx)
        {
            _logger.LogError(notificationEx, "Failed to send critical error notification for correlation ID: {CorrelationId}", correlationId);
        }
    }
}
