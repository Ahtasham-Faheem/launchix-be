import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';
import * as sharp from 'sharp';

@Injectable()
export class ImageOverlayService {
  constructor(private configService: ConfigService) {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Overlay a logo/image on a shirt template and return the Cloudinary URL
   * @param logoUrl - URL of the image to overlay on the shirt
   * @param shirtUrl - URL of the shirt template (default provided)
   * @returns Object containing the Cloudinary URL of the final image
   */
  async overlayImageOnShirt(
    logoUrl: string,
    shirtUrl: string = 'https://i4.cloudfable.net/styles/550x550/576.575/White/joan-arc-mens-t-shirt-back-20240203055102-cfghzcdp-s4.jpg',
  ): Promise<{ imageUrl: string; publicId: string }> {
    try {
      // Download both images
      const [shirtBuffer, logoBuffer] = await Promise.all([
        this.downloadImage(shirtUrl),
        this.downloadImage(logoUrl),
      ]);

      // Process images and create overlay
      const finalImage = await this.createOverlay(shirtBuffer, logoBuffer);

      // Upload to Cloudinary
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
   * Download image from URL
   */
  private async downloadImage(url: string): Promise<Buffer> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 10000,
      });
      return Buffer.from(response.data);
    } catch (error) {
      throw new Error(`Failed to download image from ${url}: ${error.message}`);
    }
  }

  /**
   * Create overlay of logo on shirt using Sharp
   */
  private async createOverlay(
    shirtBuffer: Buffer,
    logoBuffer: Buffer,
  ): Promise<Buffer> {
    try {
      // Get shirt dimensions
      const shirtMetadata = await sharp(shirtBuffer).metadata();
      const shirtWidth = shirtMetadata.width || 550;
      const shirtHeight = shirtMetadata.height || 550;

      // Calculate logo size (30% of shirt width, adjust as needed)
      const logoWidth = Math.floor(shirtWidth * 0.3);

      // Resize logo maintaining aspect ratio
      const resizedLogo = await sharp(logoBuffer)
        .resize(logoWidth, null, {
          fit: 'inside',
          withoutEnlargement: false,
        })
        .png()
        .toBuffer();

      // Get resized logo dimensions
      const logoMetadata = await sharp(resizedLogo).metadata();
      const logoHeight = logoMetadata.height || 100;

      // Calculate position to center the logo on the shirt
      // Adjust these values to position logo correctly on your shirt template
      const left = Math.floor((shirtWidth - logoWidth) / 2);
      const top = Math.floor(shirtHeight * 0.35); // Position at 35% from top

      // Composite the logo onto the shirt
      const finalImage = await sharp(shirtBuffer)
        .composite([
          {
            input: resizedLogo,
            top: top,
            left: left,
          },
        ])
        .jpeg({ quality: 90 })
        .toBuffer();

      return finalImage;
    } catch (error) {
      throw new Error(`Failed to create overlay: ${error.message}`);
    }
  }

  /**
   * Upload image to Cloudinary
   */
  private async uploadToCloudinary(
    imageBuffer: Buffer,
  ): Promise<{ secure_url: string; public_id: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'shirt-designs',
          resource_type: 'image',
          format: 'jpg',
        },
        (error, result) => {
          if (error) {
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
          } else {
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
          }
        },
      );

      uploadStream.end(imageBuffer);
    });
  }

  /**
   * Alternative method using Cloudinary's transformation API
   * This method uses Cloudinary's built-in overlay capabilities
   */
  async overlayUsingCloudinaryTransform(
    logoUrl: string,
    shirtUrl: string = 'https://i4.cloudfable.net/styles/550x550/576.575/White/joan-arc-mens-t-shirt-back-20240203055102-cfghzcdp-s4.jpg',
  ): Promise<{ imageUrl: string }> {
    try {
      // Upload shirt to Cloudinary
      const shirtUpload = await this.uploadImageFromUrl(shirtUrl, 'shirt-base');
      
      // Upload logo to Cloudinary
      const logoUpload = await this.uploadImageFromUrl(logoUrl, 'logos');

      // Generate URL with transformation overlay
      const transformedUrl = cloudinary.url(shirtUpload.public_id, {
        transformation: [
          {
            overlay: logoUpload.public_id.replace(/\//g, ':'),
            width: 0.3, // 30% of base image width
            gravity: 'center',
            y: -50, // Adjust vertical position
          },
        ],
      });

      return { imageUrl: transformedUrl };
    } catch (error) {
      throw new HttpException(
        `Failed to create overlay using Cloudinary: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Upload image from URL to Cloudinary
   */
  private async uploadImageFromUrl(
    url: string,
    folder: string,
  ): Promise<{ secure_url: string; public_id: string }> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        url,
        {
          folder: folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
          }
        },
      );
    });
  }
}