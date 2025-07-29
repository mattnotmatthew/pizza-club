import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Skeleton from '@/components/common/Skeleton';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = () => {
    // Check if already authenticated in session
    const sessionAuth = sessionStorage.getItem('admin-authenticated');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
      setIsChecking(false);
      return;
    }

    // Check environment variable
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
    if (!adminPassword) {
      console.warn('Admin password not configured. Set VITE_ADMIN_PASSWORD in your .env file.');
      setIsAuthenticated(false);
      setIsChecking(false);
      return;
    }

    // Check if password is in URL query params (for easy access during development)
    const urlParams = new URLSearchParams(window.location.search);
    const providedPassword = urlParams.get('password');

    if (providedPassword === adminPassword) {
      // Store in session to avoid re-checking
      sessionStorage.setItem('admin-authenticated', 'true');
      setIsAuthenticated(true);
      
      // Remove password from URL for security
      urlParams.delete('password');
      const newUrl = window.location.pathname + 
        (urlParams.toString() ? '?' + urlParams.toString() : '') + 
        window.location.hash;
      window.history.replaceState({}, '', newUrl);
    } else if (!providedPassword) {
      // No password provided, prompt for it
      promptForPassword(adminPassword);
    } else {
      // Wrong password
      alert('Invalid admin password');
      setIsAuthenticated(false);
    }
    
    setIsChecking(false);
  };

  const promptForPassword = (correctPassword: string) => {
    const password = prompt('Enter admin password:');
    
    if (password === correctPassword) {
      sessionStorage.setItem('admin-authenticated', 'true');
      setIsAuthenticated(true);
    } else if (password !== null) {
      // User entered wrong password (not cancelled)
      alert('Invalid admin password');
      setIsAuthenticated(false);
    } else {
      // User cancelled
      setIsAuthenticated(false);
    }
  };

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Skeleton variant="circular" width={60} height={60} className="mx-auto mb-4" />
          <Skeleton variant="text" width={200} className="mx-auto" />
          <p className="text-gray-600 mt-2">Checking admin access...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default AdminRoute;