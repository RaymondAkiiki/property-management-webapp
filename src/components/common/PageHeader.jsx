import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PageHeader component for displaying consistent headers across pages
 * 
 * @param {Object} props
 * @param {string} props.title - The main title of the page
 * @param {string} props.subtitle - Optional subtitle or description
 * @param {React.ReactNode} props.actions - Optional action buttons or elements
 * @param {string} props.backLink - Optional URL to navigate back to
 */
const PageHeader = ({ title, subtitle, actions, backLink }) => {
  return (
    <div className="mb-6 pb-4 border-b border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          {backLink && (
            <Link 
              to={backLink} 
              className="mr-3 text-gray-500 hover:text-blue-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          )}
          <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
        </div>
        
        {actions && (
          <div className="flex space-x-2">
            {actions}
          </div>
        )}
      </div>
      
      {subtitle && (
        <p className="text-gray-500">{subtitle}</p>
      )}
    </div>
  );
};

export default PageHeader;