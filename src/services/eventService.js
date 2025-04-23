// src/services/eventService.js
import axios from 'axios';
import { API_URL } from '../config/constants';

const EVENT_API = `${API_URL}/api/events`;

export const getAllEvents = async () => {
  try {
    const response = await axios.get(EVENT_API, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch events' };
  }
};

export const getEventsByDateRange = async (startDate, endDate) => {
  try {
    const response = await axios.get(`${EVENT_API}/range`, {
      params: { startDate, endDate },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch events by date range' };
  }
};

export const getEventById = async (id) => {
  try {
    const response = await axios.get(`${EVENT_API}/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch event' };
  }
};

export const createEvent = async (eventData) => {
  try {
    const response = await axios.post(EVENT_API, eventData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create event' };
  }
};

export const updateEvent = async (id, eventData) => {
  try {
    const response = await axios.put(`${EVENT_API}/${id}`, eventData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update event' };
  }
};

export const deleteEvent = async (id) => {
  try {
    const response = await axios.delete(`${EVENT_API}/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete event' };
  }
};

export const getEventsByType = async (eventType) => {
  try {
    const response = await axios.get(`${EVENT_API}/type/${eventType}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch events by type' };
  }
};