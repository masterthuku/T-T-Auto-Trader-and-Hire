/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
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
  const [submitAttempted, setSubmitAttempted] = useState(false);

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
    pickupDate: undefined as Date | undefined,
    pickupTime: "" as string, // e.g. "14:30"
    returnDate: undefined as Date | undefined,
    returnTime: "" as string,
  });

  const [dobPopoverOpen, setDobPopoverOpen] = useState(false);
  const [licensePopoverOpen, setLicensePopoverOpen] = useState(false);
  const [pickupPopoverOpen, setPickupPopoverOpen] = useState(false);
  const [returnPopoverOpen, setReturnPopoverOpen] = useState(false);

  const [availableCars, setAvailableCars] = useState<any[]>([]);
  const [selectedCar, setSelectedCar] = useState<string>("");

  const isIndividual = clientType === "individual";
  const isCorporate = clientType === "corporate";

  // Fetch available cars
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await fetch("/api/cars/available");
        const data = await res.json();
        if (data.success) {
          setAvailableCars(data.cars);
        }
      } catch (err) {
        console.error("Failed to load cars:", err);
      }
    };
    fetchCars();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const isValid =
      clientType &&
      formData.phone.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.residentialAddress.trim() !== "" &&
      formData.idType.trim() !== "" &&
      formData.idNumber.trim() !== "" &&
      formData.licenseNumber.trim() !== "" &&
      selectedCar.trim() !== "" &&
      formData.pickupDate &&
      formData.pickupTime &&
      formData.returnDate &&
      formData.returnTime &&
      formData.pickupDate > new Date() &&
      formData.returnDate > formData.pickupDate &&
      (isIndividual
        ? formData.firstName.trim() !== "" && formData.lastName.trim() !== ""
        : formData.organizationName.trim() !== "");

    if (!isValid) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const formDataToSend = new FormData(e.currentTarget as HTMLFormElement);

      // Manually append state-managed fields
      formDataToSend.append("idType", formData.idType);
      formDataToSend.append("idNumber", formData.idNumber);
      formDataToSend.append("selectedCar", selectedCar);

      // Dates
      if (formData.dob) {
        formDataToSend.append("dobYear", formData.dob.getFullYear().toString());
        formDataToSend.append(
          "dobMonth",
          (formData.dob.getMonth() + 1).toString(),
        );
        formDataToSend.append("dobDay", formData.dob.getDate().toString());
      }

      if (formData.licenseExpiration) {
        formDataToSend.append(
          "expYear",
          formData.licenseExpiration.getFullYear().toString(),
        );
        formDataToSend.append(
          "expMonth",
          (formData.licenseExpiration.getMonth() + 1).toString(),
        );
        formDataToSend.append(
          "expDay",
          formData.licenseExpiration.getDate().toString(),
        );
      }

      // Pickup Date + Time
      if (formData.pickupDate) {
        formDataToSend.append(
          "pickupYear",
          formData.pickupDate.getFullYear().toString(),
        );
        formDataToSend.append(
          "pickupMonth",
          (formData.pickupDate.getMonth() + 1).toString(),
        );
        formDataToSend.append(
          "pickupDay",
          formData.pickupDate.getDate().toString(),
        );
      }
      if (formData.pickupTime) {
        formDataToSend.append("pickupTime", formData.pickupTime); // e.g. "14:30"
      }

      // Return Date + Time
      if (formData.returnDate) {
        formDataToSend.append(
          "returnYear",
          formData.returnDate.getFullYear().toString(),
        );
        formDataToSend.append(
          "returnMonth",
          (formData.returnDate.getMonth() + 1).toString(),
        );
        formDataToSend.append(
          "returnDay",
          formData.returnDate.getDate().toString(),
        );
      }
      if (formData.returnTime) {
        formDataToSend.append("returnTime", formData.returnTime);
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

      // Mark car as Booked
      await fetch(`/api/cars/${selectedCar}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Booked" }),
      });

      // Optimistic UI: Remove booked car from dropdown
      setAvailableCars((prev) => prev.filter((car) => car._id !== selectedCar));

      setSubmitStatus("success");
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      console.error("Submission error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fixed date helper
  const updateDateYearMonth = (
    currentDate: Date | undefined,
    yearStr?: string,
    monthStr?: string,
  ): Date => {
    const date = currentDate ? new Date(currentDate) : new Date();

    if (yearStr !== undefined && yearStr !== "") {
      date.setFullYear(Number(yearStr));
    }

    if (monthStr !== undefined && monthStr !== "") {
      date.setMonth(Number(monthStr));
    }

    const lastDay = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
    ).getDate();
    date.setDate(Math.min(date.getDate(), lastDay));

    return date;
  };

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

              {!clientType && submitAttempted && (
                <p className="text-sm text-red-600 text-center">
                  Please select client type
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
                            className={cn(
                              submitAttempted &&
                                !formData.firstName &&
                                "border-red-500",
                            )}
                          />
                          {submitAttempted && !formData.firstName && (
                            <p className="text-xs text-red-600">Required</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                            className={cn(
                              submitAttempted &&
                                !formData.lastName &&
                                "border-red-500",
                            )}
                          />
                          {submitAttempted && !formData.lastName && (
                            <p className="text-xs text-red-600">Required</p>
                          )}
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
                          className={cn(
                            submitAttempted &&
                              !formData.organizationName &&
                              "border-red-500",
                          )}
                        />
                        {submitAttempted && !formData.organizationName && (
                          <p className="text-xs text-red-600">Required</p>
                        )}
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
                          className={cn(
                            "rounded-l-none",
                            submitAttempted &&
                              !formData.phone &&
                              "border-red-500",
                          )}
                          placeholder="7XX XXX XXX"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      {submitAttempted && !formData.phone && (
                        <p className="text-xs text-red-600">Required</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email Address (Optional for individuals)
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className={cn(
                          submitAttempted &&
                            !formData.email &&
                            "border-red-500",
                        )}
                      />
                      {submitAttempted && !formData.email && (
                        <p className="text-xs text-red-600">Required</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Date of Birth */}
                {isIndividual && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Date of Birth *</h3>
                    <div className="space-y-2">
                      <Popover
                        open={dobPopoverOpen}
                        onOpenChange={setDobPopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.dob && "text-muted-foreground",
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
                                value={
                                  formData.dob?.getFullYear().toString() ?? ""
                                }
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
                                value={
                                  formData.dob?.getMonth().toString() ?? ""
                                }
                                onValueChange={(month) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    dob: updateDateYearMonth(
                                      prev.dob,
                                      undefined,
                                      month,
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
                                  newMonth.getMonth().toString(),
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
                        className={cn(
                          submitAttempted &&
                            !formData.licenseNumber &&
                            "border-red-500",
                        )}
                      />
                      {submitAttempted && !formData.licenseNumber && (
                        <p className="text-xs text-red-600">Required</p>
                      )}
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
                            e.target.value = "";
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
                                "text-muted-foreground",
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
                                value={
                                  formData.licenseExpiration
                                    ?.getFullYear()
                                    .toString() ?? ""
                                }
                                onValueChange={(year) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    licenseExpiration: updateDateYearMonth(
                                      prev.licenseExpiration,
                                      year,
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
                                value={
                                  formData.licenseExpiration
                                    ?.getMonth()
                                    .toString() ?? ""
                                }
                                onValueChange={(month) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    licenseExpiration: updateDateYearMonth(
                                      prev.licenseExpiration,
                                      undefined,
                                      month,
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
                                  newMonth.getMonth().toString(),
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

                {/* KYC + Vehicle + Pickup/Return Dates */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">
                    Additional Identification (KYC), Vehicle & Rental Period
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ID Type */}
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
                              "border-red-500",
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

                    {/* ID Number */}
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
                            "border-red-500",
                        )}
                      />
                      {submitAttempted && !formData.idNumber && (
                        <p className="text-xs text-red-600">Required</p>
                      )}
                    </div>

                    {/* Pickup Date + Time */}
                    <div className="space-y-2">
                      <Label>Pickup Date & Time *</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Popover
                          open={pickupPopoverOpen}
                          onOpenChange={setPickupPopoverOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "justify-start text-left font-normal",
                                !formData.pickupDate && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.pickupDate
                                ? format(formData.pickupDate, "PPP")
                                : "Date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-3" align="start">
                            <DayPicker
                              mode="single"
                              selected={formData.pickupDate}
                              onSelect={(date) => {
                                if (date && date > new Date()) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    pickupDate: date,
                                  }));
                                }
                              }}
                              month={formData.pickupDate ?? new Date()}
                              disabled={{ before: new Date() }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>

                        <Input
                          type="time"
                          value={formData.pickupTime}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              pickupTime: e.target.value,
                            }))
                          }
                          required
                          className={cn(
                            submitAttempted &&
                              !formData.pickupTime &&
                              "border-red-500",
                          )}
                        />
                      </div>
                      {submitAttempted &&
                        (!formData.pickupDate || !formData.pickupTime) && (
                          <p className="text-sm text-red-600 mt-1">
                            Pickup date & time required (future)
                          </p>
                        )}
                    </div>

                    {/* Return Date + Time */}
                    <div className="space-y-2">
                      <Label>Return Date & Time *</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Popover
                          open={returnPopoverOpen}
                          onOpenChange={setReturnPopoverOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "justify-start text-left font-normal",
                                !formData.returnDate && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.returnDate
                                ? format(formData.returnDate, "PPP")
                                : "Date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-3" align="start">
                            <DayPicker
                              mode="single"
                              selected={formData.returnDate}
                              onSelect={(date) => {
                                if (
                                  date &&
                                  formData.pickupDate &&
                                  date > formData.pickupDate
                                ) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    returnDate: date,
                                  }));
                                }
                              }}
                              month={formData.returnDate ?? new Date()}
                              disabled={{
                                before: formData.pickupDate ?? new Date(),
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>

                        <Input
                          type="time"
                          value={formData.returnTime}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              returnTime: e.target.value,
                            }))
                          }
                          required
                          className={cn(
                            submitAttempted &&
                              !formData.returnTime &&
                              "border-red-500",
                          )}
                        />
                      </div>
                      {submitAttempted &&
                        (!formData.returnDate || !formData.returnTime) && (
                          <p className="text-sm text-red-600 mt-1">
                            Return date & time required (after pickup)
                          </p>
                        )}
                    </div>

                    {/* Vehicle Selection */}
                    <div className="space-y-2 md:col-span-2">
                      <Label>Vehicle to Hire *</Label>
                      <Select
                        value={selectedCar}
                        onValueChange={setSelectedCar}
                        required
                      >
                        <SelectTrigger
                          className={cn(
                            submitAttempted && !selectedCar && "border-red-500",
                          )}
                        >
                          <SelectValue placeholder="Select available vehicle *" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCars.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No vehicles available
                            </SelectItem>
                          ) : (
                            availableCars.map((car) => (
                              <SelectItem key={car._id} value={car._id}>
                                {car.make} {car.modelName} ({car.year}) - KSh{" "}
                                {car.dailyPrice}/day
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {submitAttempted && !selectedCar && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          Please select a vehicle
                        </p>
                      )}
                    </div>

                    {/* ID Front Image */}
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
                            e.target.value = "";
                          }
                        }}
                      />
                    </div>

                    {/* ID Back Image */}
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
                            e.target.value = "";
                          }
                        }}
                      />
                    </div>

                    {/* Passport Size Photo */}
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
                            e.target.value = "";
                          }
                        }}
                      />
                    </div>

                    {/* Residential Address */}
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
                        className={cn(
                          submitAttempted &&
                            !formData.residentialAddress &&
                            "border-red-500",
                        )}
                      />
                      {submitAttempted && !formData.residentialAddress && (
                        <p className="text-xs text-red-600">Required</p>
                      )}
                    </div>

                    {/* Work Address */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="workAddress">
                        Work / Office Address (optional for individuals)
                      </Label>
                      <Input
                        id="workAddress"
                        name="workAddress"
                        value={formData.workAddress}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
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
                      "Submit Registration & Book Vehicle"
                    )}
                  </Button>

                  {submitStatus === "success" && (
                    <p className="mt-4 text-center text-green-600 font-medium">
                      Registration & booking submitted successfully!
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
