import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  isCorporate: boolean;
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  phone: string;
  email: string;
  dob?: Date;
  licenseNumber: string;
  licenseFrontUrl: string;
  licenseExpiration?: Date;
  idType: string;
  idNumber: string;
  idFrontUrl?: string;
  idBackUrl?: string;
  photoUrl?: string;
  residentialAddress?: string;
  workAddress?: string;
  pickupDate: Date;       // Required
  returnDate: Date;       // Required
  selectedCar?: string;   // Optional: reference to booked car
}

const UserSchema: Schema = new Schema(
  {
    isCorporate: { type: Boolean, default: false },
    firstName: { type: String },
    lastName: { type: String },
    organizationName: { type: String },
    phone: { type: String, required: true },
    email: { type: String, required: false },
    dob: { type: Date },
    licenseNumber: { type: String, required: true },
    licenseFrontUrl: { type: String, required: true },
    licenseExpiration: { type: Date },
    idType: {
      type: String,
      required: [true, "ID Type is required"],
      enum: ["national_id", "passport", "alien_id", "military_id"],
    },
    idNumber: {
      type: String,
      required: [true, "ID Number is required"],
      trim: true,
    },
    idFrontUrl: { type: String },
    idBackUrl: { type: String },
    photoUrl: { type: String },
    residentialAddress: { type: String },
    workAddress: { type: String },
    pickupDate: {
      type: Date,
      required: [true, "Pickup date is required"],
    },
    returnDate: {
      type: Date,
      required: [true, "Return date is required"],
    },
    selectedCar: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);