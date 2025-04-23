import React from 'react';
import { Route } from 'react-router-dom';
import PropertiesList from '../pages/properties/PropertiesList';
import PropertyDetail from '../pages/properties/PropertyDetail';
import AddProperty from '../pages/properties/AddProperty';
import EditProperty from '../pages/properties/EditProperty';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from '../components/routing/ProtectedRoute';

const PropertyRoutes = () => (
  <>
    <Route
      path="/properties"
      element={
        <ProtectedRoute>
          <AppLayout>
            <PropertiesList />
          </AppLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/properties/add"
      element={
        <ProtectedRoute>
          <AppLayout>
            <AddProperty />
          </AppLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/properties/:id"
      element={
        <ProtectedRoute>
          <AppLayout>
            <PropertyDetail />
          </AppLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/properties/:id/edit"
      element={
        <ProtectedRoute>
          <AppLayout>
            <EditProperty />
          </AppLayout>
        </ProtectedRoute>
      }
    />
  </>
);

export default PropertyRoutes;
