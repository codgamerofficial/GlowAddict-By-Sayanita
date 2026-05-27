import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  publicId?: string
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `glow-addict/${folder}`,
        public_id: publicId,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!);
      }
    );
    uploadStream.end(buffer);
  });
}

export function getCloudinaryUrl(publicId: string, transformations?: string): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return publicId;
  const base = `https://res.cloudinary.com/${cloudName}/image/upload`;
  return transformations
    ? `${base}/${transformations}/${publicId}`
    : `${base}/${publicId}`;
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
