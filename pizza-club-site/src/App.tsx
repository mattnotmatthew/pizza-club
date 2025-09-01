import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/common/Layout';
import AdminRoute from '@/components/admin/AdminRoute';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

// Lazy load pages for better performance
const Home = lazy(() => import('@/pages/Home'));
const About = lazy(() => import('@/pages/About'));
const Members = lazy(() => import('@/pages/Members'));
const MemberDetail = lazy(() => import('@/pages/MemberDetail'));
const Restaurants = lazy(() => import('@/pages/Restaurants'));
const RestaurantDetail = lazy(() => import('@/pages/RestaurantDetail'));
const RestaurantsCompare = lazy(() => import('@/pages/RestaurantsCompare'));
const Events = lazy(() => import('@/pages/Events'));
const Links = lazy(() => import('@/pages/Links'));
const Test = lazy(() => import('@/pages/Test'));
const Infographics = lazy(() => import('@/pages/Infographics'));
const InfographicView = lazy(() => import('@/pages/InfographicView'));

// Admin pages
const AdminLayout = lazy(() => import('@/components/admin/AdminLayout'));
const InfographicsList = lazy(() => import('@/pages/admin/InfographicsList'));
const InfographicsEditor = lazy(() => import('@/pages/admin/InfographicsEditor'));
const EventsList = lazy(() => import('@/pages/admin/EventsList'));
const EventsEditor = lazy(() => import('@/pages/admin/EventsEditor'));
const MembersList = lazy(() => import('@/pages/admin/MembersList'));
const MembersEditor = lazy(() => import('@/pages/admin/MembersEditor'));
const RestaurantsList = lazy(() => import('@/pages/admin/RestaurantsList'));
const RestaurantsEditor = lazy(() => import('@/pages/admin/RestaurantsEditor'));
const RestaurantVisits = lazy(() => import('@/pages/admin/RestaurantVisits'));
const LinksList = lazy(() => import('@/pages/admin/LinksList'));
const LinksEditor = lazy(() => import('@/pages/admin/LinksEditor'));

// Loading component for Suspense fallback
const Loading: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Router basename="/pizza">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="members" element={<Members />} />
              <Route path="members/:id" element={<MemberDetail />} />
              <Route path="restaurants" element={<Restaurants />} />
              <Route path="restaurants/compare" element={<RestaurantsCompare />} />
              <Route path="restaurants/:slug" element={<RestaurantDetail />} />
              <Route path="events" element={<Events />} />
              <Route path="infographics" element={<Infographics />} />
              <Route path="infographics/:id" element={<InfographicView />} />
              <Route path="test" element={<Test />} />
            </Route>
            
            {/* Links page without navigation */}
            <Route path="links" element={<Links />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route path="infographics" element={<InfographicsList />} />
              <Route path="infographics/new" element={<InfographicsEditor />} />
              <Route path="infographics/edit/:id" element={<InfographicsEditor />} />
              <Route path="events" element={<EventsList />} />
              <Route path="events/new" element={<EventsEditor />} />
              <Route path="events/edit/:id" element={<EventsEditor />} />
              <Route path="members" element={<MembersList />} />
              <Route path="members/new" element={<MembersEditor />} />
              <Route path="members/edit/:id" element={<MembersEditor />} />
              <Route path="restaurants" element={<RestaurantsList />} />
              <Route path="restaurants/new" element={<RestaurantsEditor />} />
              <Route path="restaurants/edit/:id" element={<RestaurantsEditor />} />
              <Route path="restaurants/:id/visits" element={<RestaurantVisits />} />
              <Route path="links" element={<LinksList />} />
              <Route path="links/new" element={<LinksEditor />} />
              <Route path="links/edit/:id" element={<LinksEditor />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;