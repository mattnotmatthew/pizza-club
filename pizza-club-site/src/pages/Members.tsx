import React, { useState, useEffect } from 'react';
import MemberCard from '@/components/members/MemberCard';
import { MemberCardSkeleton } from '@/components/common/Skeleton';
import type { Member } from '@/types';

// Mock data - replace with CMS fetch
const mockMembers: Member[] = [
  {
    id: '1',
    name: 'John Smith',
    bio: 'Pizza enthusiast since 1985. I believe the perfect pizza has a crispy crust, balanced sauce, and just the right amount of cheese. Always searching for the next great slice in Chicago.',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    joinDate: new Date('2020-01-15'),
    favoriteStyle: 'Deep Dish',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    bio: 'Lifelong Chicagoan with a passion for thin crust tavern-style pizza. I love exploring neighborhood pizza joints and discovering hidden gems across the city.',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    joinDate: new Date('2020-03-22'),
    favoriteStyle: 'Tavern Style',
  },
  {
    id: '3',
    name: 'Mike Wilson',
    bio: 'Former New Yorker converted to Chicago pizza. I appreciate all styles but have a special place in my heart for stuffed pizza. Weekend pizza hunter and amateur pizza historian.',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    joinDate: new Date('2021-06-10'),
    favoriteStyle: 'Stuffed',
  },
  {
    id: '4',
    name: 'Emily Davis',
    bio: 'Food blogger and pizza aficionado. I document our pizza adventures and love trying unique toppings. Firm believer that pizza is the perfect food for any occasion.',
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    joinDate: new Date('2020-11-05'),
    favoriteStyle: 'Neapolitan',
  },
  {
    id: '5',
    name: 'Robert Martinez',
    bio: 'Chef by profession, pizza lover by choice. I bring a culinary perspective to our tastings and enjoy analyzing the technical aspects of great pizza making.',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    joinDate: new Date('2021-02-28'),
    favoriteStyle: 'Wood-Fired',
  },
  {
    id: '6',
    name: 'Lisa Anderson',
    bio: 'Pizza purist who believes in quality ingredients and traditional techniques. I organize our monthly meetups and keep track of our ever-growing list of pizzerias to visit.',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop',
    joinDate: new Date('2020-01-15'),
    favoriteStyle: 'Classic',
  },
  {
    id: '7',
    name: 'David Thompson',
    bio: 'Numbers guy who brings data to our pizza discussions. I maintain our rating spreadsheet and love finding correlations between pizza styles and neighborhood demographics.',
    photoUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop',
    joinDate: new Date('2022-04-12'),
    favoriteStyle: 'Detroit Style',
  },
  {
    id: '8',
    name: 'Jennifer Chen',
    bio: 'Adventurous eater who never says no to trying new pizza places. I love the community aspect of our club and the friendships formed over shared slices.',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
    joinDate: new Date('2021-09-20'),
    favoriteStyle: 'Artisanal',
  },
];

const Members: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchMembers = async () => {
      setLoading(true);
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        // TODO: Replace with actual CMS fetch
        setMembers(mockMembers);
      } catch (error) {
        console.error('Failed to fetch members:', error);
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