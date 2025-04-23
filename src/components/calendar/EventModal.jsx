// src/components/calendar/EventModal.jsx
import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { format } from 'date-fns';
import { createEvent, updateEvent, deleteEvent } from '../../services/eventService';
import { getProperties } from '../../services/propertyService';
import { getTenants } from '../../services/tenantService';
import { toast } from 'react-toastify';

const EventModal = ({ event, isOpen, onClose, onSave, isNew }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'appointment',
    startDate: new Date(),
    endDate: new Date(),
    allDay: false,
    location: '',
    propertyId: '',
    tenantId: '',
    maintenanceTicketId: '',
    notifications: [{ type: 'in-app', time: 30 }],
    isRecurring: false,
    recurringPattern: {
      frequency: 'monthly',
      interval: 1,
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3))
    }
  });
  
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Load reference data
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [propertiesRes, tenantsRes] = await Promise.all([
          getProperties(),
          getTenants()
        ]);
        
        setProperties(propertiesRes.data);
        setTenants(tenantsRes.data);
      } catch (error) {
        console.error('Error loading reference data:', error);
        toast.error('Error loading properties and tenants');
      }
    };
    
    loadReferenceData();
  }, []);
  
  // Set form data when event changes
  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        startDate: event.startDate || new Date(),
        endDate: event.endDate || new Date(),
        propertyId: event.propertyId?._id || event.propertyId || '',
        tenantId: event.tenantId?._id || event.tenantId || '',
        maintenanceTicketId: event.maintenanceTicketId?._id || event.maintenanceTicketId || '',
        notifications: event.notifications || [{ type: 'in-app', time: 30 }],
        isRecurring: event.isRecurring || false,
        recurringPattern: event.recurringPattern || {
          frequency: 'monthly',
          interval: 1,
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 3))
        }
      });
    }
  }, [event]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties (e.g., recurringPattern.frequency)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      // Handle direct properties
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };
  
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: new Date(value)
    }));
  };
  
  const handleNotificationChange = (index, field, value) => {
    const updatedNotifications = [...formData.notifications];
    updatedNotifications[index][field] = value;
    
    setFormData(prev => ({
      ...prev,
      notifications: updatedNotifications
    }));
  };
  
  const addNotification = () => {
    setFormData(prev => ({
      ...prev,
      notifications: [...prev.notifications, { type: 'in-app', time: 30 }]
    }));
  };
  
  const removeNotification = (index) => {
    const updatedNotifications = [...formData.notifications];
    updatedNotifications.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      notifications: updatedNotifications
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isNew) {
        await createEvent(formData);
      } else {
        await updateEvent(event._id, formData);
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setLoading(true);
      
      try {
        await deleteEvent(event._id);
        toast.success('Event deleted successfully');
        onClose();
        onSave();
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      } finally {
        setLoading(false);
      }
    }
  };
  
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  {isNew ? 'Create New Event' : 'Edit Event'}
                </Dialog.Title>
                
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* Event Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Event Type</label>
                    <select
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="rent-due">Rent Due</option>
                      <option value="lease-expiration">Lease Expiration</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="appointment">Appointment</option>
                      <option value="reminder">Reminder</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Date</label>
                      <input
                        type="datetime-local"
                        name="startDate"
                        value={format(new Date(formData.startDate), "yyyy-MM-dd'T'HH:mm")}
                        onChange={handleDateChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">End Date</label>
                      <input
                        type="datetime-local"
                        name="endDate"
                        value={format(new Date(formData.endDate), "yyyy-MM-dd'T'HH:mm")}
                        onChange={handleDateChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* All Day */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="allDay"
                      checked={formData.allDay}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700">All Day Event</label>
                  </div>
                  
                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* Property */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Property</label>
                    <select
                      name="propertyId"
                      value={formData.propertyId}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select Property</option>
                      {properties.map((property) => (
                        <option key={property._id} value={property._id}>
                          {property.name || property.address}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Tenant */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tenant</label>
                    <select
                      name="tenantId"
                      value={formData.tenantId}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select Tenant</option>
                      {tenants.map((tenant) => (
                        <option key={tenant._id} value={tenant._id}>
                          {tenant.firstName} {tenant.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Recurring Event */}
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isRecurring"
                        checked={formData.isRecurring}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label className="ml-2 block text-sm text-gray-700">Recurring Event</label>
                    </div>
                    
                    {formData.isRecurring && (
                        <div className="ml-6 space-y-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Frequency</label>
                            <select
                              name="recurringPattern.frequency"
                              value={formData.recurringPattern.frequency}
                              onChange={handleChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                              <option value="yearly">Yearly</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Every {formData.recurringPattern.interval} {formData.recurringPattern.frequency.slice(0, -2)}(s)
                            </label>
                            <input
                              type="number"
                              name="recurringPattern.interval"
                              value={formData.recurringPattern.interval}
                              onChange={handleChange}
                              min="1"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">End Date</label>
                            <input
                              type="date"
                              name="recurringPattern.endDate"
                              value={format(new Date(formData.recurringPattern.endDate), "yyyy-MM-dd")}
                              onChange={handleDateChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Notifications */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Notifications</label>
                      
                      {formData.notifications.map((notification, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <select
                            value={notification.type}
                            onChange={(e) => handleNotificationChange(index, 'type', e.target.value)}
                            className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="email">Email</option>
                            <option value="in-app">In-App</option>
                            <option value="sms">SMS</option>
                          </select>
                          
                          <input
                            type="number"
                            value={notification.time}
                            onChange={(e) => handleNotificationChange(index, 'time', e.target.value)}
                            min="1"
                            className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          
                          <span className="text-sm text-gray-500">minutes before</span>
                          
                          {formData.notifications.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeNotification(index)}
                              className="rounded-full bg-red-100 p-1 text-red-600 hover:bg-red-200"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={addNotification}
                        className="mt-2 inline-flex items-center rounded-md border border-transparent bg-blue-100 px-2 py-1 text-sm font-medium text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Notification
                      </button>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-between">
                      <div>
                        {!isNew && (
                          <button
                            type="button"
                            onClick={handleDelete}
                            className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            disabled={loading}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={onClose}
                          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          disabled={loading}
                        >
                          {loading ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    );
  };
  
  export default EventModal;