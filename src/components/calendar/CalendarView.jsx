// src/components/calendar/CalendarView.jsx
import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom';
import { getEvents } from '../../services/eventService';
import EventModal from './EventModal';
import CalendarToolbar from './CalendarToolbar';
import { toast } from 'react-toastify';

// Setup localizer
const localizer = momentLocalizer(moment);

// Event style customization based on event type
const eventStyleGetter = (event) => {
  let backgroundColor = '#3174ad'; // default
  
  switch (event.eventType) {
    case 'rent-due':
      backgroundColor = '#28a745'; // green
      break;
    case 'lease-expiration':
      backgroundColor = '#dc3545'; // red
      break;
    case 'maintenance':
      backgroundColor = '#fd7e14'; // orange
      break;
    case 'appointment':
      backgroundColor = '#17a2b8'; // teal
      break;
    case 'reminder':
      backgroundColor = '#6c757d'; // gray
      break;
    default:
      backgroundColor = '#3174ad'; // blue
  }
  
  const style = {
    backgroundColor,
    borderRadius: '5px',
    opacity: 0.8,
    color: 'white',
    border: '0px',
    display: 'block'
  };
  
  return {
    style
  };
};

const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewEvent, setIsNewEvent] = useState(false);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [filters, setFilters] = useState({
    propertyId: '',
    tenantId: '',
    eventType: ''
  });
  
  const navigate = useNavigate();
  
  // Load events
  useEffect(() => {
    fetchEvents();
  }, [date, view, filters]);
  
  const fetchEvents = async () => {
    try {
      // Determine date range based on current view
      let startDate, endDate;
      
      if (view === 'month') {
        startDate = moment(date).startOf('month').subtract(7, 'days').toDate();
        endDate = moment(date).endOf('month').add(7, 'days').toDate();
      } else if (view === 'week') {
        startDate = moment(date).startOf('week').toDate();
        endDate = moment(date).endOf('week').toDate();
      } else if (view === 'day') {
        startDate = moment(date).startOf('day').toDate();
        endDate = moment(date).endOf('day').toDate();
      } else {
        startDate = moment(date).startOf('day').toDate();
        endDate = moment(date).add(30, 'days').endOf('day').toDate();
      }
      
      // Add any active filters
      const queryParams = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v)
        )
      };
      
      const response = await getEvents(queryParams);
      
      // Format events for the calendar
      const formattedEvents = response.data.map(event => ({
        ...event,
        start: new Date(event.startDate),
        end: new Date(event.endDate),
        title: event.title,
      }));
      
      setEvents(formattedEvents);
    } catch (error) {
      toast.error('Failed to load calendar events');
      console.error('Error fetching events:', error);
    }
  };
  
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setIsNewEvent(false);
    setIsModalOpen(true);
  };
  
  const handleSelectSlot = ({ start, end }) => {
    setSelectedEvent({
      title: '',
      description: '',
      eventType: 'appointment',
      startDate: start,
      endDate: end,
      allDay: start.getHours() === 0 && end.getHours() === 0,
      notifications: [{ type: 'in-app', time: 30 }]
    });
    setIsNewEvent(true);
    setIsModalOpen(true);
  };
  
  const handleViewChange = (newView) => {
    setView(newView);
  };
  
  const handleNavigate = (newDate) => {
    setDate(newDate);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };
  
  const onEventSaved = () => {
    closeModal();
    fetchEvents();
    toast.success('Event saved successfully');
  };
  
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };
  
  return (
    <div className="calendar-container h-full">
      <CalendarToolbar 
        onViewChange={handleFilterChange} 
        filters={filters} 
      />
      
      <div className="h-[calc(100vh-250px)]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          view={view}
          date={date}
          onView={handleViewChange}
          onNavigate={handleNavigate}
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day', 'agenda']}
          popup
          components={{
            event: (props) => (
              <div>
                <strong>{props.event.title}</strong>
                {props.event.propertyId && (
                  <div className="text-xs">{props.event.propertyId.name}</div>
                )}
              </div>
            )
          }}
        />
      </div>
      
      {isModalOpen && (
        <EventModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={onEventSaved}
          isNew={isNewEvent}
        />
      )}
    </div>
  );
};

export default CalendarView;