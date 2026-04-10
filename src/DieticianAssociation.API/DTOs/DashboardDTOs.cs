namespace DieticianAssociation.API.DTOs
{
    public class AdminDashboardStatsDto
    {
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int ExpiredUsers { get; set; }
        public int TotalEvents { get; set; }
        public int UpcomingEvents { get; set; }
    }
}