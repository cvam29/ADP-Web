"use client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "@/hooks/use-toast";
import {
  getDieticianAssociationAPI,
  type GetApiMediaParams,
  type PostApiMediaUploadBody,
  type CreateFolderDto,
  type MediaFileDto,
} from "../services/generated";
import { handleError } from "./storeUtils";
import { API_BASE_URL } from "../services/api-client";


interface MediaState {
  media: MediaFileDto[];
  folders: string[];
  folderTree: any; // hierarchical folder structure (untyped until schema provided)
  currentFileInfo: any; // metadata for a single file
  downloading: boolean;
  uploading: boolean;
  loading: boolean; // generic loading (listing, fetching folders, etc.)
  // Pagination / metadata
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  rawMediaResponse?: any;
  error: string | null;
  success: boolean;
  message: string | null;
  currentFilesInfo: [];

  // Actions
  fetchMedia: (params?: GetApiMediaParams) => Promise<MediaFileDto[]>;
  uploadMedia: (file: File, folder?: string) => Promise<void>;
  downloadFile: (fileName: string) => Promise<Blob | undefined>;
  getFileInfo: (fileName: string) => Promise<any>;
  deleteFile: (fileName: string) => Promise<void>;
  fetchFolders: () => Promise<string[]>;
  createFolder: (name: string) => Promise<void>;
  deleteFolder: (name: string) => Promise<void>;
  fetchFolderTree: () => Promise<any>;
  getFileUrl: (fileName: string) => Promise<string | undefined>; // returns a direct URL (if API supplies one)
  getDownloadUrl: (fileName: string) => string; // constructs download endpoint URL (no network call)
  removeError: () => void;
  clearMessage: () => void;
  reset: () => void;
}

const api = getDieticianAssociationAPI();

