// src/components/layout/AppLayout.js
import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const AppLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation links
  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: 'grid' },
    { name: 'Properties', path: '/properties', icon: 'home' },
    { name: 'Tenants', path: '/tenants', icon: 'users' },
    { name: 'Rent', path: '/rent', icon: 'dollar-sign' },
    { name: 'Maintenance', path: '/maintenance', icon: 'tool' },
    { name: 'Documents', path: '/documents', icon: 'file-text' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Icon component - using Feather icons via className
  const Icon = ({ name }) => (
    <i className={`feather feather-${name} h-5 w-5`}></i>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b border-gray-200">
            <Link to="/dashboard" className="text-xl font-bold text-blue-600">
              PropertyPro
            </Link>
          </div>
          
          {/* Navigation */}
          <div className="flex flex-col flex-grow p-4">
            <nav className="flex-1 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center px-4 py-2 rounded-md ${
                    location.pathname === link.path
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon name={link.icon} />
                  <span className="ml-3">{link.name}</span>
                </Link>
              ))}
            </nav>
            
            {/* User section */}
            <div className="mt-auto pt-4 border-t border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                  <button 
                    onClick={handleLogout}
                    className="text-xs font-medium text-gray-500 hover:text-red-500"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile nav & content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top header (mobile) */}
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 flex items-center justify-between border-b border-gray-200 bg-white">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 focus:outline-none"
          >
            <span className="sr-only">Open menu</span>
            <Icon name={isMobileMenuOpen ? 'x' : 'menu'} />
          </button>
          <div className="pr-4">
            <Link to="/dashboard" className="text-xl font-bold text-blue-600">
              PropertyPro
            </Link>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === link.path
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon name={link.icon} />
                  <span className="ml-3">{link.name}</span>
                </Link>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-700">{user?.name}</p>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-sm font-medium text-gray-500 hover:text-red-500"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;