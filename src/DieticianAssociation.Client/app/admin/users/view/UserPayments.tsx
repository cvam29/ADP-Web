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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface UserPaymentsProps {
  payments: any[];
  onPaymentStatusChange?: (
    paymentId: string,
    newStatus: number,
  ) => Promise<void>;
}

export default function UserPayments({
  payments,
  onPaymentStatusChange,
}: UserPaymentsProps) {
  const getMethodName = (method: number) => {
    return method === 0 ? "UPI" : "Bank Transfer";
  };

  const getStatusBadge = (status: number) => {
    const statuses = [
      { label: "Pending", variant: "secondary" as const },
      { label: "Verified", variant: "default" as const },
      { label: "Rejected", variant: "destructive" as const },
      { label: "Refunded", variant: "outline" as const },
    ];
    return (
      statuses[status] || { label: "Unknown", variant: "outline" as const }
    );
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Payment Records</CardTitle>
        <CardDescription>
          Transaction history and payment details
        </CardDescription>
      </CardHeader>
      <CardContent>
        {payments.length > 0 ? (
          <div className="overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Transaction Ref</TableHead>
                  <TableHead>Bank/Gateway</TableHead>
                  <TableHead>Paid At</TableHead>
                  <TableHead>Proof</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => {
                  const statusInfo = getStatusBadge(payment.status);
                  return (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="text-sm">{payment.referenceType}</p>
                          <p className="text-xs text-muted-foreground">
                            {payment.referenceId}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ₹{payment.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>{getMethodName(payment.method)}</TableCell>
                      <TableCell>
                        {onPaymentStatusChange ? (
                          <Select
                            value={String(payment.status)}
                            onValueChange={(val) =>
                              onPaymentStatusChange(payment.id, Number(val))
                            }
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Pending</SelectItem>
                              <SelectItem value="1">Verified</SelectItem>
                              <SelectItem value="2">Rejected</SelectItem>
                              <SelectItem value="3">Refunded</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.label}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {payment.transactionReference || "—"}
                      </TableCell>
                      <TableCell>{payment.bankOrGatewayName || "—"}</TableCell>
                      <TableCell>
                        {new Date(payment.paidAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {payment.proofFilePath ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              window.open(payment.proofFilePath, "_blank")
                            }
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No payment records found
          </p>
        )}
      </CardContent>
    </Card>
  );
}
