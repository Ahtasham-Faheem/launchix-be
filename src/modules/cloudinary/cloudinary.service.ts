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

  /**
   * Uploads an image from a URL to Cloudinary.
   * Alternative method for DALL-E 3 images (can upload directly from URL).
   * This is simpler than downloading to buffer first.
   * Returns the hosted image URL.
   * 
   * @param imageUrl - Full image URL from DALL-E 3
   * @param folder - Cloudinary folder path
   * @param fileName - File name without extension
   * @returns Cloudinary secure URL
   * 
   * @example
   * const url = await uploadFromUrl(
   *   'https://oaidalleapiprodscus.blob.core.windows.net/...',
   *   'banners/linkedin',
   *   'banner_123'
   * );
   */
  async uploadFromUrl(
    imageUrl: string,
    folder: string,
    fileName: string,
  ): Promise<string> {
    try {
      if (!imageUrl) {
        throw new Error('No image URL provided');
      }

      this.logger.log(`📤 Uploading from URL to Cloudinary: ${imageUrl}`);

      const result = await cloudinary.uploader.upload(imageUrl, {
        folder,
        public_id: fileName,
        resource_type: 'image',
        overwrite: true,
        transformation: [
          { quality: 'auto:best', fetch_format: 'auto' },
        ],
      });

      this.logger.log(`✅ URL image uploaded to Cloudinary: ${result.secure_url}`);
      return result.secure_url;
    } catch (error) {
      this.logger.error('❌ Cloudinary URL Upload Failed:', error);
      throw new Error('Cloudinary URL upload failed: ' + error.message);
    }
  }

  /**
   * Deletes an image from Cloudinary by public ID.
   * Useful for cleanup or replacing banners.
   * 
   * @param publicId - Cloudinary public ID (folder/filename without extension)
   * @returns Deletion result
   * 
   * @example
   * await deleteImage('launchix_ai_banners/linkedin/banner_123');
   */
  async deleteImage(publicId: string): Promise<any> {
    try {
      this.logger.log(`🗑️  Deleting image from Cloudinary: ${publicId}`);
      
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
      });

      if (result.result === 'ok') {
        this.logger.log(`✅ Image deleted successfully: ${publicId}`);
      } else {
        this.logger.warn(`⚠️  Image deletion result: ${result.result} for ${publicId}`);
      }

      return result;
    } catch (error) {
      this.logger.error('❌ Cloudinary Delete Failed:', error);
      throw new Error('Cloudinary delete failed: ' + error.message);
    }
  }
}
