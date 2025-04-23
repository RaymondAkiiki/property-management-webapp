import React from 'react';

const MaintenanceStatusBadge = ({ status }) => {
  // Define styling based on status
  const statusStyles = {
    new: {
      bg: 'bg-blue-100',
      text: 'text-blue-800'
    },
    in_progress: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800'
    },
    completed: {
      bg: 'bg-green-100',
      text: 'text-green-800'
    },
    cancelled: {
      bg: 'bg-gray-100',
      text: 'text-gray-800'
    }
  };
  
  // Get status display name
  const getStatusDisplayName = (status) => {
    switch (status) {
      case 'new':
        return 'New';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };
  
  const style = statusStyles[status] || statusStyles.new;
  
  return (
    <span className={`px-2 py-1 ${style.bg} ${style.text} text-xs rounded-full`}>
      {getStatusDisplayName(status)}
    </span>
  );
};

export default MaintenanceStatusBadge;