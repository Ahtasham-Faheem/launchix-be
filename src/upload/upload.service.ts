import { Injectable } from '@nestjs/common';
import { handleUpload } from '../helpers/cloudinary.helper';
import { Express } from 'express';
import * as fs from 'fs';

@Injectable()
export class UploadService {
  private readonly maxSize = parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 2;
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'image/jpg',
  ];

  async handleFileUpload(file: Express.Multer.File) {
    try {
      if (!file || !file.path) {
        console.log('file', file);
        throw new Error('No file or buffer provided');
      }

      if (file.size > this.maxSize * 1024 * 1024) {
        throw new Error('File size exceeds the allowed limit');
      }

      if (!this.allowedMimeTypes.includes(file.mimetype)) {
        throw new Error(
          'Invalid file type. Only JPG, PNG, and PDF are allowed.',
        );
      }

      const fileContent = await fs.promises.readFile(file.path);

      const b64 = fileContent.toString('base64');

      const dataURI = `data:${file.mimetype};base64,${b64}`;

      const folderName = 'X-Invoice-Images';
      const cldRes = await handleUpload(dataURI, { folder: folderName });

      if (!cldRes || !cldRes.secure_url) {
        throw new Error('Image upload to Cloudinary failed');
      }

      return { public_id: cldRes.public_id, secure_url: cldRes.secure_url };
    } catch (error) {
      throw error;
    }
  }
}
