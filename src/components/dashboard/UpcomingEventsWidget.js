/**
 * src/components/dashboard/UpcomingEventsWidget.js
 * Widget to display upcoming events like rent due dates, lease expirations, etc.
 */

import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Link } from 'react-router-dom';

const UpcomingEventsWidget = () => {
  const { upcomingEvents, loading } = useDashboard();

  // Function to get event type icon and color
  const getEventTypeStyles = (eventType) => {
    switch (eventType) {
      case 'leaseExpiration':
        return {
          icon: 'calendar-x',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-300'
        };
      case 'payment':
        return {
          icon: 'dollar-sign',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-300'
        };
      case 'maintenance':
        return {
          icon: 'tool',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-300'
        };
      default:
        return {
          icon: 'alert-circle',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-300'
        };
    }
  };

  // Function to get the appropriate route based on event type
  const getEventRoute = (event) => {
    switch (event.type) {
      case 'leaseExpiration':
        return `/tenants/${event.relatedId}`;
      case 'payment':
        return `/payments/${event.relatedId}`;
      case 'maintenance':
        return `/maintenance/${event.relatedId}`;
      default:
        return '#';
    }
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate days from now
  const getDaysFromNow = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(dateString);
    eventDate.setHours(0, 0, 0, 0);
    
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    return `In ${diffDays} days`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 h-64 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Upcoming Events</h3>
      
      {upcomingEvents && upcomingEvents.length > 0 ? (
        <div className="space-y-3">
          {upcomingEvents.slice(0, 5).map((event, index) => {
            const { bgColor, textColor, borderColor } = getEventTypeStyles(event.type);
            return (
              <Link 
                key={index} 
                to={getEventRoute(event)}
                className={`block p-3 rounded-lg border ${borderColor} ${bgColor} hover:bg-opacity-80 transition-colors`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className={`font-medium ${textColor}`}>{event.title}</h4>
                    <p className="text-sm text-gray-600">{event.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">{formatDate(event.date)}</span>
                    <p className="text-xs text-gray-500">{getDaysFromNow(event.date)}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          No upcoming events in the next 30 days.
        </div>
      )}
      
      {upcomingEvents && upcomingEvents.length > 5 && (
        <div className="mt-4 text-center">
          <Link 
            to="/calendar" 
            className="text-blue-500 hover:text-blue-700 text-sm font-medium"
          >
            View all {upcomingEvents.length} events
          </Link>
        </div>
      )}
    </div>
  );
};

export default UpcomingEventsWidget;