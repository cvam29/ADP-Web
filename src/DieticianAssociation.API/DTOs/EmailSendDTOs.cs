namespace DieticianAssociation.API.DTOs;

public class SendTemplatedEmailRequestDto
{
    [Required]
    [EmailAddress]
    public string To { get; set; } = string.Empty;

    [Required]
    [MaxLength(120)]
    public string TemplateKey { get; set; } = string.Empty;

    public Dictionary<string, string> Placeholders { get; set; } = new(StringComparer.OrdinalIgnoreCase);
}

public class SendDirectEmailRequestDto
{
    [Required]
    [EmailAddress]
    public string To { get; set; } = string.Empty;

    [Required]
    [MaxLength(300)]
    public string Subject { get; set; } = string.Empty;

    [Required]
    public string BodyHtml { get; set; } = string.Empty;

    public List<string>? Bcc { get; set; }
}
