import React from 'react';
import InfographicCanvas from './InfographicCanvas';
import MagazineTemplate from './templates/MagazineTemplate';
import type { InfographicWithData } from '@/types/infographics';

interface TemplateRendererProps {
  data: InfographicWithData;
  isPreview?: boolean;
}

const TemplateRenderer: React.FC<TemplateRendererProps> = ({ data, isPreview = false }) => {
  const template = data.content.template || 'classic';

  switch (template) {
    case 'magazine':
      return <MagazineTemplate data={data} isPreview={isPreview} />;
    
    case 'classic':
    default:
      return <InfographicCanvas data={data} isPreview={isPreview} />;
  }
};

export default TemplateRenderer;