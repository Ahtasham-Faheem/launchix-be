import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';
import * as sharp from 'sharp';

@Injectable()
export class ImageOverlayService {
  mockUpTypes = {
    shirt: 'https://res.cloudinary.com/dudpoehph/image/upload/shirt-base/hhtvfsnntf2sovp6fnty.jpg',
    mug: 'https://res.cloudinary.com/dudpoehph/image/upload/d3f10d5e-0f04-4d96-b602-afad07a9b9e8.png',
    cap: 'https://res.cloudinary.com/dudpoehph/image/upload/229afd3d-922b-43d1-82ce-01bff13e3a29.png',
  };

  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * ✅ Main function — overlay logo on product mockup
   */
  async overlayImageOnMochup(
    logoUrl: string,
    type: 'shirt' | 'mug' | 'cap' = 'shirt',
  ): Promise<{ imageUrl: string; publicId: string }> {
    try {
      const typeUrl = this.mockUpTypes[type];

      // 🧩 Download both base & logo
      const [typeBuffer, logoBuffer] = await Promise.all([
        this.downloadImage(typeUrl),
        this.downloadImage(logoUrl),
      ]);

      // 🎨 Create overlay based on type
      const finalImage = await this.createOverlay(typeBuffer, logoBuffer, type);

      // ☁️ Upload final image to Cloudinary
      const uploadResult = await this.uploadToCloudinary(finalImage);

      return {
        imageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to process image: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * ✅ Download image from URL
   */
  private async downloadImage(url: string): Promise<Buffer> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 15000,
      });
      return Buffer.from(response.data);
    } catch (error) {
      throw new Error(`Failed to download image from ${url}: ${error.message}`);
    }
  }

  /**
   * ✅ Create overlay with dynamic logo placement
   */
  private async createOverlay(
    baseBuffer: Buffer,
    logoBuffer: Buffer,
    type: 'shirt' | 'mug' | 'cap' = 'shirt',
  ): Promise<Buffer> {
    try {
      const baseMetadata = await sharp(baseBuffer).metadata();
      const baseWidth = baseMetadata.width || 600;
      const baseHeight = baseMetadata.height || 600;

      // Dynamic logo placement ratios (fine-tuned)
      const placements = {
        shirt: { widthRatio: 0.35, topRatio: 0.35, leftRatio: 0.32 },
        mug: { widthRatio: 0.4, topRatio: 0.45, leftRatio: 0.3 },
        cap: { widthRatio: 0.25, topRatio: 0.28, leftRatio: 0.38 },
      };

      const { widthRatio, topRatio, leftRatio } = placements[type];
      const logoWidth = Math.floor(baseWidth * widthRatio);

      // Resize logo
      const resizedLogo = await sharp(logoBuffer)
        .resize(logoWidth, null, { fit: 'inside', withoutEnlargement: false })
        .png()
        .toBuffer();

      // Position logo
      const left = Math.floor(baseWidth * leftRatio);
      const top = Math.floor(baseHeight * topRatio);

      // Composite logo onto product
      const finalImage = await sharp(baseBuffer)
        .composite([{ input: resizedLogo, top, left }])
        .jpeg({ quality: 92 })
        .toBuffer();

      return finalImage;
    } catch (error) {
      throw new Error(`Failed to create overlay: ${error.message}`);
    }
  }

  /**
   * ✅ Upload final image to Cloudinary
   */
  private async uploadToCloudinary(
    imageBuffer: Buffer,
  ): Promise<{ secure_url: string; public_id: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'mockup-overlays',
          resource_type: 'image',
          format: 'jpg',
        },
        (error, result) => {
          if (error) reject(new Error(`Cloudinary upload failed: ${error.message}`));
          else
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
        },
      );

      uploadStream.end(imageBuffer);
    });
  }

  /**
   * ✅ Upload image from URL to Cloudinary
   */
  private async uploadImageFromUrl(
    url: string,
    folder: string,
  ): Promise<{ secure_url: string; public_id: string }> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        url,
        {
          folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) reject(error);
          else
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
        },
      );
    });
  }
}
