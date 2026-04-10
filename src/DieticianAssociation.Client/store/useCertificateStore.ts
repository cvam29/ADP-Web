"use client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  getDieticianAssociationAPI,
  CertificateDto,
} from "../services/generated";
import { handleError } from "./storeUtils";
import { toast } from "@/hooks/use-toast";

const api = getDieticianAssociationAPI();

interface CertificateState {
  certificates: CertificateDto[];
  adminCertificates: CertificateDto[];
  verifiedCertificate?: CertificateDto | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  message: string | null;

  // API actions
  fetchMyCertificates: () => Promise<void>;
  fetchUserCertificatesAdmin: (userId: string) => Promise<void>;
  verifyCertificate: (certificateNumber: string) => Promise<void>;
  removeError: () => void;
  clearMessage: () => void;
}

export const useCertificateStore = create<CertificateState>()(
  devtools((set) => ({
    certificates: [],
    adminCertificates: [],
    verifiedCertificate: null,
    loading: false,
    error: null,
    success: false,
    message: null,

    fetchMyCertificates: async () => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const result = await api.getApiCertificatesMyCertificates();
        set({
          certificates: result.data ?? [],
          loading: false,
          success: true,
          message: "Certificates fetched successfully",
        });
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false, success: false });

        toast({
          title: "Certificate Error",
          description: error,
          variant: "error",
        });
      }
    },

    fetchUserCertificatesAdmin: async (userId: string) => {
      set({ loading: true, error: null, success: false, message: null, adminCertificates: [] });
      try {
        const result = await api.getApiCertificatesUserUserId(userId);
        set({
          adminCertificates: result.data ?? [],
          loading: false,
          success: true,
          message: "User certificates fetched successfully",
        });
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false, success: false, adminCertificates: [] });

        toast({
          title: "Certificate Error",
          description: error,
          variant: "error",
        });
      }
    },

    verifyCertificate: async (certificateNumber: string) => {
      set({ loading: true, error: null, success: false, message: null, verifiedCertificate: null });
      try {
        const result = await api.getApiCertificatesVerify({certificateNumber});
        set({
          verifiedCertificate: result.data,
          loading: false,
          success: true,
          message: "Certificate verified successfully",
        });
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false, success: false, verifiedCertificate: null });

        toast({
          title: "Certificate Error",
          description: error,
          variant: "error",
        });
        return null;
      }
    },

    removeError: () => set({ error: null }),
    clearMessage: () => set({ message: null, success: false }),
  }))
);
