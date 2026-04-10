"use client";

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
import { X, Plus, Check, ChevronsUpDown, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useEventsStore } from "@/store/useEventsStore";
import { useUserStore } from "@/store/useUsersStore";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

interface EventFormProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  eventId?: string;
  mode: "create" | "edit";
  asDialog?: boolean;
}

export function EventForm({
  isOpen = true,
  onClose,
  onSuccess,
  eventId,
  mode,
  asDialog = true,
}: EventFormProps) {
  const { users, fetchUsers, loading: usersLoading } = useUserStore();
  const {
    createEvent,
    updateEvent,
    fetchEvent: getEventById,
    currentEvent,
  } = useEventsStore();

  const [selectedSpeakerIds, setSelectedSpeakerIds] = useState<string[]>([]);
  const [speakersOpen, setSpeakersOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

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

  // Fetch users for speakers
  useEffect(() => {
    fetchUsers({} as any);
  }, [fetchUsers]);

  // Load event data if editing
  useEffect(() => {
    if (mode === "edit" && eventId) {
      const fetchEvent = async () => {
        await getEventById(eventId);
        const event = currentEvent;
        if (event) {
          const eventDate = new Date(event?.date ?? "")
            .toISOString()
            .split("T")[0];
          const eventTime = new Date(event?.date ?? "").toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          });
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
          setSelectedSpeakerIds(event?.speakers?.map((x) => x.id?.toString() ?? "") || []);
          setImages(event.images || []);
        }
      };
      fetchEvent();
    }
  }, [mode, eventId, form, currentEvent, getEventById]);

  const toggleSpeaker = (id: string) => {
    setSelectedSpeakerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const addImage = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    setImages((prev) => Array.from(new Set([...prev, url])));
    setNewImageUrl("");
  };

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((x) => x !== url));
  };

  const [debouncedSubmit, isSubmitting] = usePreventDoubleClick(
    async (data: EventFormData) => {
      try {
        if (mode === "edit" && eventId) {
          await updateEvent(eventId, { ...data, images, speakerIds: selectedSpeakerIds } as any);
          toast.success("Event updated successfully!");
        } else {
          await createEvent({ ...data, images, speakerIds: selectedSpeakerIds } as any);
          toast.success("Event created successfully!");
          form.reset();
          setSelectedSpeakerIds([]);
          setImages([]);
        }
        onSuccess?.();
      } catch {
        toast.error(`Failed to ${mode === "edit" ? "update" : "create"} event`);
      }
    },
    2000
  );

  // ---------------- UI Layout ----------------
  const formInner = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(debouncedSubmit)} className="space-y-6">
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
                <Textarea {...field} rows={4} placeholder="Enter event description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date & Time */}
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

        {/* Format & Type */}
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
                  <Input {...field} placeholder="e.g., 2.5 CE" />
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
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
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
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Images */}
        <div className="space-y-2">
          <FormLabel>Images</FormLabel>
          <div className="flex gap-2">
            <Input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Add image URL"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addImage();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addImage} disabled={!newImageUrl.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images.map((url) => (
                <Badge key={url} variant="secondary" className="flex items-center gap-1">
                  <span className="truncate max-w-[200px]">{url}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => removeImage(url)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {mode === "edit" ? "Update Event" : "Create Event"}
          </Button>
        </div>
      </form>
    </Form>
  );

  if (asDialog) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{mode === "edit" ? "Edit Event" : "Create Event"}</DialogTitle>
            <DialogDescription>
              {mode === "edit" ? "Update your event details below." : "Fill in the event details."}
            </DialogDescription>
          </DialogHeader>
          {formInner}
        </DialogContent>
      </Dialog>
    );
  }

  // Standalone page layout
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {mode === "edit" ? "Edit Event" : "Create Event"}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {mode === "edit" ? "Update your event details below." : "Fill in the event details."}
          </p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        )}
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>
            Please provide the necessary details for the event.
          </CardDescription>
        </CardHeader>
        <CardContent>{formInner}</CardContent>
      </Card>
    </div>
  );
}
