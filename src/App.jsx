import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './hooks/useToast';
import ProtectedRoute from './components/routing/ProtectedRoute';

// Route Modules
import AuthRoutes from './routes/AuthRoutes';
import PropertyRoutes from './routes/PropertyRoutes';
import TenantRoutes from './routes/TenantRoutes';
import MaintenanceRoutes from './routes/MaintenanceRoutes';
import DocumentRoutes from './routes/DocumentRoutes';

// Dashboard
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Auth */}
            <AuthRoutes />

            {/* Redirect Home */}
            <Route path="/" element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            } />

            {/* Dashboard */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />

            {/* Modular Routes */}
            <PropertyRoutes />
            <TenantRoutes />
            <MaintenanceRoutes />
            <DocumentRoutes />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;






// /**
//  * src/App.js
//  * Update to include DashboardProvider for relevant routes
//  */

// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import { ToastProvider } from './context/ToastContext';
// import { DashboardProvider } from './context/DashboardContext';

// // Layout
// import Layout from './components/layout/Layout';

// // Pages
// import Dashboard from './pages/Dashboard';
// import Properties from './pages/Properties';
// import PropertyDetail from './pages/PropertyDetail';
// import AddProperty from './pages/AddProperty';
// import EditProperty from './pages/EditProperty';
// import Tenants from './pages/Tenants';
// import TenantDetail from './pages/TenantDetail';
// import AddTenant from './pages/AddTenant';
// import EditTenant from './pages/EditTenant';
// import Maintenance from './pages/Maintenance';
// import MaintenanceDetail from './pages/MaintenanceDetail';
// import AddMaintenance from './pages/AddMaintenance';
// import EditMaintenance from './pages/EditMaintenance';
// import Payments from './pages/Payments';
// import PaymentDetail from './pages/PaymentDetail';
// import AddPayment from './pages/AddPayment';
// import Documents from './pages/Documents';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import NotFound from './pages/NotFound';

// const App = () => {
//   return (
//     <Router>
//       <ToastProvider>
//         <AuthProvider>
//           <Routes>
//             <Route path="/login" element={<Login />} />
//             <Route path="/register" element={<Register />} />
            
//             <Route path="/" element={<Layout />}>
//               <Route index element={<Navigate to="/dashboard" replace />} />
              
//               {/* Dashboard */}
//               <Route path="dashboard" element={
//                 <DashboardProvider>
//                   <Dashboard />
//                 </DashboardProvider>
//               } />
              
//               {/* Properties */}
//               <Route path="properties" element={<Properties />} />
//               <Route path="properties/:id" element={<PropertyDetail />} />
//               <Route path="properties/add" element={<AddProperty />} />
//               <Route path="properties/edit/:id" element={<EditProperty />} />
              
//               {/* Tenants */}
//               <Route path="tenants" element={<Tenants />} />
//               <Route path="tenants/:id" element={<TenantDetail />} />
//               <Route path="tenants/add" element={<AddTenant />} />
//               <Route path="tenants/edit/:id" element={<EditTenant />} />
              
//               {/* Maintenance */}
//               <Route path="maintenance" element={<Maintenance />} />
//               <Route path="maintenance/:id" element={<MaintenanceDetail />} />
//               <Route path="maintenance/add" element={<AddMaintenance />} />
//               <Route path="maintenance/edit/:id" element={<EditMaintenance />} />
              
//               {/* Payments */}
//               <Route path="payments" element={<Payments />} />
//               <Route path="payments/:id" element={<PaymentDetail />} />
//               <Route path="payments/add" element={<AddPayment />} />
              
//               {/* Documents */}
//               <Route path="documents" element={<Documents />} />
              
//               {/* Not Found */}
//               <Route path="*" element={<NotFound />} />
//             </Route>
//           </Routes>
//         </AuthProvider>
//       </ToastProvider>
//     </Router>
//   );
// };

// export default App;