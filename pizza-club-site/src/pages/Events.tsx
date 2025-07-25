import React from 'react';

const Events: React.FC = () => {
  return (
    <div className="min-h-screen py-12 md:py-16">
      <div className="container-custom">
        <h1 className="text-4xl font-bold mb-8 text-center">Club Events</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <p className="col-span-full text-center text-gray-600">Events loading...</p>
        </div>
      </div>
    </div>
  );
};

export default Events;