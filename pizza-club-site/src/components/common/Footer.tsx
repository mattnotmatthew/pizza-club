import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto">
      <div className="container-custom">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Greater Chicagoland Pizza Club</p>
          <p className="text-gray-400 text-sm">
            © {currentYear} GCPC. All rights reserved. | Dedicated to the pursuit of perfect pizza.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;