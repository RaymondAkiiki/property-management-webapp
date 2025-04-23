// src/components/calendar/CalendarToolbar.jsx
import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  List, 
  Plus 
} from 'lucide-react';

const CalendarToolbar = ({ 
  date, 
  onNavigate, 
  onView, 
  view, 
  onAddEvent 
}) => {
  const [viewOptions] = useState([
    { label: 'Month', value: 'month' },
    { label: 'Week', value: 'week' },
    { label: 'Day', value: 'day' },
    { label: 'Agenda', value: 'agenda' }
  ]);

  const goToToday = () => {
    onNavigate('TODAY');
  };

  const goToBack = () => {
    onNavigate('PREV');
  };

  const goToNext = () => {
    onNavigate('NEXT');
  };

  // Format the date as Month YYYY
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric'
  }).format(date);

  return (
    <div className="flex items-center justify-between mb-4 p-2 bg-white rounded-lg shadow">
      <div className="flex items-center gap-2">
        <button 
          onClick={goToBack}
          className="p-2 hover:bg-gray-100 rounded-full"
          aria-label="Previous"
        >
          <ChevronLeft size={20} />
        </button>
        <button 
          onClick={goToToday}
          className="px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-md"
        >
          Today
        </button>
        <button 
          onClick={goToNext}
          className="p-2 hover:bg-gray-100 rounded-full"
          aria-label="Next"
        >
          <ChevronRight size={20} />
        </button>
        <h2 className="text-xl font-semibold ml-2">{formattedDate}</h2>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {viewOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onView(option.value)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                view === option.value 
                  ? 'bg-white text-blue-600 shadow' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <button
          onClick={onAddEvent}
          className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add Event
        </button>
      </div>
    </div>
  );
};

export default CalendarToolbar;