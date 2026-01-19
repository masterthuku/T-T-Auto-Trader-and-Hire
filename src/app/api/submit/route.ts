/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Car from "@/models/Car";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const bodyParser = false;

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();

    const getField = (name: string) =>
      formData.get(name)?.toString() ?? undefined;

    const isCorporate = getField("isCorporate") === "true";
    const firstName = getField("firstName");
    const lastName = getField("lastName");
    const organizationName = getField("organizationName");
    const phone = getField("phone");
    const email = getField("email");
    const licenseNumber = getField("licenseNumber");
    const idType = getField("idType");
    const idNumber = getField("idNumber");
    const residentialAddress = getField("residentialAddress");
    const workAddress = getField("workAddress");

    // Selected car ID
    const selectedCar = getField("selectedCar");

    // Parse dates (year/month/day)
    const dob =
      getField("dobYear") && getField("dobMonth") && getField("dobDay")
        ? new Date(
            `${getField("dobYear")}-${getField("dobMonth")}-${getField("dobDay")}`,
          )
        : undefined;

    const licenseExpiration =
      getField("expYear") && getField("expMonth") && getField("expDay")
        ? new Date(
            `${getField("expYear")}-${getField("expMonth")}-${getField("expDay")}`,
          )
        : undefined;

    // Pickup date + time
    const pickupDate =
      getField("pickupYear") && getField("pickupMonth") && getField("pickupDay")
        ? new Date(
            `${getField("pickupYear")}-${getField("pickupMonth")}-${getField("pickupDay")}`,
          )
        : undefined;

    const pickupTime = getField("pickupTime"); // e.g. "14:30"
    if (pickupDate && pickupTime) {
      const [hours, minutes] = pickupTime.split(":").map(Number);
      pickupDate.setHours(hours);
      pickupDate.setMinutes(minutes);
      pickupDate.setSeconds(0);
      pickupDate.setMilliseconds(0);
    }

    // Return date + time
    const returnDate =
      getField("returnYear") && getField("returnMonth") && getField("returnDay")
        ? new Date(
            `${getField("returnYear")}-${getField("returnMonth")}-${getField("returnDay")}`,
          )
        : undefined;

    const returnTime = getField("returnTime");
    if (returnDate && returnTime) {
      const [hours, minutes] = returnTime.split(":").map(Number);
      returnDate.setHours(hours);
      returnDate.setMinutes(minutes);
      returnDate.setSeconds(0);
      returnDate.setMilliseconds(0);
    }

    // Server-side validation
    if (!pickupDate || !returnDate) {
      return NextResponse.json(
        { error: "Pickup and return date/time are required" },
        { status: 400 },
      );
    }
    if (pickupDate >= returnDate) {
      return NextResponse.json(
        { error: "Return date/time must be after pickup date/time" },
        { status: 400 },
      );
    }
    if (pickupDate < new Date()) {
      return NextResponse.json(
        { error: "Pickup date/time must be in the future" },
        { status: 400 },
      );
    }

    // File uploads
    const uploadFile = async (
      file: File | null,
      prefix: string,
    ): Promise<string> => {
      if (!file || file.size === 0) return "";

      if (file.size > MAX_FILE_SIZE) {
        console.warn(`File too large: ${file.name} (${file.size} bytes)`);
        return "";
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const extension = file.name.split(".").pop() || "jpg";
        const fileName = `${prefix}-${Date.now()}.${extension}`;

        const response = await imagekit.upload({
          file: buffer,
          fileName,
          useUniqueFileName: true,
        });

        return response.url;
      } catch (err) {
        console.error(`Upload failed for ${file?.name || prefix}:`, err);
        return "";
      }
    };

    const [licenseFrontUrl, idFrontUrl, idBackUrl, photoUrl] =
      await Promise.all([
        uploadFile(
          formData.get("licenseFront") as File | null,
          "license-front",
        ),
        uploadFile(formData.get("idFront") as File | null, "id-front"),
        uploadFile(formData.get("idBack") as File | null, "id-back"),
        uploadFile(formData.get("photo") as File | null, "photo"),
      ]);

    // Create and save user with all fields
    const user = new User({
      isCorporate,
      firstName,
      lastName,
      organizationName,
      phone,
      email,
      dob,
      licenseNumber,
      licenseFrontUrl,
      licenseExpiration,
      idType,
      idNumber,
      idFrontUrl,
      idBackUrl,
      photoUrl,
      residentialAddress,
      workAddress,
      pickupDate,
      returnDate,
      selectedCar,
    });

    await user.save();

    if (selectedCar) {
      await Car.findByIdAndUpdate(selectedCar, {
        status: "Booked",
        bookedBy: user._id, // ← This links the user to the car
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Form processing error:", error);
    return NextResponse.json(
      { error: "Submission failed", message: error.message },
      { status: 500 },
    );
  }
}
