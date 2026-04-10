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
import {
  CreateCollegeDto,
  CreateCollegeDtoCoursesOffered,
} from "@/services/generated";
import { useEducationStore } from "@/store/useEducationStore";

interface CollegeFormDialogProps {
  open: boolean;
  onClose: () => void;
  formData: CreateCollegeDto;
  setFormData: (data: CreateCollegeDto) => void;
  editingCollege: any;
  onSubmit: () => void;
  universities: any[];
  states: any[];
  countries: any[];
  selectedCountryId: number | null;
  onCountryChange: (countryId: number) => void;
  onStateChange: (stateId: number) => void;
}

export default function CollegeFormDialog({
  open,
  onClose,
  formData,
  setFormData,
  editingCollege,
  onSubmit,
  universities,
  states,
  countries,
  selectedCountryId,
  onCountryChange,
  onStateChange,
}: CollegeFormDialogProps) {
  const { districts } = useEducationStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const courseOptions = [
    { label: "Undergraduate (UG)", value: CreateCollegeDtoCoursesOffered.uG },
    { label: "Postgraduate (PG)", value: CreateCollegeDtoCoursesOffered.pG },
    { label: "PhD", value: CreateCollegeDtoCoursesOffered.phD },
    { label: "Diploma", value: CreateCollegeDtoCoursesOffered.diploma },
    { label: "Certificate", value: CreateCollegeDtoCoursesOffered.certificate },
    { label: "Fellowship", value: CreateCollegeDtoCoursesOffered.fellowship },
  ];

  const selectedCoursesFlags = Number(
    formData.coursesOffered ?? CreateCollegeDtoCoursesOffered.none,
  );

  const handleCourseToggle = (courseFlag: number, checked: boolean) => {
    const updatedFlags = checked
      ? selectedCoursesFlags | courseFlag
      : selectedCoursesFlags & ~courseFlag;

    setFormData({
      ...formData,
      coursesOffered: updatedFlags as CreateCollegeDto["coursesOffered"],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingCollege ? "Edit College" : "Add New College"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="aisheCode">AISHE Code *</Label>
              <Input
                id="aisheCode"
                value={formData.aisheCode || ""}
                onChange={(e) =>
                  setFormData({ ...formData, aisheCode: e.target.value })
                }
                placeholder="C-60180"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearOfEstablishment">Year of Establishment</Label>
              <Input
                id="yearOfEstablishment"
                type="number"
                value={formData.yearOfEstablishment || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    yearOfEstablishment: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">College Name *</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter college name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website || ""}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="university">University *</Label>
            <Select
              value={formData.universityId ? formData.universityId.toString() : undefined}
              onValueChange={(value) =>
                setFormData({ ...formData, universityId: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select university" />
              </SelectTrigger>
              <SelectContent>
                {universities.map((uni) => (
                  <SelectItem key={uni.id} value={uni.id.toString()}>
                    {uni.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          <div className="grid grid-cols-3 gap-4">
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
              <Label htmlFor="district">District *</Label>
              <Select
                value={formData.districtId ? formData.districtId.toString() : undefined}
                onValueChange={(value) =>
                  setFormData({ ...formData, districtId: parseInt(value) })
                }
                disabled={!formData.stateId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district) => (
                    <SelectItem
                      key={district.id}
                      value={district.id.toString()}
                    >
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {editingCollege ? "Update" : "Create"} College
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
