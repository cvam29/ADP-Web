import type { UserDto } from "@/services/generated";

export const TESTIMONIAL_STATUSES = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
} as const;

export interface TestimonialDto {
  id: string;
  content: string;
  memberName: string;
  professionalTitle: string;
  photoUrl?: string | null;
  rating: number;
  consentToPublish: boolean;
  status: string;
  isFeatured: boolean;
  submittedByUserId: string;
  reviewedByUserId?: string | null;
  submittedAt: string;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string | null;
  submittedBy?: UserDto | null;
  reviewedBy?: UserDto | null;
}

export interface CreateTestimonialDto {
  content: string;
  professionalTitle: string;
  photoUrl?: string;
  rating: number;
  consentToPublish: boolean;
}

export interface ReviewTestimonialDto {
  status: string;
  rejectionReason?: string;
  isFeatured: boolean;
}

export interface PageInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  info?: PageInfo;
}

export interface PagedRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: string;
  filters?: Record<string, unknown>;
}

export type TestimonialPagedResult = PagedResult<TestimonialDto>;

export type TestimonialPagedParams = PagedRequest & {
  Page?: number;
  PageSize?: number;
  Search?: string;
  SortBy?: string;
  SortDirection?: string;
  Filters?: Record<string, unknown>;
};