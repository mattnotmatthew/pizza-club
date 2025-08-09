import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/common/Button';
import Skeleton from '@/components/common/Skeleton';
import TranslatedText from '@/components/common/TranslatedText';
import { useInfographics } from '@/hooks/useInfographics';
import { dataService } from '@/services/dataWithApi';
import type { Restaurant } from '@/types';

const InfographicsList: React.FC = () => {
  const { infographics, loading, deleteInfographic } = useInfographics();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      const data = await dataService.getRestaurants();
      setRestaurants(data);
    } catch (error) {
      console.error('Failed to load restaurants:', error);
    }
  };

  const getRestaurantName = (restaurantId: string) => {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    return restaurant?.name || restaurantId;
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this infographic?')) {
      return;
    }

    setDeleting(id);
    try {
      await deleteInfographic(id);
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete infographic');
    } finally {
      setDeleting(null);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(infographics, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'infographics.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
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
          <h1 className="text-3xl font-bold text-gray-900"><TranslatedText>Infographics</TranslatedText></h1>
          <div className="flex gap-4">
            {infographics.length > 0 && (
              <Button onClick={handleExport} variant="secondary">
                <TranslatedText>Export JSON</TranslatedText>
              </Button>
            )}
            <Link to="/admin/infographics/new">
              <Button><TranslatedText>Create New Infographic</TranslatedText></Button>
            </Link>
          </div>
        </div>
        
        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2"><TranslatedText>Publishing Infographics</TranslatedText></h3>
          <p className="text-sm text-blue-800">
            <TranslatedText>Since this is a static site, infographics are stored locally in your browser. To make them visible to visitors:</TranslatedText>
          </p>
          <ol className="list-decimal list-inside text-sm text-blue-800 mt-2 space-y-1">
            <li><TranslatedText>Create and publish your infographics</TranslatedText></li>
            <li><TranslatedText>Click "Export JSON" to download infographics.json</TranslatedText></li>
            <li><TranslatedText>Replace /public/data/infographics.json with the downloaded file</TranslatedText></li>
            <li><TranslatedText>Commit and push the changes to your repository</TranslatedText></li>
          </ol>
        </div>

        {infographics.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-600"><TranslatedText>No infographics yet. Create your first one!</TranslatedText></p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <TranslatedText>Restaurant</TranslatedText>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <TranslatedText>Visit Date</TranslatedText>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <TranslatedText>Status</TranslatedText>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <TranslatedText>Updated</TranslatedText>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <TranslatedText>Actions</TranslatedText>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {infographics.map((infographic) => (
                  <tr key={infographic.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getRestaurantName(infographic.restaurantId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(infographic.visitDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        infographic.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {infographic.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(infographic.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/admin/infographics/edit/${infographic.id}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <TranslatedText>Edit</TranslatedText>
                      </Link>
                      {infographic.status === 'published' && (
                        <Link
                          to={`/infographics/${infographic.id}`}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          <TranslatedText>View</TranslatedText>
                        </Link>
                      )}
                      <button
                        onClick={() => handleDelete(infographic.id)}
                        disabled={deleting === infographic.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        {deleting === infographic.id ? <TranslatedText>Deleting...</TranslatedText> : <TranslatedText>Delete</TranslatedText>}
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

export default InfographicsList;