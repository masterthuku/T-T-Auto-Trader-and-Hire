/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegistrationForm() {
  const [clientType, setClientType] = useState<
    "individual" | "corporate" | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [submitAttempted, setSubmitAttempted] = useState(false); // ← Controls error display

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    organizationName: "",
    phone: "",
    email: "",
    dob: undefined as Date | undefined,
    licenseNumber: "",
    licenseExpiration: undefined as Date | undefined,
    idType: "",
    idNumber: "",
    residentialAddress: "",
    workAddress: "",
    kraPin: "",
  });

  const [dobPopoverOpen, setDobPopoverOpen] = useState(false);
  const [licensePopoverOpen, setLicensePopoverOpen] = useState(false);

  const isIndividual = clientType === "individual";
  const isCorporate = clientType === "corporate";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    // Client-side validation (blocks submission if missing)
    const isValid =
      clientType &&
      formData.phone.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.residentialAddress.trim() !== "" &&
      formData.idType.trim() !== "" && // ← Critical check
      formData.idNumber.trim() !== "" &&
      formData.licenseNumber.trim() !== "" &&
      (isIndividual
        ? formData.firstName.trim() !== "" && formData.lastName.trim() !== ""
        : formData.organizationName.trim() !== "");

    if (!isValid) {
      return; // Show errors, don't submit
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const formDataToSend = new FormData(e.currentTarget as HTMLFormElement);

      // Manually append state-managed fields that aren't in native inputs
      formDataToSend.append("idType", formData.idType); // ← FIX: this was missing!
      formDataToSend.append("idNumber", formData.idNumber); // ← Just in case

      // Append dates (already doing this - good)
      if (formData.dob) {
        formDataToSend.append("dobYear", formData.dob.getFullYear().toString());
        formDataToSend.append(
          "dobMonth",
          (formData.dob.getMonth() + 1).toString()
        );
        formDataToSend.append("dobDay", formData.dob.getDate().toString());
      }

      if (formData.licenseExpiration) {
        formDataToSend.append(
          "expYear",
          formData.licenseExpiration.getFullYear().toString()
        );
        formDataToSend.append(
          "expMonth",
          (formData.licenseExpiration.getMonth() + 1).toString()
        );
        formDataToSend.append(
          "expDay",
          formData.licenseExpiration.getDate().toString()
        );
      }

      formDataToSend.append("isCorporate", isCorporate.toString());

      const res = await fetch("/api/submit", {
        method: "POST",
        body: formDataToSend,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Submission failed");
      }

      setSubmitStatus("success");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error("Submission error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Date helpers (unchanged)
  const today = new Date();
  const currentYear = today.getFullYear();

  const dobYears = Array.from({ length: 101 }, (_, i) => currentYear - i);
  const licenseYears = Array.from({ length: 21 }, (_, i) => currentYear + i);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const updateDateYearMonth = (
    currentDate: Date | undefined,
    yearStr?: string,
    monthStr?: string
  ): Date => {
    const date = currentDate ? new Date(currentDate) : new Date();
    if (yearStr !== undefined) date.setFullYear(Number(yearStr));
    if (monthStr !== undefined) date.setMonth(Number(monthStr));
    return date;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <Card className="mx-auto max-w-3xl shadow-lg">
        <CardHeader className="pb-6 pt-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl">
              TT
            </div>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold">
            T T Auto Trader and Hire
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Client Registration & KYC Form
          </p>
        </CardHeader>

        <CardContent className="px-6 pb-10">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Client Type Selection */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-center">
                Who will be renting the vehicle?
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto">
                <Button
                  type="button"
                  variant={isIndividual ? "default" : "outline"}
                  size="lg"
                  className="h-16 text-lg font-medium transition-all"
                  onClick={() => setClientType("individual")}
                >
                  Individual
                </Button>

                <Button
                  type="button"
                  variant={isCorporate ? "default" : "outline"}
                  size="lg"
                  className="h-16 text-lg font-medium transition-all"
                  onClick={() => setClientType("corporate")}
                >
                  Corporate / Organization
                </Button>
              </div>

              {!clientType && (
                <p className="text-sm text-muted-foreground text-center">
                  Please select client type to continue
                </p>
              )}
            </div>

            {/* Form content */}
            {clientType && (
              <>
                <Separator className="my-8" />

                {/* Personal / Organization Details */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">
                    {isIndividual ? "Personal Details" : "Organization Details"}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isIndividual ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </>
                    ) : (
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="organizationName">
                          Organization Name *
                        </Label>
                        <Input
                          id="organizationName"
                          name="organizationName"
                          value={formData.organizationName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <div className="flex">
                        <div className="bg-gray-100 border border-r-0 rounded-l-md px-3 flex items-center text-sm">
                          +254
                        </div>
                        <Input
                          id="phone"
                          name="phone"
                          className="rounded-l-none"
                          placeholder="7XX XXX XXX"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Date of Birth */}
                {isIndividual && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Date of Birth</h3>
                    <div className="space-y-2">
                      <Label>Date of Birth *</Label>
                      <Popover
                        open={dobPopoverOpen}
                        onOpenChange={setDobPopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.dob && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.dob ? (
                              format(formData.dob, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-3" align="start">
                          <div className="flex justify-between gap-4 mb-4 px-2">
                            <div className="w-32">
                              <Select
                                value={formData.dob?.getFullYear().toString()}
                                onValueChange={(year) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    dob: updateDateYearMonth(prev.dob, year),
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent className="max-h-64">
                                  {dobYears.map((y) => (
                                    <SelectItem key={y} value={y.toString()}>
                                      {y}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="w-40">
                              <Select
                                value={formData.dob?.getMonth().toString()}
                                onValueChange={(month) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    dob: updateDateYearMonth(
                                      prev.dob,
                                      undefined,
                                      month
                                    ),
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                  {months.map((m, idx) => (
                                    <SelectItem key={m} value={idx.toString()}>
                                      {m}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <DayPicker
                            mode="single"
                            selected={formData.dob}
                            onSelect={(date) => {
                              setFormData((prev) => ({ ...prev, dob: date }));
                              setDobPopoverOpen(false);
                            }}
                            month={formData.dob ?? new Date()}
                            onMonthChange={(newMonth) =>
                              setFormData((prev) => ({
                                ...prev,
                                dob: updateDateYearMonth(
                                  prev.dob,
                                  undefined,
                                  newMonth.getMonth().toString()
                                ),
                              }))
                            }
                            disabled={{
                              after: today,
                              before: new Date(currentYear - 100, 0, 1),
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}

                {/* Driver's License */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">
                    Driver&apos;s License
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="licenseNumber">
                        Driver License Number *
                      </Label>
                      <Input
                        id="licenseNumber"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Driver License Front Image *</Label>
                      <Input
                        type="file"
                        name="licenseFront"
                        accept="image/*"
                        className="cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && file.size > 20 * 1024 * 1024) {
                            alert("File too large! Maximum 20MB allowed.");
                            e.target.value = ""; // Clear the input
                          }
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Expiration Date *</Label>
                      <Popover
                        open={licensePopoverOpen}
                        onOpenChange={setLicensePopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.licenseExpiration &&
                                "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.licenseExpiration ? (
                              format(formData.licenseExpiration, "PPP")
                            ) : (
                              <span>Pick expiration date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-3" align="start">
                          <div className="flex justify-between gap-4 mb-4 px-2">
                            <div className="w-32">
                              <Select
                                value={formData.licenseExpiration
                                  ?.getFullYear()
                                  .toString()}
                                onValueChange={(year) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    licenseExpiration: updateDateYearMonth(
                                      prev.licenseExpiration,
                                      year
                                    ),
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent className="max-h-64">
                                  {licenseYears.map((y) => (
                                    <SelectItem key={y} value={y.toString()}>
                                      {y}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="w-40">
                              <Select
                                value={formData.licenseExpiration
                                  ?.getMonth()
                                  .toString()}
                                onValueChange={(month) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    licenseExpiration: updateDateYearMonth(
                                      prev.licenseExpiration,
                                      undefined,
                                      month
                                    ),
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                  {months.map((m, idx) => (
                                    <SelectItem key={m} value={idx.toString()}>
                                      {m}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <DayPicker
                            mode="single"
                            selected={formData.licenseExpiration}
                            onSelect={(date) => {
                              setFormData((prev) => ({
                                ...prev,
                                licenseExpiration: date,
                              }));
                              setLicensePopoverOpen(false);
                            }}
                            month={formData.licenseExpiration ?? new Date()}
                            onMonthChange={(newMonth) =>
                              setFormData((prev) => ({
                                ...prev,
                                licenseExpiration: updateDateYearMonth(
                                  prev.licenseExpiration,
                                  undefined,
                                  newMonth.getMonth().toString()
                                ),
                              }))
                            }
                            disabled={{ before: today }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                {/* KYC - ID Type & ID Number now enforced */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">
                    Additional Identification (KYC)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Type of ID *</Label>
                      <Select
                        value={formData.idType}
                        onValueChange={(v) =>
                          setFormData((prev) => ({ ...prev, idType: v }))
                        }
                        required
                      >
                        <SelectTrigger
                          className={cn(
                            submitAttempted &&
                              !formData.idType &&
                              "border-red-500 focus:ring-red-500"
                          )}
                        >
                          <SelectValue placeholder="Select ID Type *" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="national_id">
                            National ID
                          </SelectItem>
                          <SelectItem value="passport">Passport</SelectItem>
                          <SelectItem value="alien_id">Alien ID</SelectItem>
                          <SelectItem value="military_id">
                            Military ID
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {submitAttempted && !formData.idType && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          Please select an ID type
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="idNumber">ID Number *</Label>
                      <Input
                        id="idNumber"
                        name="idNumber"
                        value={formData.idNumber}
                        onChange={handleInputChange}
                        required
                        className={cn(
                          submitAttempted &&
                            !formData.idNumber &&
                            "border-red-500 focus:ring-red-500"
                        )}
                      />
                      {submitAttempted && !formData.idNumber && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          ID Number is required
                        </p>
                      )}
                    </div>

                    {/* Other KYC fields */}
                    <div className="space-y-2">
                      <Label>ID Front Image *</Label>
                      <Input
                        type="file"
                        name="idFront"
                        accept="image/*"
                        className="cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && file.size > 20 * 1024 * 1024) {
                            alert("File too large! Maximum 20MB allowed.");
                            e.target.value = ""; // Clear the input
                          }
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>ID Back Image</Label>
                      <Input
                        type="file"
                        name="idBack"
                        accept="image/*"
                        className="cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && file.size > 20 * 1024 * 1024) {
                            alert("File too large! Maximum 20MB allowed.");
                            e.target.value = ""; // Clear the input
                          }
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Passport Size Photo *</Label>
                      <Input
                        type="file"
                        name="photo"
                        accept="image/*"
                        className="cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && file.size > 20 * 1024 * 1024) {
                            alert("File too large! Maximum 20MB allowed.");
                            e.target.value = ""; // Clear the input
                          }
                        }}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="residentialAddress">
                        Residential Address / Hotel Name *
                      </Label>
                      <Input
                        id="residentialAddress"
                        name="residentialAddress"
                        value={formData.residentialAddress}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="workAddress">Work / Office Address</Label>
                      <Input
                        id="workAddress"
                        name="workAddress"
                        value={formData.workAddress}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="kraPin">KRA PIN</Label>
                      <Input
                        id="kraPin"
                        name="kraPin"
                        value={formData.kraPin}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Section */}
                <div className="pt-8">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full md:w-auto px-12 py-6 text-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Submit Registration"
                    )}
                  </Button>

                  {submitStatus === "success" && (
                    <p className="mt-4 text-center text-green-600 font-medium">
                      Registration submitted successfully!
                    </p>
                  )}
                  {submitStatus === "error" && (
                    <p className="mt-4 text-center text-red-600 font-medium">
                      Something went wrong. Please try again.
                    </p>
                  )}
                </div>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
