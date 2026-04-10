namespace DieticianAssociation.API.Constants;

public static class EmailConstants
{
    public const string LogoDataUri = "cid:logoImage";

    public const string WelcomeEmailTemplate = $$$"""
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to ADP</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: &quot;Segoe UI&quot;, Tahoma, Geneva, Verdana, sans-serif;
    "
  >
    <!-- Main Wrapper -->
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="background-color: #f8fafc; padding: 40px 0"
    >
      <tr>
        <td align="center">
          <!-- Content Container -->
          <table
            width="600"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow:
                0 4px 6px -1px rgba(0, 0, 0, 0.1),
                0 2px 4px -1px rgba(0, 0, 0, 0.06);
            "
          >
            <!-- Header -->
            <tr>
              <td
                align="center"
                style="
                  background-color: #ffffff;
                  padding: 40px 0;
                  border-bottom: 3px solid #10b981;
                "
              >
                <img
                  src="{{{LogoDataUri}}}"
                  alt="ADP Logo"
                  width="80"
                  style="display: block; margin-bottom: 10px"
                />
                <h1
                  style="
                    color: #0f172a;
                    margin: 0;
                    font-size: 24px;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                  "
                >
                  Association of Dietetics Professionals
                </h1>
              </td>
            </tr>

            <!-- Body Content -->
            <tr>
              <td style="padding: 40px 50px">
                <!-- Personalization -->
                <h2
                  style="
                    color: #0f172a;
                    margin-top: 0;
                    font-size: 22px;
                    font-weight: 600;
                  "
                >
                  Hello, {{Name}}!
                </h2>

                <p
                  style="
                    color: #475569;
                    font-size: 16px;
                    line-height: 1.6;
                    margin-bottom: 20px;
                  "
                >
                  We are honored to welcome you to the
                  <strong>Association of Dietetics Professionals (ADP)</strong>.
                  Your membership application has been successfully received and is currently under review by our team. You will receive another email once your payment and details are verified and your membership is approved.
                </p>

                <!-- Membership Details Box -->
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="
                    background-color: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    border-radius: 8px;
                    margin-bottom: 30px;
                  "
                >
                  <tr>
                    <td style="padding: 20px">
                      <h3
                        style="
                          margin: 0 0 15px 0;
                          font-size: 16px;
                          color: #166534;
                          border-bottom: 1px solid #bbf7d0;
                          padding-bottom: 8px;
                        "
                      >
                        Membership Details
                      </h3>

                      <p
                        style="
                          margin: 0 0 10px 0;
                          font-size: 14px;
                          color: #334155;
                        "
                      >
                        <strong>Membership Type:</strong>
                        <span style="color: #0f172a"
                          >{{MembershipPlanName}}</span
                        >
                      </p>
                      <p
                        style="
                          margin: 0 0 10px 0;
                          font-size: 14px;
                          color: #334155;
                        "
                      >
                        <strong>Status:</strong>
                        <span
                          style="
                            color: #15803d;
                            font-weight: 600;
                            text-transform: uppercase;
                            font-size: 12px;
                            background-color: #dcfce7;
                            padding: 2px 6px;
                            border-radius: 4px;
                          "
                          >{{MembershipStatus}}</span
                        >
                      </p>
                      <p
                        style="
                          margin: 0 0 10px 0;
                          font-size: 14px;
                          color: #334155;
                        "
                      >
                        <strong>Valid From:</strong>
                        <span style="color: #0f172a"
                          >{{MembershipStartDate}}</span
                        >
                      </p>
                      <p style="margin: 0; font-size: 14px; color: #334155">
                        <strong>Valid Through:</strong>
                        <span style="color: #0f172a"
                          >{{MembershipExpiryDate}}</span
                        >
                      </p>
                    </td>
                  </tr>
                </table>

                <p
                  style="
                    color: #475569;
                    font-size: 16px;
                    line-height: 1.6;
                    margin-bottom: 30px;
                  "
                >
                  At ADP, we are dedicated to empowering nutrition professionals
                  through education, resources, and community support. You can explore more about our association on our website while your application is under review.
                </p>

                <!-- Call to Action Button -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" style="padding-bottom: 30px">
                      <!-- Emerald Green Button -->
                      <a
                        href="https://www.adp.org.in/"
                        target="_blank"
                        style="
                          display: inline-block;
                          background-color: #10b981;
                          color: #ffffff;
                          text-decoration: none;
                          padding: 14px 32px;
                          border-radius: 6px;
                          font-weight: 600;
                          font-size: 16px;
                          box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.4);
                        "
                        >Visit ADP Website</a
                      >
                    </td>
                  </tr>
                </table>

                <p
                  style="
                    color: #475569;
                    font-size: 16px;
                    line-height: 1.6;
                    margin-bottom: 0;
                  "
                >
                  We look forward to welcoming you soon.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                style="
                  padding: 40px 50px;
                  background-color: #0f172a;
                  color: #94a3b8;
                "
              >
                <!-- Social Links -->
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="margin-bottom: 20px"
                >
                  <tr>
                    <td align="center">
                      <a
                        href="https://www.facebook.com/adp.org.in"
                        style="
                          display: inline-block;
                          margin: 0 10px;
                          color: #94a3b8;
                          text-decoration: none;
                        "
                        >Facebook</a
                      >
                      <a
                        href="https://x.com/adp_org_in"
                        style="
                          display: inline-block;
                          margin: 0 10px;
                          color: #94a3b8;
                          text-decoration: none;
                        "
                        >Twitter (X)</a
                      >
                      <a
                        href="https://www.linkedin.com/company/adp-org-in/"
                        style="
                          display: inline-block;
                          margin: 0 10px;
                          color: #94a3b8;
                          text-decoration: none;
                        "
                        >LinkedIn</a
                      >
                      <a
                        href="https://www.instagram.com/adp.org.in/"
                        style="
                          display: inline-block;
                          margin: 0 10px;
                          color: #94a3b8;
                          text-decoration: none;
                        "
                        >Instagram</a
                      >
                    </td>
                  </tr>
                </table>

                <!-- Contact Info -->
                <p
                  style="
                    font-size: 14px;
                    margin: 0 0 10px 0;
                    text-align: center;
                  "
                >
                  <strong>Association of Dietetics Professionals</strong><br />
                  New Delhi - 110059, India
                </p>
                <p
                  style="
                    font-size: 14px;
                    margin: 0 0 20px 0;
                    text-align: center;
                  "
                >
                  <a
                    href="mailto:info@adp.org.in"
                    style="color: #10b981; text-decoration: none"
                    >info@adp.org.in</a
                  >
                  |
                  <a
                    href="tel:+918059655000"
                    style="color: #10b981; text-decoration: none"
                    >+91 80596 55000</a
                  >
                </p>

                <!-- Copyright -->
                <p
                  style="
                    font-size: 12px;
                    margin: 0;
                    text-align: center;
                    color: #64748b;
                  "
                >
                  &copy; {{Year}} Association of Dietetics Professionals. All
                  rights reserved.<br />
                  You are receiving this email because you are a registered
                  member of ADP.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
""";

    public const string TempPasswordResetEmailTemplate = $$$"""
 <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ADP – Login Credentials</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">

    <!-- Main Wrapper -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; padding: 40px 0;">
        <tr>
            <td align="center">

                <!-- Content Container -->
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">

                    <!-- Header -->
                    <tr>
                        <td align="center" style="background-color: #ffffff; padding: 40px 0; border-bottom: 3px solid #10b981;">
                            <img src="{{{LogoDataUri}}}" alt="ADP Logo" width="80" style="display: block; margin-bottom: 10px;">
                            <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Association of Dietetics Professionals</h1>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 40px 50px;">
                            <!-- Personalization -->
                            <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 600;">Namaste, {{Name}}!</h2>

                            <!-- Short text -->
                            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                                Congratulations! Your membership application has been approved. We formally welcome you as a member of the <strong>Association of Dietetics Professionals (ADP)</strong>. Please find your login details below.
                            </p>

                            <!-- Login Credentials Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #166534; border-bottom: 1px solid #bbf7d0; padding-bottom: 8px;">
                                            Login Credentials
                                        </h3>

                                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #334155;">
                                            <strong>User ID:</strong> <span style="color: #0f172a;">{{UserId}}</span>
                                        </p>
                                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #334155;">
                                            <strong>Password:</strong> <span style="color: #0f172a;">{{TemporaryPassword}}</span>
                                        </p>
                                        <p style="margin: 10px 0 0 0; font-size: 12px; color: #64748b;">
                                            For security, please change your password after first login from your profile settings.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                                You can use these credentials to sign in to your member dashboard, complete your profile, and access member resources and upcoming events.
                            </p>

                            <!-- Call to Action Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 30px;">
                                        <a href="https://www.adp.org.in/login/" target="_blank" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.4);">
                                            Access Member Dashboard
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 0;">
                                If you face any difficulty logging in, please contact us at <a href="mailto:info@adp.org.in" style="color: #10b981; text-decoration: none;">info@adp.org.in</a>.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 40px 50px; background-color: #0f172a; color: #94a3b8;">

                            <!-- Social Links -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                                <tr>
                                    <td align="center">
                                        <a href="https://www.facebook.com/adp.org.in" style="display: inline-block; margin: 0 10px; color: #94a3b8; text-decoration: none;">Facebook</a>
                                        <a href="https://x.com/adp_org_in" style="display: inline-block; margin: 0 10px; color: #94a3b8; text-decoration: none;">Twitter (X)</a>
                                        <a href="https://www.linkedin.com/company/adp-org-in/" style="display: inline-block; margin: 0 10px; color: #94a3b8; text-decoration: none;">LinkedIn</a>
                                        <a href="https://www.instagram.com/adp.org.in/" style="display: inline-block; margin: 0 10px; color: #94a3b8; text-decoration: none;">Instagram</a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Contact Info -->
                            <p style="font-size: 14px; margin: 0 0 10px 0; text-align: center;">
                                <strong>Association of Dietetics Professionals</strong><br>
                                New Delhi - 110059, India
                            </p>
                            <p style="font-size: 14px; margin: 0 0 20px 0; text-align: center;">
                                <a href="mailto:info@adp.org.in" style="color: #10b981; text-decoration: none;">info@adp.org.in</a> | 
                                <a href="tel:+918059655000" style="color: #10b981; text-decoration: none;">+91 80596 55000</a>
                            </p>

                            <!-- Copyright -->
                            <p style="font-size: 12px; margin: 0; text-align: center; color: #64748b;">
                                &copy; 2026 Association of Dietetics Professionals. All rights reserved.<br>
                                You are receiving this email because you are a registered member of ADP.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>

</body>
</html>

""";

    public const string PasswordResetAdminNotificationEmailTemplate = $$$"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ADP – Password Reset</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">

    <!-- Main Wrapper -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; padding: 40px 0;">
        <tr>
            <td align="center">

                <!-- Content Container -->
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">

                    <!-- Header -->
                    <tr>
                        <td align="center" style="background-color: #ffffff; padding: 40px 0; border-bottom: 3px solid #10b981;">
                            <img src="{{{LogoDataUri}}}" alt="ADP Logo" width="80" style="display: block; margin-bottom: 10px;">
                            <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                                Association of Dietetics Professionals
                            </h1>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 40px 50px;">

                            <!-- Greeting -->
                            <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 600;">
                                Dear {{Name}},
                            </h2>

                            <!-- Message -->
                            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                                Your account password has been reset by an administrator of the 
                                <strong>Association of Dietetics Professionals (ADP)</strong>.
                            </p>

                            <!-- Temporary Password Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #991b1b; border-bottom: 1px solid #fecaca; padding-bottom: 8px;">
                                            Temporary Password
                                        </h3>

                                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #334155;">
                                            <strong>Password:</strong> 
                                            <span style="color: #0f172a; font-weight: 600;">{{TemporaryPassword}}</span>
                                        </p>

                                        <p style="margin: 10px 0 0 0; font-size: 12px; color: #64748b;">
                                            For security reasons, this is a temporary password. Please change it immediately after logging in.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                                Please log in using this temporary password and update it from your profile settings to ensure your account remains secure.
                            </p>

                            <!-- Call to Action Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 30px;">
                                        <a href="https://www.adp.org.in/login/" target="_blank"
                                           style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.4);">
                                            Login to Your Account
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 0;">
                                If you did not request this reset or need assistance, please contact us at 
                                <a href="mailto:info@adp.org.in" style="color: #10b981; text-decoration: none;">
                                    info@adp.org.in
                                </a>.
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 40px 50px; background-color: #0f172a; color: #94a3b8;">

                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                                <tr>
                                    <td align="center">
                                        <a href="https://www.facebook.com/adp.org.in" style="display: inline-block; margin: 0 10px; color: #94a3b8; text-decoration: none;">Facebook</a>
                                        <a href="https://x.com/adp_org_in" style="display: inline-block; margin: 0 10px; color: #94a3b8; text-decoration: none;">Twitter (X)</a>
                                        <a href="https://www.linkedin.com/company/adp-org-in/" style="display: inline-block; margin: 0 10px; color: #94a3b8; text-decoration: none;">LinkedIn</a>
                                        <a href="https://www.instagram.com/adp.org.in/" style="display: inline-block; margin: 0 10px; color: #94a3b8; text-decoration: none;">Instagram</a>
                                    </td>
                                </tr>
                            </table>

                            <p style="font-size: 14px; margin: 0 0 10px 0; text-align: center;">
                                <strong>Association of Dietetics Professionals</strong><br>
                                New Delhi - 110059, India
                            </p>

                            <p style="font-size: 14px; margin: 0 0 20px 0; text-align: center;">
                                <a href="mailto:info@adp.org.in" style="color: #10b981; text-decoration: none;">info@adp.org.in</a> | 
                                <a href="tel:+918059655000" style="color: #10b981; text-decoration: none;">+91 80596 55000</a>
                            </p>

                            <p style="font-size: 12px; margin: 0; text-align: center; color: #64748b;">
                                &copy; 2026 Association of Dietetics Professionals. All rights reserved.
                            </p>

                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>

</body>
</html>
""";

      
}