'use client'

import React, { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import PageLoading from '@/components/page-loading'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Award } from 'lucide-react'
import { useCertificateStore } from '@/store/useCertificateStore'

export default function CertificateVerificationPage() {
  const searchParams = useSearchParams()
  const certificateNumber = searchParams?.get('certificateNumber') || ''

  const { verifiedCertificate, loading, verifyCertificate } = useCertificateStore()

  useEffect(() => {
    if (certificateNumber) {
      verifyCertificate(certificateNumber)
    }
  }, [certificateNumber, verifyCertificate])

  return (
  <div className="flex justify-center items-center min-h-[80vh] px-4">
    <div className="w-full max-w-4xl space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Certificate Verification
        </h1>
        <p className="text-muted-foreground">
          Verify the authenticity of issued certificates
        </p>
      </div>

      {loading ? (
        <PageLoading
          minHeightClassName="py-10"
          direction="column"
          iconClassName="h-10 w-10 text-primary"
          message=""
        />
      ) : verifiedCertificate ? (
        <Card className="shadow-xl rounded-2xl p-6">
          <CardHeader className="border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-xl">
                  Certificate #{verifiedCertificate.certificateNumber}
                </CardTitle>
                <CardDescription>
                  Issued by the Association of Dietetics Professionals
                </CardDescription>
              </div>
              <Badge
                className={`px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1 ${
                  verifiedCertificate.isValid
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {verifiedCertificate.isValid ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Valid
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Invalid
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 mt-4">
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-base">
              <p>
                <span className="font-medium">Member:</span>{' '}
                {verifiedCertificate.participantName}
              </p>
              <p>
                <span className="font-medium">Org Registration #:</span>{' '}
                {verifiedCertificate.orgRegistrationNumber}
              </p>
              <p>
                <span className="font-medium">Darpan ID:</span>{' '}
                {verifiedCertificate.darpanId}
              </p>
              <p>
                <span className="font-medium">Issued:</span>{' '}
                {verifiedCertificate.issueDate}
              </p>
              <p>
                <span className="font-medium">Expires:</span>{' '}
                {verifiedCertificate.expireDate}
              </p>
            </div>

            {/* {verifiedCertificate.qrCodeBase64 && (
              <div className="flex justify-center mt-6">
                <img
                  src={`data:image/png;base64,${verifiedCertificate.qrCodeBase64}`}
                  alt={`QR Code for ${verifiedCertificate.certificateNumber}`}
                  className="w-48 h-48 rounded-md border shadow-md"
                />
              </div>
            )} */}
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center py-12 shadow-md rounded-2xl">
          <CardContent>
            <Award className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              No certificate found for <span className="font-semibold">&ldquo;{certificateNumber}&rdquo;</span>.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  </div>
)
}
