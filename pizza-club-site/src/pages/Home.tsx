import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      <section className="bg-red-700 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-6">
            Greater Chicagoland Pizza Club
          </h1>
          <p className="text-xl md:text-2xl text-center text-yellow-100">
            Dedicated to finding and rating the best pizza in Chicagoland
          </p>
        </div>
      </section>
      
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center">Upcoming Events</h2>
          <p className="text-center text-gray-600">Events loading...</p>
        </div>
      </section>
      
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center">Recent Visits</h2>
          <p className="text-center text-gray-600">Recent visits loading...</p>
        </div>
      </section>
    </div>
  );
};

export default Home;