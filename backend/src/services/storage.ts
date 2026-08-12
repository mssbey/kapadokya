import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { AppError } from '../middleware/errorHandler';

export type StoredImage = {
  provider: 'CLOUDINARY';
  storageKey: string;
  assetId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
};

export interface MediaStorage {
  uploadImage(buffer: Buffer, filename: string): Promise<StoredImage>;
  deleteImage(storageKey: string): Promise<void>;
}

function ensureConfigured() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new AppError('Cloudinary is not configured. Add the server-side Cloudinary environment variables.', 503);
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

class CloudinaryStorage implements MediaStorage {
  async uploadImage(buffer: Buffer, filename: string): Promise<StoredImage> {
    ensureConfigured();
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: process.env.CLOUDINARY_FOLDER || 'discovery-cappadocia/tours',
          use_filename: true,
          unique_filename: true,
          overwrite: false,
          filename_override: filename,
        },
        (error, response) => {
          if (error || !response) reject(error || new Error('Cloudinary did not return an upload result'));
          else resolve(response);
        },
      );
      stream.end(buffer);
    });

    return {
      provider: 'CLOUDINARY',
      storageKey: result.public_id,
      assetId: result.asset_id,
      secureUrl: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  }

  async deleteImage(storageKey: string) {
    ensureConfigured();
    const result = await cloudinary.uploader.destroy(storageKey, { resource_type: 'image', invalidate: true });
    if (!['ok', 'not found'].includes(result.result)) throw new AppError('The media provider could not delete this image', 502);
  }
}

export const mediaStorage: MediaStorage = new CloudinaryStorage();

export function optimizedImageUrl(url: string, width: number): string {
  if (!url.includes('/image/upload/')) return url;
  return url.replace('/image/upload/', `/image/upload/c_limit,w_${width}/f_auto/q_auto/`);
}

