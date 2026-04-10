namespace DieticianAssociation.API.Services;

public class CalendarService(
    ApplicationDbContext context,

    IConfiguration configuration) : ICalendarService
{
    private readonly ApplicationDbContext _context = context;
    private readonly IConfiguration _configuration = configuration;

    public async Task<EventCalendarDto?> CreateCalendarEventAsync(string eventId, CancellationToken cancellationToken = default)
    {
        var eventItem = await _context.AssociationEvents
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == eventId, cancellationToken);
        if (eventItem == null) return null;

        // Parse event time to create proper DateTime
        var eventDateTime = eventItem.Date;
        if (TimeSpan.TryParse(eventItem.Time, out var timeSpan))
        {
            eventDateTime = eventItem.Date.Add(timeSpan);
        }

        var calendarEvent = new EventCalendarDto
        {
            Id = eventItem.Id,
            Title = eventItem.Title,
            Description = eventItem.Description,
            StartDate = eventDateTime,
            EndDate = eventDateTime.AddHours(2), // Default 2-hour duration
            Location = eventItem.Location,
            TimeZone = "UTC",
            IsAllDay = false
        };

        return calendarEvent;
    }

    public async Task<string> GenerateICalendarAsync(string eventId, CancellationToken cancellationToken = default)
    {
        var eventItem = await _context.AssociationEvents.FindAsync(new object[] { eventId }, cancellationToken);
        if (eventItem == null) return string.Empty;

        var calendarEvent = await CreateCalendarEventAsync(eventId, cancellationToken);
        if (calendarEvent == null) return string.Empty;

        var icalBuilder = new StringBuilder();
        icalBuilder.AppendLine("BEGIN:VCALENDAR");
        icalBuilder.AppendLine("VERSION:2.0");
        icalBuilder.AppendLine("PRODID:Dietician Association");
        icalBuilder.AppendLine("CALSCALE:GREGORIAN");
        icalBuilder.AppendLine("METHOD:PUBLISH");
        icalBuilder.AppendLine("BEGIN:VEVENT");
        icalBuilder.AppendLine($"UID:{eventItem.Id}@dieticianassociation.com");
        icalBuilder.AppendLine($"DTSTART:{calendarEvent.StartDate:yyyyMMddTHHmmssZ}");
        icalBuilder.AppendLine($"DTEND:{calendarEvent.EndDate:yyyyMMddTHHmmssZ}");
        icalBuilder.AppendLine($"DTSTAMP:{DateTime.UtcNow:yyyyMMddTHHmmssZ}");
        icalBuilder.AppendLine($"CREATED:{DateTime.UtcNow:yyyyMMddTHHmmssZ}");
        icalBuilder.AppendLine($"LAST-MODIFIED:{eventItem.UpdatedAt:yyyyMMddTHHmmssZ}");
        icalBuilder.AppendLine($"SUMMARY:{eventItem.Title}");
        icalBuilder.AppendLine($"DESCRIPTION:{eventItem.Description.Replace("\n", "\\n")}");
        icalBuilder.AppendLine($"LOCATION:{eventItem.Location}");
        icalBuilder.AppendLine("STATUS:CONFIRMED");
        icalBuilder.AppendLine("TRANSP:OPAQUE");
        icalBuilder.AppendLine("END:VEVENT");
        icalBuilder.AppendLine("END:VCALENDAR");

        return icalBuilder.ToString();
    }

    public async Task<string> GenerateGoogleCalendarUrlAsync(string eventId, CancellationToken cancellationToken = default)
    {
        var calendarEvent = await CreateCalendarEventAsync(eventId, cancellationToken);
        if (calendarEvent == null) return string.Empty;

        var startDate = calendarEvent.StartDate.ToString("yyyyMMddTHHmmssZ");
        var endDate = calendarEvent.EndDate.ToString("yyyyMMddTHHmmssZ");

        var parameters = new Dictionary<string, string>
        {
            ["action"] = "TEMPLATE",
            ["text"] = calendarEvent.Title,
            ["dates"] = $"{startDate}/{endDate}",
            ["details"] = calendarEvent.Description,
            ["location"] = calendarEvent.Location
        };

        var queryString = string.Join("&", parameters.Select(p => $"{p.Key}={HttpUtility.UrlEncode(p.Value)}"));
        return $"https://calendar.google.com/calendar/render?{queryString}";
    }

    public async Task<string> GenerateOutlookCalendarUrlAsync(string eventId, CancellationToken cancellationToken = default)
    {
        var calendarEvent = await CreateCalendarEventAsync(eventId, cancellationToken);
        if (calendarEvent == null) return string.Empty;

        var startDate = calendarEvent.StartDate.ToString("yyyy-MM-ddTHH:mm:ss.fffK");
        var endDate = calendarEvent.EndDate.ToString("yyyy-MM-ddTHH:mm:ss.fffK");

        var parameters = new Dictionary<string, string>
        {
            ["path"] = "/calendar/action/compose",
            ["rru"] = "addevent",
            ["subject"] = calendarEvent.Title,
            ["startdt"] = startDate,
            ["enddt"] = endDate,
            ["body"] = calendarEvent.Description,
            ["location"] = calendarEvent.Location
        };

        var queryString = string.Join("&", parameters.Select(p => $"{p.Key}={HttpUtility.UrlEncode(p.Value)}"));
        return $"https://outlook.live.com/calendar/0/deeplink/compose?{queryString}";
    }

    public async Task<bool> SendCalendarInviteAsync(string eventId, List<string> attendees, CancellationToken cancellationToken = default)
    {
        try
        {
            var icalContent = await GenerateICalendarAsync(eventId, cancellationToken);
            if (string.IsNullOrEmpty(icalContent)) return false;

            var eventItem = await _context.AssociationEvents.FindAsync(new object[] { eventId }, cancellationToken);
            if (eventItem == null) return false;

            foreach (var attendeeEmail in attendees)
            {
                var subject = $"Calendar Invite: {eventItem.Title}";
                var body = GenerateCalendarInviteEmail(eventItem, icalContent);

            }

            return true;
        }
        catch (Exception)
        {
            return false;
        }
    }


    private static string GenerateCalendarInviteEmail(Event eventItem, string icalContent)
    {
        return $@"
        <html>
        <body>
            <h2>Calendar Invite: {eventItem.Title}</h2>
            <p>You're invited to attend:</p>
            <ul>
                <li><strong>Event:</strong> {eventItem.Title}</li>
                <li><strong>Date:</strong> {eventItem.Date:MMMM dd, yyyy}</li>
                <li><strong>Time:</strong> {eventItem.Time}</li>
                <li><strong>Location:</strong> {eventItem.Location}</li>
                <li><strong>Format:</strong> {eventItem.Format}</li>
            </ul>
            <p><strong>Description:</strong></p>
            <p>{eventItem.Description}</p>
            <p>Please add this event to your calendar using the attachment or the links below:</p>
            <p>
                <a href='data:text/calendar;charset=utf8,{HttpUtility.UrlEncode(icalContent)}' download='event.ics'>Download Calendar File</a>
            </p>
            <p>We look forward to seeing you there!</p>
            <p>Best regards,<br>Dietician Association Team</p>
        </body>
        </html>";
    }
}
