/**
 * Admin Dashboard
 * Landing page for the admin area with stats, quick actions, and recent activity
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dataService } from '@/services/dataWithApi';
import type { Restaurant } from '@/types';
import type { Infographic } from '@/types/infographics';

interface DashboardStats {
  totalRestaurants: number;
  totalMembers: number;
  totalVisits: number;
  totalInfographics: number;
  draftInfographics: number;
  publishedInfographics: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentVisits, setRecentVisits] = useState<Array<{ restaurant: Restaurant; visitDate: string }>>([]);
  const [topRated, setTopRated] = useState<Restaurant[]>([]);
  const [draftInfos, setDraftInfos] = useState<Infographic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [restaurants, members, infographics] = await Promise.all([
        dataService.getRestaurants(),
        dataService.getMembers(),
        dataService.getInfographics(),
      ]);

      // Calculate stats
      const totalVisits = restaurants.reduce((acc, r) => acc + (r.visits?.length || 0), 0);
      const drafts = infographics.filter(i => i.status === 'draft');
      const published = infographics.filter(i => i.status === 'published');

      setStats({
        totalRestaurants: restaurants.length,
        totalMembers: members.length,
        totalVisits,
        totalInfographics: infographics.length,
        draftInfographics: drafts.length,
        publishedInfographics: published.length,
      });

      // Get recent visits (flatten and sort)
      const allVisits = restaurants.flatMap(r =>
        (r.visits || []).map(v => ({ restaurant: r, visitDate: v.date }))
      );
      allVisits.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
      setRecentVisits(allVisits.slice(0, 5));

      // Get top rated restaurants
      const rated = restaurants.filter(r => r.averageRating > 0);
      rated.sort((a, b) => b.averageRating - a.averageRating);
      setTopRated(rated.slice(0, 5));

      // Get draft infographics
      setDraftInfos(drafts.slice(0, 3));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome to the Pizza Club admin panel</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Restaurants"
            value={stats?.totalRestaurants || 0}
            icon="🍕"
            href="/admin/restaurants"
            color="bg-red-500"
          />
          <StatCard
            title="Members"
            value={stats?.totalMembers || 0}
            icon="👥"
            href="/admin/members"
            color="bg-blue-500"
          />
          <StatCard
            title="Total Visits"
            value={stats?.totalVisits || 0}
            icon="📍"
            color="bg-green-500"
          />
          <StatCard
            title="Infographics"
            value={stats?.totalInfographics || 0}
            subtitle={`${stats?.draftInfographics || 0} drafts`}
            icon="🎨"
            href="/admin/infographics"
            color="bg-purple-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction
              label="Add Restaurant"
              href="/admin/restaurants/new"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
            />
            <QuickAction
              label="New Infographic"
              href="/admin/infographics/new"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
            <QuickAction
              label="Add Member"
              href="/admin/members/new"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              }
            />
            <QuickAction
              label="Manage Links"
              href="/admin/links"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              }
            />
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Visits */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Visits</h2>
              <Link to="/admin/restaurants" className="text-sm text-red-600 hover:text-red-700">
                View all →
              </Link>
            </div>
            {recentVisits.length > 0 ? (
              <div className="space-y-3">
                {recentVisits.map((visit, index) => (
                  <Link
                    key={`${visit.restaurant.id}-${visit.visitDate}-${index}`}
                    to={`/admin/restaurants/${visit.restaurant.id}/visits`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">🍕</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-[180px]">
                          {visit.restaurant.name}
                        </p>
                        <p className="text-sm text-gray-500">{visit.restaurant.location}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">
                      {new Date(visit.visitDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No visits recorded yet</p>
            )}
          </div>

          {/* Top Rated */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Top Rated</h2>
              <Link to="/standings" className="text-sm text-red-600 hover:text-red-700">
                Standings →
              </Link>
            </div>
            {topRated.length > 0 ? (
              <div className="space-y-3">
                {topRated.map((restaurant, index) => (
                  <Link
                    key={restaurant.id}
                    to={`/admin/restaurants/edit/${restaurant.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-amber-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-amber-700' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-[180px]">
                          {restaurant.name}
                        </p>
                        <p className="text-sm text-gray-500">{restaurant.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{restaurant.averageRating.toFixed(2)}</span>
                      <span className="text-gray-400 text-sm"> / 5</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No rated restaurants yet</p>
            )}
          </div>
        </div>

        {/* Draft Infographics Alert */}
        {draftInfos.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">📝</span>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900">Draft Infographics</h3>
                <p className="text-amber-700 text-sm mt-1">
                  You have {draftInfos.length} infographic{draftInfos.length !== 1 ? 's' : ''} waiting to be published.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {draftInfos.map(info => (
                    <Link
                      key={info.id}
                      to={`/admin/infographics/edit/${info.id}`}
                      className="inline-flex items-center px-3 py-1 bg-white border border-amber-300 rounded-full text-sm text-amber-800 hover:bg-amber-100 transition-colors"
                    >
                      {info.content?.title || 'Untitled'}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: string;
  href?: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, href, color }) => {
  const content = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow h-[120px]">
      <div className="flex items-center justify-between h-full">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-sm text-gray-400 mt-1 h-5">{subtitle || ''}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return href ? <Link to={href}>{content}</Link> : content;
};

// Quick Action Component
interface QuickActionProps {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const QuickAction: React.FC<QuickActionProps> = ({ label, href, icon }) => (
  <Link
    to={href}
    className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors group"
  >
    <div className="text-gray-400 group-hover:text-red-500 transition-colors">
      {icon}
    </div>
    <span className="mt-2 text-sm font-medium text-gray-600 group-hover:text-red-600">
      {label}
    </span>
  </Link>
);

export default AdminDashboard;
