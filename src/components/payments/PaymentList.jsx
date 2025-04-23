

// src/components/payments/PaymentList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPayments, deletePayment } from '../../services/paymentService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Spinner from '../common/Spinner';
import ConfirmModal from '../common/ConfirmModal';
import Badge from '../common/Badge';

const PaymentList = ({ propertyId, tenantId, limit }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true);
        const filters = {};
        if (propertyId) filters.propertyId = propertyId;
        if (tenantId) filters.tenantId = tenantId;
        if (limit) filters.limit = limit;
        
        const response = await getPayments(filters);
        setPayments(response.data);
      } catch (err) {
        setError('Failed to load payments. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [propertyId, tenantId, limit]);

  const handleDeleteClick = (payment) => {
    setPaymentToDelete(payment);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deletePayment(paymentToDelete._id);
      setPayments(payments.filter(p => p._id !== paymentToDelete._id));
      setShowDeleteModal(false);
    } catch (err) {
      setError('Failed to delete payment. Please try again.');
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'paid': 'green',
      'pending': 'yellow',
      'overdue': 'red',
      'partial': 'blue'
    };
    
    return <Badge color={statusColors[status] || 'gray'} text={status} />;
  };

  if (loading) return <Spinner />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (payments.length === 0) return <div className="text-gray-500">No payments found.</div>;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {payments.map((payment) => (
            <tr key={payment._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(payment.paymentDate)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {payment.property?.name || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {payment.tenant?.name || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(payment.amount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(payment.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link 
                  to={`/payments/${payment._id}`} 
                  className="text-indigo-600 hover:text-indigo-900 mr-3"
                >
                  View
                </Link>
                <Link 
                  to={`/payments/${payment._id}/edit`} 
                  className="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDeleteClick(payment)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {showDeleteModal && (
        <ConfirmModal
          title="Delete Payment"
          message={`Are you sure you want to delete the payment of ${formatCurrency(paymentToDelete.amount)} made on ${formatDate(paymentToDelete.paymentDate)}?`}
          confirmText="Delete"
          confirmButtonColor="red"
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default PaymentList;




// // /src/components/payments/PaymentList.jsx
// import React, { useState, useEffect } from 'react';
// import { format } from 'date-fns';
// import { FiDollarSign, FiCalendar, FiFilter, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';
// import { getPayments } from '../../services/paymentService';
// import { useToast } from '../../hooks/useToast';
// import PaymentStatusBadge from './PaymentStatusBadge';
// import LoadingSpinner from '../common/LoadingSpinner';

// const PaymentList = ({ tenant, property, onSelectPayment }) => {
//   const [payments, setPayments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filters, setFilters] = useState({
//     tenant: tenant || '',
//     property: property || '',
//     status: '',
//     startDate: '',
//     endDate: '',
//     sort: 'dueDate',
//     order: 'desc',
//     page: 1,
//   });
//   const [pagination, setPagination] = useState({
//     total: 0,
//     page: 1,
//     pages: 1
//   });
//   const [showFilters, setShowFilters] = useState(false);
//   const { showToast } = useToast();

//   useEffect(() => {
//     // If tenant or property props change, update filters
//     if (tenant !== undefined) {
//       setFilters(prev => ({ ...prev, tenant }));
//     }
//     if (property !== undefined) {
//       setFilters(prev => ({ ...prev, property }));
//     }
//   }, [tenant, property]);

//   const fetchPayments = async () => {
//     setLoading(true);
//     try {
//       const response = await getPayments(filters);
//       setPayments(response.data.payments);
//       setPagination(response.data.pagination);
//     } catch (error) {
//       console.error('Error fetching payments:', error);
//       showToast(
//         error.response?.data?.message || 'Failed to fetch payments',
//         'error'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPayments();
//   }, [filters.page, filters.sort, filters.order]);

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters((prev) => ({
//       ...prev,
//       [name]: value,
//       page: 1 // Reset page when changing filters
//     }));
//   };

//   const applyFilters = (e) => {
//     e.preventDefault();
//     fetchPayments();
//   };

//   const resetFilters = () => {
//     setFilters({
//       tenant: tenant || '',
//       property: property || '',
//       status: '',
//       startDate: '',
//       endDate: '',
//       sort: 'dueDate',
//       order: 'desc',
//       page: 1,
//     });
//     fetchPayments();
//   };

//   const handleSort = (field) => {
//     setFilters((prev) => ({
//       ...prev,
//       sort: field,
//       order: prev.sort === field && prev.order === 'desc' ? 'asc' : 'desc'
//     }));
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD'
//     }).format(amount);
//   };

//   const renderSortIcon = (field) => {
//     if (filters.sort !== field) return null;
//     return filters.order === 'asc' ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />;
//   };

//   if (loading && payments.length === 0) {
//     return <LoadingSpinner />;
//   }

//   return (
//     <div className="bg-white rounded-lg shadow">
//       <div className="p-4 flex justify-between items-center border-b">
//         <h2 className="text-lg font-semibold">Payments</h2>
//         <button
//           onClick={() => setShowFilters(!showFilters)}
//           className="flex items-center text-sm text-gray-600 hover:text-gray-900"
//         >
//           <FiFilter className="mr-1" />
//           {showFilters ? 'Hide Filters' : 'Show Filters'}
//         </button>
//       </div>

//       {showFilters && (
//         <div className="p-4 bg-gray-50 border-b">
//           <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//               <select
//                 name="status"
//                 value={filters.status}
//                 onChange={handleFilterChange}
//                 className="w-full p-2 border border-gray-300 rounded-md"
//               >
//                 <option value="">All Statuses</option>
//                 <option value="pending">Pending</option>
//                 <option value="paid">Paid</option>
//                 <option value="partial">Partial</option>
//                 <option value="late">Late</option>
//                 <option value="overdue">Overdue</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
//               <input
//                 type="date"
//                 name="startDate"
//                 value={filters.startDate}
//                 onChange={handleFilterChange}
//                 className="w-full p-2 border border-gray-300 rounded-md"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
//               <input
//                 type="date"
//                 name="endDate"
//                 value={filters.endDate}
//                 onChange={handleFilterChange}
//                 className="w-full p-2 border border-gray-300 rounded-md"
//               />
//             </div>

//             <div className="md:col-span-2 lg:col-span-3 flex justify-end space-x-2">
//               <button
//                 type="button"
//                 onClick={resetFilters}
//                 className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
//               >
//                 Reset
//               </button>
//               <button
//                 type="submit"
//                 className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
//               >
//                 Apply Filters
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {payments.length === 0 ? (
//         <div className="p-6 text-center text-gray-500">
//           <FiDollarSign className="mx-auto h-12 w-12 text-gray-400" />
//           <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
//           <p className="mt-1 text-sm text-gray-500">
//             There are no payments matching your current filters.
//           </p>
//         </div>
//       ) : (
//         <>
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th 
//                     scope="col" 
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                     onClick={() => handleSort('dueDate')}
//                   >
//                     <div className="flex items-center">
//                       Due Date {renderSortIcon('dueDate')}
//                     </div>
//                   </th>
//                   {!tenant && (
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Tenant
//                     </th>
//                   )}
//                   {!property && (
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Property
//                     </th>
//                   )}
//                   <th 
//                     scope="col" 
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                     onClick={() => handleSort('amount')}
//                   >
//                     <div className="flex items-center">
//                       Amount {renderSortIcon('amount')}
//                     </div>
//                   </th>
//                   <th 
//                     scope="col" 
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                     onClick={() => handleSort('status')}
//                   >
//                     <div className="flex items-center">
//                       Status {renderSortIcon('status')}
//                     </div>
//                   </th>
//                   <th 
//                     scope="col" 
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                     onClick={() => handleSort('paymentDate')}
//                   >
//                     <div className="flex items-center">
//                       Payment Date {renderSortIcon('paymentDate')}
//                     </div>
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {payments.map((payment) => (
//                   <tr 
//                     key={payment._id} 
//                     className="hover:bg-gray-50 cursor-pointer"
//                     onClick={() => onSelectPayment(payment)}
//                   >
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         <FiCalendar className="mr-2 text-gray-400" />
//                         <span>{format(new Date(payment.dueDate), 'MMM d, yyyy')}</span>
//                       </div>
//                     </td>
//                     {!tenant && (
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         {payment.tenant ? (
//                           <div className="text-sm font-medium text-gray-900">
//                             {payment.tenant.firstName} {payment.tenant.lastName}
//                           </div>
//                         ) : (
//                           <span className="text-sm text-gray-500">Unknown Tenant</span>
//                         )}
//                       </td>
//                     )}
//                     {!property && (
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         {payment.property ? (
//                           <div className="text-sm font-medium text-gray-900">
//                             {payment.property.name || payment.property.address}
//                           </div>
//                         ) : (
//                           <span className="text-sm text-gray-500">Unknown Property</span>
//                         )}
//                       </td>
//                     )}
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm font-medium text-gray-900">
//                         {formatCurrency(payment.amount)}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <PaymentStatusBadge status={payment.status} />
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {payment.paymentDate ? format(new Date(payment.paymentDate), 'MMM d, yyyy') : '—'}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination (Optional) */}
//           <div className="flex justify-between items-center p-4 border-t text-sm text-gray-600">
//             <div>
//               Page {pagination.page} of {pagination.pages}
//             </div>
//             <div className="space-x-2">
//               <button
//                 disabled={pagination.page === 1}
//                 onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
//                 className="px-3 py-1 border rounded disabled:opacity-50"
//               >
//                 Previous
//               </button>
//               <button
//                 disabled={pagination.page === pagination.pages}
//                 onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
//                 className="px-3 py-1 border rounded disabled:opacity-50"
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default PaymentList;




