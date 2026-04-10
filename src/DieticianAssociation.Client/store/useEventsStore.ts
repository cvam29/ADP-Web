"use client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
	getDieticianAssociationAPI,
	type EventDto,
	type EventDtoPagedResult,
	type CreateEventDto,
	type PagedRequest,
} from "../services/generated";
import { handleError } from "./storeUtils";
import { toast } from "@/hooks/use-toast";

const api = getDieticianAssociationAPI();

interface EventsState {
	events: EventDto[];
	pagedResult?: EventDtoPagedResult;
	currentEvent?: EventDto;
	loading: boolean;
	error: string | null;
	success: boolean;
	message: string | null;

	// API actions
	// Accept both new (pagedRequest) and legacy (capitalized) param shapes for backward compatibility
	fetchEvents: (params?: EventPagedParams) => Promise<EventDtoPagedResult>;
	fetchEvent: (id: string) => Promise<void>;
	fetchEventByUrl: (url: string) => Promise<void>;
	createEvent: (payload: CreateEventDto) => Promise<EventDto>;
	updateEvent: (id: string, payload: CreateEventDto) => Promise<EventDto>;
	deleteEvent: (id: string) => Promise<void>;
	removeError: () => void;
	clearMessage: () => void;
}

// Backward-compatible type to support old callers using capitalized keys (Page, PageSize, etc.)
type EventPagedParams = PagedRequest & {
	Page?: number;
	PageSize?: number;
	Search?: string;
	SortBy?: string;
	SortDirection?: string;
	Filters?: { [key: string]: unknown };
	Skip?: number;
	IsValid?: boolean;
};

// Normalize any legacy keys to the new PagedRequest shape expected by postApiEventsPaginated
const normalizePagedParams = (params?: EventPagedParams): PagedRequest => {
	if (!params) return {};
	const { Page, PageSize, Search, SortBy, SortDirection, Filters, ...rest } =
		params as EventPagedParams;

	return {
		...rest,
		page: params.page ?? Page,
		pageSize: params.pageSize ?? PageSize,
		search: params.search ?? Search,
		sortBy: params.sortBy ?? SortBy,
		sortDirection: params.sortDirection ?? SortDirection,
		filters: (params.filters ?? (Filters as any)) as PagedRequest["filters"],
	};
};

export const useEventsStore = create<EventsState>()(
	devtools((set) => ({
		events: [],
		pagedResult: undefined,
		currentEvent: undefined,
		loading: false,
		error: null,
		success: false,
		message: null,

		fetchEvents: async (params) => {
			set({ loading: true, error: null, success: false, message: null });
			try {
				const res = await api.postApiEventsPaginated(normalizePagedParams(params));
				set({
					events: res.data.items ?? [],
					pagedResult: res.data,
					loading: false,
					success: true,
					message: "Events fetched successfully",
				});
				return res.data;
			} catch (err) {
				const error = handleError(err);
				set({ error, loading: false });

				toast({
					title: "Events Error",
					description: error,
					variant: "error",
				});
				throw err;
			}
		},

		fetchEvent: async (id) => {
			set({ loading: true, error: null, success: false, message: null });
			try {
				const res = await api.getApiEventsId(id);
				set({
					currentEvent: res.data,
					loading: false,
					success: true,
					message: "Event fetched successfully",
				});
			} catch (err) {
				const error = handleError(err);
				set({ error, loading: false });

				toast({
					title: "Events Error",
					description: error,
					variant: "error",
				});
			}
		},

		fetchEventByUrl: async (url) => {
			set({ loading: true, error: null, success: false, message: null });
			try {
				const res = await api.getApiEventsByUrlUrl(url);
				set({
					currentEvent: res.data,
					loading: false,
					success: true,
					message: "Event fetched successfully",
				});
			} catch (err) {
				const error = handleError(err);
				set({ error, loading: false });

				toast({
					title: "Events Error",
					description: error,
					variant: "error",
				});
			}
		},

		createEvent: async (payload) => {
			set({ loading: true, error: null, success: false, message: null });
			try {
				const res = await api.postApiEvents(payload);
				set((state) => ({
					events: [...state.events, res.data],
					loading: false,
					success: true,
					message: "Event created successfully",
				}));

				toast({
					title: "Success",
					description: "Event created successfully",
					variant: "success",
				});

				return res.data;
			} catch (err) {
				const error = handleError(err);
				set({ error, loading: false, success: false });

				toast({
					title: "Events Error",
					description: error,
					variant: "error",
				});

				throw err;
			}
		},

		updateEvent: async (id, payload) => {
			set({ loading: true, error: null, success: false, message: null });
			try {
				const res = await api.putApiEventsId(id, payload);
				set((state) => ({
					events: state.events.map((e) => (e.id === id ? res.data : e)),
					loading: false,
					success: true,
					message: "Event updated successfully",
				}));

				toast({
					title: "Success",
					description: "Event updated successfully",
					variant: "success",
				});

				return res.data;
			} catch (err) {
				const error = handleError(err);
				set({ error, loading: false, success: false });

				toast({
					title: "Events Error",
					description: error,
					variant: "error",
				});

				throw err;
			}
		},

		deleteEvent: async (id) => {
			set({ loading: true, error: null, success: false, message: null });
			try {
				await api.deleteApiEventsId(id);
				set((state) => ({
					events: state.events.filter((e) => e.id !== id),
					loading: false,
					success: true,
					message: "Event deleted successfully",
				}));

				toast({
					title: "Success",
					description: "Event deleted successfully",
					variant: "success",
				});
			} catch (err) {
				const error = handleError(err);
				set({ error, loading: false, success: false });

				toast({
					title: "Events Error",
					description: error,
					variant: "error",
				});
			}
		},

		removeError: () => set({ error: null }),
		clearMessage: () => set({ message: null, success: false }),
	}))
);

