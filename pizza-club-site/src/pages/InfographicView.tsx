import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Skeleton from '@/components/common/Skeleton';
import InfographicCanvas from '@/components/infographics/InfographicCanvas';
import { dataService } from '@/services/dataWithApi';
import type { InfographicWithData } from '@/types/infographics';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const InfographicView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [infographic, setInfographic] = useState<InfographicWithData | null>(null);
  const [useStaticHtml, setUseStaticHtml] = useState(false);
  const [staticHtmlContent, setStaticHtmlContent] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadInfographic(id);
    }

    // Cleanup: remove injected styles when component unmounts
    return () => {
      const styleElement = document.getElementById('infographic-styles');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [id]);

  const loadInfographic = async (infographicId: string) => {
    console.log('[InfographicView] Loading infographic:', infographicId);

    try {
      setLoading(true);

      // Check if this is a draft ID - drafts don't have static HTML
      const isDraft = infographicId.startsWith('draft-');
      console.log('[InfographicView] Is draft?', isDraft);

      if (isDraft) {
        console.log('[InfographicView] Draft detected - using dynamic React rendering');
        // For drafts, fall back to dynamic rendering
        const data = await dataService.getInfographicWithData(infographicId);
        console.log('[InfographicView] Loaded draft data:', data);

        if (data) {
          setInfographic(data);
          setRestaurantName(data.restaurantName);
          setUseStaticHtml(false);
        } else {
          throw new Error('Draft not found');
        }
      } else {
        console.log('[InfographicView] Published infographic - fetching static HTML');

        // For published infographics, use static HTML
        const url = `${API_BASE_URL}/infographics?id=${infographicId}&static=true`;
        console.log('[InfographicView] Fetching URL:', url);

        const response = await fetch(url);
        console.log('[InfographicView] Static HTML response status:', response.status, response.statusText);
        console.log('[InfographicView] Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          throw new Error(`Infographic not found (${response.status})`);
        }

        const contentType = response.headers.get('content-type');
        console.log('[InfographicView] Content-Type:', contentType);

        const html = await response.text();
        console.log('[InfographicView] Received HTML length:', html.length);
        console.log('[InfographicView] HTML preview:', html.substring(0, 200));

        // Check if we got JSON instead of HTML
        if (contentType?.includes('application/json')) {
          console.error('[InfographicView] ERROR: Received JSON instead of HTML!');
          console.error('[InfographicView] This means static_html is likely NULL in the database');
          console.error('[InfographicView] Full response:', html);
        }

        // Extract restaurant name from the HTML for the page title
        const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/);
        if (titleMatch) {
          const name = titleMatch[1].replace(/<[^>]*>/g, '');
          console.log('[InfographicView] Extracted restaurant name:', name);
          setRestaurantName(name);
        }

        // Extract only the body content (strip out <html>, <head>, <body> tags)
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        const bodyContent = bodyMatch ? bodyMatch[1] : html;
        console.log('[InfographicView] Body content extracted, length:', bodyContent.length);

        // Extract styles from the head to include them
        const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
        const styles = styleMatch ? styleMatch[1] : '';
        console.log('[InfographicView] Styles extracted, length:', styles.length);

        // Add the styles to document head
        if (styles && !document.getElementById('infographic-styles')) {
          console.log('[InfographicView] Adding styles to document head');
          const styleElement = document.createElement('style');
          styleElement.id = 'infographic-styles';
          styleElement.textContent = styles;
          document.head.appendChild(styleElement);
        }

        // Store HTML content in state for rendering
        setStaticHtmlContent(bodyContent);
        setUseStaticHtml(true);
        console.log('[InfographicView] Static HTML ready for rendering');
      }

      setError(null);
    } catch (err) {
      console.error('[InfographicView] Failed to load infographic:', err);
      setError(err instanceof Error ? err.message : 'Failed to load infographic');
    } finally {
      setLoading(false);
      console.log('[InfographicView] Loading complete');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${restaurantName || 'Restaurant'} Visit - Pizza Club`,
        text: `Check out our visit to ${restaurantName || 'this restaurant'}!`,
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error}
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

      {/* Infographic Display - Static HTML for published, React for drafts */}
      {useStaticHtml ? (
        <div
          ref={containerRef}
          className="print:px-0"
          dangerouslySetInnerHTML={{ __html: staticHtmlContent }}
        />
      ) : infographic ? (
        <div className="max-w-4xl mx-auto px-4 print:px-0 print:max-w-none">
          <InfographicCanvas data={infographic} />
        </div>
      ) : null}
    </div>
  );
};

export default InfographicView;