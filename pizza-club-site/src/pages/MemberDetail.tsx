import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Skeleton from '@/components/common/Skeleton';
import { dataService } from '@/services/dataWithApi';
import type { Member, Restaurant } from '@/types';


// Mock visited restaurants data
const mockVisitedRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Lou Malnati\'s Pizzeria',
    address: '439 N Wells St, Chicago, IL 60654',
    coordinates: { lat: 41.890251, lng: -87.633991 },
    averageRating: 4.5,
    totalVisits: 3,
  },
  {
    id: '2',
    name: 'Pequod\'s Pizza',
    address: '2207 N Clybourn Ave, Chicago, IL 60614',
    coordinates: { lat: 41.922577, lng: -87.664421 },
    averageRating: 4.8,
    totalVisits: 2,
  },
  {
    id: '3',
    name: 'Art of Pizza',
    address: '3033 N Ashland Ave, Chicago, IL 60657',
    coordinates: { lat: 41.937594, lng: -87.668365 },
    averageRating: 4.3,
    totalVisits: 4,
  },
];

const MemberDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [visitedRestaurants, setVisitedRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemberData = async () => {
      setLoading(true);
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Fetch member from data service
        const foundMember = await dataService.getMemberById(id || '');
        if (foundMember) {
          // Handle photo URL with base path
          let photoUrl = foundMember.photoUrl || foundMember.photo;
          if (photoUrl && photoUrl.startsWith('/images/')) {
            photoUrl = import.meta.env.BASE_URL + photoUrl.slice(1);
          }
          
          const mappedMember = {
            ...foundMember,
            photoUrl,
            joinDate: foundMember.joinDate || (foundMember.memberSince ? new Date(foundMember.memberSince) : undefined),
            favoriteStyle: foundMember.favoriteStyle || foundMember.favoritePizzaStyle,
          };
          
          setMember(mappedMember);
          // TODO: Fetch actual visited restaurants for this member
          setVisitedRestaurants(mockVisitedRestaurants);
        } else {
          // Member not found
          navigate('/members');
        }
      } catch (error) {
        console.error('Failed to fetch member:', error);
        navigate('/members');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMemberData();
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen py-12 md:py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Loading skeleton */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <Skeleton variant="rectangular" height={400} className="w-full" />
            <div className="p-6 md:p-8">
              <Skeleton variant="text" className="text-3xl mb-4" />
              <Skeleton variant="text" count={4} className="mb-6" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton variant="text" />
                <Skeleton variant="text" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!member) {
    return null;
  }

  const memberSince = member.joinDate 
    ? new Date(member.joinDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      })
    : 'Recently';

  // Smart focal point defaults for portrait photos
  const getImagePositioning = () => {
    if (member.focalPoint) {
      // Use custom focal point if available
      return {
        objectPosition: `${member.focalPoint.x}% ${member.focalPoint.y}%`
      };
    } else {
      // Smart defaults - better for portrait photos where faces are typically in upper third
      return {
        objectPosition: '50% 25%' // Center horizontally, 25% from top (good for faces)
      };
    }
  };

  return (
    <div className="min-h-screen py-12 md:py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link
          to="/members"
          className="inline-flex items-center text-red-700 hover:text-red-800 mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Members
        </Link>

        {/* Member Profile Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          {/* Hero Image Section */}
          <div className="relative h-64 md:h-80 bg-gray-200">
            <img
              src={member.photoUrl || '/api/placeholder/800/400'}
              alt={member.name}
              className="w-full h-full object-cover"
              style={getImagePositioning()}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {member.name}
              </h1>
              {member.favoriteStyle && (
                <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                  {member.favoriteStyle}
                </span>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 md:p-8">
            {/* Bio */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {member.bio}
              </p>
            </div>

            {/* Member Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="text-lg font-semibold">{memberSince}</p>
              </div>
              {member.favoriteStyle && (
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="text-lg font-semibold">{member.favoriteStyle}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Visited Restaurants */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6">Restaurants Visited with the Club</h2>
          
          {visitedRestaurants.length > 0 ? (
            <div className="space-y-4">
              {visitedRestaurants.map((restaurant) => (
                <Link
                  key={restaurant.id}
                  to={`/restaurants#${restaurant.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {restaurant.name}
                      </h3>
                      <p className="text-sm text-gray-600">{restaurant.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {restaurant.totalVisits || 0} visit{(restaurant.totalVisits || 0) > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No restaurant visits recorded yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberDetail;