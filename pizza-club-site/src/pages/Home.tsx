import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/common/Button';

const Home: React.FC = () => {
  // Calculate responsive background size and position
  const getBackgroundStyles = () => {
    if (typeof window === 'undefined') {
      return {
        size: 'auto 70vh',
        position: 'center center'
      };
    }
    
    const width = window.innerWidth;
    if (width < 768) {
      // Mobile - smaller size, centered
      return {
        size: 'auto 60vh',
        position: 'center center'
      };
    } else if (width < 1024) {
      // Tablet
      return {
        size: 'auto 70vh',
        position: 'center center'
      };
    } else {
      // Desktop - centered
      return {
        size: 'auto 70vh',
        position: 'center center'
      };
    }
  };

  const bgStyles = getBackgroundStyles();

  // Background style for Cook County SVG
  const backgroundStyle: React.CSSProperties = {
    backgroundImage: 'url("/pizza/images/cook-county/cook-county.svg")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: bgStyles.position,
    backgroundSize: bgStyles.size,
    backgroundAttachment: 'fixed'
  };

  return (
    <div className="min-h-screen bg-red-700 text-white relative" style={backgroundStyle}>
      <section className="min-h-screen flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center ml-9 lg:ml-14 lg:mb-14">
            <img 
              src="/pizza/logo.png" 
              alt="Greater Chicagoland Pizza Club Logo" 
              className="h-60 w-60 md:h-60 md:w-60 lg:h-100 lg:w-100 object-cover"
            />
            <h1 className="text-4xl md:text-6xl font-bold text-center mb-6 animate-fade-in">
              Greater Chicagoland Pizza Club
            </h1>
            <div className="flex justify-center mb-12">
              <p className="text-xl md:text-2xl text-center text-yellow-100 tracking-wide animate-typewriter">
                Nella pizza, il volto di Dio.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8 animate-fade-in-delay">
              <Link to="/members" className="w-full sm:w-auto">
                <Button 
                  size="large" 
                  className="w-full sm:w-[220px] bg-transparent text-white hover:bg-white hover:text-red-700 border-2 border-white transition-all cursor-pointer"
                >
                  Explore Members
                </Button>
              </Link>
              <Link to="/restaurants" className="w-full sm:w-auto">
                <Button 
                  size="large" 
                  className="w-full sm:w-[220px] bg-transparent text-white hover:bg-white hover:text-red-700 border-2 border-white transition-all cursor-pointer"
                >
                  Restaurants
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