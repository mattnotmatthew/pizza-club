import React from 'react';
import type { InfographicWithData } from '@/types/infographics';
import { useMagazineData } from '@/hooks/useMagazineData';
import MagazinePage1 from './magazine/MagazinePage1';
import MagazinePage2 from './magazine/MagazinePage2';
import MagazinePage3 from './magazine/MagazinePage3';

interface MagazineTemplateProps {
  data: InfographicWithData;
  isPreview?: boolean;
}

const MagazineTemplate: React.FC<MagazineTemplateProps> = ({ data, isPreview = false }) => {
  // Extract magazine data from visit
  const magazineData = useMagazineData(data);

  // Get photos from content if available
  const heroImage = data.content.photos?.find(p => p.layer === 'background')?.url;
  const additionalPhotos = data.content.photos?.filter(p => p.layer === 'foreground') || [];

  return (
    <div className={`bg-white ${isPreview ? '' : 'max-w-4xl mx-auto'} print:shadow-none relative overflow-hidden shadow-xl`}>
      {/* Page 1: Header, Overall, Roll Call, Orders */}
      <MagazinePage1
        restaurantName={data.restaurantName}
        address={data.restaurantAddress}
        visitDate={data.visitDate}
        heroImage={heroImage}
        magazineData={magazineData}
      />

      {/* Page 2: Apps and Pizza Components */}
      {(magazineData.appetizers.length > 0 || Object.keys(magazineData.componentRatings).length > 0) && (
        <MagazinePage2
          magazineData={magazineData}
          photoUrl={additionalPhotos[0]?.url}
        />
      )}

      {/* Page 3: Quotes and The Other Stuff */}
      {(data.content.selectedQuotes.length > 0 || Object.keys(magazineData.otherStuff).length > 0) && (
        <MagazinePage3
          quotes={data.content.selectedQuotes}
          magazineData={magazineData}
          photoUrl={additionalPhotos[1]?.url || additionalPhotos[0]?.url}
        />
      )}

      {/* Override Indicator (for debugging/editing) */}
      {magazineData.hasOverrides && !isPreview && (
        <div className="bg-blue-50 border-t-2 border-blue-200 p-3 print:hidden">
          <p className="text-sm text-blue-700 text-center">
            ℹ️ Manual overrides have been applied to this infographic
          </p>
        </div>
      )}
    </div>
  );
};

export default MagazineTemplate;