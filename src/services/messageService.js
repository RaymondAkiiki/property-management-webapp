// src/services/messageService.js
import axios from 'axios';
import { API_URL } from '../config/constants';

const MESSAGE_API = `${API_URL}/api/messages`;

// Get all conversations for the current user
export const getConversations = async () => {
  try {
    const response = await axios.get(`${MESSAGE_API}/conversations`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch conversations' };
  }
};

// Get all messages in a conversation
export const getMessages = async (conversationId) => {
  try {
    const response = await axios.get(`${MESSAGE_API}/conversations

