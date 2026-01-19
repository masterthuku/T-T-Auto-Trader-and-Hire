// models/Car.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ICar extends Document {
  make: string;
  modelName: string;
  year: number;
  registration: string;
  seats: number;
  transmission: 'Automatic' | 'Manual';
  fuelType: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
  color: string;
  dailyPrice: number;
  status: 'Available' | 'Booked' | 'Maintenance';
  mainImageUrl?: string;
  galleryImages?: string[];
  createdAt: Date;
}

const CarSchema: Schema = new Schema({
  make: { type: String, required: true },
  modelName: { type: String, required: true },
  year: { type: Number, required: true },
  registration: { type: String, required: true, unique: true },
  seats: { type: Number, required: true },
  transmission: { type: String, enum: ['Automatic', 'Manual'], required: true },
  fuelType: { type: String, enum: ['Petrol', 'Diesel', 'Hybrid', 'Electric'], required: true },
  color: { type: String, required: true },
  dailyPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Available', 'Booked', 'Maintenance'],
    default: 'Available',
  },
  mainImageUrl: { type: String },
  galleryImages: [{ type: String }],
}, { timestamps: true });

export default mongoose.models.Car || mongoose.model<ICar>('Car', CarSchema);