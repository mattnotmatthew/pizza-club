import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';
import RestaurantImageUploader from '@/components/admin/RestaurantImageUploader';
import { dataService } from '@/services/dataWithApi';
import { restaurantNameToSlug } from '@/utils/urlUtils';
import type { Restaurant } from '@/types';

const RestaurantsEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    latitude: '',
    longitude: '',
    style: '',
    priceRange: '',
    website: '',
    phone: '',
    mustTry: ''
  });
  const [heroImage, setHeroImage] = useState<string | undefined>();
  const [heroFocalPoint, setHeroFocalPoint] = useState<{ x: number; y: number } | undefined>();
  const [heroZoom, setHeroZoom] = useState<number | undefined>();
  const [heroPanX, setHeroPanX] = useState<number | undefined>();
  const [heroPanY, setHeroPanY] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      loadRestaurant(id);
    }
  }, [id, isEditing]);

  const loadRestaurant = async (restaurantId: string) => {
    try {
      setLoading(true);
      const restaurant = await dataService.getRestaurantById(restaurantId);
      if (restaurant) {
        setFormData({
          name: restaurant.name,
          location: restaurant.location || '',
          address: restaurant.address,
          latitude: restaurant.coordinates.lat.toString(),
          longitude: restaurant.coordinates.lng.toString(),
          style: restaurant.style || '',
          priceRange: restaurant.priceRange || '',
          website: restaurant.website || '',
          phone: restaurant.phone || '',
          mustTry: restaurant.mustTry || ''
        });
        setHeroImage(restaurant.heroImage);
        setHeroFocalPoint(restaurant.heroFocalPoint);
        setHeroZoom(restaurant.heroZoom);
        setHeroPanX(restaurant.heroPanX);
        setHeroPanY(restaurant.heroPanY);
      } else {
        alert('Restaurant not found');
        navigate('/admin/restaurants');
      }
    } catch (error) {
      console.error('Failed to load restaurant:', error);
      alert('Failed to load restaurant');
      navigate('/admin/restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address || !formData.latitude || !formData.longitude) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const restaurantData: any = {
        id: isEditing ? id : `restaurant_${Date.now()}`,
        name: formData.name,
        location: formData.location || undefined,
        address: formData.address,
        coordinates: {
          lat: parseFloat(formData.latitude),
          lng: parseFloat(formData.longitude)
        },
        style: formData.style || undefined,
        priceRange: formData.priceRange as Restaurant['priceRange'] || undefined,
        website: formData.website || undefined,
        phone: formData.phone || undefined,
        mustTry: formData.mustTry || undefined,
        // Explicitly send null when removing image to clear it in database
        heroImage: heroImage === undefined ? null : heroImage,
        heroFocalPoint: heroFocalPoint === undefined ? null : heroFocalPoint,
        heroZoom: heroZoom === undefined ? null : heroZoom,
        heroPanX: heroPanX === undefined ? null : heroPanX,
        heroPanY: heroPanY === undefined ? null : heroPanY,
        averageRating: 0,
        visits: isEditing ? undefined : []
      };

      await dataService.saveRestaurant(restaurantData);
      alert(`Restaurant ${isEditing ? 'updated' : 'created'} successfully!`);
      navigate('/admin/restaurants');
    } catch (error) {
      console.error('Failed to save restaurant:', error);
      alert('Failed to save restaurant');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading restaurant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/admin/restaurants" className="text-blue-600 hover:text-blue-700 text-sm">
            ← Back to Restaurants
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            {isEditing ? 'Edit' : 'Add'} Restaurant
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location/Neighborhood
              </label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="East Village"
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="123 Main St, City, State ZIP"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                You can use Google Maps to find exact coordinates
              </p>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                  Latitude <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="latitude"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="40.7128"
                  required
                />
              </div>
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                  Longitude <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="longitude"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="-74.0060"
                  required
                />
              </div>
            </div>

            {/* Style */}
            <div>
              <label htmlFor="style" className="block text-sm font-medium text-gray-700">
                Pizza Style
              </label>
              <select
                id="style"
                value={formData.style}
                onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
              >
                <option value="">Select a style</option>
                <option value="Neapolitan">Neapolitan</option>
                <option value="New York">New York</option>
                <option value="Sicilian">Sicilian</option>
                <option value="Chicago">Chicago</option>
                <option value="Detroit">Detroit</option>
                <option value="California">California</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700">
                Price Range
              </label>
              <select
                id="priceRange"
                value={formData.priceRange}
                onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
              >
                <option value="">Select price range</option>
                <option value="$">$ - Budget friendly</option>
                <option value="$$">$$ - Moderate</option>
                <option value="$$$">$$$ - Upscale</option>
                <option value="$$$$">$$$$ - Fine dining</option>
              </select>
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                Website
              </label>
              <input
                type="url"
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="https://restaurant.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="(555) 123-4567"
              />
            </div>

            {/* Must Try */}
            <div>
              <label htmlFor="mustTry" className="block text-sm font-medium text-gray-700">
                Must Try
              </label>
              <input
                type="text"
                id="mustTry"
                value={formData.mustTry}
                onChange={(e) => setFormData({ ...formData, mustTry: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="Margherita Pizza"
              />
            </div>

            {/* Hero Image */}
            <div className="pt-6 border-t border-gray-200">
              <RestaurantImageUploader
                restaurantSlug={formData.name ? restaurantNameToSlug(formData.name) : 'new-restaurant'}
                currentImageUrl={heroImage}
                currentFocalPoint={heroFocalPoint}
                currentZoom={heroZoom}
                currentPanX={heroPanX}
                currentPanY={heroPanY}
                onImageChange={setHeroImage}
                onFocalPointChange={setHeroFocalPoint}
                onZoomChange={setHeroZoom}
                onPanXChange={setHeroPanX}
                onPanYChange={setHeroPanY}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <Button
              type="submit"
              disabled={saving}
              className="flex-1"
            >
              {saving ? 'Saving...' : (isEditing ? 'Update Restaurant' : 'Add Restaurant')}
            </Button>
            <Link to="/admin/restaurants" className="flex-1">
              <Button variant="secondary" className="w-full">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestaurantsEditor;