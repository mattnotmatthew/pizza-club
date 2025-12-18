import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About GCPC' },
    { path: '/members', label: 'Members' },
    { path: '/restaurants', label: 'Restaurants' },
    { path: '/standings', label: 'Standings' },
    { path: '/infographics', label: 'Infographics' },
  ];
  
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block py-2 px-4 text-white hover:text-yellow-100 transition-colors ${
      isActive ? 'text-yellow-100 font-semibold' : ''
    }`;
  
  return (
    <header className="bg-checkered-border shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 bg-red-800/90 md:bg-transparent px-3 py-1 rounded-lg backdrop-blur-sm ml-4">
            <img 
              src="/logo.png" 
              alt="Greater Chicagoland Pizza Club Logo" 
              className="h-12 w-12 md:h-10 md:w-10 rounded-full shadow-md object-cover"
            />
            <span className="text-white font-bold text-xl md:text-2xl">GCPC</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white focus:outline-none bg-red-800/90 p-2 rounded-lg backdrop-blur-sm mr-4"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-yellow-100/20">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={navLinkClass}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;