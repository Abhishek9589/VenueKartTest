import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Upload image to Cloudinary
 * @param {string} imageData - Base64 image data or file path
 * @param {string} folder - Cloudinary folder name (optional)
 * @param {string} publicId - Custom public ID (optional)
 * @returns {Promise<Object>} - Cloudinary response with secure_url
 */
export async function uploadImage(imageData, folder = 'venuekart', publicId = null) {
  try {
    const uploadOptions = {
      folder: folder,
      resource_type: 'auto',
      quality: 'auto:good',
      fetch_format: 'auto',
      transformation: [
        {
          width: 1200,
          height: 800,
          crop: 'limit'
        }
      ]
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
      uploadOptions.overwrite = true;
    }

    const result = await cloudinary.uploader.upload(imageData, uploadOptions);
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
}

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} - Cloudinary deletion response
 */
export async function deleteImage(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
}

/**
 * Upload multiple images to Cloudinary
 * @param {Array<string>} imageDataArray - Array of base64 image data
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<Array<Object>>} - Array of Cloudinary responses
 */
export async function uploadMultipleImages(imageDataArray, folder = 'venuekart') {
  try {
    const uploadPromises = imageDataArray.map(imageData => 
      uploadImage(imageData, folder)
    );
    
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Multiple images upload error:', error);
    throw new Error('Failed to upload multiple images to Cloudinary');
  }
}

export default cloudinary;
