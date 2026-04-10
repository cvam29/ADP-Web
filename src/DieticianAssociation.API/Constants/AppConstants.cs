namespace DieticianAssociation.API.Constants
{
    public static class AppConstants
    {
        public const string ApplicationName = "Dietician Association API";
        public const string ApiVersion = "v1";
        public const string AzureBlobContainerName = "adpcontainer";

        public static class Roles
        {
            public const string SuperAdmin = "SuperAdmin";
            public const string Admin = "Admin";
            public const string Student = "Student";
        }

        public static class ClaimTypes
        {
            public const string MembershipTier = "MembershipTier";
            public const string MembershipStatus = "MembershipStatus";
            public const string IsViewAs = "viewAs";
            public const string ImpersonatorUserId = "impersonatorUserId";
        }

        public static class DefaultValues
        {
            public const int DefaultPageSize = 10;
            public const int MaxPageSize = 100;
            public const int PasswordMinLength = 6;
            public const int TokenExpirationMinutes = 1440; // 24 hours
        }

        public static class ValidationMessages
        {
            public const string EmailRequired = "Email is required";
            public const string EmailInvalid = "Email format is invalid";
            public const string PasswordRequired = "Password is required";
            public const string PasswordMinLength = "Password must be at least 6 characters";
            public const string PasswordMismatch = "Passwords do not match";
            public const string NameRequired = "Name is required";
            public const string MembershipTierRequired = "Membership tier is required";
        }

        public static class CertificateConstants
        {
            public const string OrgRegistrationNumber = "S/RS/SW/HQ/092/2025";
            public const string DarpanId = "DL/2025/0736657";
        }
    }
}
