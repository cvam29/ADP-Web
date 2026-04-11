namespace DieticianAssociation.API.Interfaces
{
    public interface ITestimonialService
    {
        Task<PagedResult<TestimonialDto>> GetPublicTestimonialsAsync(PagedRequest request, CancellationToken cancellationToken = default);
        Task<DieticianAssociation.API.Helper.PageInfo> GetPublicTestimonialsStreamPageInfoAsync(PagedRequest request, bool featuredOnly = false, CancellationToken cancellationToken = default);
        IAsyncEnumerable<TestimonialDto> StreamPublicTestimonialsAsync(PagedRequest request, bool featuredOnly = false, CancellationToken cancellationToken = default);
        Task<PagedResult<TestimonialDto>> GetAdminTestimonialsAsync(PagedRequest request, CancellationToken cancellationToken = default);
        Task<List<TestimonialDto>> GetMyTestimonialsAsync(string userId, CancellationToken cancellationToken = default);
        Task<TestimonialDto> SubmitTestimonialAsync(string userId, CreateTestimonialDto dto, CancellationToken cancellationToken = default);
        Task<TestimonialDto> ReviewTestimonialAsync(string id, string reviewerUserId, ReviewTestimonialDto dto, CancellationToken cancellationToken = default);
        Task DeleteTestimonialAsync(string id, CancellationToken cancellationToken = default);
    }
}