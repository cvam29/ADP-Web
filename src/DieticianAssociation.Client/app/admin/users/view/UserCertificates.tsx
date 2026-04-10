"use client";

import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CertificateDisplay } from "@/components/certificates/CertificateDisplay";
import { useCertificateStore } from "@/store/useCertificateStore";
import { ADPSpinner } from "@/components/ui/adp-spinner";

interface UserCertificatesProps {
  userId: string;
}

export default function UserCertificates({ userId }: UserCertificatesProps) {
  const { adminCertificates, loading, error, fetchUserCertificatesAdmin } =
    useCertificateStore();

  useEffect(() => {
    if (userId) {
      fetchUserCertificatesAdmin(userId);
    }
  }, [userId, fetchUserCertificatesAdmin]);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Certificates</CardTitle>
        <CardDescription>
          Membership certificates issued to this user
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <ADPSpinner size="md" />
          </div>
        ) : error ? (
          <p className="text-red-600 text-center py-8">{error}</p>
        ) : (
          <CertificateDisplay certificates={adminCertificates} />
        )}
      </CardContent>
    </Card>
  );
}
