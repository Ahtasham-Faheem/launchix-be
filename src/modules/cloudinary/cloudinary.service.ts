import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Uploads a Base64 image (from DALL·E) to Cloudinary.
   * Returns the hosted image URL.
   */
  async uploadBase64Image(base64: string, folder = 'launchix_ai'): Promise<string> {
    try {
      if (!base64) throw new Error('No image data provided');

      // ✅ Ensure it’s a full data URI for Cloudinary
      const dataUri = `data:image/png;base64,${base64}`;

      const result = await cloudinary.uploader.upload(dataUri, {
        folder,
        resource_type: 'image',
        overwrite: true,
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
        ],
      });

      this.logger.log(`✅ Uploaded to Cloudinary: ${result.secure_url}`);
      return result.secure_url;
    } catch (error) {
      this.logger.error('❌ Cloudinary Upload Failed:', error);
      throw new Error('Cloudinary upload failed: ' + error.message);
    }
  }
}
