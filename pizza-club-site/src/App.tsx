import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/common/Layout';
import AdminRoute from '@/components/admin/AdminRoute';

// Lazy load pages for better performance
const Home = lazy(() => import('@/pages/Home'));
const Members = lazy(() => import('@/pages/Members'));
const MemberDetail = lazy(() => import('@/pages/MemberDetail'));
const Restaurants = lazy(() => import('@/pages/Restaurants'));
const RestaurantsCompare = lazy(() => import('@/pages/RestaurantsCompare'));
const Events = lazy(() => import('@/pages/Events'));
const Test = lazy(() => import('@/pages/Test'));
const Infographics = lazy(() => import('@/pages/Infographics'));
const InfographicView = lazy(() => import('@/pages/InfographicView'));

// Admin pages
const AdminLayout = lazy(() => import('@/components/admin/AdminLayout'));
const InfographicsList = lazy(() => import('@/pages/admin/InfographicsList'));
const InfographicsEditor = lazy(() => import('@/pages/admin/InfographicsEditor'));

// Loading component for Suspense fallback
const Loading: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[--color-pizza-red] mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router basename="/pizza">
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="members" element={<Members />} />
            <Route path="members/:id" element={<MemberDetail />} />
            <Route path="restaurants" element={<Restaurants />} />
            <Route path="restaurants/compare" element={<RestaurantsCompare />} />
            <Route path="events" element={<Events />} />
            <Route path="infographics" element={<Infographics />} />
            <Route path="infographics/:id" element={<InfographicView />} />
            <Route path="test" element={<Test />} />
          </Route>
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route path="infographics" element={<InfographicsList />} />
            <Route path="infographics/new" element={<InfographicsEditor />} />
            <Route path="infographics/edit/:id" element={<InfographicsEditor />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;