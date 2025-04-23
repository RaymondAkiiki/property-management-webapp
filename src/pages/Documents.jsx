// /src/pages/Documents.jsx
import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import DocumentList from '../components/documents/DocumentList';
import { FiFileText } from 'react-icons/fi';

const DocumentsPage = () => {
  const [filter, setFilter] = useState({
    relatedTo: 'general',
    relatedId: null
  });

  const handleFilterChange = (filterType) => {
    setFilter({
      relatedTo: filterType,
      relatedId: null
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FiFileText className="mr-2" /> Document Management
          </h1>
          <p className="text-gray-600 mt-1">
            Upload, organize, and manage all your property-related documents.
          </p>
        </div>

        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              <button
                onClick={() => handleFilterChange('general')}
                className={`px-4 py-2 rounded-md ${
                  filter.relatedTo === 'general'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                All Documents
              </button>
              <button
                onClick={() => handleFilterChange('property')}
                className={`px-4 py-2 rounded-md ${
                  filter.relatedTo === 'property'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Property Documents
              </button>
              <button
                onClick={() => handleFilterChange('tenant')}
                className={`px-4 py-2 rounded-md ${
                  filter.relatedTo === 'tenant'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Tenant Documents
              </button>
              <button
                onClick={() => handleFilterChange('maintenance')}
                className={`px-4 py-2 rounded-md ${
                  filter.relatedTo === 'maintenance'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Maintenance Documents
              </button>
            </div>
          </div>
        </div>

        <DocumentList
          relatedTo={filter.relatedTo !== 'general' ? filter.relatedTo : null}
          relatedId={filter.relatedId}
        />
      </div>
    </Layout>
  );
};

export default DocumentsPage;