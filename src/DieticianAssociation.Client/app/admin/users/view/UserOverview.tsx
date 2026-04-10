import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface UserOverviewProps {
  user: any;
}

export default function UserOverview({ user }: UserOverviewProps) {
  const getRoleName = (role: number) => {
    const roles = ["Student", "Super Admin", "Admin", "Member"];
    return roles[role] || "Unknown";
  };

  const getNationalityName = (nationality: number) => {
    return nationality === 0 ? "Indian" : "Other";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Personal Information */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.avatar || ""} alt={user.name} />
              <AvatarFallback className="text-lg">
                {user.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{user.name}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm font-medium text-gray-500">Phone</p>
              <p className="text-sm">{user.phoneNumber || "—"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Gender</p>
              <p className="text-sm">{user.gender || "—"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Date of Birth</p>
              <p className="text-sm">
                {user.dob ? new Date(user.dob).toLocaleDateString() : "—"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Nationality</p>
              <p className="text-sm">{getNationalityName(user.nationality)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Role</p>
            <Badge className="mt-1">{getRoleName(user.role)}</Badge>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Organization</p>
            <p className="text-sm">{user.organization || "—"}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Designation</p>
            <p className="text-sm">{user.designation || "—"}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Specializations</p>
            {user.specializations && user.specializations.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-1">
                {user.specializations.map((spec: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {spec}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm">—</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Active</span>
            <Badge variant={user.isActive ? "default" : "destructive"}>
              {user.isActive ? "Yes" : "No"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Featured</span>
            <Badge variant={user.isFeatured ? "default" : "secondary"}>
              {user.isFeatured ? "Yes" : "No"}
            </Badge>
          </div>

          <div className="pt-4 border-t space-y-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Join Date</p>
              <p className="text-sm">
                {new Date(user.joinDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Created At</p>
              <p className="text-sm">
                {new Date(user.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Last Updated</p>
              <p className="text-sm">
                {new Date(user.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Memberships</span>
            <Badge variant="secondary">{user.memberships?.length || 0}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Addresses</span>
            <Badge variant="secondary">{user.addresses?.length || 0}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Education Records</span>
            <Badge variant="secondary">
              {user.educationQualifications?.length || 0}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Payment Records</span>
            <Badge variant="secondary">
              {user.paymentRecords?.length || 0}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Blog Posts</span>
            <Badge variant="secondary">{user.blogPostsCount || 0}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
