"use client";
import { useEffect, useState } from "react";
import { useEducationStore } from "@/store/useEducationStore";
import { useGeoStore } from "@/store/useGeoStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FeedbackMessage from "@/components/feedback-message";
import { Plus, GraduationCap, Building2 } from "lucide-react";
import UniversityTable from "./UniversityTable";
import UniversityFormDialog from "./UniversityFormDialog";
import CollegeTable from "./CollegeTable";
import CollegeFormDialog from "./CollegeFormDialog";
import {
  CreateUniversityDto,
  CreateUniversityDtoCoursesOffered,
  UpdateUniversityDto,
  CreateCollegeDto,
  CreateCollegeDtoCoursesOffered,
  UpdateCollegeDto,
} from "@/services/generated";

const DEFAULT_COUNTRY_NAME = "india";

const resolveDefaultCountryId = (
  countries: Array<{ id?: number; name?: string | null }>,
) => {
  const india = countries.find(
    (country) => country.name?.trim().toLowerCase() === DEFAULT_COUNTRY_NAME,
  );

  return india?.id ?? countries[0]?.id ?? null;
};

export default function EducationManagement() {
  const {
    universities,
    colleges,
    fetchUniversities,
    fetchColleges,
    createUniversity,
    updateUniversity,
    deleteUniversity,
    createCollege,
    updateCollege,
    deleteCollege,
    districts,
    fetchDistrictsByState,
    currentTab,
    setCurrentTab,
    message,
    success,
    clearMessage,
  } = useEducationStore();

  const { countries, states, fetchCountries, fetchStatesByCountry } =
    useGeoStore();

  const [showUniversityDialog, setShowUniversityDialog] = useState(false);
  const [showCollegeDialog, setShowCollegeDialog] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<any>(null);
  const [editingCollege, setEditingCollege] = useState<any>(null);
  const [selectedUniversityCountryId, setSelectedUniversityCountryId] =
    useState<number | null>(null);
  const [selectedCollegeCountryId, setSelectedCollegeCountryId] =
    useState<number | null>(null);

  const [universityForm, setUniversityForm] = useState<CreateUniversityDto>({
    universityCode: "",
    name: "",
    websiteUrl: "",
    rating: 0,
    surveyYear: new Date().getFullYear(),
    typeId: "",
    universityType: "",
    stateId: undefined,
    districtId: undefined,
    coursesOffered: CreateUniversityDtoCoursesOffered.none,
  });

  const [collegeForm, setCollegeForm] = useState<CreateCollegeDto>({
    aisheCode: "",
    name: "",
    website: "",
    yearOfEstablishment: undefined,
    universityId: undefined,
    stateId: undefined,
    districtId: undefined,
    coursesOffered: CreateCollegeDtoCoursesOffered.none,
  });

  useEffect(() => {
    const initialize = async () => {
      fetchUniversities();
      fetchColleges();
      const loadedCountries = await fetchCountries();
      const defaultCountryId = resolveDefaultCountryId(loadedCountries);

      if (defaultCountryId) {
        await fetchStatesByCountry(defaultCountryId);
      }
    };

    initialize().catch(() => undefined);
  }, [fetchUniversities, fetchColleges, fetchCountries, fetchStatesByCountry]);

  const handleCreateUniversity = () => {
    setEditingUniversity(null);
    setSelectedUniversityCountryId(null);
    setUniversityForm({
      universityCode: "",
      name: "",
      websiteUrl: "",
      rating: 0,
      surveyYear: new Date().getFullYear(),
      typeId: "",
      universityType: "",
      stateId: undefined,
      districtId: undefined,
      coursesOffered: CreateUniversityDtoCoursesOffered.none,
    });
    setShowUniversityDialog(true);
  };

  const handleEditUniversity = async (university: any) => {
    setEditingUniversity(university);
    const matchedState = states.find((state) => state.id === university.stateId);
    const inferredCountryId = matchedState?.countryId ?? null;
    setSelectedUniversityCountryId(inferredCountryId);

    if (inferredCountryId) {
      await fetchStatesByCountry(inferredCountryId);
    }
    if (university.stateId) {
      await fetchDistrictsByState(university.stateId);
    }

    setUniversityForm({
      universityCode: university.universityCode,
      name: university.name,
      websiteUrl: university.websiteUrl || "",
      rating: university.rating ?? 0,
      surveyYear: university.surveyYear,
      typeId: university.typeId,
      universityType: university.universityType,
      stateId: university.stateId,
      districtId: university.districtId,
      coursesOffered:
        university.coursesOffered ?? CreateUniversityDtoCoursesOffered.none,
    });
    setShowUniversityDialog(true);
  };

  const handleSubmitUniversity = async () => {
    if (editingUniversity) {
      await updateUniversity(
        editingUniversity.id,
        universityForm as UpdateUniversityDto,
      );
    } else {
      await createUniversity(universityForm);
    }
    await fetchUniversities();
    setShowUniversityDialog(false);
    setEditingUniversity(null);
  };

  const handleDeleteUniversity = async (id: number) => {
    if (
      confirm(
        "Are you sure you want to delete this university? All associated colleges will also be deleted.",
      )
    ) {
      await deleteUniversity(id);
      await fetchUniversities();
    }
  };

  const handleCreateCollege = () => {
    setEditingCollege(null);
    setSelectedCollegeCountryId(null);
    setCollegeForm({
      aisheCode: "",
      name: "",
      website: "",
      yearOfEstablishment: undefined,
      universityId: undefined,
      stateId: undefined,
      districtId: undefined,
      coursesOffered: CreateCollegeDtoCoursesOffered.none,
    });
    setShowCollegeDialog(true);
  };

  const handleEditCollege = async (college: any) => {
    setEditingCollege(college);
    const matchedState = states.find((state) => state.id === college.stateId);
    const inferredCountryId = matchedState?.countryId ?? null;
    setSelectedCollegeCountryId(inferredCountryId);

    if (inferredCountryId) {
      await fetchStatesByCountry(inferredCountryId);
    }
    if (college.stateId) {
      await fetchDistrictsByState(college.stateId);
    }

    setCollegeForm({
      aisheCode: college.aisheCode,
      name: college.name,
      website: college.website || "",
      yearOfEstablishment: college.yearOfEstablishment,
      universityId: college.universityId,
      stateId: college.stateId,
      districtId: college.districtId,
      coursesOffered:
        college.coursesOffered ?? CreateCollegeDtoCoursesOffered.none,
    });
    setShowCollegeDialog(true);
  };

  const handleSubmitCollege = async () => {
    if (editingCollege) {
      await updateCollege(editingCollege.id, collegeForm as UpdateCollegeDto);
    } else {
      await createCollege(collegeForm);
    }
    await fetchColleges();
    setShowCollegeDialog(false);
    setEditingCollege(null);
  };

  const handleDeleteCollege = async (id: number) => {
    if (confirm("Are you sure you want to delete this college?")) {
      await deleteCollege(id);
      await fetchColleges();
    }
  };

  const handleUniversityCountryChange = async (countryId: number) => {
    setSelectedUniversityCountryId(countryId);
    setUniversityForm({
      ...universityForm,
      stateId: undefined,
      districtId: undefined,
    });
    await fetchStatesByCountry(countryId);
  };

  const handleUniversityStateChange = async (stateId: number) => {
    setUniversityForm({
      ...universityForm,
      stateId,
      districtId: undefined,
    });
    await fetchDistrictsByState(stateId);
  };

  const handleCollegeCountryChange = async (countryId: number) => {
    setSelectedCollegeCountryId(countryId);
    setCollegeForm({
      ...collegeForm,
      stateId: undefined,
      districtId: undefined,
    });
    await fetchStatesByCountry(countryId);
  };

  const handleCollegeStateChange = async (stateId: number) => {
    setCollegeForm({
      ...collegeForm,
      stateId,
      districtId: undefined,
    });
    await fetchDistrictsByState(stateId);
  };

  return (
    <div className="w-full px-6 py-8 space-y-6">
      <FeedbackMessage
        message={message ?? undefined}
        success={success}
        onClear={clearMessage}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Education Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage universities and colleges in the system.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={currentTab}
        onValueChange={(value) =>
          setCurrentTab(value as "universities" | "colleges")
        }
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="universities" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Universities
          </TabsTrigger>
          <TabsTrigger value="colleges" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Colleges
          </TabsTrigger>
        </TabsList>

        {/* Universities Tab */}
        <TabsContent value="universities" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Universities</CardTitle>
                <CardDescription>
                  List of all universities with their details
                </CardDescription>
              </div>
              <Button
                onClick={handleCreateUniversity}
                className="flex items-center"
              >
                <Plus className="mr-2 h-4 w-4" /> Add University
              </Button>
            </CardHeader>
            <CardContent>
              <UniversityTable
                universities={universities}
                onEdit={handleEditUniversity}
                onDelete={handleDeleteUniversity}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Colleges Tab */}
        <TabsContent value="colleges" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Colleges</CardTitle>
                <CardDescription>
                  List of all colleges with their details
                </CardDescription>
              </div>
              <Button
                onClick={handleCreateCollege}
                className="flex items-center"
              >
                <Plus className="mr-2 h-4 w-4" /> Add College
              </Button>
            </CardHeader>
            <CardContent>
              <CollegeTable
                colleges={colleges}
                onEdit={handleEditCollege}
                onDelete={handleDeleteCollege}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* University Form Dialog */}
      <UniversityFormDialog
        open={showUniversityDialog}
        onClose={() => {
          setShowUniversityDialog(false);
          setEditingUniversity(null);
        }}
        formData={universityForm}
        setFormData={setUniversityForm}
        editingUniversity={editingUniversity}
        onSubmit={handleSubmitUniversity}
        states={states}
        districts={districts}
        countries={countries}
        selectedCountryId={selectedUniversityCountryId}
        onCountryChange={handleUniversityCountryChange}
        onStateChange={handleUniversityStateChange}
      />

      {/* College Form Dialog */}
      <CollegeFormDialog
        open={showCollegeDialog}
        onClose={() => {
          setShowCollegeDialog(false);
          setEditingCollege(null);
        }}
        formData={collegeForm}
        setFormData={setCollegeForm}
        editingCollege={editingCollege}
        onSubmit={handleSubmitCollege}
        universities={universities}
        states={states}
        countries={countries}
        selectedCountryId={selectedCollegeCountryId}
        onCountryChange={handleCollegeCountryChange}
        onStateChange={handleCollegeStateChange}
      />
    </div>
  );
}
