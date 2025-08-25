import { useState, useEffect } from 'react';

const API_BASE = '/api/favorites';

export const useFavorites = () => {
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  // Load user's favorite venue IDs
  const loadFavoriteIds = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/ids`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });

      if (response.ok) {
        const ids = await response.json();
        setFavoriteIds(new Set(ids));
      } else if (response.status === 401 || response.status === 403) {
        // Token might be expired, clear the favorites
        setFavoriteIds(new Set());
        console.log('Authentication required for favorites');
      }
    } catch (error) {
      console.error('Error loading favorite IDs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add venue to favorites
  const addToFavorites = async (venueId) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log('Please sign in to add favorites');
      return false;
    }

    try {
      const response = await fetch(`${API_BASE}/${venueId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });

      if (response.ok) {
        setFavoriteIds(prev => new Set([...prev, parseInt(venueId)]));
        return true;
      } else if (response.status === 401 || response.status === 403) {
        console.log('Please sign in to add favorites');
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
    return false;
  };

  // Remove venue from favorites
  const removeFromFavorites = async (venueId) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log('Please sign in to manage favorites');
      return false;
    }

    try {
      const response = await fetch(`${API_BASE}/${venueId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });

      if (response.ok) {
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(parseInt(venueId));
          return newSet;
        });
        return true;
      } else if (response.status === 401 || response.status === 403) {
        console.log('Please sign in to manage favorites');
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
    return false;
  };

  // Toggle favorite status
  const toggleFavorite = async (venueId) => {
    const isFavorite = favoriteIds.has(parseInt(venueId));
    
    if (isFavorite) {
      return await removeFromFavorites(venueId);
    } else {
      return await addToFavorites(venueId);
    }
  };

  // Check if venue is favorite
  const isFavorite = (venueId) => {
    return favoriteIds.has(parseInt(venueId));
  };

  // Load favorites on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      loadFavoriteIds();
    }
  }, []);

  return {
    favoriteIds,
    loading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    loadFavoriteIds
  };
};
