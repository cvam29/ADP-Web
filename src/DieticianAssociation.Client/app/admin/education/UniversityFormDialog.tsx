"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Star } from "lucide-react";
import {
  CreateUniversityDto,
  CreateUniversityDtoCoursesOffered,
} from "@/services/generated";

interface UniversityFormDialogProps {
  open: boolean;
  onClose: () => void;
  formData: CreateUniversityDto;
  setFormData: (data: CreateUniversityDto) => void;
  editingUniversity: any;
  onSubmit: () => void;
  states: any[];
  districts: any[];
  countries: any[];
  selectedCountryId: number | null;
  onCountryChange: (countryId: number) => void;
  onStateChange: (stateId: number) => void;
}

export default function UniversityFormDialog({
  open,
  onClose,
  formData,
  setFormData,
  editingUniversity,
  onSubmit,
  states,
  districts,
  countries,
  selectedCountryId,
  onCountryChange,
  onStateChange,
}: UniversityFormDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const universityTypes = [
    "Central govt university",
    "State govt university",
    "Private university",
    "Deemed university",
  ];

  const courseOptions = [
    { label: "Undergraduate (UG)", value: CreateUniversityDtoCoursesOffered.uG },
    { label: "Postgraduate (PG)", value: CreateUniversityDtoCoursesOffered.pG },
    { label: "PhD", value: CreateUniversityDtoCoursesOffered.phD },
    { label: "Diploma", value: CreateUniversityDtoCoursesOffered.diploma },
    { label: "Certificate", value: CreateUniversityDtoCoursesOffered.certificate },
    { label: "Fellowship", value: CreateUniversityDtoCoursesOffered.fellowship },
  ];

  const selectedCoursesFlags = Number(
    formData.coursesOffered ?? CreateUniversityDtoCoursesOffered.none,
  );

  const handleCourseToggle = (courseFlag: number, checked: boolean) => {
    const updatedFlags = checked
      ? selectedCoursesFlags | courseFlag
      : selectedCoursesFlags & ~courseFlag;

    setFormData({
      ...formData,
      coursesOffered: updatedFlags as CreateUniversityDto["coursesOffered"],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingUniversity ? "Edit University" : "Add New University"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="universityCode">University Code *</Label>
              <Input
                id="universityCode"
                value={formData?.universityCode || ""}
                onChange={(e) =>
                  setFormData({ ...formData, universityCode: e.target.value })
                }
                placeholder="U-0369"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="surveyYear">Survey Year *</Label>
              <Input
                id="surveyYear"
                type="number"
                value={formData.surveyYear}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    surveyYear: parseInt(e.target.value),
                  })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">University Name *</Label>
            <Input
              id="name"
              value={formData?.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter university name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website</Label>
            <Input
              id="websiteUrl"
              type="url"
              value={formData?.websiteUrl || ""}
              onChange={(e) =>
                setFormData({ ...formData, websiteUrl: e.target.value })
              }
              placeholder="https://example.edu"
            />
          </div>

          <div className="space-y-3">
            <Label>University Rating</Label>
            <div className="flex items-center gap-2 rounded-md border p-3">
              {[1, 2, 3, 4, 5].map((value) => {
                const active = (formData.rating ?? 0) >= value;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: value })}
                    className="rounded-md p-1 transition hover:bg-amber-50"
                    aria-label={`Set ${value} star rating`}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        active
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                );
              })}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFormData({ ...formData, rating: 0 })}
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* <div className="space-y-2">
              <Label htmlFor="typeId">Type ID *</Label>
              <Input
                id="typeId"
                value={formData?.typeId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, typeId: e.target.value })
                }
                placeholder="05"
                required
              />
            </div> */}

            <div className="space-y-2">
              <Label htmlFor="universityType">University Type *</Label>
              <Select
                value={formData?.universityType || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, universityType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {universityTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Select
                value={selectedCountryId?.toString()}
                onValueChange={(value) => onCountryChange(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id.toString()}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Select
                value={formData.stateId ? formData.stateId.toString() : undefined}
                onValueChange={(value) => {
                  onStateChange(parseInt(value));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state.id} value={state.id.toString()}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Select
                value={formData.districtId ? formData.districtId.toString() : undefined}
                onValueChange={(value) =>
                  setFormData({ ...formData, districtId: parseInt(value) })
                }
                disabled={!formData.stateId || districts.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district) => (
                    <SelectItem key={district.id} value={district.id.toString()}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Courses Offered</Label>
            <div className="grid grid-cols-2 gap-3 rounded-md border p-3">
              {courseOptions.map((option) => {
                const isChecked =
                  (selectedCoursesFlags & option.value) === option.value;

                return (
                  <Label
                    key={option.value}
                    className="flex items-center gap-2 text-sm font-normal"
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) =>
                        handleCourseToggle(option.value, checked === true)
                      }
                    />
                    {option.label}
                  </Label>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {editingUniversity ? "Update" : "Create"} University
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
