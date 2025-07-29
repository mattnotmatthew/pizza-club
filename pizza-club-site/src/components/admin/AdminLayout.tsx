import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin-authenticated');
    window.location.href = '/pizza';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/admin/infographics" className="font-bold text-xl">
                Pizza Club Admin
              </Link>
              <nav className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/admin/infographics"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/admin/infographics')
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Infographics
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-gray-300 hover:text-white text-sm"
              >
                View Site
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:text-white text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;