export const useMediaStore = create<MediaState>()(
  devtools((set, get) => ({
    media: [],
    folders: [],
    folderTree: null,
    currentFileInfo: null,
    downloading: false,
    uploading: false,
    loading: false,
    error: null,
    success: false,
    message: null,
    totalItems: undefined,
    currentPage: undefined,
    pageSize: undefined,
    rawMediaResponse: undefined,

    fetchMedia: async (params) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const res = await api.getApiMedia(params);
        // Attempt to extract list from common shapes: { items: [...] } | [...]
        const data: any = res.data as any;
        const items: MediaFileDto[] = Array.isArray(data)
          ? (data as MediaFileDto[])
          : Array.isArray(data?.items)
            ? (data.items as MediaFileDto[])
            : [];
        const totalItems =
          (data && (data.totalItems ?? data.total ?? data.count)) ?? items.length;
        set({
          media: items,
          loading: false,
          success: true,
          message: "Media fetched successfully",
          totalItems,
          currentPage: params?.page,
          pageSize: params?.pageSize,
          rawMediaResponse: data,
        });
        return items;
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });
        toast({ title: "Media Error", description: error, variant: "error" });
        throw err;
      }
    },

    uploadMedia: async (file, folder) => {
      set({ uploading: true, error: null, success: false, message: null });
      try {
        const body: PostApiMediaUploadBody = { File: file };
        if (folder) body.Folder = folder;
        const res = await api.postApiMediaUpload(body as any); // generated typing returns null
        // Optimistic refetch (could also push new item if API returned it)
        try { await get().fetchMedia({ folder }); } catch { /* ignore */ }
        set({ uploading: false, success: true, message: "File uploaded successfully", currentFileInfo: res.data });
        toast({ title: "Success", description: "File uploaded successfully" });
      } catch (err) {
        const error = handleError(err);
        set({ error, uploading: false });
        toast({ title: "Upload Error", description: error, variant: "error" });
        throw err;
      }
    },

    downloadFile: async (fileName) => {
      set({ downloading: true, error: null });
      try {
        const res = await api.getApiMediaDownloadFileName(fileName);
        // If API returns a Blob (likely). If not, user may need a direct URL from getFileUrl.
        const blob = res.data as unknown as Blob | undefined;
        toast({ title: "Download", description: "Your download should start shortly." });
        set({ downloading: false });
        return blob;
      } catch (err) {
        const error = handleError(err);
        set({ error, downloading: false });
        toast({ title: "Download Error", description: error, variant: "error" });
      }
    },

    getFileInfo: async (fileName) => {
      set({ loading: true, error: null });
      try {
        const res = await api.getApiMediaInfoFileName(fileName);
        set({ currentFileInfo: res.data, loading: false, success: true });
        return res.data as any;
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });
        toast({ title: "Media Error", description: error, variant: "error" });
      }
    },

    deleteFile: async (fileName) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        await api.deleteApiMediaFileName(fileName);
        set((state) => ({
          media: state.media.filter(
            (m) => m.fileName !== fileName && m.name !== fileName
          ),
          loading: false,
          success: true,
          message: "File deleted successfully",
        }));
        toast({ title: "Success", description: "File deleted successfully" });
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });
        toast({ title: "Delete Error", description: error, variant: "error" });
      }
    },

    fetchFolders: async () => {
      set({ loading: true, error: null });
      try {
        const res = await api.getApiMediaFolders();
        const data: any = res.data as any;
        const folders: string[] = Array.isArray(data) ? data : data?.folders ?? [];
        set({ folders, loading: false, success: true });
        return folders;
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });
        toast({ title: "Media Error", description: error, variant: "error" });
        return [];
      }
    },

    createFolder: async (name) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        const payload: CreateFolderDto = { name };
        await api.postApiMediaFolders(payload);
        // Update local list optimistically
        set((state) => ({
          folders: state.folders.includes(name)
            ? state.folders
            : [...state.folders, name],
          loading: false,
          success: true,
          message: "Folder created successfully",
        }));
        toast({ title: "Success", description: "Folder created successfully" });
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });
        toast({ title: "Folder Error", description: error, variant: "error" });
      }
    },

    deleteFolder: async (name) => {
      set({ loading: true, error: null, success: false, message: null });
      try {
        await api.deleteApiMediaFoldersFolderName(name);
        set((state) => ({
          folders: state.folders.filter((f) => f !== name),
          loading: false,
          success: true,
          message: "Folder deleted successfully",
        }));
        toast({ title: "Success", description: "Folder deleted successfully" });
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });
        toast({ title: "Folder Error", description: error, variant: "error" });
      }
    },

    fetchFolderTree: async () => {
      set({ loading: true, error: null });
      try {
        const res = await api.getApiMediaFolderTree();
        set({ folderTree: res.data, loading: false, success: true });
        return res.data as any;
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });
        toast({ title: "Media Error", description: error, variant: "error" });
      }
    },

    getFileUrl: async (fileName) => {
      try {
        const res = await api.getApiMediaUrlFileName(fileName);
        const data: any = res.data as any;
        // Attempt to resolve URL; could be string or { url: string }
        const url = typeof data === "string" ? data : data?.url;
        if (url) {
          toast({ title: "URL Ready", description: "Direct file URL retrieved." });
          return url;
        }
        toast({
          title: "URL Unavailable",
          description: "The API did not return a direct URL.",
          variant: "error",
        });
      } catch (err) {
        const error = handleError(err);
        toast({ title: "URL Error", description: error, variant: "error" });
      }
    },

    getDownloadUrl: (fileName) => `${API_BASE_URL}/api/media/download/${encodeURIComponent(fileName)}`,

    removeError: () => set({ error: null }),
    clearMessage: () => set({ message: null, success: false }),
    reset: () =>
      set({
        media: [],
        folders: [],
        folderTree: null,
        currentFileInfo: null,
        downloading: false,
        uploading: false,
        loading: false,
        error: null,
        success: false,
        message: null,
        totalItems: undefined,
        currentPage: undefined,
        pageSize: undefined,
        rawMediaResponse: undefined,
      }),
  }))
);
