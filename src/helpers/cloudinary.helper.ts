import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

import * as dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export interface UploadOptions {
  folder: string;
}

export const handleUpload = async (
  file: string,
  options: UploadOptions,
): Promise<UploadApiResponse> => {
  try {

    const result = await cloudinary.uploader.upload(file, {
      folder: options.folder,
    });

    return result;
  } catch (error) {
    throw error;
  }
};
