import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ConversationList from '../components/communication/ConversationList';
import ConversationView from '../components/communication/ConversationView';
import UserSelector from '../components/communication/UserSelector';
import messageService from '../services/messageService';
import { BsPlus } from 'react-icons/bs';

const MessagingPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newMessageContent, setNewMessageContent] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch all conversations on component mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await messageService.getConversations();
        setConversations(data);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load conversations');
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Fetch current conversation when ID changes
  useEffect(() => {
    if (conversationId) {
      const fetchConversation = async () => {
        try {
          const data = await messageService.getConversation(conversationId);
          setCurrentConversation(data);
          
          // Mark conversation as read
          await messageService.markAsRead(conversationId);
          
          // Update the unread status in the conversation list
          setConversations(prevConversations => 
            prevConversations.map(conv => 
              conv._id === conversationId 
                ? { ...conv, unreadCount: 0 } 
                : conv
            )
          );
        } catch (error) {
          toast.error('Failed to load conversation');
          navigate('/messages');
        }
      };

      fetchConversation();
    } else {
      setCurrentConversation(null);
    }
  }, [conversationId, navigate]);

  const handleSendMessage = async (content) => {
    if (!conversationId || !content.trim()) return;

    try {
      const message = await messageService.sendMessage(conversationId, content);
      
      // Update current conversation with new message
      setCurrentConversation(prev => ({
        ...prev,
        messages: [...prev.messages, message]
      }));
      
      // Update conversations list to show latest message
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv._id === conversationId 
            ? { 
                ...conv, 
                lastMessage: {
                  content: content.substring(0, 30) + (content.length > 30 ? '...' : ''),
                  createdAt: new Date().toISOString()
                }
              } 
            : conv
        )
      );
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleCreateConversation = async (e) => {
    e.preventDefault();
    
    if (!selectedUser || !newMessageContent.trim()) {
      toast.error('Please select a user and enter a message');
      return;
    }

    try {
      const newConversation = await messageService.createConversation(
        selectedUser._id, 
        newMessageContent
      );
      
      // Add new conversation to list
      setConversations(prev => [newConversation, ...prev]);
      
      // Close modal and reset form
      setShowNewMessageModal(false);
      setNewMessageContent('');
      setSelectedUser(null);
      
      // Navigate to new conversation
      navigate(`/messages/${newConversation._id}`);
      
      toast.success('Conversation started successfully');
    } catch (error) {
      toast.error('Failed to start conversation');
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
        {/* Sidebar with conversations */}
        <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Messages</h2>
            <button 
              className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition"
              onClick={() => setShowNewMessageModal(true)}
            >
              <BsPlus className="text-xl" />
            </button>
          </div>
          
          <div className="overflow-y-auto h-full">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="w-8 h-8 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
              </div>
            ) : (
              <ConversationList 
                conversations={conversations} 
                currentConversationId={conversationId} 
              />
            )}
          </div>
        </div>
        
        {/* Main conversation area */}
        <div className="w-full md:w-2/3 flex flex-col">
          {currentConversation ? (
            <ConversationView 
              conversation={currentConversation} 
              onSendMessage={handleSendMessage} 
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p className="text-xl">Select a conversation or start a new one</p>
            </div>
          )}
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-xl font-semibold mb-4">New Message</h3>
            
            <form onSubmit={handleCreateConversation}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">To:</label>
                <UserSelector onUserSelect={handleSelectUser} />
                
                {selectedUser && (
                  <div className="mt-2 p-2 bg-blue-100 rounded-lg flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                      {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span>{selectedUser.name || selectedUser.email}</span>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Message:</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  value={newMessageContent}
                  onChange={(e) => setNewMessageContent(e.target.value)}
                  placeholder="Write your message here..."
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  onClick={() => setShowNewMessageModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingPage;