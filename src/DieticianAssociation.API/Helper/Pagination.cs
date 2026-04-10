namespace DieticianAssociation.API.Helper
{
    /// <summary>
    /// Generic request parameters for paging, sorting, and filtering
    /// </summary>
    public class PagedRequest
    {
        private const int MaxPageSize = 100;
        private const int DefaultPage = 1;
        private const int DefaultPageSize = 10;
        private int _page = DefaultPage;
        private int _pageSize = DefaultPageSize;

        /// <summary>
        /// Page number (1-based)
        /// </summary>
        public int Page
        {
            get => _page;
            set => _page = value < DefaultPage ? DefaultPage : value;
        }

        /// <summary>
        /// Number of items per page (max 100)
        /// </summary>
        public int PageSize
        {
            get => _pageSize;
            set
            {
                if (value <= 0)
                {
                    _pageSize = DefaultPageSize;
                    return;
                }

                _pageSize = value > MaxPageSize ? MaxPageSize : value;
            }
        }

        /// <summary>
        /// Search term for filtering results
        /// </summary>
        public string? Search { get; set; }

        /// <summary>
        /// Sort field
        /// </summary>
        public string? SortBy { get; set; }

        /// <summary>
        /// Sort direction (asc/desc)
        /// </summary>
        public string SortDirection { get; set; } = "desc";

        /// <summary>
        /// Additional filters (key/value pairs)
        /// </summary>
        public Dictionary<string, object>? Filters { get; set; }

        /// <summary>
        /// Calculate skip value for database queries
        /// </summary>
        public int Skip => (Page - 1) * PageSize;

        /// <summary>
        /// Validate paging parameters
        /// </summary>
        public bool IsValid => Page >= DefaultPage && PageSize > 0;
    }

    /// <summary>
    /// Generic paged result wrapper
    /// </summary>
    /// <typeparam name="T">Type of items in the result</typeparam>
    public class PagedResult<T>
    {
        /// <summary>
        /// The items for the current page
        /// </summary>
        public IEnumerable<T> Items { get; set; } = [];

        /// <summary>
        /// Current page number
        /// </summary>
        public int Page { get; set; }

        /// <summary>
        /// Number of items per page
        /// </summary>
        public int PageSize { get; set; }

        /// <summary>
        /// Total number of items across all pages
        /// </summary>
        public int TotalItems { get; set; }

        /// <summary>
        /// Total number of pages
        /// </summary>
        public int TotalPages => (int)Math.Ceiling((double)TotalItems / PageSize);

        /// <summary>
        /// Whether there is a previous page
        /// </summary>
        public bool HasPrevious => Page > 1;

        /// <summary>
        /// Whether there is a next page
        /// </summary>
        public bool HasNext => Page < TotalPages;

        /// <summary>
        /// Metadata about the paging
        /// </summary>
        public PageInfo Info => new()
        {
            CurrentPage = Page,
            PageSize = PageSize,
            TotalItems = TotalItems,
            TotalPages = TotalPages,
            HasPrevious = HasPrevious,
            HasNext = HasNext
        };

        /// <summary>
        /// Helper method to create a paged result
        /// </summary>
        public static PagedResult<T> Create(IEnumerable<T> items, int page, int pageSize, int totalItems)
        {
            return new PagedResult<T>
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                TotalItems = totalItems
            };
        }
    }

    /// <summary>
    /// Paging metadata for response headers
    /// </summary>
    public class PageInfo
    {
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
        public int TotalItems { get; set; }
        public int TotalPages { get; set; }
        public bool HasPrevious { get; set; }
        public bool HasNext { get; set; }
    }
}
