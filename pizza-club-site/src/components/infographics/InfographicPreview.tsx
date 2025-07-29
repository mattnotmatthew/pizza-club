import React from 'react';
import InfographicCanvas from './InfographicCanvas';
import type { Restaurant, RestaurantVisit } from '@/types';
import type { Infographic, InfographicWithData } from '@/types/infographics';

interface InfographicPreviewProps {
  infographic: Partial<Infographic>;
  restaurantData?: Restaurant;
  visitData?: RestaurantVisit;
  members?: { id: string; name: string }[];
}

const InfographicPreview: React.FC<InfographicPreviewProps> = ({ 
  infographic, 
  restaurantData, 
  visitData,
  members = []
}) => {
  if (!restaurantData || !visitData) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            Select a restaurant visit to preview the infographic
          </p>
        </div>
      </div>
    );
  }

  // Transform to InfographicWithData format
  const attendeeNames = visitData.attendees
    .map(attendeeId => members.find(m => m.id === attendeeId)?.name || attendeeId)
    .filter(Boolean);

  const previewData: InfographicWithData = {
    id: 'preview',
    restaurantId: restaurantData.id,
    visitDate: infographic.visitDate || '',
    status: 'draft',
    content: infographic.content || {
      selectedQuotes: [],
      showRatings: {
        overall: true,
        crust: true,
        sauce: true,
        cheese: true,
        toppings: true,
        value: true
      }
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    restaurantName: restaurantData.name,
    restaurantLocation: restaurantData.location || '',
    visitData: {
      ratings: visitData.ratings,
      attendees: visitData.attendees,
      notes: visitData.notes || ''
    },
    attendeeNames
  };

  return (
    <div className="h-full overflow-auto bg-gray-100 p-4">
      <div className="transform scale-75 origin-top">
        <InfographicCanvas data={previewData} isPreview />
      </div>
    </div>
  );
};

export default InfographicPreview;