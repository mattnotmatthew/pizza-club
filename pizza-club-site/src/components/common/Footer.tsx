import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto">
      <div className="container-custom">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <img 
              src="/pizza/logo.png" 
              alt="Greater Chicagoland Pizza Club Logo" 
              className="h-8 w-8 object-contain"
            />
            <p className="text-lg font-semibold">Greater Chicagoland Pizza Club</p>
          </div>
          <p className="text-gray-400 text-sm">
            © {currentYear} GCPC. All rights reserved. | Dedicated to the pursuit of perfect pizza.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;