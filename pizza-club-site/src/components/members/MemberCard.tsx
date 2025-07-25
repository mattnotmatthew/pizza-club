import React from 'react';
import { Link } from 'react-router-dom';
import type { Member } from '@/types';

interface MemberCardProps {
  member: Member;
}

const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const memberSince = member.joinDate ? new Date(member.joinDate).getFullYear() : new Date().getFullYear();
  
  return (
    <Link 
      to={`/members/${member.id}`}
      className="group block bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
    >
      {/* Image Container */}
      <div className="aspect-square overflow-hidden bg-gray-200">
        <img
          src={member.photoUrl || '/api/placeholder/400/400'}
          alt={member.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      
      {/* Content */}
      <div className="p-4 sm:p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-700 transition-colors">
          {member.name}
        </h3>
        
        {/* Bio Preview */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-3">
          {member.bio}
        </p>
        
        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Member since {memberSince}</span>
          {member.favoriteStyle && (
            <span className="bg-red-50 text-red-700 px-2 py-1 rounded-full">
              {member.favoriteStyle}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default MemberCard;