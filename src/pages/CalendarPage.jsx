// pages/CalendarPage.jsx
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { toast } from 'react-toastify';
import EventModal from '../components/calendar/EventModal';
import EventDetailModal from '../components/calendar/EventDetailModal';
import CalendarFilters from '../components/calendar/CalendarFilters';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../services/calendarService';

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filters, setFilters] = useState({
    eventType: 'all',
    propertyId: '',
    showCompleted: true
  });

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents(filters);
      setEvents(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch events');
      setLoading(false);
    }
  };

  const handleDateClick = (info) => {
    setSelectedDate(info.date);
    setShowEventModal(true);
  };

  const handleEventClick = (info) => {
    setSelectedEvent(info.event.extendedProps);
    setShowDetailModal(true);
  };

  const handleEventCreate = async (eventData) => {
    try {
      const newEvent = await createEvent(eventData);
      setEvents([...events, newEvent]);
      toast.success('Event created successfully');
      setShowEventModal(false);
    } catch (error) {
      toast.error('Failed to create event');
    }
  };

  const handleEventUpdate = async (eventData) => {
    try {
      const updatedEvent = await updateEvent(eventData);
      setEvents(events.map(event => event._id === updatedEvent._id ? updatedEvent : event));
      toast.success('Event updated successfully');
      setShowDetailModal(false);
    } catch (error) {
      toast.error('Failed to update event');
    }
  };

  const handleEventDelete = async (eventId) => {
    try {
      await deleteEvent(eventId);
      setEvents(events.filter(event => event._id !== eventId));
      toast.success('Event deleted successfully');
      setShowDetailModal(false);
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  // Convert our events to FullCalendar format
  const formattedEvents = events.map(event => ({
    id: event._id,
    title: event.title,
    start: new Date(event.startDate),
    end: new Date(event.endDate),
    allDay: event.allDay,
    backgroundColor: getEventColor(event.type),
    borderColor: getEventColor(event.type),
    extendedProps: event
  }));

  function getEventColor(type) {
    const colors = {
      rent: '#4CAF50', // green
      lease: '#2196F3', // blue
      maintenance: '#FF9800', // orange
      inspection: '#9C27B0', // purple
      meeting: '#795548', // brown
      reminder: '#607D8B', // blue-grey
      other: '#9E9E9E', // grey
    };
    return colors[type] || colors.other;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Calendar & Scheduling</h1>
        <button
          onClick={() => {
            setSelectedDate(new Date());
            setShowEventModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Add New Event
        </button>
      </div>

      <CalendarFilters filters={filters} onFilterChange={handleFilterChange} />

      <div className="bg-white rounded-lg shadow-md p-4 mt-6">
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={formattedEvents}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            height="auto"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
          />
        )}
      </div>

      {showEventModal && (
        <EventModal
          isOpen={showEventModal}
          onClose={() => setShowEventModal(false)}
          onSave={handleEventCreate}
          selectedDate={selectedDate}
        />
      )}

      {showDetailModal && selectedEvent && (
        <EventDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          event={selectedEvent}
          onUpdate={handleEventUpdate}
          onDelete={handleEventDelete}
        />
      )}
    </div>
  );
};

export default CalendarPage;

// components/calendar/EventModal.jsx
import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FiX } from 'react-icons/fi';
import { useProperties } from '../../hooks/useProperties';
import { useTenants } from '../../hooks/useTenants';

