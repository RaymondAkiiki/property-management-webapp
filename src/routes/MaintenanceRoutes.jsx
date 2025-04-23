import React from 'react';
import { Route } from 'react-router-dom';
import MaintenanceList from '../pages/maintenance/MaintenanceList';
import MaintenanceNewPage from '../pages/maintenance/MaintenanceNewPage';
import MaintenanceEditPage from '../pages/maintenance/MaintenanceEditPage';
import MaintenanceDetailPage from '../pages/maintenance/MaintenanceDetailPage';
import MaintenanceListPage from '../pages/maintenance/MaintenanceListPage';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from '../components/routing/ProtectedRoute';

const MaintenanceRoutes = () => (
  <>
    <Route
      path="/maintenance"
      element={
        <ProtectedRoute>
          <AppLayout>
            <MaintenanceList />
          </AppLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/maintenance/new"
      element={
        <ProtectedRoute>
          <AppLayout>
            <MaintenanceNewPage />
          </AppLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/maintenance/:ticketId"
      element={
        <ProtectedRoute>
          <AppLayout>
            <MaintenanceDetailPage />
          </AppLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/maintenance/:ticketId/edit"
      element={
        <ProtectedRoute>
          <AppLayout>
            <MaintenanceEditPage />
          </AppLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/properties/:propertyId/maintenance"
      element={
        <ProtectedRoute>
          <AppLayout>
            <MaintenanceListPage />
          </AppLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/properties/:propertyId/maintenance/new"
      element={
        <ProtectedRoute>
          <AppLayout>
            <MaintenanceNewPage />
          </AppLayout>
        </ProtectedRoute>
      }
    />
  </>
);

export default MaintenanceRoutes;
