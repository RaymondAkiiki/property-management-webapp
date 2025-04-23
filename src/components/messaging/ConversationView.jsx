// src/components/messaging/ConversationView.jsx
import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Send, Paperclip, User } from 'lucide-react';

const ConversationView = ({ 
  conversation, 
  messages, 
  onSendMessage, 
  currentUser,
  isLoading
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' && attachments.length === 0) return;
    
    onSendMessage(newMessage, attachments);
    setNewMessage('');
    setAttachments([]);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleAttachmentClick = () => {
    fileInputRef.current.click();
  };

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 text-gray-500">
        Select a conversation to start messaging
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Conversation Header */}
      <div className="p-4 border-b flex items-center">
        {conversation.otherUser.avatar ? (
          <img
            src={conversation.otherUser.avatar}
            alt={conversation.otherUser.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <User size={20} className="text-gray-500" />
          </div>
        )}
        <div className="ml-3">
          <h3 className="font-medium">{conversation.otherUser.name}</h3>
          <p className="text-xs text-gray-500">{conversation.otherUser.email}</p>
        </div>
      </div>
      
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-4">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map(message => {
            const isCurrentUser = message.sender._id === currentUser._id;
            
            return (
                // src/components/messaging/ConversationView.jsx (continued)
              <div 
              key={message._id} 
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-100'} rounded-lg p-3`}>
                <div className="text-sm">{message.content}</div>
                
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center bg-white bg-opacity-20 rounded p-1">
                        <Paperclip size={14} className="mr-1" />
                        <a 
                          href={attachment.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs underline"
                        >
                          {attachment.name}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                  {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
    
    {/* Message Input */}
    <div className="border-t p-3">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((file, index) => (
            <div key={index} className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center">
              <span className="truncate max-w-[150px]">{file.name}</span>
              <button 
                onClick={() => removeAttachment(index)}
                className="ml-1 text-gray-500 hover:text-red-500"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSendMessage} className="flex items-center">
        <button 
          type="button"
          onClick={handleAttachmentClick}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <Paperclip size={20} className="text-gray-500" />
        </button>
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2 mx-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <button 
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
          disabled={newMessage.trim() === '' && attachments.length === 0}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  </div>
);
};

export default ConversationView;