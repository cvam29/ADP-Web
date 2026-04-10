namespace DieticianAssociation.API.Constants
{
    public sealed record PermissionDefinition(string Key, string Name, string Description, string Category);

    public static class PermissionKeys
    {
        public const string AdminDashboardView = "admin.dashboard.view";
        public const string UsersRead = "users.read";
        public const string UsersCreate = "users.create";
        public const string UsersUpdate = "users.update";
        public const string UsersDelete = "users.delete";
        public const string UsersStatusManage = "users.status.manage";
        public const string UsersRolesManage = "users.roles.manage";
        public const string UsersPermissionsManage = "users.permissions.manage";
        public const string MembershipPlansRead = "membership.plans.read";
        public const string MembershipPlansCreate = "membership.plans.create";
        public const string MembershipPlansUpdate = "membership.plans.update";
        public const string MembershipPlansDelete = "membership.plans.delete";
        public const string MembershipPlansPermissionsManage = "membership.plans.permissions.manage";
        public const string MembershipsRead = "memberships.read";
        public const string MembershipsAssign = "memberships.assign";
        public const string MembershipsUpdate = "memberships.update";
        public const string MembershipsDelete = "memberships.delete";
        public const string MembershipsReview = "memberships.review";
        public const string BlogsRead = "blogs.read";
        public const string BlogsCreate = "blogs.create";
        public const string BlogsUpdate = "blogs.update";
        public const string BlogsDelete = "blogs.delete";
        public const string EventsRead = "events.read";
        public const string EventsCreate = "events.create";
        public const string EventsUpdate = "events.update";
        public const string EventsDelete = "events.delete";
        public const string ResourcesRead = "resources.read";
        public const string ResourcesCreate = "resources.create";
        public const string ResourcesUpdate = "resources.update";
        public const string ResourcesDelete = "resources.delete";
        public const string ResourcesUpload = "resources.upload";
        public const string TestimonialsRead = "testimonials.read";
        public const string TestimonialsReview = "testimonials.review";
        public const string TestimonialsFeature = "testimonials.feature";
        public const string TestimonialsDelete = "testimonials.delete";
        public const string EmailsRead = "emails.read";
        public const string EmailsSend = "emails.send";
        public const string EmailTemplatesRead = "emailTemplates.read";
        public const string EmailTemplatesCreate = "emailTemplates.create";
        public const string EmailTemplatesUpdate = "emailTemplates.update";
        public const string EmailTemplatesDelete = "emailTemplates.delete";
        public const string AnalyticsView = "analytics.view";
        public const string ContactsRead = "contacts.read";
        public const string ContactsUpdate = "contacts.update";
        public const string ContactsDelete = "contacts.delete";
        public const string MemberDashboardAccess = "member.dashboard.access";
        public const string MemberDirectoryAccess = "member.directory.access";
        public const string MemberResearchAccess = "member.research.access";
        public const string MemberToolsAccess = "member.tools.access";
        public const string MemberCareerAccess = "member.career.access";
        public const string MemberCertificatesAccess = "member.certificates.access";
        public const string MemberBlogsWrite = "member.blogs.write";

        public static readonly IReadOnlyList<PermissionDefinition> All =
        [
            new(AdminDashboardView, "View Admin Dashboard", "Access the admin dashboard workspace and summary widgets.", "Administration"),
            new(UsersRead, "Read Users", "View user lists, exports, and individual user details.", "Users"),
            new(UsersCreate, "Create Users", "Create new users.", "Users"),
            new(UsersUpdate, "Update Users", "Update user profiles and set temporary passwords.", "Users"),
            new(UsersDelete, "Delete Users", "Delete or soft-delete users.", "Users"),
            new(UsersStatusManage, "Manage User Status", "Activate or deactivate users.", "Users"),
            new(UsersRolesManage, "Manage User Roles", "Assign or change application roles for users.", "Users"),
            new(UsersPermissionsManage, "Manage User Permissions", "Assign direct permission overrides to users.", "Users"),
            new(MembershipPlansRead, "Read Membership Plans", "View membership plans and plan permission defaults.", "Membership Plans"),
            new(MembershipPlansCreate, "Create Membership Plans", "Create membership plans.", "Membership Plans"),
            new(MembershipPlansUpdate, "Update Membership Plans", "Update membership plans.", "Membership Plans"),
            new(MembershipPlansDelete, "Delete Membership Plans", "Delete membership plans.", "Membership Plans"),
            new(MembershipPlansPermissionsManage, "Manage Membership Plan Permissions", "Assign plan-level member permissions.", "Membership Plans"),
            new(MembershipsRead, "Read Memberships", "View membership records, payment state, and membership details.", "Membership"),
            new(MembershipsAssign, "Assign Memberships", "Assign memberships or swap a user's plan.", "Membership"),
            new(MembershipsUpdate, "Update Memberships", "Update membership status and lifecycle fields.", "Membership"),
            new(MembershipsDelete, "Delete Memberships", "Delete or suspend user memberships.", "Membership"),
            new(MembershipsReview, "Review Membership Payments", "Review payment verification and membership activation workflow.", "Membership"),
            new(BlogsRead, "Read Blogs", "View paginated blog administration data.", "Blogs"),
            new(BlogsCreate, "Create Blogs", "Create blog content.", "Blogs"),
            new(BlogsUpdate, "Update Blogs", "Update blog content.", "Blogs"),
            new(BlogsDelete, "Delete Blogs", "Delete blog content.", "Blogs"),
            new(EventsRead, "Read Events", "View paginated event administration data.", "Events"),
            new(EventsCreate, "Create Events", "Create event content.", "Events"),
            new(EventsUpdate, "Update Events", "Update event content.", "Events"),
            new(EventsDelete, "Delete Events", "Delete event content.", "Events"),
            new(ResourcesRead, "Read Resources", "View resource administration data.", "Resources"),
            new(ResourcesCreate, "Create Resources", "Create resource records.", "Resources"),
            new(ResourcesUpdate, "Update Resources", "Update resource records.", "Resources"),
            new(ResourcesDelete, "Delete Resources", "Delete resource records.", "Resources"),
            new(ResourcesUpload, "Upload Resources", "Upload resource files.", "Resources"),
            new(TestimonialsRead, "Read Testimonials", "View testimonial submissions and moderation queues.", "Testimonials"),
            new(TestimonialsReview, "Review Testimonials", "Approve or reject testimonial submissions.", "Testimonials"),
            new(TestimonialsFeature, "Feature Testimonials", "Highlight approved testimonials on public pages.", "Testimonials"),
            new(TestimonialsDelete, "Delete Testimonials", "Delete testimonial submissions.", "Testimonials"),
            new(EmailsRead, "Read Emails", "Access inbox, outbox, and configured email accounts.", "Emails"),
            new(EmailsSend, "Send Emails", "Send templated or direct emails.", "Emails"),
            new(EmailTemplatesRead, "Read Email Templates", "View email templates.", "Email Templates"),
            new(EmailTemplatesCreate, "Create Email Templates", "Create email templates.", "Email Templates"),
            new(EmailTemplatesUpdate, "Update Email Templates", "Update email templates.", "Email Templates"),
            new(EmailTemplatesDelete, "Delete Email Templates", "Delete email templates.", "Email Templates"),
            new(AnalyticsView, "View Analytics", "View admin analytics and reporting screens.", "Administration"),
            new(ContactsRead, "Read Contacts", "View contact messages.", "Contacts"),
            new(ContactsUpdate, "Update Contacts", "Update contact message status.", "Contacts"),
            new(ContactsDelete, "Delete Contacts", "Delete contact messages.", "Contacts"),
            new(MemberDashboardAccess, "Access Member Dashboard", "Access the member dashboard workspace.", "Member"),
            new(MemberDirectoryAccess, "Access Member Directory", "Access the member directory feature.", "Member"),
            new(MemberResearchAccess, "Access Research", "Access the research dashboard feature.", "Member"),
            new(MemberToolsAccess, "Access Tools", "Access the member tools dashboard feature.", "Member"),
            new(MemberCareerAccess, "Access Career Center", "Access the career dashboard feature.", "Member"),
            new(MemberCertificatesAccess, "Access Certificates", "Access member certificate features.", "Member"),
            new(MemberBlogsWrite, "Write Blog Articles", "Create and edit blog articles (requires admin approval).", "Member")
        ];

        public static readonly IReadOnlySet<string> AllKeys = new HashSet<string>(All.Select(permission => permission.Key), StringComparer.OrdinalIgnoreCase);

        public static readonly IReadOnlySet<string> LegacyAdminPermissionKeys = new HashSet<string>(
            [
                AdminDashboardView,
                UsersRead,
                UsersCreate,
                UsersUpdate,
                UsersDelete,
                UsersStatusManage,
                UsersRolesManage,
                UsersPermissionsManage,
                MembershipPlansRead,
                MembershipPlansCreate,
                MembershipPlansUpdate,
                MembershipPlansDelete,
                MembershipPlansPermissionsManage,
                MembershipsRead,
                MembershipsAssign,
                MembershipsUpdate,
                MembershipsDelete,
                MembershipsReview,
                BlogsRead,
                BlogsCreate,
                BlogsUpdate,
                BlogsDelete,
                EventsRead,
                EventsCreate,
                EventsUpdate,
                EventsDelete,
                ResourcesRead,
                ResourcesCreate,
                ResourcesUpdate,
                ResourcesDelete,
                ResourcesUpload,
                TestimonialsRead,
                TestimonialsReview,
                TestimonialsFeature,
                TestimonialsDelete,
                EmailsRead,
                EmailsSend,
                EmailTemplatesRead,
                EmailTemplatesCreate,
                EmailTemplatesUpdate,
                EmailTemplatesDelete,
                AnalyticsView,
                ContactsRead,
                ContactsUpdate,
                ContactsDelete,
                MemberDashboardAccess,
                MemberDirectoryAccess,
                MemberResearchAccess,
                MemberToolsAccess,
                MemberCareerAccess,
                MemberCertificatesAccess
            ],
            StringComparer.OrdinalIgnoreCase);

        public static readonly IReadOnlySet<string> MembershipPlanAssignablePermissionKeys = new HashSet<string>(
            [
                MemberDashboardAccess,
                MemberDirectoryAccess,
                MemberResearchAccess,
                MemberToolsAccess,
                MemberCareerAccess,
                MemberCertificatesAccess
            ],
            StringComparer.OrdinalIgnoreCase);

        public static readonly IReadOnlySet<string> DefaultMembershipPermissionKeys = new HashSet<string>(
            [
                MemberDashboardAccess,
                MemberDirectoryAccess,
                MemberResearchAccess,
                MemberToolsAccess,
                MemberCareerAccess,
                MemberCertificatesAccess
            ],
            StringComparer.OrdinalIgnoreCase);

        public static bool IsKnown(string permissionKey)
        {
            return !string.IsNullOrWhiteSpace(permissionKey) && AllKeys.Contains(permissionKey.Trim());
        }

        public static bool IsMembershipPlanAssignable(string permissionKey)
        {
            return !string.IsNullOrWhiteSpace(permissionKey) && MembershipPlanAssignablePermissionKeys.Contains(permissionKey.Trim());
        }
    }
}