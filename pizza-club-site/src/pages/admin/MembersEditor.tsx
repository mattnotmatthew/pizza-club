import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';
import MemberPhotoUploader from '@/components/admin/MemberPhotoUploader';
import TranslatedText from '@/components/common/TranslatedText';
import { dataService } from '@/services/dataWithApi';
import type { Member } from '@/types';

const MembersEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    photo: '',
    memberSince: '',
    favoritePizzaStyle: ''
  });
  const [focalPoint, setFocalPoint] = useState<{ x: number; y: number } | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      loadMember(id);
    }
  }, [id, isEditing]);

  const loadMember = async (memberId: string) => {
    try {
      setLoading(true);
      const member = await dataService.getMemberById(memberId);
      if (member) {
        setFormData({
          name: member.name,
          bio: member.bio || '',
          photo: member.photo || '',
          memberSince: member.memberSince || '',
          favoritePizzaStyle: member.favoritePizzaStyle || ''
        });
        setFocalPoint(member.focalPoint || undefined);
      } else {
        alert('Member not found');
        navigate('/admin/members');
      }
    } catch (error) {
      console.error('Failed to load member:', error);
      alert('Failed to load member');
      navigate('/admin/members');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      alert('Please enter a name');
      return;
    }

    setSaving(true);
    try {
      const memberData: Partial<Member> & { id: string } = {
        id: isEditing ? id : `member_${Date.now()}`,
        name: formData.name,
        bio: formData.bio,
        photo: formData.photo || undefined,
        memberSince: formData.memberSince || undefined,
        favoritePizzaStyle: formData.favoritePizzaStyle || undefined,
        focalPoint: focalPoint
      };

      await dataService.saveMember(memberData);
      alert(`Member ${isEditing ? 'updated' : 'created'} successfully!`);
      navigate('/admin/members');
    } catch (error) {
      console.error('Failed to save member:', error);
      alert('Failed to save member');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600"><TranslatedText>Loading member...</TranslatedText></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/admin/members" className="text-blue-600 hover:text-blue-700 text-sm">
            <TranslatedText>← Back to Members</TranslatedText>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            <TranslatedText>{isEditing ? 'Edit' : 'Add'} Member</TranslatedText>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                <TranslatedText>Name</TranslatedText> <span className="text-red-500">*</span>
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

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                <TranslatedText>Bio</TranslatedText>
              </label>
              <textarea
                id="bio"
                rows={6}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="Tell us about this member's pizza journey..."
              />
              <p className="mt-1 text-sm text-gray-500">
                <TranslatedText>This should be a rich text field, not a single line.</TranslatedText>
              </p>
            </div>

            {/* Photo Upload */}
            <MemberPhotoUploader
              memberId={isEditing ? id : `new-${Date.now()}`}
              currentPhotoUrl={formData.photo}
              currentFocalPoint={focalPoint}
              onPhotoChange={(url) => setFormData({ ...formData, photo: url || '' })}
              onFocalPointChange={setFocalPoint}
            />

            {/* Member Since */}
            <div>
              <label htmlFor="memberSince" className="block text-sm font-medium text-gray-700">
                <TranslatedText>Member Since</TranslatedText>
              </label>
              <input
                type="text"
                id="memberSince"
                value={formData.memberSince}
                onChange={(e) => setFormData({ ...formData, memberSince: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="2024"
              />
            </div>

            {/* Favorite Pizza Style */}
            <div>
              <label htmlFor="favoritePizzaStyle" className="block text-sm font-medium text-gray-700">
                <TranslatedText>Favorite Pizza Style</TranslatedText>
              </label>
              <input
                type="text"
                id="favoritePizzaStyle"
                value={formData.favoritePizzaStyle}
                onChange={(e) => setFormData({ ...formData, favoritePizzaStyle: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="Neapolitan"
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
              {saving ? <TranslatedText>Saving...</TranslatedText> : (isEditing ? <TranslatedText>Update Member</TranslatedText> : <TranslatedText>Add Member</TranslatedText>)}
            </Button>
            <Link to="/admin/members" className="flex-1">
              <Button variant="secondary" className="w-full">
                <TranslatedText>Cancel</TranslatedText>
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MembersEditor;