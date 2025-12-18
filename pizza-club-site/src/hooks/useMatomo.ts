import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// Matomo configuration
const MATOMO_URL = 'https://greaterchicagolandpizza.club/matomo/';
const SITE_ID = '1';

// Extend window to include Matomo's _paq array
declare global {
  interface Window {
    _paq?: unknown[][];
  }
}

/**
 * Initialize Matomo tracking script
 * Only runs once on first call
 */
let isInitialized = false;

const initMatomo = () => {
  if (isInitialized || typeof window === 'undefined') return;

  window._paq = window._paq || [];
  window._paq.push(['setTrackerUrl', MATOMO_URL + 'matomo.php']);
  window._paq.push(['setSiteId', SITE_ID]);
  window._paq.push(['enableLinkTracking']);

  // Load the Matomo script
  const script = document.createElement('script');
  script.async = true;
  script.src = MATOMO_URL + 'matomo.js';
  document.head.appendChild(script);

  isInitialized = true;
};

/**
 * Track a page view
 */
const trackPageView = (path: string, title?: string) => {
  if (typeof window === 'undefined' || !window._paq) return;

  window._paq.push(['setCustomUrl', path]);
  if (title) {
    window._paq.push(['setDocumentTitle', title]);
  }
  window._paq.push(['trackPageView']);
};

/**
 * Track a custom event
 */
const trackEvent = (category: string, action: string, name?: string, value?: number) => {
  if (typeof window === 'undefined' || !window._paq) return;

  window._paq.push(['trackEvent', category, action, name, value]);
};

/**
 * Hook to use Matomo tracking in React components
 * Automatically tracks page views on route changes
 */
export const useMatomo = () => {
  const location = useLocation();

  // Initialize Matomo on mount
  useEffect(() => {
    initMatomo();
  }, []);

  // Track page view on route change
  useEffect(() => {
    // Small delay to ensure page title is updated
    const timeout = setTimeout(() => {
      const fullPath = location.pathname + location.search;
      trackPageView(fullPath, document.title);
    }, 100);

    return () => clearTimeout(timeout);
  }, [location.pathname, location.search]);

  // Return trackEvent for custom event tracking
  const track = useCallback((category: string, action: string, name?: string, value?: number) => {
    trackEvent(category, action, name, value);
  }, []);

  return { trackEvent: track };
};

export default useMatomo;
