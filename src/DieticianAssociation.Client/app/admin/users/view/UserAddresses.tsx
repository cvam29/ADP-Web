import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UserAddressesProps {
  addresses: any[];
}

export default function UserAddresses({ addresses }: UserAddressesProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Addresses</CardTitle>
        <CardDescription>
          All registered addresses for this user
        </CardDescription>
      </CardHeader>
      <CardContent>
        {addresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <Card key={address.id} className="shadow-sm">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{address.streetAddress}</p>
                        {address.addressLine2 && (
                          <p className="text-sm text-muted-foreground">
                            {address.addressLine2}
                          </p>
                        )}
                      </div>
                      {address.isPrimary && (
                        <Badge variant="default" className="ml-2">
                          Primary
                        </Badge>
                      )}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <p>
                        {address.cityName}, {address.stateName}
                      </p>
                      <p>{address.countryName}</p>
                      <p className="font-medium mt-1 text-foreground">{address.postalCode}</p>
                    </div>

                    <div className="pt-3 border-t text-xs text-muted-foreground">
                      Added: {new Date(address.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">No addresses found</p>
        )}
      </CardContent>
    </Card>
  );
}
