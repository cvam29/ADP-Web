import type {
  AcademicsEntryDto,
  AcademicsPagedResponseDto,
  BlogPostDto,
  EventDto,
  GetApiBlogStreamParams,
  GetApiEducationAcademicsStreamParams,
  GetApiEventsStreamParams,
  GetApiResourcesPublicFreeStreamParams,
  GetApiResourcesStreamParams,
  ResourceDto,
  TestimonialDto,
} from "@/services/generated";
import { API_BASE_URL } from "@/services/api-client";

export interface StreamPageInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

type StreamMetaMessage = {
  type: "meta";
  pageInfo: StreamPageInfo;
};

type StreamItemMessage<T> = {
  type: "item";
  item: T;
};

type StreamMessage<T> = StreamMetaMessage | StreamItemMessage<T>;

type StreamHandlers<T> = {
  signal?: AbortSignal;
  onMeta?: (pageInfo: StreamPageInfo) => void;
  onItem: (item: T) => void;
};

type BlogStreamParams = GetApiBlogStreamParams & {
  featured?: boolean;
};
type EventStreamParams = GetApiEventsStreamParams;
type ResourceStreamParams = GetApiResourcesStreamParams;
type PublicFreeResourceStreamParams = GetApiResourcesPublicFreeStreamParams;
type AcademicsStreamParams = GetApiEducationAcademicsStreamParams;
type TestimonialStreamParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  featured?: boolean;
};

type AcademicsStreamMetaMessage = {
  type: "meta";
  metadata: AcademicsPagedResponseDto;
};

type AcademicsStreamItemMessage = {
  type: "item";
  item: AcademicsEntryDto;
};

type AcademicsStreamMessage = AcademicsStreamMetaMessage | AcademicsStreamItemMessage;

const buildStreamUrl = (path: string, params: Record<string, string | number | undefined>) => {
  const url = new URL(path, API_BASE_URL);

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") {
      continue;
    }

    url.searchParams.set(key, String(value));
  }

  return url.toString();
};

const getAuthHeaders = () => {
  const headers: Record<string, string> = {};
  if (typeof window === "undefined") {
    return headers;
  }

  const token = window.localStorage.getItem("authToken");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const parseStream = async <T>(
  response: Response,
  { signal, onMeta, onItem }: StreamHandlers<T>,
) => {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Stream request failed with ${response.status}`);
  }

  if (!response.body) {
    throw new Error("Streaming is not supported in this browser.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    if (signal?.aborted) {
      throw new DOMException("The stream request was aborted.", "AbortError");
    }

    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    let newlineIndex = buffer.indexOf("\n");
    while (newlineIndex >= 0) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);

      if (line) {
        const message = JSON.parse(line) as StreamMessage<T>;
        if (message.type === "meta") {
          onMeta?.(message.pageInfo);
        } else if (message.type === "item") {
          onItem(message.item);
        }
      }

      newlineIndex = buffer.indexOf("\n");
    }
  }

  const trailing = `${buffer}${decoder.decode()}`.trim();
  if (!trailing) {
    return;
  }

  const message = JSON.parse(trailing) as StreamMessage<T>;
  if (message.type === "meta") {
    onMeta?.(message.pageInfo);
    return;
  }

  onItem(message.item);
};

export const streamBlogPosts = async (
  params: BlogStreamParams,
  handlers: StreamHandlers<BlogPostDto>,
) => {
  const response = await fetch(
    buildStreamUrl("/api/blog/stream", {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
      category: params.category,
      featured: params.featured === undefined ? undefined : Number(params.featured),
    }),
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/x-ndjson",
      },
      signal: handlers.signal,
    },
  );

  await parseStream(response, handlers);
};

export const streamEvents = async (
  params: EventStreamParams,
  handlers: StreamHandlers<EventDto>,
) => {
  const response = await fetch(
    buildStreamUrl("/api/events/stream", {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
    }),
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/x-ndjson",
      },
      signal: handlers.signal,
    },
  );

  await parseStream(response, handlers);
};

export const streamResources = async (
  params: ResourceStreamParams,
  handlers: StreamHandlers<ResourceDto>,
) => {
  const response = await fetch(
    buildStreamUrl("/api/resources/stream", {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
    }),
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/x-ndjson",
        ...getAuthHeaders(),
      },
      signal: handlers.signal,
    },
  );

  await parseStream(response, handlers);
};

export const streamPublicFreeResources = async (
  params: PublicFreeResourceStreamParams,
  handlers: StreamHandlers<ResourceDto>,
) => {
  const response = await fetch(
    buildStreamUrl("/api/resources/public/free/stream", {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
    }),
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/x-ndjson",
      },
      signal: handlers.signal,
    },
  );

  await parseStream(response, handlers);
};

export const streamAcademics = async (
  params: AcademicsStreamParams,
  handlers: {
    signal?: AbortSignal;
    onMeta?: (metadata: AcademicsPagedResponseDto) => void;
    onItem: (item: AcademicsEntryDto) => void;
  },
) => {
  const response = await fetch(
    buildStreamUrl("/api/education/academics/stream", {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
      selectedTab: params.selectedTab,
      stateId: params.stateId,
      districtId: params.districtId,
      universityId: params.universityId,
      includeInstitutions: params.includeInstitutions === undefined ? undefined : Number(params.includeInstitutions),
      includeColleges: params.includeColleges === undefined ? undefined : Number(params.includeColleges),
      institutionTypeCategory: params.institutionTypeCategory,
    }),
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/x-ndjson",
      },
      signal: handlers.signal,
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Stream request failed with ${response.status}`);
  }

  if (!response.body) {
    throw new Error("Streaming is not supported in this browser.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    if (handlers.signal?.aborted) {
      throw new DOMException("The stream request was aborted.", "AbortError");
    }

    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    let newlineIndex = buffer.indexOf("\n");
    while (newlineIndex >= 0) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);

      if (line) {
        const message = JSON.parse(line) as AcademicsStreamMessage;
        if (message.type === "meta") {
          handlers.onMeta?.(message.metadata);
        } else {
          handlers.onItem(message.item);
        }
      }

      newlineIndex = buffer.indexOf("\n");
    }
  }

  const trailing = `${buffer}${decoder.decode()}`.trim();
  if (!trailing) {
    return;
  }

  const message = JSON.parse(trailing) as AcademicsStreamMessage;
  if (message.type === "meta") {
    handlers.onMeta?.(message.metadata);
    return;
  }

  handlers.onItem(message.item);
};

export const streamTestimonials = async (
  params: TestimonialStreamParams,
  handlers: StreamHandlers<TestimonialDto>,
) => {
  const response = await fetch(
    buildStreamUrl("/api/testimonials/stream", {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
      featured: params.featured === undefined ? undefined : Number(params.featured),
    }),
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/x-ndjson",
      },
      signal: handlers.signal,
    },
  );

  await parseStream(response, handlers);
};
