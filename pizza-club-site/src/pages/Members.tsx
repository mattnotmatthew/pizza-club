import React, { useState, useEffect } from 'react';
import MemberCard from '@/components/members/MemberCard';
import { MemberCardSkeleton } from '@/components/common/Skeleton';
import { dataService } from '@/services/data';
import type { Member } from '@/types';

const Members: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const fetchedMembers = await dataService.getMembers();
        // Map the data to ensure compatibility with components expecting old field names
        const mappedMembers = fetchedMembers.map(member => ({
          ...member,
          // Provide backward compatibility for deprecated fields
          photoUrl: member.photoUrl || member.photo,
          joinDate: member.joinDate || (member.memberSince ? new Date(member.memberSince) : undefined),
          favoriteStyle: member.favoriteStyle || member.favoritePizzaStyle,
        }));
        setMembers(mappedMembers);
      } catch (error) {
        console.error('Failed to fetch members:', error);
        // You might want to show an error state to the user
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  return (
    <div className="min-h-screen py-12 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Club Members
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Meet the passionate pizza lovers who make up the Greater Chicagoland Pizza Club
          </p>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {loading ? (
            // Show skeletons while loading
            Array.from({ length: 8 }).map((_, index) => (
              <MemberCardSkeleton key={index} />
            ))
          ) : members.length > 0 ? (
            // Show member cards
            members.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))
          ) : (
            // Empty state
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No members found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Members;