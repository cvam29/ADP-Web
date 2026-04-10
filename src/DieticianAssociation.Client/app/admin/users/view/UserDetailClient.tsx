"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import UserOverview from "./UserOverview";
import UserMemberships from "./UserMemberships";
import UserAddresses from "./UserAddresses";
import UserEducation from "./UserEducation";
import UserPayments from "./UserPayments";
import UserCertificates from "./UserCertificates";
import { useUserStore } from "@/store/useUsersStore";
import { getDieticianAssociationAPI } from "@/services/generated";

interface UserDetailClientProps {
  userDetail: any;
}

export default function UserDetailClient({
  userDetail,
}: UserDetailClientProps) {
  const router = useRouter();
  const [localUserDetail, setLocalUserDetail] = useState(userDetail);
  const [activeTab, setActiveTab] = useState("overview");
  const { updatePaymentStatus } = useUserStore();
  const api = getDieticianAssociationAPI();

  const handlePaymentStatusChange = async (
    paymentId: string,
    newStatus: number,
  ) => {
    await updatePaymentStatus(paymentId, newStatus);
    // Refresh user detail to show updated payment status
    const res = await api.getApiUsersIdDetail(userDetail.id);
    setLocalUserDetail(res.data);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {localUserDetail.name}
          </h1>
          <p className="mt-1 text-sm text-gray-600">{localUserDetail.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="memberships">
            Memberships ({localUserDetail.memberships?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="addresses">
            Addresses ({localUserDetail.addresses?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="education">
            Education ({localUserDetail.educationQualifications?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="payments">
            Payments ({localUserDetail.paymentRecords?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="consent">Consent</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <UserOverview user={localUserDetail} />
        </TabsContent>

        <TabsContent value="memberships" className="mt-6">
          <UserMemberships memberships={localUserDetail.memberships || []} />
        </TabsContent>

        <TabsContent value="certificates" className="mt-6">
          {activeTab === "certificates" && (
            <UserCertificates userId={localUserDetail.id} />
          )}
        </TabsContent>

        <TabsContent value="addresses" className="mt-6">
          <UserAddresses addresses={localUserDetail.addresses || []} />
        </TabsContent>

        <TabsContent value="education" className="mt-6">
          <UserEducation
            qualifications={localUserDetail.educationQualifications || []}
          />
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <UserPayments
            payments={localUserDetail.paymentRecords || []}
            onPaymentStatusChange={handlePaymentStatusChange}
          />
        </TabsContent>

        <TabsContent value="consent" className="mt-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>User Consent</CardTitle>
              <CardDescription>
                User agreement to terms, privacy policy, and data usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {localUserDetail.userConsent ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Agree to Terms:</span>
                    <span
                      className={
                        localUserDetail.userConsent.agreeToTerms
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {localUserDetail.userConsent.agreeToTerms ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Agree to Privacy Policy:
                    </span>
                    <span
                      className={
                        localUserDetail.userConsent.agreeToPrivacyPolicy
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {localUserDetail.userConsent.agreeToPrivacyPolicy
                        ? "Yes"
                        : "No"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Agree to Data Usage:
                    </span>
                    <span
                      className={
                        localUserDetail.userConsent.agreeToDataUsage
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {localUserDetail.userConsent.agreeToDataUsage
                        ? "Yes"
                        : "No"}
                    </span>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-600">
                      Consented At:{" "}
                      {new Date(
                        localUserDetail.userConsent.consentedAt,
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No consent data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
