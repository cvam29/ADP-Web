namespace DieticianAssociation.API.Utilities;

/// <summary>
/// Utility class for generating SEO-friendly URL slugs
/// </summary>
public static partial class UrlHelper
{
    /// <summary>
    /// Generates a URL-friendly slug from a title
    /// </summary>
    /// <param name="title">The title to convert to a slug</param>
    /// <param name="maxLength">Maximum length of the slug (default: 100)</param>
    /// <returns>A URL-friendly slug</returns>
    public static string GenerateSlug(string title, int maxLength = 100)
    {
        if (string.IsNullOrWhiteSpace(title))
            return string.Empty;

        // Convert to lowercase
        string slug = title.ToLowerInvariant();

        // Remove diacritics (accents)
        slug = RemoveDiacritics(slug);

        // Replace spaces and multiple consecutive spaces/hyphens with single hyphens
        slug = MyRegex().Replace(slug, "-");
        slug = Regex.Replace(slug, @"-+", "-");

        // Remove all non-alphanumeric characters except hyphens
        slug = Regex.Replace(slug, @"[^a-z0-9\-]", "");

        // Remove leading and trailing hyphens
        slug = slug.Trim('-');

        // Truncate to max length and ensure it doesn't end with a hyphen
        if (slug.Length > maxLength)
        {
            slug = slug[..maxLength];
            slug = slug.TrimEnd('-');
        }

        return slug;
    }

    /// <summary>
    /// Removes diacritics (accents) from characters
    /// </summary>
    /// <param name="text">Text to process</param>
    /// <returns>Text without diacritics</returns>
    private static string RemoveDiacritics(string text)
    {
        var normalizedString = text.Normalize(NormalizationForm.FormD);
        var stringBuilder = new StringBuilder();

        foreach (var c in normalizedString)
        {
            var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
            if (unicodeCategory != UnicodeCategory.NonSpacingMark)
            {
                stringBuilder.Append(c);
            }
        }

        return stringBuilder.ToString().Normalize(NormalizationForm.FormC);
    }

    /// <summary>
    /// Ensures a slug is unique by appending a number if necessary
    /// </summary>
    /// <param name="baseSlug">The base slug</param>
    /// <param name="existingSlugs">List of existing slugs to check against</param>
    /// <returns>A unique slug</returns>
    public static string EnsureUniqueSlug(string baseSlug, IEnumerable<string> existingSlugs)
    {
        var slug = baseSlug;
        var counter = 1;
        var existingSet = existingSlugs.ToHashSet(StringComparer.OrdinalIgnoreCase);

        while (existingSet.Contains(slug))
        {
            slug = $"{baseSlug}-{counter}";
            counter++;
        }

        return slug;
    }

    [GeneratedRegex(@"\s+")]
    private static partial Regex MyRegex();
}
