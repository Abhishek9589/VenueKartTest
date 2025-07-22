import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine folder based on file type and user
    let folder = 'venuekart/misc';
    
    if (req.baseUrl.includes('/venues')) {
      folder = 'venuekart/venues';
    } else if (req.baseUrl.includes('/users') || req.baseUrl.includes('/auth')) {
      folder = 'venuekart/users';
    }

    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = file.fieldname + '-' + uniqueSuffix;

    return {
      folder: folder,
      public_id: fileName,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        { width: 1200, height: 800, crop: 'limit', quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    };
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, WebP) are allowed'), false);
  }
};

// Create multer upload middleware
export const uploadMiddleware = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10 // Maximum 10 files
  },
  fileFilter: fileFilter
});

// Local storage fallback (for development without Cloudinary)
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const localUploadMiddleware = multer({
  storage: localStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10 // Maximum 10 files
  },
  fileFilter: fileFilter
});

// Delete image from Cloudinary
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Delete multiple images from Cloudinary
export const deleteMultipleImages = async (publicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    console.error('Error deleting multiple images from Cloudinary:', error);
    throw error;
  }
};

// Get image details from Cloudinary
export const getImageDetails = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    console.error('Error getting image details from Cloudinary:', error);
    throw error;
  }
};

// Upload image directly to Cloudinary (for base64 uploads)
export const uploadBase64Image = async (base64Data, folder = 'venuekart/misc') => {
  try {
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: folder,
      transformation: [
        { width: 1200, height: 800, crop: 'limit', quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });
    return result;
  } catch (error) {
    console.error('Error uploading base64 image to Cloudinary:', error);
    throw error;
  }
};

// Generate optimized image URL
export const generateOptimizedImageUrl = (publicId, options = {}) => {
  const {
    width = 800,
    height = 600,
    crop = 'fill',
    quality = 'auto:good',
    format = 'auto'
  } = options;

  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    fetch_format: format
  });
};

// Create different image sizes for responsive design
export const generateResponsiveImageUrls = (publicId) => {
  const sizes = {
    thumbnail: { width: 150, height: 150, crop: 'fill' },
    small: { width: 300, height: 200, crop: 'fill' },
    medium: { width: 600, height: 400, crop: 'fill' },
    large: { width: 1200, height: 800, crop: 'limit' },
    original: { quality: 'auto:best', fetch_format: 'auto' }
  };

  const urls = {};
  
  Object.entries(sizes).forEach(([sizeName, options]) => {
    urls[sizeName] = cloudinary.url(publicId, {
      quality: 'auto:good',
      fetch_format: 'auto',
      ...options
    });
  });

  return urls;
};

// Validate image file
export const validateImageFile = (file) => {
  const errors = [];

  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    errors.push('File size must be less than 5MB');
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    errors.push('Only JPEG, PNG, and WebP images are allowed');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Error handling middleware for multer
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File size too large. Maximum size is 5MB per file.'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum 10 files allowed.'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field.'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'File upload error: ' + error.message
        });
    }
  }

  if (error.message.includes('Only image files')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
};

// Health check for Cloudinary connection
export const checkCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    return { connected: true, result };
  } catch (error) {
    console.error('Cloudinary connection error:', error);
    return { connected: false, error: error.message };
  }
};

export default {
  uploadMiddleware,
  localUploadMiddleware,
  deleteImage,
  deleteMultipleImages,
  getImageDetails,
  uploadBase64Image,
  generateOptimizedImageUrl,
  generateResponsiveImageUrls,
  validateImageFile,
  handleUploadError,
  checkCloudinaryConnection
};
