import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  isCorporate: boolean;
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  phone: string;
  email: string;
  dob: Date;
  licenseNumber: string;
  licenseFrontUrl: string; // ImageKit URL
  licenseExpiration: Date;
  idType?: string;
  idNumber?: string;
  idFrontUrl?: string;
  idBackUrl?: string;
  photoUrl?: string;
  residentialAddress?: string;
  workAddress?: string;
  kraPin?: string;
}

const UserSchema: Schema = new Schema({
  isCorporate: { type: Boolean, default: false },
  firstName: { type: String },
  lastName: { type: String },
  organizationName: { type: String },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  dob: { type: Date },
  licenseNumber: { type: String },
  licenseFrontUrl: { type: String },
  licenseExpiration: { type: Date },
  idType: { type: String },
  idNumber: { type: String },
  idFrontUrl: { type: String },
  idBackUrl: { type: String },
  photoUrl: { type: String },
  residentialAddress: { type: String },
  workAddress: { type: String },
  kraPin: { type: String },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);