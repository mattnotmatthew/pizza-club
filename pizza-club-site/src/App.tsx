import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/common/Layout';

// Lazy load pages for better performance
const Home = lazy(() => import('@/pages/Home'));
const Members = lazy(() => import('@/pages/Members'));
const MemberDetail = lazy(() => import('@/pages/MemberDetail'));
const Restaurants = lazy(() => import('@/pages/Restaurants'));
const RestaurantsCompare = lazy(() => import('@/pages/RestaurantsCompare'));
const Events = lazy(() => import('@/pages/Events'));
const Test = lazy(() => import('@/pages/Test'));

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
            <Route path="test" element={<Test />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;