import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/common/Button';
import Skeleton from '@/components/common/Skeleton';
import SortableContainer from '@/components/common/SortableContainer';
import DraggableMemberCard from '@/components/admin/DraggableMemberCard';
import { dataService } from '@/services/dataWithApi';
import type { Member } from '@/types';

const MembersList: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await dataService.getMembers();
      setMembers(data);
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member?')) {
      return;
    }

    setDeleting(id);
    try {
      await dataService.deleteMember(id);
      await loadMembers();
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete member');
    } finally {
      setDeleting(null);
    }
  };

  const handleReorder = async (reorderedMembers: Member[]) => {
    // Optimistically update the UI
    setMembers(reorderedMembers);
    setReordering(true);

    try {
      // Send the new order to the server
      const memberIds = reorderedMembers.map(m => m.id);
      await dataService.updateMemberOrder(memberIds);
    } catch (error) {
      console.error('Failed to update member order:', error);
      alert('Failed to save new order. Please refresh and try again.');
      // Reload to get the correct order from server
      await loadMembers();
    } finally {
      setReordering(false);
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Members</h1>
          <Link to="/admin/members/new">
            <Button>Add New Member</Button>
          </Link>
        </div>

        {members.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-600">No members yet. Add your first one!</p>
          </div>
        ) : (
          <>
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Drag the handles on the left of each card to reorder members. 
                Changes are saved automatically.
              </p>
            </div>
            
            {reordering && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">Saving new order...</p>
              </div>
            )}
            
            <SortableContainer
              items={members}
              onReorder={handleReorder}
              getItemId={(member) => member.id}
              strategy="grid"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              disabled={reordering}
              renderItem={(member) => (
                <DraggableMemberCard
                  key={member.id}
                  member={member}
                  onDelete={handleDelete}
                  isDeleting={deleting === member.id}
                />
              )}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default MembersList;