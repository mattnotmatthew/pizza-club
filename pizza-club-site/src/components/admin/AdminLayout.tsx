import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/admin" className="font-bold text-xl">
                Pizza Club Admin
              </Link>
              <nav className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/admin'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
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
                <Link
                  to="/admin/events"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/admin/events')
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Events
                </Link>
                <Link
                  to="/admin/members"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/admin/members')
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Members
                </Link>
                <Link
                  to="/admin/restaurants"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/admin/restaurants')
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Restaurants
                </Link>
                <Link
                  to="/admin/links"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/admin/links')
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Links
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {user?.email && (
                <span className="text-gray-400 text-sm">
                  {user.email}
                </span>
              )}
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