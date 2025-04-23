import React from 'react';
import { Route } from 'react-router-dom';
import DocumentsList from '../pages/documents/DocumentsList';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from '../components/routing/ProtectedRoute';

const DocumentRoutes = () => (
  <Route
    path="/documents"
    element={
      <ProtectedRoute>
        <AppLayout>
          <DocumentsList />
        </AppLayout>
      </ProtectedRoute>
    }
  />
);

export default DocumentRoutes;
