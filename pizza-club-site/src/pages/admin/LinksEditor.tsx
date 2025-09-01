import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';
import { dataService } from '@/services/dataWithApi';
import type { SocialLink, LinkFormData } from '@/types';

const LinksEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState<LinkFormData>({
    title: '',
    url: '',
    description: '',
    iconType: 'default',
    iconValue: '',
    customImageUrl: '',
    isActive: true,
    sortOrder: 0
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadLink = useCallback(async (linkId: string) => {
    try {
      setLoading(true);
      const link = await dataService.getLinkById(linkId);
      if (link) {
        setFormData({
          title: link.title,
          url: link.url,
          description: link.description || '',
          iconType: link.iconType,
          iconValue: link.iconValue || '',
          customImageUrl: link.customImageUrl || '',
          isActive: link.isActive,
          sortOrder: link.sortOrder
        });
      } else {
        alert('Link not found');
        navigate('/admin/links');
      }
    } catch (error) {
      console.error('Failed to load link:', error);
      alert('Failed to load link');
      navigate('/admin/links');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const loadDefaultSortOrder = useCallback(async () => {
    try {
      const links = await dataService.getLinks();
      const maxOrder = links.reduce((max, link) => Math.max(max, link.sortOrder), 0);
      setFormData(prev => ({ ...prev, sortOrder: maxOrder + 1 }));
    } catch (error) {
      console.error('Failed to load links for sort order:', error);
    }
  }, []);

  useEffect(() => {
    if (isEditing && id) {
      loadLink(id);
    } else {
      // Set default sort order for new links
      loadDefaultSortOrder();
    }
  }, [id, isEditing, loadLink, loadDefaultSortOrder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.url) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate URL format
    try {
      new URL(formData.url.startsWith('http') ? formData.url : `https://${formData.url}`);
    } catch {
      if (!formData.url.startsWith('mailto:') && !formData.url.startsWith('tel:')) {
        alert('Please enter a valid URL');
        return;
      }
    }

    // Validate icon requirements
    if (formData.iconType === 'emoji' && !formData.iconValue) {
      alert('Please enter an emoji for the icon');
      return;
    }

    if (formData.iconType === 'custom' && !formData.customImageUrl) {
      alert('Please enter a custom image URL');
      return;
    }

    setSaving(true);
    try {
      const linkData: Partial<SocialLink> = {
        ...(isEditing && { id }),
        title: formData.title,
        url: formData.url.startsWith('http') || formData.url.startsWith('mailto:') || formData.url.startsWith('tel:') 
          ? formData.url 
          : `https://${formData.url}`,
        description: formData.description || undefined,
        iconType: formData.iconType,
        iconValue: formData.iconType === 'emoji' ? formData.iconValue : undefined,
        customImageUrl: formData.iconType === 'custom' ? formData.customImageUrl : undefined,
        isActive: formData.isActive,
        sortOrder: formData.sortOrder
      };

      await dataService.saveLink(linkData);
      alert(`Link ${isEditing ? 'updated' : 'created'} successfully!`);
      
      navigate('/admin/links');
    } catch (error) {
      console.error('Failed to save link:', error);
      alert('Failed to save link');
    } finally {
      setSaving(false);
    }
  };

  const handleIconTypeChange = (iconType: 'default' | 'custom' | 'emoji') => {
    setFormData({
      ...formData,
      iconType,
      iconValue: '',
      customImageUrl: ''
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/admin/links" className="text-blue-600 hover:text-blue-700 text-sm">
            ← Back to Links
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            {isEditing ? 'Edit' : 'Create'} Link
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="e.g., Instagram, Website, Contact Us"
                required
              />
            </div>

            {/* URL */}
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="https://example.com, mailto:email@example.com, tel:+1234567890"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter a web URL, email (mailto:), or phone number (tel:)
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="Optional description shown below the title"
              />
            </div>

            {/* Icon Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Icon Type
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="default"
                    checked={formData.iconType === 'default'}
                    onChange={() => handleIconTypeChange('default')}
                    className="mr-2 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm">Default (auto-detected based on title/URL)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="emoji"
                    checked={formData.iconType === 'emoji'}
                    onChange={() => handleIconTypeChange('emoji')}
                    className="mr-2 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm">Custom Emoji</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="custom"
                    checked={formData.iconType === 'custom'}
                    onChange={() => handleIconTypeChange('custom')}
                    className="mr-2 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm">Custom Image</span>
                </label>
              </div>
            </div>

            {/* Emoji Input */}
            {formData.iconType === 'emoji' && (
              <div>
                <label htmlFor="iconValue" className="block text-sm font-medium text-gray-700">
                  Emoji <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="iconValue"
                  value={formData.iconValue}
                  onChange={(e) => setFormData({ ...formData, iconValue: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="🍕"
                  maxLength={4}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter a single emoji to use as the icon
                </p>
              </div>
            )}

            {/* Custom Image URL */}
            {formData.iconType === 'custom' && (
              <div>
                <label htmlFor="customImageUrl" className="block text-sm font-medium text-gray-700">
                  Custom Image URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  id="customImageUrl"
                  value={formData.customImageUrl}
                  onChange={(e) => setFormData({ ...formData, customImageUrl: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="https://example.com/icon.png"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Image should be square (1:1 aspect ratio) and at least 64x64 pixels
                </p>
                {formData.customImageUrl && (
                  <div className="mt-2">
                    <img 
                      src={formData.customImageUrl} 
                      alt="Preview" 
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Status and Sort Order */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
                <p className="mt-1 text-sm text-gray-500">
                  Only active links are shown to the public
                </p>
              </div>
              <div>
                <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700">
                  Sort Order
                </label>
                <input
                  type="number"
                  id="sortOrder"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  min="0"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Lower numbers appear first
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <Button
              type="submit"
              disabled={saving}
              className="flex-1"
            >
              {saving ? 'Saving...' : (isEditing ? 'Update Link' : 'Create Link')}
            </Button>
            <Link to="/admin/links" className="flex-1">
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

export default LinksEditor;