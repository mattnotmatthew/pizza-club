import React from 'react';
import { Link } from 'react-router-dom';
import type { Member } from '@/types';
import { nameToSlug } from '@/utils/urlUtils';

interface MemberCardProps {
  member: Member;
}

const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const memberSinceYear = member.memberSince ? new Date(member.memberSince).getFullYear() : new Date().getFullYear();
  const visitCount = member.restaurantsVisited || 0;

  // Use slug if available, otherwise generate from name
  const memberSlug = member.slug || nameToSlug(member.name);

  // Use focal point for image positioning if available
  const imageStyle = member.focalPoint
    ? { objectPosition: `${member.focalPoint.x}% ${member.focalPoint.y}%` }
    : { objectPosition: '50% 25%' }; // Default: center horizontal, upper third for faces

  return (
    <Link
      to={`/members/${memberSlug}`}
      className="member-card group block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100"
    >
      {/* Image Container with Overlay */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
        <img
          src={member.photo || '/api/placeholder/400/300'}
          alt={member.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          style={imageStyle}
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Name overlay on image */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-xl font-bold text-white drop-shadow-lg group-hover:text-red-200 transition-colors">
            {member.name}
          </h3>
        </div>

        {/* Visit count badge */}
        {visitCount > 0 && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-lg flex items-center gap-1.5">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-semibold text-gray-800">{visitCount}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Role Badge */}
        {member.favoritePizzaStyle && (
          <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium mb-3">
            {member.favoritePizzaStyle}
          </span>
        )}

        {/* Bio Preview */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-3 leading-relaxed">
          {member.bio}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            Since {memberSinceYear}
          </span>
          <span className="text-xs font-medium text-red-600 group-hover:text-red-700 flex items-center gap-1">
            View Profile
            <svg className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default MemberCard;