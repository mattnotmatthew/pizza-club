/**
 * Magazine Page 1
 * Header, hero image, overall rating, roll call, and pizza orders
 */

import React from 'react';
import CircularRatingBadge from './CircularRatingBadge';
import RollCallDisplay from './RollCallDisplay';
import PizzaOrderDisplay from './PizzaOrderDisplay';
import type { MagazineData } from '@/hooks/useMagazineData';

interface MagazinePage1Props {
  restaurantName: string;
  address: string;
  visitDate: string;
  heroImage?: string;
  magazineData: MagazineData;
}

const MagazinePage1: React.FC<MagazinePage1Props> = ({
  restaurantName,
  address,
  visitDate,
  heroImage,
  magazineData
}) => {
  return (
    <div className="bg-white">
      {/* Header Section */}
      <div className="bg-[#D4C5B0] px-8 py-6">
        <div className="flex items-center gap-6">
          {/* Logo placeholder - circular badge */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-white border-4 border-gray-800 flex items-center justify-center overflow-hidden">
              <div className="text-center text-xs font-bold text-gray-900">
                greater<br />chicago<br />land<br />pizzaclub
              </div>
            </div>
          </div>

          {/* Restaurant Name */}
          <div className="flex-1">
            <h1
              className="text-5xl font-bold uppercase leading-tight"
              style={{ fontFamily: 'serif' }}
            >
              {restaurantName}
            </h1>
          </div>
        </div>

        {/* Address and Date */}
        <div className="mt-4 text-right text-sm">
          <p className="text-gray-800">{address}</p>
          <p className="text-gray-800 font-medium">
            {new Date(visitDate).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Hero Image */}
      {heroImage && (
        <div className="w-full h-64 overflow-hidden">
          <img
            src={heroImage}
            alt={restaurantName}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Overall Rating Section */}
      {magazineData.overallRating && (
        <div className="bg-[#F4E4C1] py-8 px-8">
          <h2
            className="text-center text-5xl font-bold text-[#C41E3A] mb-4 uppercase"
            style={{ fontFamily: 'serif' }}
          >
            Overall
          </h2>
          <div className="flex justify-center mb-4">
            <CircularRatingBadge
              rating={magazineData.overallRating}
              size="large"
              color="yellow"
            />
          </div>
          <p className="text-center text-gray-800 text-lg max-w-2xl mx-auto">
            Based on the overall experience including pizza, atmosphere, wait staff, and appetizers.
          </p>
        </div>
      )}

      {/* Roll Call Section */}
      <RollCallDisplay
        membersCount={magazineData.attendance.membersCount}
        absenteesCount={magazineData.attendance.absenteesCount}
        billsCount={magazineData.attendance.billsCount}
      />

      {/* The Order Section */}
      {magazineData.pizzaOrders.length > 0 && (
        <div className="bg-[#F4E4C1] py-8 px-8">
          <h2
            className="text-center text-5xl font-bold text-[#C41E3A] mb-6 uppercase"
            style={{ fontFamily: 'serif' }}
          >
            The Order
          </h2>

          <div className="space-y-4">
            {magazineData.pizzaOrders.map((pizza, index) => (
              <PizzaOrderDisplay
                key={index}
                displayName={pizza.displayName}
                rating={pizza.rating}
                toppings={pizza.toppings}
                size={pizza.size}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pizza Overall Rating */}
      {magazineData.pizzaOverallRating && (
        <div className="bg-[#C41E3A] py-6 px-8 flex items-center justify-between">
          <h2
            className="text-4xl font-bold text-[#F4E4C1] uppercase"
            style={{ fontFamily: 'serif' }}
          >
            Pizza Overall
          </h2>
          <CircularRatingBadge
            rating={magazineData.pizzaOverallRating}
            size="medium"
            color="yellow"
          />
        </div>
      )}
    </div>
  );
};

export default MagazinePage1;
