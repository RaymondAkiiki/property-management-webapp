import React, { useState, useEffect } from 'react';
import messageService from '../services/messageService';
import { BsSearch } from 'react-icons/bs';

const UserSelector = ({ onUserSelect }) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim() === '') {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const searchResults = await messageService.searchUsers(searchQuery);
      setUsers(searchResults);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout to prevent excessive API calls while typing
    const timeout = setTimeout(() => {
      handleSearch(query);
    }, 500);

    setSearchTimeout(timeout);

    // Clean up timeout on component unmount
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [query]);

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type="text"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search for a user..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {loading ? (
            <div className="w-5 h-5 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
          ) : (
            <BsSearch className="text-gray-400" />
          )}
        </div>
      </div>

      {users.length > 0 && (
        <div className="mt-2 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {users.map((user) => (
            <div
              key={user._id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
              onClick={() => onUserSelect(user)}
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <p className="font-medium">{user.name || 'Unknown User'}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {query && users.length === 0 && !loading && (
        <div className="mt-2 p-4 text-center text-gray-500 border rounded-lg">
          No users found
        </div>
      )}
    </div>
  );
};

export default UserSelector;