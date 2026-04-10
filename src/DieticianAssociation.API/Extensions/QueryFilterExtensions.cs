namespace DieticianAssociation.API.Extensions
{
    public static class QueryFilterExtensions
    {
        /// <summary>
        /// Applies filters dynamically based on the Filters dictionary in PagedRequest.
        /// Supports nested navigation properties using dot notation (e.g., "Role.Name").
        /// </summary>
        public static IQueryable<T> ApplyFilters<T>(this IQueryable<T> query, PagedRequest request)
        {
            if (request.Filters == null || request.Filters.Count == 0)
                return query;

            var parameter = Expression.Parameter(typeof(T), "x");

            foreach (var filter in request.Filters)
            {
                // Split nested properties (e.g., "Role.Name")
                var propertyParts = filter.Key.Split('.');
                Expression propertyAccess = parameter;
                Type currentType = typeof(T);

                foreach (var part in propertyParts)
                {
                    var propertyInfo = currentType.GetProperty(part,
                        System.Reflection.BindingFlags.IgnoreCase |
                        System.Reflection.BindingFlags.Public |
                        System.Reflection.BindingFlags.Instance);

                    if (propertyInfo == null)
                    {
                        propertyAccess = null;
                        break;
                    }

                    propertyAccess = Expression.Property(propertyAccess, propertyInfo);
                    currentType = propertyInfo.PropertyType;
                }

                if (propertyAccess == null) continue; // Skip if property not found

                // Convert filter value to correct type
                object convertedValue;
                try
                {
                    if (currentType.IsEnum)
                    {
                        // Handle both numeric and string enum values
                        if (int.TryParse(filter.Value?.ToString(), out var enumInt))
                        {
                            convertedValue = Enum.ToObject(currentType, enumInt);
                        }
                        else
                        {
                            convertedValue = Enum.Parse(currentType, filter.Value?.ToString() ?? "", true);
                        }
                    }
                    else if (currentType == typeof(bool) || currentType == typeof(bool?))
                    {
                        convertedValue = bool.Parse(filter.Value?.ToString() ?? "false");
                    }
                    else
                    {
                        convertedValue = Convert.ChangeType(filter.Value, currentType);
                    }
                }
                catch
                {
                    continue; // skip invalid type conversion
                }

                var right = Expression.Constant(convertedValue, currentType);

                // Build x.Property == value
                var body = Expression.Equal(propertyAccess, right);
                var lambda = Expression.Lambda<Func<T, bool>>(body, parameter);

                query = query.Where(lambda);
            }

            return query;
        }

        public interface IHasCreatedAt
        {
            DateTime CreatedAt { get; set; }
        }


        public static IQueryable<T> ApplyDateRangeFilter<T>(
            this IQueryable<T> query,
            string? dateRange,
            Expression<Func<T, DateTime>> dateSelector
        )
        {
            if (string.IsNullOrWhiteSpace(dateRange))
                return query;

            var now = DateTime.UtcNow;
            var startDate = dateRange switch
            {
                "today" => now.Date,
                "yesterday" => now.Date.AddDays(-1),
                "last_7_days" => now.AddDays(-7),
                "last_30_days" => now.AddDays(-30),
                "last_3_months" => now.AddMonths(-3),
                "last_6_months" => now.AddMonths(-6),
                "last_1_year" => now.AddYears(-1),
                _ => (DateTime?)null
            };

            if (startDate == null)
                return query;

            return dateRange == "yesterday"
                ? query.Where(Expression.Lambda<Func<T, bool>>(
                    Expression.AndAlso(
                        Expression.GreaterThanOrEqual(dateSelector.Body, Expression.Constant(startDate.Value)),
                        Expression.LessThan(dateSelector.Body, Expression.Constant(now.Date))
                    ),
                    dateSelector.Parameters
                ))
                : query.Where(Expression.Lambda<Func<T, bool>>(
                    Expression.GreaterThanOrEqual(dateSelector.Body, Expression.Constant(startDate.Value)),
                    dateSelector.Parameters
                ));
        }

        /// <summary>
        /// Applies dynamic sorting based on SortBy and SortOrder.
        /// Supports nested properties using dot notation (e.g., "Role.Name").
        /// </summary>
        public static IQueryable<T> ApplySorting<T>(
            this IQueryable<T> query,
            string? sortBy,
            string? sortOrder
        )
        {
            if (string.IsNullOrWhiteSpace(sortBy))
                return query;

            var parameter = Expression.Parameter(typeof(T), "x");
            Expression propertyAccess = parameter;
            Type currentType = typeof(T);

            // Handle nested properties
            foreach (var part in sortBy.Split('.'))
            {
                var property = currentType.GetProperty(
                    part,
                    BindingFlags.IgnoreCase |
                    BindingFlags.Public |
                    BindingFlags.Instance
                );

                if (property == null)
                    return query; // Invalid sort field → ignore sorting

                propertyAccess = Expression.Property(propertyAccess, property);
                currentType = property.PropertyType;
            }

            var lambda = Expression.Lambda(propertyAccess, parameter);

            var methodName =
                string.Equals(sortOrder, "desc", StringComparison.OrdinalIgnoreCase)
                    ? "OrderByDescending"
                    : "OrderBy";

            var method = typeof(Queryable)
                .GetMethods()
                .First(m =>
                    m.Name == methodName &&
                    m.GetParameters().Length == 2)
                .MakeGenericMethod(typeof(T), currentType);

            return (IQueryable<T>)method.Invoke(null, [query, lambda])!;
        }
    }
}
