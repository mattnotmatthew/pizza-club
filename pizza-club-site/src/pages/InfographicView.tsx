import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Skeleton from '@/components/common/Skeleton';
import InfographicCanvas from '@/components/infographics/InfographicCanvas';
import { useMatomo } from '@/hooks/useMatomo';
import { dataService } from '@/services/dataWithApi';
import type { InfographicWithData } from '@/types/infographics';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const InfographicView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { trackEvent } = useMatomo();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [infographic, setInfographic] = useState<InfographicWithData | null>(null);
  const [useStaticHtml, setUseStaticHtml] = useState(false);
  const [staticHtmlContent, setStaticHtmlContent] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadInfographic(id);
    }
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
          setUseStaticHtml(false);
          // Track draft infographic view
          trackEvent('Infographic', 'View', data.restaurantName || infographicId);
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

        // Extract only the body content (strip out <html>, <head>, <body> tags)
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        const bodyContent = bodyMatch ? bodyMatch[1] : html;
        console.log('[InfographicView] Body content extracted, length:', bodyContent.length);

        // Extract styles from the head to include them inline (not in document head)
        // This prevents style conflicts with the main app's CSS
        const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
        const styles = styleMatch ? styleMatch[1] : '';
        console.log('[InfographicView] Styles extracted, length:', styles.length);

        // Include styles directly in the content (scoped to this component)
        // rather than injecting into document head which causes global conflicts
        const contentWithStyles = styles
          ? `<style>${styles}</style>${bodyContent}`
          : bodyContent;

        // Store HTML content in state for rendering
        setStaticHtmlContent(contentWithStyles);
        setUseStaticHtml(true);
        console.log('[InfographicView] Static HTML ready for rendering');

        // Track infographic view (extract restaurant name from title tag if possible)
        const titleMatch = html.match(/<title>([^|<]+)/i);
        const infographicName = titleMatch ? titleMatch[1].trim() : infographicId;
        trackEvent('Infographic', 'View', infographicName);
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
    <div className="min-h-screen bg-gray-50 py-0 print:py-0 print:bg-white">
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