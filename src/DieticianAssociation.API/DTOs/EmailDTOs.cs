namespace DieticianAssociation.API.DTOs
{
    public class SentEmailDto
    {
        public string Id { get; set; } = string.Empty;
        public string FromAddress { get; set; } = string.Empty;
        public string ToAddress { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string BodyHtml { get; set; } = string.Empty;
        public DateTime DateSent { get; set; }
    }
}
