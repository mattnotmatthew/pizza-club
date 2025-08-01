import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import InfographicCanvas from '@/components/infographics/InfographicCanvas';
import Skeleton from '@/components/common/Skeleton';
import { dataService } from '@/services/dataWithApi';
import type { InfographicWithData } from '@/types/infographics';

const InfographicView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [infographic, setInfographic] = useState<InfographicWithData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadInfographic(id);
    }
  }, [id]);

  const loadInfographic = async (infographicId: string) => {
    try {
      setLoading(true);
      const data = await dataService.getInfographicWithData(infographicId);
      if (data) {
        setInfographic(data);
      } else {
        setError('Infographic not found');
      }
    } catch (err) {
      console.error('Failed to load infographic:', err);
      setError('Failed to load infographic');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${infographic?.restaurantName} Visit - Pizza Club`,
        text: `Check out our visit to ${infographic?.restaurantName}!`,
        url: window.location.href
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Skeleton variant="rectangular" height={600} className="rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !infographic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Infographic not found'}
          </h2>
          <Link to="/infographics" className="text-red-600 hover:text-red-700">
            Back to Infographics
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 print:py-0 print:bg-white">
      {/* Header with actions - hidden on print */}
      <div className="max-w-4xl mx-auto px-4 mb-8 print:hidden">
        <div className="flex items-center justify-between">
          <Link to="/infographics" className="text-blue-600 hover:text-blue-700">
            ← Back to Infographics
          </Link>
          <div className="flex gap-4">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.632 6.316a3 3 0 11-5.368-2.684m5.368 2.684a3 3 0 00-5.368-2.684m0 0a3 3 0 00-5.368 2.684"
                />
              </svg>
              Share
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Infographic Display */}
      <div className="max-w-4xl mx-auto px-4 print:px-0 print:max-w-none">
        <InfographicCanvas data={infographic} />
      </div>

      {/* Additional Info - hidden on print */}
      <div className="max-w-4xl mx-auto px-4 mt-8 print:hidden">
        <div className="text-center text-sm text-gray-600">
          <p>
            Published on {new Date(infographic.publishedAt || infographic.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfographicView;