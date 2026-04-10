'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Award,
  Calendar,
  User,
  Hash,
  CheckCircle,
  XCircle,
  Eye,
  Download,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { CertificateDto } from '@/services/generated'
import { Button } from '@/components/ui/button'
import CertificatePreview from '@/components/certificates/CertificatePreview'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { toast } from '@/hooks/use-toast'

interface CertificateDisplayProps {
  certificates: CertificateDto[]
}

export function CertificateDisplay({ certificates }: CertificateDisplayProps) {
  const [selectedCertificate, setSelectedCertificate] =
    useState<CertificateDto | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handlePreview = (certificate: CertificateDto) => {
    setSelectedCertificate(certificate)
    setDialogOpen(true)
  }

  const getSafeCertificateId = (certificateNumber: string) => {
  return certificateNumber.replace(/[^\w-]/g, "_"); // keeps a-zA-Z0-9 and replaces others with _
};

const handleDownload = async (certificate: CertificateDto) => {
  try {
    // Select the iframe used for preview 
    const iframe = document.querySelector<HTMLIFrameElement>(
  `iframe#certificate-preview-${getSafeCertificateId(certificate.certificateNumber??"")}`
);
    if (!iframe) throw new Error("Certificate preview not found");

    // Access iframe document
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) throw new Error("Cannot access certificate content");

    // Convert iframe content to canvas
    const canvas = await html2canvas(iframeDoc.body, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("l", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`certificate-${certificate.certificateNumber || "unknown"}.pdf`);

    toast({
      title: "Download Complete",
      description: "Your certificate has been downloaded as PDF.",
    });
  } catch (err) {
    console.error(err);
    toast({
      title: "Download Failed",
      description: "Unable to download certificate. Please try again.",
    });
  }
};


  const CertificateCard = ({ certificate }: { certificate: CertificateDto }) => (
    <Card className="w-full shadow-md rounded-2xl border hover:shadow-lg transition">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-yellow-600" />
            <div>
              <CardTitle className="text-xl font-semibold">
                {certificate.participantName}
              </CardTitle>
              <CardDescription className="mt-1 text-sm text-muted-foreground">
                Certificate #{certificate.certificateNumber}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {certificate.isValid ? (
              <Badge className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                <CheckCircle className="w-3 h-3 mr-1" />
                Valid
              </Badge>
            ) : (
              <Badge variant="destructive" className="px-2 py-1 rounded-full">
                <XCircle className="w-3 h-3 mr-1" />
                Invalid
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span>
              <strong>Member:</strong> {certificate.participantName}
            </span>
          </div>
          {certificate.issueDate && (
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <span>
                <strong>Issued:</strong>{' '}
                {formatDistanceToNow(new Date(certificate.issueDate), {
                  addSuffix: true,
                })}
              </span>
            </div>
          )}
          {certificate.expireDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>
                <strong>Expires:</strong>{' '}
                {new Date(certificate.expireDate).toLocaleDateString()}
              </span>
            </div>
          )}
          {certificate.orgRegistrationNumber && (
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-muted-foreground" />
              <span>
                <strong>Org Reg#:</strong> {certificate.orgRegistrationNumber}
              </span>
            </div>
          )}
          {certificate.darpanId && (
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-muted-foreground" />
              <span>
                <strong>Darpan ID:</strong> {certificate.darpanId}
              </span>
            </div>
          )}
        </div>

        {/* QR Code */}
        {certificate.qrCodeBase64 && (
          <div className="mt-6 flex justify-end">
            <Image
              src={`data:image/png;base64,${certificate.qrCodeBase64}`}
              alt={`QR Code for ${certificate.certificateNumber}`}
              width={160}
              height={160}
              unoptimized
              className="w-40 h-40 rounded-md border shadow-sm"
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-3 pt-4 border-t">
        <Button variant="outline" size="sm" onClick={() => handlePreview(certificate)}>
          <Eye className="w-4 h-4 mr-1" /> Preview
        </Button>
        {/* <Button size="sm" onClick={() => handleDownload(certificate)}>
          <Download className="w-4 h-4 mr-1" /> Download
        </Button> */}
      </CardFooter>
    </Card>
  )

  return (
    <div className="space-y-6">
      {certificates.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="text-center py-12">
            <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">No Certificates Available</h3>
            <p className="text-muted-foreground text-sm">
              Purchased membership certificates will appear here once available.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {certificates.map((certificate, idx) => (
            <CertificateCard key={idx} certificate={certificate} />
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <CertificatePreview
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        certificate={selectedCertificate}
        onDownload={() =>
          selectedCertificate ? handleDownload(selectedCertificate) : Promise.resolve()
        }
      />
    </div>
  )
}
