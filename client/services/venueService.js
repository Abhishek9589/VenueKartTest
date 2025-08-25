const API_BASE = '/api/venues';

class VenueService {
  async createVenue(venueData, images) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      // First upload images if any
      let uploadedImageUrls = [];
      if (images.length > 0) {
        uploadedImageUrls = await this.uploadImages(images);
      }

      // Prepare venue data for API (matching the expected format)
      const apiData = {
        venueName: venueData.venueName,
        description: venueData.description,
        location: venueData.area, // API expects 'location' field
        footfall: parseInt(venueData.capacity),
        priceMin: parseInt(venueData.price),
        priceMax: parseInt(venueData.price), // Using same price for both min/max for now
        images: uploadedImageUrls,
        facilities: venueData.amenities
      };

      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create venue');
      }

      return data;
    } catch (error) {
      console.error('Error creating venue:', error);
      throw error;
    }
  }

  async uploadImages(images) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const uploadedUrls = [];

    for (const image of images) {
      try {
        const formData = new FormData();
        formData.append('file', image.file);
        formData.append('folder', 'venues');

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to upload image');
        }

        uploadedUrls.push(data.secure_url);
      } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error(`Failed to upload image: ${image.name}`);
      }
    }

    return uploadedUrls;
  }

  async getVenues(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.location) {
        queryParams.append('location', filters.location);
      }
      
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      
      if (filters.limit) {
        queryParams.append('limit', filters.limit);
      }
      
      if (filters.offset) {
        queryParams.append('offset', filters.offset);
      }

      const url = `${API_BASE}?${queryParams.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch venues');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching venues:', error);
      throw error;
    }
  }

  async getVenueById(id) {
    try {
      const response = await fetch(`${API_BASE}/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch venue');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching venue:', error);
      throw error;
    }
  }

  async getMyVenues() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      const response = await fetch(`${API_BASE}/owner/my-venues`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch venues');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching my venues:', error);
      throw error;
    }
  }

  async updateVenue(id, venueData, images) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      // Upload new images if any
      let uploadedImageUrls = [];
      if (images.length > 0) {
        uploadedImageUrls = await this.uploadImages(images);
      }

      // Prepare venue data for API
      const apiData = {
        venueName: venueData.venueName,
        description: venueData.description,
        location: venueData.area,
        footfall: parseInt(venueData.capacity),
        priceMin: parseInt(venueData.price),
        priceMax: parseInt(venueData.price),
        images: uploadedImageUrls,
        facilities: venueData.amenities
      };

      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update venue');
      }

      return data;
    } catch (error) {
      console.error('Error updating venue:', error);
      throw error;
    }
  }

  async deleteVenue(id) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete venue');
      }

      return { message: 'Venue deleted successfully' };
    } catch (error) {
      console.error('Error deleting venue:', error);
      throw error;
    }
  }
}

export default new VenueService();
