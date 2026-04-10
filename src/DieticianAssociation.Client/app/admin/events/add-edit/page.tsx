"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { usePreventDoubleClick } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useEventsStore } from "@/store/useEventsStore";
import { useUserStore } from "@/store/useUsersStore";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import FileUploader from "@/components/file-uploader"; // ✅ import uploader

// -------------------- Validation Schema --------------------
const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  location: z.string().min(1, "Location is required"),
  format: z.string().min(1, "Format is required"),
  type: z.string().min(1, "Type is required"),
  credits: z.string().min(1, "Credits are required"),
  price: z.number().min(0),
  capacity: z.number().min(1),
  recordingUrl: z.string().optional(),
  recording: z.boolean().optional(),
  images: z.array(z.string().min(1)).optional(),
});

type EventFormData = z.infer<typeof eventFormSchema>;

export default function EventPage() {
  const router = useRouter();
  const params = useSearchParams();

  const eventId = params?.get("id") ?? null;
  const mode = eventId ? "edit" : "create";

  const { fetchUsers } = useUserStore();
  const { createEvent, updateEvent, fetchEvent: getEventById, currentEvent } =
    useEventsStore();

  const [images, setImages] = useState<string[]>([]);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      format: "",
      type: "",
      credits: "",
      price: 0,
      capacity: 50,
      recordingUrl: "",
      recording: false,
      images: [],
    },
  });

  // Fetch users once
  useEffect(() => {
    fetchUsers({} as any);
  }, [fetchUsers]);

  // Fetch event if editing
  useEffect(() => {
    if (mode === "edit" && eventId) {
      getEventById(eventId);
    }
  }, [mode, eventId, getEventById]);

  // When event data arrives, populate form
  useEffect(() => {
    if (mode === "edit" && currentEvent) {
      const event = currentEvent;
      const eventDate = new Date(event?.date ?? "")
        .toISOString()
        .split("T")[0];
      const eventTime = new Date(event?.date ?? "").toLocaleTimeString(
        "en-US",
        { hour12: false, hour: "2-digit", minute: "2-digit" }
      );

      form.reset({
        title: event.title ?? "",
        description: event.description ?? "",
        date: eventDate,
        time: eventTime,
        location: event.location ?? "",
        format: event.format ?? "",
        type: event.type ?? "",
        credits: event.credits ?? "",
        price: Number(event?.price) ?? 0,
        capacity: event.capacity,
        recordingUrl: event.recordingUrl ?? "",
        recording: event.recording,
        images: event.images || [],
      });

      setImages(event.images || []);
    }
  }, [mode, currentEvent, form]);

  // -------------------- Submit Handler --------------------
  const [debouncedSubmit, isSubmitting] = usePreventDoubleClick(
    async (data: EventFormData) => {
      try {
        const payload = { ...data, images };
        if (mode === "edit" && eventId) {
          await updateEvent(eventId, payload as any);
          toast.success("Event updated successfully!");
        } else {
          await createEvent(payload as any);
          toast.success("Event created successfully!");
          form.reset();
          setImages([]);
        }
        router.push("/admin/events");
      } catch {
        toast.error(`Failed to ${mode === "edit" ? "update" : "create"} event`);
      }
    },
    2000
  );

  // -------------------- Render --------------------
  return (
    <div className="w-full px-6 py-8 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {mode === "edit" ? "Edit Event" : "Create Event"}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {mode === "edit"
              ? "Update event details below."
              : "Fill in the event details to create a new one."}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/admin/events")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>
            Provide the necessary information for the event
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(debouncedSubmit)}
              className="space-y-6"
            >
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter event title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date + Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input {...field} type="time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter event location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Format + Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Format</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="in-person">In-Person</SelectItem>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="workshop">Workshop</SelectItem>
                          <SelectItem value="webinar">Webinar</SelectItem>
                          <SelectItem value="conference">Conference</SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Credits / Price / Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="credits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credits</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 2 CE" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 1)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Recording */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="recordingUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recording URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="recording"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <FormLabel>Has Recording</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* ✅ Images (with FileUploader) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FileUploader
                  label="Event Images"
                  multiple={true}
                  folder="events"
                  onUploadComplete={(urls) => {
                    setImages(urls);
                    form.setValue("images", urls);
                  }}
                />

                {images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {images.map((url) => (
                      <Badge
                        key={url}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <span className="truncate max-w-[200px]">{url}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() =>
                            setImages((prev) =>
                              prev.filter((img) => img !== url)
                            )
                          }
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  {mode === "edit" ? "Update Event" : "Create Event"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
