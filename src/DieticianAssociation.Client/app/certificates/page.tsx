"use client";

import { useEffect } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { CertificateDisplay } from "@/components/certificates/CertificateDisplay";
import { useCertificateStore } from "@/store/useCertificateStore"; // ✅ import the store

export default function CertificatesPage() {
  const {
    certificates,
    fetchMyCertificates,
    loading,
    error,
  } = useCertificateStore();

  // Fetch certificates on mount
  useEffect(() => {
    fetchMyCertificates();
  }, [fetchMyCertificates]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              My Certificates
            </h1>
            <p className="text-slate-600">
              View and download your earned certificates and achievements.
            </p>
          </div>

          {/* Loading & Error Handling */}
          {loading && <p className="text-slate-600">Loading certificates...</p>}
          {error && <p className="text-red-600 font-medium">Error: {error}</p>}

          {/* Certificate list */}
          {!loading && !error && (
            <CertificateDisplay certificates={certificates} /> 
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
