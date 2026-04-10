namespace DieticianAssociation.API.DTOs
{
    public class MessageResponseDto
    {
        public string Message { get; set; } = string.Empty;
    }

    public class ErrorResponseDto
    {
        public string Message { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string? Details { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string? Path { get; set; }
        public int StatusCode { get; set; }
        public Dictionary<string, string[]>? ValidationErrors { get; set; }
    }


}
