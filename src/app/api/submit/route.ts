/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import ImageKit from 'imagekit';
import connectDB from '@/lib/db';
import User from '@/models/User';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();

    // Text fields
    const getField = (name: string) => formData.get(name)?.toString() ?? undefined;

    const isCorporate = getField('isCorporate') === 'true';
    const firstName = getField('firstName');
    const lastName = getField('lastName');
    const organizationName = getField('organizationName');
    const phone = getField('phone');
    const email = getField('email');
    const licenseNumber = getField('licenseNumber');
    const idType = getField('idType');
    const idNumber = getField('idNumber');
    const residentialAddress = getField('residentialAddress');
    const workAddress = getField('workAddress');
    const kraPin = getField('kraPin');

    // Dates
    const dobYear = getField('dobYear');
    const dobMonth = getField('dobMonth');
    const dobDay = getField('dobDay');
    const dob = dobYear && dobMonth && dobDay
      ? new Date(`${dobYear}-${dobMonth}-${dobDay}`)
      : undefined;

    const expYear = getField('expYear');
    const expMonth = getField('expMonth');
    const expDay = getField('expDay');
    const licenseExpiration = expYear && expMonth && expDay
      ? new Date(`${expYear}-${expMonth}-${expDay}`)
      : undefined;

    // File handling
    const fileToBuffer = async (file: File | null) => {
      if (!file) return null;
      const arrayBuffer = await file.arrayBuffer();
      return Buffer.from(arrayBuffer);
    };

    const uploadFile = async (file: File | null, fileNamePrefix: string) => {
      const buffer = await fileToBuffer(file);
      if (!buffer) return '';

      const extension = file?.name?.split('.').pop() || 'jpg';
      const response = await imagekit.upload({
        file: buffer,
        fileName: `${fileNamePrefix}-${Date.now()}.${extension}`,
      });
      return response.url;
    };

    const [
      licenseFrontUrl,
      idFrontUrl,
      idBackUrl,
      photoUrl,
    ] = await Promise.all([
      uploadFile(formData.get('licenseFront') as File | null, 'license-front'),
      uploadFile(formData.get('idFront') as File | null, 'id-front'),
      uploadFile(formData.get('idBack') as File | null, 'id-back'),
      uploadFile(formData.get('photo') as File | null, 'photo'),
    ]);

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
      kraPin,
    });

    await user.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Form processing error:', error);
    return NextResponse.json(
      { error: 'Submission failed', message: error.message },
      { status: 500 }
    );
  }
}