const EventModal = ({ isOpen, onClose, onSave, selectedDate, event = null }) => {
  const { properties } = useProperties();
  const { tenants } = useTenants();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'reminder',
    startDate: selectedDate || new Date(),
    endDate: selectedDate || new Date(),
    allDay: true,
    propertyId: '',
    tenantId: '',
    notifications: true,
    notificationTime: '1h'
  });

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate)
      });
    }
  }, [event]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleStartDateChange = (date) => {
    setFormData({
      ...formData,
      startDate: date,
      endDate: date > formData.endDate ? date : formData.endDate
    });
  };

  const handleEndDateChange = (date) => {
    setFormData({
      ...formData,
      endDate: date
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const eventTypes = [
    { value: 'rent', label: 'Rent Due' },
    { value: 'lease', label: 'Lease Event' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'reminder', label: 'Reminder' },
    { value: 'other', label: 'Other' }
  ];

  const notificationOptions = [
    { value: '0m', label: 'At time of event' },
    { value: '15m', label: '15 minutes before' },
    { value: '30m', label: '30 minutes before' },
    { value: '1h', label: '1 hour before' },
    { value: '3h', label: '3 hours before' },
    { value: '1d', label: '1 day before' },
    { value: '2d', label: '2 days before' },
    { value: '1w', label: '1 week before' }
  ];

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-medium">
              {event ? 'Edit Event' : 'Add New Event'}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500">
              <FiX className="h-5 w-5" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Event Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {eventTypes.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <DatePicker
                selected={formData.startDate}
                onChange={handleStartDateChange}
                showTimeSelect
                dateFormat="Pp"
                className="mt-1 w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <DatePicker
                selected={formData.endDate}
                onChange={handleEndDateChange}
                showTimeSelect
                dateFormat="Pp"
                className="mt-1 w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="allDay"
              checked={formData.allDay}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label className="text-sm text-gray-700">All Day Event</label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Property</label>
            <select
              name="propertyId"
              value={formData.propertyId}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
            >
              <option value="">-- Select Property --</option>
              {properties.map((property) => (
                <option key={property._id} value={property._id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tenant (optional)</label>
            <select
              name="tenantId"
              value={formData.tenantId}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
            >
              <option value="">-- Select Tenant --</option>
              {tenants.map((tenant) => (
                <option key={tenant._id} value={tenant._id}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="notifications"
              checked={formData.notifications}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label className="text-sm text-gray-700">Enable Notifications</label>
          </div>

          {formData.notifications && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Notify Me</label>
              <select
                name="notificationTime"
                value={formData.notificationTime}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
              >
                {notificationOptions.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              {event ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Dialog>
);
};

export default EventModal;


// // src/pages/CalendarPage.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { Calendar, momentLocalizer } from 'react-big-calendar';
// import moment from 'moment';
// import 'react-big-calendar/lib/css/react-big-calendar.css';
// import CalendarToolbar from '../components/calendar/CalendarToolbar';
// import EventModal from '../components/calendar/EventModal';
// import { toast } from 'react-toastify';
// import {
//   getAllEvents,
//   createEvent,
//   updateEvent,
//   deleteEvent
// } from '../services/eventService';
// import { useNavigate } from 'react-router-dom';

// // Setup the localizer for react-big-calendar
// const localizer = momentLocalizer(moment);

// const CalendarPage = () => {
//   const [events, setEvents] = useState([]);
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [view, setView] = useState('month');
//   const [date, setDate] = useState(new Date());
//   const navigate = useNavigate();

//   // Event colors based on type
//   const eventTypeColors = {
//     maintenance: '#F97316', // Orange
//     inspection: '#3B82F6', // Blue
//     lease: '#10B981', // Green
//     payment: '#EC4899', // Pink
//     other: '#8B5CF6', // Purple
//     meeting: '#6366F1', // Indigo
//   };

//   // Fetch events from API
//   const fetchEvents = useCallback(async () => {
//     try {
//       const fetchedEvents = await getAllEvents();
//       // Transform the events to format expected by react-big-calendar
//       const formattedEvents = fetchedEvents.map(event => ({
//         id: event._id,
//         title: event.title,
//         start: new Date(event.startDate),
//         end: new Date(event.endDate),
//         allDay: event.allDay,
//         type: event.eventType,
//         relatedTo: event.relatedTo,
//         notes: event.notes,
//         location: event.location,
//         status: event.status,
//         notifications: event.notifications,
//       }));
//       setEvents(formattedEvents);
//     } catch (error) {
//       toast.error('Failed to load calendar events');
//       console.error(error);
//     }
//   }, []);

//   useEffect(() => {
//     fetchEvents();
//   }, [fetchEvents]);

//   const handleSelectSlot = ({ start, end }) => {
//     setSelectedEvent({
//       start,
//       end,
//       allDay: false,
//       title: '',
//       type: 'other',
//       relatedTo: '',
//       notes: '',
//       location: '',
//       status: 'scheduled',
//       notifications: [],
//     });
//     setIsModalOpen(true);
//   };

//   const handleSelectEvent = (event) => {
//     setSelectedEvent(event);
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setSelectedEvent(null);
//     setIsModalOpen(false);
//   };

//   const handleAddEvent = () => {
//     const start = new Date();
//     const end = new Date(start);
//     end.setHours(end.getHours() + 1);
    
//     setSelectedEvent({
//       start,
//       end,
//       allDay: false,
//       title: '',
//       type: 'other',
//       relatedTo: '',
//       notes: '',
//       location: '',
//       status: 'scheduled',
//       notifications: [],
//     });
//     setIsModalOpen(true);
//   };

//   const handleSaveEvent = async (eventData) => {
//     try {
//       if (eventData.id) {
//         // Update existing event
//         await updateEvent(eventData.id, {
//           title: eventData.title,
//           startDate: eventData.start,
//           endDate: eventData.end,
//           allDay: eventData.allDay,
//           eventType: eventData.type,
//           relatedTo: eventData.relatedTo,
//           notes: eventData.notes,
//           location: eventData.location,
//           status: eventData.status,
//           notifications: eventData.notifications,
//         });
//         toast.success('Event updated successfully');
//       } else {
//         // Create new event
//         await createEvent({
//           title: eventData.title,
//           startDate: eventData.start,
//           endDate: eventData.end,
//           allDay: eventData.allDay,
//           eventType: eventData.type,
//           relatedTo: eventData.relatedTo,
//           notes: eventData.notes,
//           location: eventData.location,
//           status: eventData.status,
//           notifications: eventData.notifications,
//         });
//         toast.success('Event created successfully');
//       }
//       // Refresh events
//       fetchEvents();
//       handleCloseModal();
//     } catch (error) {
//       toast.error(error.message || 'Failed to save event');
//       console.error(error);
//     }
//   };

//   const handleDeleteEvent = async (id) => {
//     try {
//       await deleteEvent(id);
//       toast.success('Event deleted successfully');
//       fetchEvents();
//       handleCloseModal();
//     } catch (error) {
//       toast.error(error.message || 'Failed to delete event');
//       console.error(error);
//     }
//   };

//   const handleNavigate = (action) => {
//     const newDate = new Date(date);
    
//     switch (action) {
//       case 'PREV':
//         if (view === 'month') {
//           newDate.setMonth(date.getMonth() - 1);
//         } else if (view === 'week') {
//           newDate.setDate(date.getDate() - 7);
//         } else if (view === 'day') {
//           newDate.setDate(date.getDate() - 1);
//         }
//         break;
//       case 'NEXT':
//         if (view === 'month') {
//           newDate.setMonth(date.getMonth() + 1);
//         } else if (view === 'week') {
//           newDate.setDate(date.getDate() + 7);
//         } else if (view === 'day') {
//           newDate.setDate(date.getDate() + 1);
//         }
//         break;
//       case 'TODAY':
//         return setDate(new Date());
//       default:
//         return;
//     }
//     setDate(newDate);
//   };

//   // Custom event styling
//   const eventStyleGetter = (event) => {
//     const backgroundColor = eventTypeColors[event.type] || eventTypeColors.other;
//     return {
//       style: {
//         backgroundColor,
//         borderRadius: '4px',
//         color: 'white',
//         border: 'none',
//         display: 'block'
//       }
//     };
//   };

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Calendar</h1>
//       </div>

//       <div className="bg-white rounded-lg shadow p-6">
//         <CalendarToolbar 
//           date={date}
//           onNavigate={handleNavigate}
//           onView={setView}
//           view={view}
//           onAddEvent={handleAddEvent}
//         />
        
//         <div className="h-screen max-h-[75vh]">
//           <Calendar
//             localizer={localizer}
//             events={events}
//             startAccessor="start"
//             endAccessor="end"
//             selectable
//             onSelectSlot={handleSelectSlot}
//             onSelectEvent={handleSelectEvent}
//             view={view}
//             onView={setView}
//             date={date}
//             onNavigate={setDate}
//             eventPropGetter={eventStyleGetter}
//             defaultView="month"
//             views={['month', 'week', 'day', 'agenda']}
//             step={60}
//             showMultiDayTimes
//             components={{
//               toolbar: () => null // We're using our custom toolbar
//             }}
//           />
//         </div>
//       </div>

//       {isModalOpen && (
//         <EventModal
//           isOpen={isModalOpen}
//           onClose={handleCloseModal}
//           event={selectedEvent}
//           onSave={handleSaveEvent}
//           onDelete={selectedEvent?.id ? handleDeleteEvent : null}
//         />
//       )}
//     </div>
//   );
// };

// export default CalendarPage;