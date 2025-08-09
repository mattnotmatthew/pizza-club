import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/common/Button';
import Skeleton from '@/components/common/Skeleton';
import TranslatedText from '@/components/common/TranslatedText';
import { dataService } from '@/services/dataWithApi';
import { restaurantNameToSlug } from '@/utils/urlUtils';
import type { Restaurant } from '@/types';

const RestaurantsList: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const data = await dataService.getRestaurants();
      setRestaurants(data);
    } catch (error) {
      console.error('Failed to load restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this restaurant? This will also delete all associated visits and ratings.')) {
      return;
    }

    setDeleting(id);
    try {
      await dataService.deleteRestaurant(id);
      await loadRestaurants();
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete restaurant');
    } finally {
      setDeleting(null);
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.style?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRestaurantSlug = (restaurant: Restaurant): string => {
    return restaurant.slug || restaurantNameToSlug(restaurant.name);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton variant="text" width={200} height={40} className="mb-8" />
          <Skeleton variant="rectangular" height={400} className="rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900"><TranslatedText>Restaurants</TranslatedText></h1>
          <Link to="/admin/restaurants/new">
            <Button><TranslatedText>Add New Restaurant</TranslatedText></Button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search restaurants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
          />
        </div>

        {restaurants.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-600"><TranslatedText>No restaurants yet. Add your first one!</TranslatedText></p>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-600"><TranslatedText>No restaurants found matching your search.</TranslatedText></p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <TranslatedText>Name</TranslatedText>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <TranslatedText>Location</TranslatedText>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <TranslatedText>Style</TranslatedText>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <TranslatedText>Price</TranslatedText>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <TranslatedText>Rating</TranslatedText>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <TranslatedText>Visits</TranslatedText>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <TranslatedText>Actions</TranslatedText>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRestaurants.map((restaurant) => (
                  <tr key={restaurant.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        <Link
                          to={`/restaurants/${getRestaurantSlug(restaurant)}`}
                          className="text-blue-600 hover:text-blue-900"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {restaurant.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {restaurant.location || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {restaurant.style || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {restaurant.priceRange || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {restaurant.averageRating ? restaurant.averageRating.toFixed(1) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {restaurant.visits?.length || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/admin/restaurants/edit/${restaurant.id}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <TranslatedText>Edit</TranslatedText>
                      </Link>
                      <Link
                        to={`/admin/restaurants/${restaurant.id}/visits`}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        <TranslatedText>Visits</TranslatedText>
                      </Link>
                      <button
                        onClick={() => handleDelete(restaurant.id)}
                        disabled={deleting === restaurant.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        {deleting === restaurant.id ? <TranslatedText>Deleting...</TranslatedText> : <TranslatedText>Delete</TranslatedText>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantsList;