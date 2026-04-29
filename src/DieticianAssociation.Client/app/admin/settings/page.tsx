"use client"

import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Settings, 
  Save, 
  Globe, 
  Shield,
  Bell,
  Mail,
  Users,
  CreditCard,
  Database,
  Key,
  Upload,
  Download,
  RefreshCw,
  AlertTriangle,
} from "lucide-react"
import { ADPSpinner } from "@/components/ui/adp-spinner"

export default function SettingsManagement() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("general")
  const [isSaving, setIsSaving] = useState(false)

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Association of Dietetics Professionals",
    siteDescription: "Professional platform for registered dieticians",
    contactEmail: "contact@dieticianassociation.com",
    supportEmail: "support@dieticianassociation.com",
    timezone: "IST",
    language: "en",
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true
  })

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8,
    requireSpecialCharacters: true,
    requireNumbers: true,
    requireUppercase: true,
    sessionTimeout: 30,
    twoFactorEnabled: false,
    loginAttemptLimit: 5,
    lockoutDuration: 15,
    ipWhitelist: "",
    allowedFileTypes: ".jpg,.jpeg,.png,.pdf,.doc,.docx"
  })

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: true,
    systemAlerts: true,
    userRegistrationAlert: true,
    paymentFailureAlert: true,
    lowStockAlert: true,
    newsletterSchedule: "weekly",
    digestFrequency: "daily"
  })

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    paymentProvider: "stripe",
    stripePublishableKey: "",
    stripeSecretKey: "",
    paypalClientId: "",
    paypalSecret: "",
    currency: "USD",
    taxRate: 8.5,
    processingFee: 2.9,
    refundEnabled: true,
    recurringBilling: true
  })

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUsername: "",
    smtpPassword: "",
    fromEmail: "noreply@dieticianassociation.com",
    fromName: "Association of Dietetics Professionals",
    encryptionType: "TLS",
    authRequired: true,
    emailTemplateHeader: "",
    emailTemplateFooter: ""
  })

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/unauthorized")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ADPSpinner size="md" />
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return null
  }

  const handleSave = async (section: string) => {
    setIsSaving(true)
    // Here you would save the settings to your API
    //console.log(`Saving ${section} settings`)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSaving(false)
  }

  const handleBackup = () => {
    //console.log("Creating backup...")
  }

  const handleRestore = () => {
    //console.log("Restoring from backup...")
  }

  return (
    <div className="w-full px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">System Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Configure platform settings and preferences</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={handleBackup}>
            <Download className="w-4 h-4" />
            Backup
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleRestore}>
            <Upload className="w-4 h-4" />
            Restore
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general" className="gap-2">
                <Globe className="w-4 h-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="w-4 h-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="payments" className="gap-2">
                <CreditCard className="w-4 h-4" />
                Payments
              </TabsTrigger>
              <TabsTrigger value="email" className="gap-2">
                <Mail className="w-4 h-4" />
                Email
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Configuration</CardTitle>
                  <CardDescription>Basic platform settings and configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input
                        id="siteName"
                        value={generalSettings.siteName}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={generalSettings.contactEmail}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Textarea
                      id="siteDescription"
                      value={generalSettings.siteDescription}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select value={generalSettings.timezone} onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, timezone: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EST">Eastern (EST)</SelectItem>
                          <SelectItem value="CST">Central (CST)</SelectItem>
                          <SelectItem value="MST">Mountain (MST)</SelectItem>
                          <SelectItem value="PST">Pacific (PST)</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Default Language</Label>
                      <Select value={generalSettings.language} onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, language: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                        <p className="text-sm text-muted-foreground">Put the site in maintenance mode</p>
                      </div>
                      <Switch
                        id="maintenanceMode"
                        checked={generalSettings.maintenanceMode}
                        onCheckedChange={(checked) => setGeneralSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="registrationEnabled">User Registration</Label>
                        <p className="text-sm text-muted-foreground">Allow new user registrations</p>
                      </div>
                      <Switch
                        id="registrationEnabled"
                        checked={generalSettings.registrationEnabled}
                        onCheckedChange={(checked) => setGeneralSettings(prev => ({ ...prev, registrationEnabled: checked }))}
                      />
                    </div>
                  </div>
                  
                  <Button onClick={() => handleSave("general")} disabled={isSaving} className="gap-2">
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save General Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Configuration</CardTitle>
                  <CardDescription>Password policies and security measures</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                      <Input
                        id="passwordMinLength"
                        type="number"
                        value={securitySettings.passwordMinLength}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="requireSpecialCharacters">Require Special Characters</Label>
                        <p className="text-sm text-muted-foreground">Passwords must contain special characters</p>
                      </div>
                      <Switch
                        id="requireSpecialCharacters"
                        checked={securitySettings.requireSpecialCharacters}
                        onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, requireSpecialCharacters: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="twoFactorEnabled">Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">Enable 2FA for all users</p>
                      </div>
                      <Switch
                        id="twoFactorEnabled"
                        checked={securitySettings.twoFactorEnabled}
                        onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: checked }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="loginAttemptLimit">Login Attempt Limit</Label>
                      <Input
                        id="loginAttemptLimit"
                        type="number"
                        value={securitySettings.loginAttemptLimit}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, loginAttemptLimit: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                      <Input
                        id="lockoutDuration"
                        type="number"
                        value={securitySettings.lockoutDuration}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, lockoutDuration: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSave("security")} disabled={isSaving} className="gap-2">
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Security Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Configure system and user notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Send notifications via email</p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="pushNotifications">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Send browser push notifications</p>
                      </div>
                      <Switch
                        id="pushNotifications"
                        checked={notificationSettings.pushNotifications}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="systemAlerts">System Alerts</Label>
                        <p className="text-sm text-muted-foreground">Notify admins of system events</p>
                      </div>
                      <Switch
                        id="systemAlerts"
                        checked={notificationSettings.systemAlerts}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, systemAlerts: checked }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newsletterSchedule">Newsletter Schedule</Label>
                      <Select value={notificationSettings.newsletterSchedule} onValueChange={(value) => setNotificationSettings(prev => ({ ...prev, newsletterSchedule: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="disabled">Disabled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="digestFrequency">Digest Frequency</Label>
                      <Select value={notificationSettings.digestFrequency} onValueChange={(value) => setNotificationSettings(prev => ({ ...prev, digestFrequency: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="realtime">Real-time</SelectItem>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={() => handleSave("notifications")} disabled={isSaving} className="gap-2">
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Notification Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Settings */}
            <TabsContent value="payments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Configuration</CardTitle>
                  <CardDescription>Configure payment providers and settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentProvider">Payment Provider</Label>
                    <Select value={paymentSettings.paymentProvider} onValueChange={(value) => setPaymentSettings(prev => ({ ...prev, paymentProvider: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stripe">Stripe</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="square">Square</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={paymentSettings.currency} onValueChange={(value) => setPaymentSettings(prev => ({ ...prev, currency: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="CAD">CAD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxRate">Tax Rate (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        step="0.1"
                        value={paymentSettings.taxRate}
                        onChange={(e) => setPaymentSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="refundEnabled">Refunds Enabled</Label>
                        <p className="text-sm text-muted-foreground">Allow refunds for payments</p>
                      </div>
                      <Switch
                        id="refundEnabled"
                        checked={paymentSettings.refundEnabled}
                        onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, refundEnabled: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="recurringBilling">Recurring Billing</Label>
                        <p className="text-sm text-muted-foreground">Enable subscription payments</p>
                      </div>
                      <Switch
                        id="recurringBilling"
                        checked={paymentSettings.recurringBilling}
                        onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, recurringBilling: checked }))}
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSave("payments")} disabled={isSaving} className="gap-2">
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Payment Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Email Settings */}
            <TabsContent value="email" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Configuration</CardTitle>
                  <CardDescription>SMTP settings and email preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        value={emailSettings.smtpHost}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        type="number"
                        value={emailSettings.smtpPort}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fromEmail">From Email</Label>
                      <Input
                        id="fromEmail"
                        type="email"
                        value={emailSettings.fromEmail}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fromName">From Name</Label>
                      <Input
                        id="fromName"
                        value={emailSettings.fromName}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="encryptionType">Encryption</Label>
                    <Select value={emailSettings.encryptionType} onValueChange={(value) => setEmailSettings(prev => ({ ...prev, encryptionType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TLS">TLS</SelectItem>
                        <SelectItem value="SSL">SSL</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={() => handleSave("email")} disabled={isSaving} className="gap-2">
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Email Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            System Status
          </CardTitle>
          <CardDescription>Current system health and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium">Database</div>
                <div className="text-sm text-muted-foreground">Connected</div>
              </div>
              <Badge className="bg-green-100 text-green-800">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium">Email Service</div>
                <div className="text-sm text-muted-foreground">Operational</div>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <div className="font-medium">Backup</div>
                <div className="text-sm text-muted-foreground">2 hours ago</div>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
