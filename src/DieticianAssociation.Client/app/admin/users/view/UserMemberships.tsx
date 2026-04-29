import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface UserMembershipsProps {
  memberships: any[];
}

export default function UserMemberships({ memberships }: UserMembershipsProps) {
  const getStatusBadge = (status: number) => {
    const statuses = [
      { label: "Active", variant: "default" as const },
      { label: "Expired", variant: "destructive" as const },
      { label: "Pending", variant: "secondary" as const },
      { label: "Suspended", variant: "outline" as const },
    ];
    return (
      statuses[status] || { label: "Unknown", variant: "outline" as const }
    );
  };

  const getTierName = (tier: number) => {
    const tiers = ["Student", "Professional", "Premium"];
    return tiers[tier] || "Unknown";
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Membership History</CardTitle>
        <CardDescription>
          All membership plans associated with this user
        </CardDescription>
      </CardHeader>
      <CardContent>
        {memberships.length > 0 ? (
          <div className="overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Renewed At</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberships.map((membership) => {
                  const statusInfo = getStatusBadge(membership.status);
                  return (
                    <TableRow key={membership.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {membership.applicationRequestId || "—"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {membership.membershipPlanName}
                      </TableCell>
                      <TableCell>{getTierName(membership.tier)}</TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(membership.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(membership.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {membership.renewedAt
                          ? new Date(membership.renewedAt).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {new Date(membership.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No membership records found
          </p>
        )}
      </CardContent>
    </Card>
  );
}
