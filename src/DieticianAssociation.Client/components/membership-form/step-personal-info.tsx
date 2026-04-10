"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGeoStore } from "@/store/useGeoStore";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeDialCode = (value?: string | null) => {
  const numericDialCode = (value ?? "").replace(/\D/g, "");
  return numericDialCode ? `+${numericDialCode}` : "";
};

interface PersonalInfoData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  email: string;
  countryCode: string;
  phone: string;
  streetAddress: string;
  addressLine2: string;
  postalCode: string;
  // Add IDs for the dropdowns
  countryId: number | undefined;
  stateId: number | undefined;
  cityId: number | undefined;
}

interface StepPersonalInfoProps {
  data: PersonalInfoData;
  onChange: (data: PersonalInfoData) => void;
  onNext: () => void | Promise<void>;
  onValidateUniqueEmail?: (email: string) => Promise<boolean>;
}

export function StepPersonalInfo({
  data,
  onChange,
  onNext,
  onValidateUniqueEmail,
}: StepPersonalInfoProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "error"
  >("idle");
  const emailValidationRequestIdRef = useRef(0);
  const lastValidatedEmailRef = useRef("");
  const lastValidationResultRef = useRef<boolean | null>(null);

  const {
    countries,
    states,
    cities,
    loading,
    fetchCountries,
    setSelectedCountry,
    setSelectedState,
    setSelectedCity,
  } = useGeoStore();

  // Fetch countries on component mount
  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  const applyEmailValidationResult = (email: string, isUnique: boolean) => {
    lastValidatedEmailRef.current = email;
    lastValidationResultRef.current = isUnique;

    if (isUnique) {
      setEmailStatus("available");
      setErrors((prev) => {
        if (
          prev.email === "Email is already registered" ||
          prev.email ===
            "Unable to validate email right now. Please try again."
        ) {
          return { ...prev, email: "" };
        }
        return prev;
      });
      return;
    }

    setEmailStatus("taken");
    setErrors((prev) => ({
      ...prev,
      email: "Email is already registered",
    }));
  };

  useEffect(() => {
    if (!onValidateUniqueEmail) return;

    const email = data.email.trim();
    if (!email || !EMAIL_REGEX.test(email)) {
      setEmailStatus("idle");
      setIsCheckingEmail(false);
      return;
    }

    if (
      email === lastValidatedEmailRef.current &&
      lastValidationResultRef.current !== null
    ) {
      applyEmailValidationResult(email, lastValidationResultRef.current);
      setIsCheckingEmail(false);
      return;
    }

    const requestId = ++emailValidationRequestIdRef.current;

    const timer = window.setTimeout(async () => {
      setEmailStatus("checking");
      setIsCheckingEmail(true);

      try {
        const isUnique = await onValidateUniqueEmail(email);

        if (requestId !== emailValidationRequestIdRef.current) return;

        applyEmailValidationResult(email, isUnique);
      } catch {
        if (requestId !== emailValidationRequestIdRef.current) return;

        lastValidatedEmailRef.current = "";
        lastValidationResultRef.current = null;
        setEmailStatus("error");
        setErrors((prev) => ({
          ...prev,
          email: "Unable to validate email right now. Please try again.",
        }));
      } finally {
        if (requestId === emailValidationRequestIdRef.current) {
          setIsCheckingEmail(false);
        }
      }
    }, 450);

    return () => {
      window.clearTimeout(timer);
    };
  }, [data.email, onValidateUniqueEmail]);

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (!data.firstName.trim()) newErrors.firstName = "First name is required";
    // if (!data.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!data.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!data.gender) newErrors.gender = "Gender is required";
    if (!data.nationality) newErrors.nationality = "Nationality is required";
    if (!data.email.trim()) newErrors.email = "Email is required";
    if (!EMAIL_REGEX.test(data.email))
      newErrors.email = "Valid email is required";
    if (!data.phone.trim()) newErrors.phone = "Phone is required";
    if (!data.cityId) newErrors.city = "City is required";
    if (!data.stateId) newErrors.state = "State is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    if (emailStatus === "checking") return;

    if (emailStatus === "taken") {
      setErrors((prev) => ({
        ...prev,
        email: "Email is already registered",
      }));
      return;
    }

    if (onValidateUniqueEmail) {
      const normalizedEmail = data.email.trim();
      let isUnique = true;

      if (
        normalizedEmail === lastValidatedEmailRef.current &&
        lastValidationResultRef.current !== null
      ) {
        isUnique = lastValidationResultRef.current;
      } else {
        try {
          setIsCheckingEmail(true);
          isUnique = await onValidateUniqueEmail(normalizedEmail);
          applyEmailValidationResult(normalizedEmail, isUnique);
        } catch {
          lastValidatedEmailRef.current = "";
          lastValidationResultRef.current = null;
          setErrors((prev) => ({
            ...prev,
            email: "Unable to validate email right now. Please try again.",
          }));
          return;
        } finally {
          setIsCheckingEmail(false);
        }
      }

      if (!isUnique) {
        setEmailStatus("taken");
        setErrors((prev) => ({
          ...prev,
          email: "Email is already registered",
        }));
        return;
      }
    }

    await onNext();
  };

  const handleChange = (field: keyof PersonalInfoData, value: string) => {
    if (field === "countryCode") {
      const numericDialCode = value.replace(/\D/g, "");
      const formattedDialCode = numericDialCode ? `+${numericDialCode}` : "";
      onChange({ ...data, [field]: formattedDialCode });

      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }

      return;
    }

    onChange({ ...data, [field]: value });

    if (field === "email") {
      setEmailStatus("idle");

      const emailValue = value.trim();
      if (!emailValue) {
        setErrors((prev) => ({ ...prev, email: "" }));
        return;
      }

      if (!EMAIL_REGEX.test(emailValue)) {
        setErrors((prev) => ({ ...prev, email: "Valid email is required" }));
        return;
      }

      setErrors((prev) => ({
        ...prev,
        email:
          prev.email === "Valid email is required" ||
          prev.email === "Email is already registered" ||
          prev.email === "Unable to validate email right now. Please try again."
            ? ""
            : prev.email,
      }));
      return;
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleCountryChange = (countryId: string) => {
    const country = countries.find((c) => c.id === Number(countryId));
    if (country) {
      const dialCode = normalizeDialCode(country.phoneCode);
      setSelectedCountry(Number(countryId));
      onChange({
        ...data,
        countryId: Number(countryId),
        stateId: undefined,
        cityId: undefined,
        countryCode: dialCode || data.countryCode,
      });
      if (errors.country) {
        setErrors({ ...errors, country: "" });
      }
    }
  };

  const handleStateChange = (stateId: string) => {
    const state = states.find((s) => s.id === Number(stateId));
    if (state) {
      setSelectedState(Number(stateId));
      onChange({
        ...data,
        stateId: Number(stateId),
        cityId: undefined,
      });
      if (errors.state) {
        setErrors({ ...errors, state: "" });
      }
    }
  };

  const handleCityChange = (cityId: string) => {
    const city = cities.find((c) => c.id === Number(cityId));
    if (city) {
      setSelectedCity(Number(cityId));
      onChange({
        ...data,
        cityId: Number(cityId),
      });
      if (errors.city) {
        setErrors({ ...errors, city: "" });
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          Personal Information
        </h3>
        <p className="text-sm text-gray-500">
          Please provide your personal details
        </p>
      </div>

      {/* Basic Information Section */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold mr-2">
            1
          </span>
          Basic Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label
              htmlFor="firstName"
              className="text-sm font-medium text-gray-700 block mb-2"
            >
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              placeholder="John"
              value={data.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              className={`${errors.firstName ? "border-red-500 focus:ring-red-500" : "focus:ring-emerald-500"}`}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>
          <div>
            <Label
              htmlFor="lastName"
              className="text-sm font-medium text-gray-700 block mb-2"
            >
              Last Name
            </Label>
            <Input
              id="lastName"
              placeholder="Doe"
              value={data.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              className={`${errors.lastName ? "border-red-500 focus:ring-red-500" : "focus:ring-emerald-500"}`}
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>
        <div className="mt-4">
          <div>
            <Label
              htmlFor="dob"
              className="text-sm font-medium text-gray-700 block mb-2"
            >
              Date of Birth <span className="text-red-500">*</span>
            </Label>
            <Input
              id="dob"
              type="date"
              value={data.dateOfBirth}
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
              className={`${errors.dateOfBirth ? "border-red-500 focus:ring-red-500" : "focus:ring-emerald-500"}`}
            />
            {errors.dateOfBirth && (
              <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label className="text-sm font-medium text-gray-700 block mb-2">
              Gender <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={data.gender}
              onValueChange={(val) => handleChange("gender", val)}
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white transition">
                <RadioGroupItem value="male" id="male" />
                <Label
                  htmlFor="male"
                  className="font-normal cursor-pointer text-gray-700"
                >
                  Male
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white transition">
                <RadioGroupItem value="female" id="female" />
                <Label
                  htmlFor="female"
                  className="font-normal cursor-pointer text-gray-700"
                >
                  Female
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white transition">
                <RadioGroupItem value="other" id="other" />
                <Label
                  htmlFor="other"
                  className="font-normal cursor-pointer text-gray-700"
                >
                  Other
                </Label>
              </div>
            </RadioGroup>
            {errors.gender && (
              <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 block mb-2">
              Nationality <span className="text-red-500">*</span>
            </Label>

            <RadioGroup
              value={data.nationality}
              onValueChange={(val) => handleChange("nationality", val)}
            >
              {/* Indian */}
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white transition">
                <RadioGroupItem value="0" id="indian" />
                <Label
                  htmlFor="indian"
                  className="font-normal cursor-pointer text-gray-700"
                >
                  Indian
                </Label>
              </div>

              {/* Other / NRI */}
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white transition">
                <RadioGroupItem value="99" id="other" />
                <Label
                  htmlFor="other"
                  className="font-normal cursor-pointer text-gray-700"
                >
                  NRI / Other
                </Label>
              </div>
            </RadioGroup>

            {errors.nationality && (
              <p className="text-red-500 text-xs mt-1">{errors.nationality}</p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold mr-2">
            2
          </span>
          Contact Information
        </h4>
        <div className="space-y-4">
          <div>
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 block mb-2"
            >
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={data.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={`${errors.email ? "border-red-500 focus:ring-red-500" : "focus:ring-emerald-500"}`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
            {!errors.email && emailStatus === "checking" && (
              <p className="text-gray-500 text-xs mt-1">
                Checking email availability...
              </p>
            )}
            {!errors.email && emailStatus === "available" && (
              <p className="text-emerald-600 text-xs mt-1">
                Email is available
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="countryCode"
                className="text-sm font-medium text-gray-700 block mb-2"
              >
                Country Code
              </Label>
              <Select
                value={data.countryCode}
                onValueChange={(value) => handleChange("countryCode", value)}
                disabled={loading || countries.length === 0}
              >
                <SelectTrigger id="countryCode" className="focus:ring-emerald-500">
                  <SelectValue placeholder="Select code" />
                </SelectTrigger>
                <SelectContent searchable>
                  {countries
                    .map((country) => {
                      const dialCode = normalizeDialCode(country.phoneCode);
                      if (!dialCode) {
                        return null;
                      }

                      const countryName = country.name?.trim() || "Unknown";
                      return (
                        <SelectItem key={country.id} value={dialCode}>
                          {`${dialCode} (${countryName})`}
                        </SelectItem>
                      );
                    })
                    .filter(Boolean)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                htmlFor="phone"
                className="text-sm font-medium text-gray-700 block mb-2"
              >
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="9876543210"
                value={data.phone}
                onChange={(e) =>
                  handleChange("phone", e.target.value.replace(/\D/g, ""))
                }
                className={`${errors.phone ? "border-red-500 focus:ring-red-500" : "focus:ring-emerald-500"}`}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Address Information Section */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold mr-2">
            3
          </span>
          Address Information
        </h4>
        <div className="space-y-4">
          <div>
            <Label
              htmlFor="street"
              className="text-sm font-medium text-gray-700 block mb-2"
            >
              Street Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="street"
              placeholder="123 Main Street"
              value={data.streetAddress}
              onChange={(e) => handleChange("streetAddress", e.target.value)}
              className="focus:ring-emerald-500"
            />
          </div>

          <div>
            <Label
              htmlFor="address2"
              className="text-sm font-medium text-gray-700 block mb-2"
            >
              Apartment, Suite, etc. (Optional)
            </Label>
            <Input
              id="address2"
              placeholder="Apartment or suite number"
              value={data.addressLine2}
              onChange={(e) => handleChange("addressLine2", e.target.value)}
              className="focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="country"
                className="text-sm font-medium text-gray-700 block mb-2"
              >
                Country <span className="text-red-500">*</span>
              </Label>
              <Select
                value={data.countryId?.toString()}
                onValueChange={handleCountryChange}
                disabled={loading}
              >
                <SelectTrigger
                  className={`${errors.country ? "border-red-500" : ""}`}
                >
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent searchable>
                  {countries.map((country) => (
                    <SelectItem
                      key={country.id}
                      value={country.id?.toString() || ""}
                    >
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.country && (
                <p className="text-red-500 text-xs mt-1">{errors.country}</p>
              )}
            </div>

            <div>
              <Label
                htmlFor="state"
                className="text-sm font-medium text-gray-700 block mb-2"
              >
                State <span className="text-red-500">*</span>
              </Label>
              <Select
                value={data.stateId?.toString()}
                onValueChange={handleStateChange}
                disabled={!data.countryId || loading || states.length === 0}
              >
                <SelectTrigger
                  className={`${errors.state ? "border-red-500" : ""}`}
                >
                  <SelectValue
                    placeholder={
                      !data.countryId ? "Select country first" : "Select state"
                    }
                  />
                </SelectTrigger>
                <SelectContent searchable>
                  {states.map((state) => (
                    <SelectItem
                      key={state.id}
                      value={state.id?.toString() || ""}
                    >
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && (
                <p className="text-red-500 text-xs mt-1">{errors.state}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="city"
                className="text-sm font-medium text-gray-700 block mb-2"
              >
                City <span className="text-red-500">*</span>
              </Label>
              <Select
                value={data.cityId?.toString()}
                onValueChange={handleCityChange}
                disabled={!data.stateId || loading || cities.length === 0}
              >
                <SelectTrigger
                  className={`${errors.city ? "border-red-500" : ""}`}
                >
                  <SelectValue
                    placeholder={
                      !data.stateId ? "Select state first" : "Select city"
                    }
                  />
                </SelectTrigger>
                <SelectContent searchable>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id?.toString() || ""}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">{errors.city}</p>
              )}
            </div>

            <div>
              <Label
                htmlFor="postal"
                className="text-sm font-medium text-gray-700 block mb-2"
              >
                Postal Code
              </Label>
              <Input
                id="postal"
                placeholder="400001"
                value={data.postalCode}
                onChange={(e) => handleChange("postalCode", e.target.value)}
                className="focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="px-6 text-gray-700 border-gray-300 hover:bg-gray-50"
        >
          Cancel
        </Button>
        <Button
          onClick={handleNext}
          disabled={isCheckingEmail}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 font-semibold"
        >
          Continue to Membership →
        </Button>
      </div>
    </div>
  );
}
