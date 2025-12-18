import { useMatomo } from '@/hooks/useMatomo';

/**
 * Component that initializes Matomo tracking
 * Must be placed inside a Router component
 */
const MatomoTracker: React.FC = () => {
  useMatomo();
  return null;
};

export default MatomoTracker;
