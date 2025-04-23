// /src/components/properties/PropertyDocuments.jsx
import React from 'react';
import DocumentList from '../documents/DocumentList';
import { FiFileText } from 'react-icons/fi';

const PropertyDocuments = ({ propertyId }) => {
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center">
          <FiFileText className="mr-2" /> Property Documents
        </h2>
      </div>
      <div className="p-4">
        <DocumentList relatedTo="property" relatedId={propertyId} />
      </div>
    </div>
  );
};

export default PropertyDocuments;