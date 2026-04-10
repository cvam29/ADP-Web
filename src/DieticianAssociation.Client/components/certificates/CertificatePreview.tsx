"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CertificateDto } from "@/services/generated";
import Frame from "react-frame-component";

interface CertificatePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  certificate: CertificateDto | null;
  onDownload: () => Promise<void>;
}

export default function CertificatePreviewDialog({
  open,
  onClose,
  certificate,
  onDownload,
}: CertificatePreviewDialogProps) {
  if (!certificate) return null;


  const getBackgroundClass = (certificate: CertificateDto) => {
  if (certificate.memberShipName === "Lifetime") return "bg-professional";
  if (certificate.memberShipName === "Student") return "bg-student";
  return "bg-premium";
};


  //certificate/certificate.css
  // ${certificate.orgRegistrationNumber || "----"}

  const buildCertificateHTML = (certificate: CertificateDto) => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>certificate</title>
	<link rel="stylesheet" href="/certificate/certificate.css">
  </head>
  <body class="${getBackgroundClass(certificate)}">  
    <!--certificate-->
		<div class="background-main">
			<div class="certificate">
       <!-- Watermark logo -->
  <div class="watermark-logo">
    <img src="/certificate/logo-final.png" alt="ADP Logo" width="200" height="200" >
  </div>
				<div class="top">
					<div class="regg">
						<p class="reg"><b>&nbsp;&nbsp;&nbsp;Reg. No:  ${
              certificate.orgRegistrationNumber || "----"
            }</b></p>
					</div>
					<div class="regg">
						<p class="reg"><b>Darpan ID: ${certificate.darpanId || "----"}</b>&nbsp;&nbsp;&nbsp;</p>
					</div>
				</div>
				<div class="middel-text">
					<div class="regg">
						<h1>CERTIFICATE</h1>
						<h2><span>OF MEMBERSHIP</span><br> of <b>Association of Dietetics Professionals </b></h2>
						<p class="certify">This is to certify that <b>${
              certificate.participantName || "-----------"
            }</b> is <b>${certificate.memberShipName || "Registered"}&nbsp;member </b> of <br> the Association of Dietetics Professionals. This Certificate is Issued on<br>
							<b>${
                certificate.issueDate
                  ? new Date(certificate.issueDate).toLocaleDateString()
                  : "dd-mm-yyyy"
              }</b> &nbsp;Valid Upto <b>${
    certificate.expireDate
      ? new Date(certificate.expireDate).toLocaleDateString()
      : "Lifetime"
  }</b>.
						</p>
						<p class="Registration">Registration No: ${
              certificate.certificateNumber || "----"
            }</p>
							</div>
				</div>
				<div class="main-sign">
					<div class="signnn">
						 <div class="sign">
						    &nbsp;&nbsp;<img src="/certificate/sign.png" alt="ADP Logo" width="120" class="signn">
							<h4>&nbsp;&nbsp;&nbsp;Deepak Kumar</h4>
							<p>&nbsp;Secretary, ADP</p>
						</div>
					</div>
					<div class="signn">
						<div class="logo">
							<img src="data:image/png;base64,${certificate.qrCodeBase64}" alt="ADP Logo" width="100">
						</div>
					</div>
					<div class="signn">
						<div class="sign">
							 <img src="/certificate/sign1.png" alt="ADP Logo" width="120" class="signnn">&nbsp;&nbsp;
							<h4>&nbsp;&nbsp;Ravi Kumar&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</h4>
							<p>&nbsp;&nbsp;President, ADP&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	<!--certificate-->
  </body>
</html>
`;

  const getSafeCertificateId = (certificateNumber: string) =>
    certificateNumber.replace(/[^\w-]/g, "_");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Certificate Preview</DialogTitle>
        </DialogHeader>

       <div className="w-[900px] h-[600px] border rounded overflow-hidden mx-auto">
          <Frame
            id={`certificate-preview-${getSafeCertificateId(
              certificate.certificateNumber ?? ""
            )}`}
            style={{ width: "100%", height: "100%", border: "none" }}
            initialContent={buildCertificateHTML(certificate)}
          >
            <></>
          </Frame>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onDownload}>Download</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
