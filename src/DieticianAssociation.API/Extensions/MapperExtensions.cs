namespace DieticianAssociation.API.Extensions
{
    public static class MapperExtensions
    {
        public static UserDto MapToUserDto(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                Name = user.Name ?? string.Empty,
                Role = user.Role.ToString(),
                RoleId = (short)user.Role,
                Avatar = user.Avatar,
                Phone = user.PhoneNumber,
                Organization = user.Organization,
                Bio = user.Bio,
                Specializations = user.Specializations,
                IsActive = user.IsActive,
                IsDeleted = user.IsDeleted,
                DeletedAt = user.DeletedAt,
                ConfirmationSent = user.ConfirmationSent,
                TempPasswordSent = user.TempPasswordSent,
                RequirePasswordReset = user.RequirePasswordReset,
                Designation = user.Designation ?? string.Empty,
                IsFeatured = user.IsFeatured,
                EffectivePermissions = user.EffectivePermissions ?? [],
                Membership = new MembershipDto
                {
                    Name = user?.LatestMembership?.MembershipPlan?.Name ?? "N/A",
                    Tier = user?.LatestMembership?.MembershipPlan?.Tier.ToString() ?? "N/A",
                    Status = user?.LatestMembership?.Status.ToString() ?? string.Empty,
                    JoinDate = user?.LatestMembership?.StartDate.ToString("yyyy-MM-dd") ?? string.Empty,
                    ExpirationDate = user?.LatestMembership?.EndDate.ToString("yyyy-MM-dd") ?? string.Empty
                }
            };
        }

        //test

        public static BlogPostDto MapToBlogPostDto(BlogPost post)
        {
            return new BlogPostDto
            {
                Id = post.Id,
                Title = post.Title,
                Url = post.Url,
                PreviousUrl = post.PreviousUrl,
                Content = post.Content,
                Excerpt = post.Excerpt,
                Author = post.Author != null ? MapToUserDto(post.Author) : null,
                AuthorId = post.AuthorId,
                Category = post.Category,
                Image = post.Image,
                Featured = post.Featured,
                ReadTime = post.ReadTime,
                Date = post.PublishedDate.ToString("yyyy-MM-dd"),
                PublishedAt = post.PublishedDate.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                IsPublished = post.IsPublished,
                Version = post.Version,
                EditStatus = post.EditStatus,
                HasPendingEdit = post.PendingContent != null,
                Tags = post.Tags,
                CreatedAt = post.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                UpdatedAt = post.UpdatedAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
            };
        }

        public static EventDto MapToEventDto(Event eventItem)
        {
            return new EventDto
            {
                Id = eventItem.Id,
                Title = eventItem.Title,
                Url = eventItem.Url,
                Description = eventItem.Description,
                Date = eventItem.Date.ToString("yyyy-MM-dd"),
                Time = eventItem.Time,
                Location = eventItem.Location,
                Format = eventItem.Format,
                Type = eventItem.Type,
                Credits = eventItem.Credits,
                Price = eventItem?.Price.ToString() ?? "0",
                Capacity = eventItem?.Capacity ?? 0,
                Registered = eventItem.Registered,
                Speakers = [.. (eventItem.Speakers ?? []).Select(MapToUserDto)],
                Recording = eventItem.Recording,
                RecordingUrl = eventItem.RecordingUrl,
                Images = eventItem.Images ?? [],
                CreatedAt = eventItem.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                UpdatedAt = eventItem.UpdatedAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
            };
        }

        public static MembershipPlanDto MapToPlanDto(MembershipPlan plan)
        {
            return new MembershipPlanDto
            {
                Id = plan.Id,
                Name = plan.Name,
                Tier = plan.Tier,
                Price = plan.Price,
                Duration = plan.Duration,
                Features = plan.Features,
                Popular = plan.Popular,
                InitialFee = plan.InitialFee,
                RenewalFee = plan.RenewalFee,
                DiscountedPrice = plan.DiscountedPrice,
                DiscountedRenewalFee = plan.DiscountedRenewalFee,
                Discount = plan.Discount,
                PriceWithGST = (plan.PriceWithGST.GetValueOrDefault() > 0) ? plan.PriceWithGST : (plan.Price * 1.18m),
                RenewalPriceWithGST = (plan.RenewalPriceWithGST.GetValueOrDefault() > 0) ? plan.RenewalPriceWithGST : (plan.RenewalFee * 1.18m),
                Description = plan.Description,
                PermissionKeys = [.. (plan.PlanPermissions ?? []).Select(assignment => assignment.Permission.Key).OrderBy(key => key)]
            };
        }

        public static TestimonialDto MapToTestimonialDto(Testimonial testimonial)
        {
            return new TestimonialDto
            {
                Id = testimonial.Id,
                Content = testimonial.Content,
                MemberName = testimonial.MemberName,
                ProfessionalTitle = testimonial.ProfessionalTitle,
                PhotoUrl = testimonial.PhotoUrl,
                Rating = testimonial.Rating,
                ConsentToPublish = testimonial.ConsentToPublish,
                Status = testimonial.Status,
                IsFeatured = testimonial.IsFeatured,
                SubmittedByUserId = testimonial.SubmittedByUserId,
                ReviewedByUserId = testimonial.ReviewedByUserId,
                SubmittedAt = testimonial.SubmittedAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                ReviewedAt = testimonial.ReviewedAt?.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                CreatedAt = testimonial.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                UpdatedAt = testimonial.UpdatedAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                RejectionReason = testimonial.RejectionReason,
                SubmittedBy = testimonial.SubmittedBy != null ? MapToUserDto(testimonial.SubmittedBy) : null,
                ReviewedBy = testimonial.ReviewedBy != null ? MapToUserDto(testimonial.ReviewedBy) : null,
            };
        }
    }
}
