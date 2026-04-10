namespace DieticianAssociation.API.Extensions
{
    public static class PaginationExtensions
    {
        /// <summary>
        /// Converts an IQueryable into a paged result asynchronously
        /// </summary>
        public static async Task<PagedResult<TResult>> ToPagedResultAsync<TSource, TResult>(
    this IQueryable<TSource> query,
    PagedRequest request,
    Func<TSource, TResult> selector,
    CancellationToken cancellationToken = default)
        {
            // Apply filters dynamically (on the source type, e.g. User)
            query = query.ApplyFilters(request);

            var totalItems = await query.CountAsync(cancellationToken);

            // Apply paging
            var items = await query
                .Skip(request.Skip)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            // Map using selector (e.g. MapToUserDto)
            var mappedItems = items.Select(selector).ToList();

            return PagedResult<TResult>.Create(mappedItems, request.Page, request.PageSize, totalItems);
        }

    }
}
