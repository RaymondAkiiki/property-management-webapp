import React from 'react';
import { Route } from 'react-router-dom';
import TenantsList from '../pages/tenants/TenantsList';
import TenantDetail from '../pages/tenants/TenantDetail';
import AddTenant from '../pages/tenants/AddTenant';
import EditTenant from '../pages/tenants/EditTenant';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from '../components/routing/ProtectedRoute';

const TenantRoutes = () => (
  <>
    <Route
      path="/tenants"
      element={
        <ProtectedRoute>
          <AppLayout>
            <TenantsList />
          </AppLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/tenants/add"
      element={
        <ProtectedRoute>
          <AppLayout>
            <AddTenant />
          </AppLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/tenants/:id"
      element={
        <ProtectedRoute>
          <AppLayout>
            <TenantDetail />
          </AppLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/tenants/:id/edit"
      element={
        <ProtectedRoute>
          <AppLayout>
            <EditTenant />
          </AppLayout>
        </ProtectedRoute>
      }
    />
  </>
);

export default TenantRoutes;
