import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/common/Button';

const Home: React.FC = () => {

  return (
    <div className="min-h-screen bg-red-700 text-white">
      <section className="min-h-screen flex items-center justify-center py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">
            <div className="checkered-pizza-border shadow-xl mb-6 animate-rotate-slow">
              <img 
                src="/pizza/logo.png" 
                alt="Greater Chicagoland Pizza Club Logo" 
                className="h-45 w-45 md:h-60 md:w-60 lg:h-100 lg:w-100 object-cover"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-center mb-6 animate-fade-in">
              Greater Chicagoland Pizza Club
            </h1>
            <div className="flex justify-center mb-12">
              <p className="text-xl md:text-2xl text-center text-yellow-100 tracking-wide animate-typewriter">
                Nella pizza, il volto di Dio.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8 animate-fade-in-delay">
              <Link to="/members">
                <Button 
                  size="large" 
                  className="min-w-[200px] bg-transparent text-white hover:bg-white hover:text-red-700 border-2 border-white transition-all"
                >
                  Explore Members
                </Button>
              </Link>
              <Link to="/restaurants">
                <Button 
                  size="large" 
                  className="min-w-[200px] bg-transparent text-white hover:bg-white hover:text-red-700 border-2 border-white transition-all"
                >
                  Discover Restaurants
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;