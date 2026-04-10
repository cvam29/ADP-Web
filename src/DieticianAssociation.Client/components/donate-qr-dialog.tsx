"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, ExternalLink } from "lucide-react";

type DonateQRCodeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DonateQRCodeDialog({
  open,
  onOpenChange,
}: DonateQRCodeDialogProps) {
  const donationUrl = useMemo(() => {
    // Must be NEXT_PUBLIC_ to be available on the client
    return process.env.NEXT_PUBLIC_DONATION_URL || "DIETETICSPROFESSION@SRCB";
  }, []);

  const [qrDataUrl, setQrDataUrl] = useState<string>(
    "https://adpblobstorage.blob.core.windows.net/adpcontainer/Payment/Qr-Code/img7.jpg",
  );

  // useEffect(() => {
  //   let active = true
  // async function generate() {
  //   try {
  //     const dataUrl = await QRCode.toDataURL(donationUrl, {
  //       width: 512,
  //       margin: 2,
  //       errorCorrectionLevel: "M",
  //       color: { dark: "#111111", light: "#ffffff" },
  //     })
  //     if (active) setQrDataUrl(dataUrl)
  //   } catch (err) {
  //     console.error("Failed to generate QR:", err)
  //   }
  // }

  // if (open) {
  //   generate()
  // }

  // return () => {
  //   active = false
  // }
  // }, [open, donationUrl])

  const handleDownload = () => {
    if (!qrDataUrl) return;
    window.open(qrDataUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Support our mission</DialogTitle>
          {/* <DialogDescription>Scan the QR code.</DialogDescription> */}
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <div className="w-full space-y-2 text-center">
            <Label htmlFor="donation-url" className="text-xs text-slate-500 ">
              ASSOCIATION OF DIETETICS PROFESSIONALS
            </Label>
          </div>
          <div className="rounded-lg border p-3 bg-white">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt="Donation QR code"
                className="h-48 w-48 sm:h-56 sm:w-56 object-contain"
                width={224}
                height={224}
              />
            ) : (
              <div
                className="h-48 w-48 sm:h-56 sm:w-56 animate-pulse rounded-md bg-slate-100"
                aria-hidden="true"
              />
            )}
          </div>

          <div className="w-full space-y-2 text-center">
            <Label htmlFor="donation-url" className="text-xs text-slate-500 ">
              UPI ID: DIETETICSPROFESSION@SRCB
            </Label>
            {/* <div className="flex items-center gap-2"> */}
            {/* <Input id="donation-url" readOnly value={donationUrl} className="text-sm" /> */}
            {/* <Button asChild variant="outline">
                <a href={donationUrl} target="_blank" rel="noopener noreferrer" aria-label="Open donation link">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button> */}
            {/* </div> */}
          </div>
          {/* ✅ Add payment method image below QR code */}
          <div className="flex justify-center">
            <Image
              src="https://adpblobstorage.blob.core.windows.net/adpcontainer/Payment/Qr-Code/payment-methods.avif" // 👈 move your uploaded file to `public/images/payment-methods.png`
              alt="Supported Payment Methods"
              width={256}
              height={96}
              unoptimized
              className="w-64 object-contain"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:space-x-0">
          <Button
            onClick={handleDownload}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Download QR
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
