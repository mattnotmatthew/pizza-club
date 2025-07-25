import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Skeleton from '@/components/common/Skeleton';
import type { Member, Restaurant } from '@/types';

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
        
        // TODO: Replace with actual CMS fetch
        const foundMember = mockMembers.find(m => m.id === id);
        if (foundMember) {
          setMember(foundMember);
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
          <div className="relative h-64 md:h-96 bg-gray-200">
            <img
              src={member.photoUrl || '/api/placeholder/800/400'}
              alt={member.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {member.name}
              </h1>
              {member.favoriteStyle && (
                <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                  {member.favoriteStyle} Lover
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
                  <p className="text-sm text-gray-500">Favorite Pizza Style</p>
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