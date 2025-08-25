import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import { PUNE_AREAS, VENUE_TYPES } from '@/constants/venueOptions';

export default function AddVenueForm({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    venueName: '',
    description: '',
    venueType: '',
    area: '',
    footfall: '',
    priceMin: '',
    priceMax: '',
    facilities: [''],
    images: []
  });

  const [errors, setErrors] = useState({});
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 10) {
      setErrors(prev => ({ ...prev, images: 'Maximum 10 images allowed' }));
      return;
    }

    files.forEach(file => {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, images: 'Each image must be less than 10MB' }));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, e.target.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleFacilityChange = (index, value) => {
    const newFacilities = [...formData.facilities];
    newFacilities[index] = value;
    setFormData(prev => ({
      ...prev,
      facilities: newFacilities
    }));
  };

  const addFacility = () => {
    setFormData(prev => ({
      ...prev,
      facilities: [...prev.facilities, '']
    }));
  };

  const removeFacility = (index) => {
    if (formData.facilities.length > 1) {
      setFormData(prev => ({
        ...prev,
        facilities: prev.facilities.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.venueName.trim()) {
      newErrors.venueName = 'Venue name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.venueType) {
      newErrors.venueType = 'Venue type is required';
    }
    if (!formData.area) {
      newErrors.area = 'Area is required';
    }
    if (!formData.footfall || formData.footfall <= 0) {
      newErrors.footfall = 'Valid footfall capacity is required';
    }
    if (!formData.priceMin || formData.priceMin <= 0) {
      newErrors.priceMin = 'Valid minimum price is required';
    }
    if (!formData.priceMax || formData.priceMax <= 0) {
      newErrors.priceMax = 'Valid maximum price is required';
    }
    if (formData.priceMin && formData.priceMax && parseInt(formData.priceMin) >= parseInt(formData.priceMax)) {
      newErrors.priceMax = 'Maximum price must be greater than minimum price';
    }
    if (formData.facilities.filter(f => f.trim()).length === 0) {
      newErrors.facilities = 'At least one facility is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImagesToCloudinary = async (imageDataArray) => {
    // If no images, return empty array
    if (!imageDataArray || imageDataArray.length === 0) {
      return [];
    }

    try {
      setUploadingImages(true);

      const response = await fetch('/api/upload/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          images: imageDataArray,
          folder: 'venuekart/venues'
        })
      });

      if (!response.ok) {
        let errorMessage = `Failed to upload images: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          // If response is not JSON, use the status text
          errorMessage = `${errorMessage} - ${response.statusText}`;
        }
        
        console.error('Image upload failed:', response.status, response.statusText, errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.images.map(img => img.url);
    } catch (error) {
      console.error('Image upload error:', error);
      
      // Show more specific error message
      let userMessage = 'Image upload failed, but venue can be saved without images';
      if (error.message.includes('Must supply api_key') || error.message.includes('demo')) {
        userMessage = 'Image upload service not configured. Venue will be saved without images.';
      } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
        userMessage = 'Authentication failed. Please sign in again.';
      } else if (error.message.includes('413') || error.message.includes('too large')) {
        userMessage = 'Images are too large. Please use smaller images.';
      }
      
      setErrors(prev => ({ ...prev, images: userMessage }));
      return [];
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting || uploadingImages) {
      return;
    }

    if (validateForm()) {
      try {
        setIsSubmitting(true);

        // Upload images to Cloudinary (optional)
        let imageUrls = await uploadImagesToCloudinary(formData.images);

        const venueData = {
          ...formData,
          images: imageUrls, // Use Cloudinary URLs instead of base64
          facilities: formData.facilities.filter(f => f.trim()),
          footfall: parseInt(formData.footfall),
          priceMin: parseInt(formData.priceMin),
          priceMax: parseInt(formData.priceMax),
          location: `${formData.area}, Pune`
        };

        await onSubmit(venueData);
        // Reset form only after successful submission
        setFormData({
          venueName: '',
          description: '',
          venueType: '',
          area: '',
          footfall: '',
          priceMin: '',
          priceMax: '',
          facilities: [''],
          images: []
        });
        setErrors({});
      } catch (error) {
        // Form stays open with data intact if submission fails
        console.error('Form submission failed:', error);
        setErrors(prev => ({ ...prev, general: error.message || 'Failed to submit form' }));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
          <CardTitle className="text-xl font-semibold text-gray-900">Add New Venue</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto px-6 py-6">
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {errors.general}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Venue Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Venue Name *
              </label>
              <Input
                value={formData.venueName}
                onChange={(e) => handleInputChange('venueName', e.target.value)}
                placeholder="Enter venue name"
                className={`h-10 ${errors.venueName ? 'border-red-300' : 'border-gray-300'} focus:border-indigo-500 focus:ring-indigo-500`}
              />
              {errors.venueName && (
                <p className="text-red-500 text-sm mt-1">{errors.venueName}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your venue..."
                rows={4}
                className={`resize-none ${errors.description ? 'border-red-300' : 'border-gray-300'} focus:border-indigo-500 focus:ring-indigo-500`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Venue Type and Area */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue Type *
                </label>
                <Input
                  value={formData.venueType}
                  onChange={(e) => handleInputChange('venueType', e.target.value)}
                  placeholder="Type venue type manually..."
                  className={`w-full h-10 ${errors.venueType ? 'border-red-300' : 'border-gray-300'} focus:border-indigo-500`}
                />
                {errors.venueType && (
                  <p className="text-red-500 text-sm mt-1">{errors.venueType}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area (Pune) *
                </label>
                <AutocompleteInput
                  options={PUNE_AREAS}
                  value={formData.area}
                  onChange={(value) => handleInputChange('area', value)}
                  placeholder="Type to search..."
                  className={`w-full h-10 ${errors.area ? 'border-red-300' : 'border-gray-300'} focus:border-indigo-500`}
                  data-field="area"
                  data-value={formData.area}
                />
                {errors.area && (
                  <p className="text-red-500 text-sm mt-1">{errors.area}</p>
                )}
              </div>
            </div>

            {/* Footfall Capacity and Price Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Footfall Capacity *
                </label>
                <Input
                  type="number"
                  value={formData.footfall}
                  onChange={(e) => handleInputChange('footfall', e.target.value)}
                  placeholder="Maximum guests"
                  className={`h-10 ${errors.footfall ? 'border-red-300' : 'border-gray-300'} focus:border-indigo-500 focus:ring-indigo-500`}
                />
                {errors.footfall && (
                  <p className="text-red-500 text-sm mt-1">{errors.footfall}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range per Day (₹) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    value={formData.priceMin}
                    onChange={(e) => handleInputChange('priceMin', e.target.value)}
                    placeholder="Minimum price"
                    className={`h-10 ${errors.priceMin ? 'border-red-300' : 'border-gray-300'} focus:border-indigo-500 focus:ring-indigo-500`}
                  />
                  <Input
                    type="number"
                    value={formData.priceMax}
                    onChange={(e) => handleInputChange('priceMax', e.target.value)}
                    placeholder="Maximum price"
                    className={`h-10 ${errors.priceMax ? 'border-red-300' : 'border-gray-300'} focus:border-indigo-500 focus:ring-indigo-500`}
                  />
                </div>
                {(errors.priceMin || errors.priceMax) && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.priceMin || errors.priceMax}
                  </p>
                )}
              </div>
            </div>

            {/* Facilities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facilities *
              </label>
              <div className="space-y-2">
                {formData.facilities.map((facility, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={facility}
                      onChange={(e) => handleFacilityChange(index, e.target.value)}
                      placeholder="Enter facility (e.g., AC, Parking, Catering)"
                      className="flex-1 h-10 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {formData.facilities.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10"
                        onClick={() => removeFacility(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addFacility}
                  className="w-full h-10 text-sm border-gray-300 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Facility
                </Button>
              </div>
              {errors.facilities && (
                <p className="text-red-500 text-sm mt-1">{errors.facilities}</p>
              )}
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images (Optional - up to 10 allowed)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">Click to upload venue images</p>
                  <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB each</p>
                </label>
              </div>
              
              <p className="text-sm text-gray-500 mt-2">
                {formData.images.length}/10 images uploaded {formData.images.length === 0 && '(Images are optional)'}
              </p>
              
              {formData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Venue ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {errors.images && (
                <p className="text-red-500 text-sm mt-1">{errors.images}</p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={uploadingImages || isSubmitting}
                className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingImages ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading Images...
                  </div>
                ) : isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding Venue...
                  </div>
                ) : 'Add Venue'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
