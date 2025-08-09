import React, { useState } from 'react';
import { useChicagoian } from '@/contexts/ChicagoianContext';
import TranslatedText from '@/components/common/TranslatedText';

const Home: React.FC = () => {
  const { toggleChicagoianMode, isChicagoianMode } = useChicagoian();
  const [showEasterEggHint, setShowEasterEggHint] = useState(false);

  // Handle double-click on logo
  const handleLogoDoubleClick = () => {
    toggleChicagoianMode();
    setShowEasterEggHint(false);
  };

  // Handle single click on logo for hint
  const handleLogoClick = () => {
    if (!isChicagoianMode) {
      setShowEasterEggHint(true);
      setTimeout(() => setShowEasterEggHint(false), 3000);
    }
  };

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
      // Mobile - contain to fit without cutting off, positioned higher
      return {
        size: 'contain',
        position: 'center 30%'
      };
    } else if (width < 1024) {
      // Tablet
      return {
        size: 'auto 98vh',
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
      {/* Easter egg hint */}
      {showEasterEggHint && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-sm animate-pulse z-10">
          Double-click da logo fer da real Chicago experience! 🏈
        </div>
      )}

      {/* Chicagoian mode indicator */}
      {isChicagoianMode && (
        <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold z-10 animate-bounce">
          🏈 DA BEARS! 🌭
        </div>
      )}

      <section className="min-h-screen flex items-center justify-center relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center ml-9 lg:ml-14 lg:mb-14">
            <img 
              src="/pizza/logo.png" 
              alt="Greater Chicagoland Pizza Club Logo" 
              className="h-60 w-60 md:h-60 md:w-60 lg:h-100 lg:w-100 object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
              onClick={handleLogoClick}
              onDoubleClick={handleLogoDoubleClick}
              title={showEasterEggHint ? "Double-click fer da Bears!" : ""}
            />
            <TranslatedText>
              <h1 className="text-4xl md:text-6xl font-bold text-center mb-6 animate-fade-in">
                Greater Chicagoland Pizza Club
              </h1>
            </TranslatedText>
            <div className="flex justify-center mb-12">
              <TranslatedText>
                <p className="text-xl md:text-2xl text-center text-yellow-100 tracking-wide animate-typewriter">
                  Nella pizza, il volto di Dio.
                </p>
              </TranslatedText>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;