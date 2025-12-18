import React from 'react';
import { Link } from 'react-router-dom';
import type { Member } from '@/types';
import { nameToSlug } from '@/utils/urlUtils';

interface MemberCardProps {
  member: Member;
}

const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const memberSinceYear = member.memberSince ? new Date(member.memberSince).getFullYear() : new Date().getFullYear();
  
  // Use slug if available, otherwise generate from name
  const memberSlug = member.slug || nameToSlug(member.name);
  
  return (
    <Link 
      to={`/members/${memberSlug}`}
      className="group block bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
    >
      {/* Image Container */}
      <div className="aspect-square overflow-hidden bg-gray-200">
        <img
          src={member.photo || '/api/placeholder/400/400'}
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
        
        {/* Favorite Style Badge */}
        {member.favoritePizzaStyle && (
          <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-xs mb-3">
            {member.favoritePizzaStyle}
          </span>
        )}
        
        {/* Bio Preview */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-3">
          {member.bio}
        </p>
        
        {/* Meta Info */}
        <div className="text-xs text-gray-500">
          <span>Member since {memberSinceYear}</span>
        </div>
      </div>
    </Link>
  );
};

export default MemberCard;