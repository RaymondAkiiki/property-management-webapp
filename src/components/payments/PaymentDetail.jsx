// src/components/payments/PaymentDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPaymentById, markAsPaid } from '../../services/paymentService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Spinner from '../common/Spinner';
import Badge from '../common/Badge';
import { useToast } from '../../hooks/useToast';

const PaymentDetail = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPayment = async () => {
      try {
        setLoading(true);
        const response = await getPaymentById(id);
        setPayment(response.data);
      } catch (err) {
        setError('Failed to load payment details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPayment();
  }, [id]);

  const handleMarkAsPaid = async () => {
    try {
      if (payment.status === 'paid') {
        showToast('This payment is already marked as paid', 'info');
        return;
      }
      
      const paidData = {
        status: 'paid',
        paymentDate: new Date().toISOString()
      };
      
      await markAsPaid(id, paidData);
      
      // Update the payment status in the current view
      setPayment({ ...payment, status: 'paid', paymentDate: new Date().toISOString() });
      
      showToast('Payment marked as paid successfully', 'success');
    } catch (err) {
      console.error('Error marking payment as paid:', err);
      showToast('Failed to mark payment as paid', 'error');
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

  const getPaymentMethodIcon = (method) => {
    const iconMap = {
      'bank_transfer': 'bank',
      'cash': 'cash',
      'check': 'file-text',
      'credit_card': 'credit-card',
      'paypal': 'paypal',
      'other': 'circle'
    };
    
    return iconMap[method] || 'dollar-sign';
  };

  if (loading) return <Spinner />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!payment) return <div className="text-gray-500">Payment not found</div>;

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Payment Details</h2>
        <div className="flex space-x-2">
          {payment.status !== 'paid' && (
            <button
              onClick={handleMarkAsPaid}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Mark as Paid
            </button>
          )}
          <Link
            to={`/payments/${id}/edit`}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Edit
          </Link>
          <Link
            to="/payments"
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Back to Payments
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Basic Information</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold">{formatCurrency(payment.amount)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span>{formatDate(payment.paymentDate)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span>{getStatusBadge(payment.status)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Category:</span>
              <span className="capitalize">{payment.category?.replace('_', ' ')}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="capitalize flex items-center">
                <span className="mr-2">{getPaymentMethodIcon(payment.paymentMethod)}</span>
                {payment.paymentMethod?.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Related Information</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Property:</span>
              <Link 
                to={`/properties/${payment.propertyId}`}
                className="text-blue-600 hover:underline"
              >
                {payment.property?.name || 'N/A'}
              </Link>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Tenant:</span>
              <Link 
                to={`/tenants/${payment.tenantId}`}
                className="text-blue-600 hover:underline"
              >
                {payment.tenant?.name || 'N/A'}
              </Link>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span>{formatDate(payment.createdAt)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated:</span>
              <span>{formatDate(payment.updatedAt)}</span>
            </div>
            
            {payment.receiptUrl && (
              <div className="flex justify-between">
                <span className="text-gray-600">Receipt:</span>
                <a 
                  href={payment.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Receipt
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {payment.description && (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p className="text-gray-700">{payment.description}</p>
        </div>
      )}

      {payment.attachments && payment.attachments.length > 0 && (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Attachments</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {payment.attachments.map(attachment => (
              <div key={attachment._id} className="border rounded p-3 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium truncate">{attachment.name}</span>
                  <a 
                    href={attachment.url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Download
                  </a>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(attachment.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDetail;







// // src/components/payments/PaymentDetail.jsx
// import { useState, useEffect } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import { fetchPayment } from '../../services/paymentService';
// import { formatCurrency, formatDate } from '../../utils/formatters';
// import Spinner from '../common/Spinner';
// import Badge from '../common/Badge';

// const PaymentDetail = () => {
//   const { id } = useParams();
//   const [payment, setPayment] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const loadPayment = async () => {
//       try {
//         setLoading(true);
//         const data = await fetchPayment(id);
//         setPayment(data);
//       } catch (err) {
//         setError('Failed to load payment details');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadPayment();
//   }, [id]);

//   const getStatusBadge = (status) => {
//     const statusColors = {
//       'paid': 'green',
//       'pending': 'yellow',
//       'overdue': 'red',
//       'partial': 'blue'
//     };
    
//     return <Badge color={statusColors[status] || 'gray'} text={status} />;
//   };

//   const getPaymentMethodIcon = (method) => {
//     const iconMap = {
//       'bank_transfer': 'bank',
//       'cash': 'cash',
//       'check': 'file-text',
//       'credit_card': 'credit-card',
//       'paypal': 'paypal',
//       'other': 'circle'
//     };
    
//     return iconMap[method] || 'dollar-sign';
//   };

//   if (loading) return <Spinner />;
//   if (error) return <div className="text-red-500">{error}</div>;
//   if (!payment) return <div className="text-gray-500">Payment not found</div>;

//   return (
//     <div className="bg-white shadow-md rounded-lg p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl font-bold">Payment Details</h2>
//         <div className="flex space-x-2">
//           <Link
//             to={`/payments/${id}/edit`}
//             className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
//           >
//             Edit
//           </Link>
//           <Link
//             to="/payments"
//             className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
//           >
//             Back to Payments
//           </Link>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="bg-gray-50 p-4 rounded-lg">
//           <h3 className="text-lg font-semibold mb-4 border-b pb-2">Basic Information</h3>
          
//           <div className="space-y-3">
//             <div className="flex justify-between">
//               <span className="text-gray-600">Amount:</span>
//               <span className="font-semibold">{formatCurrency(payment.amount)}</span>
//             </div>
            
//             <div className="flex justify-between">
//               <span className="text-gray-600">Date:</span>
//               <span>{formatDate(payment.paymentDate)}</span>
//             </div>
            
//             <div className="flex justify-between">
//               <span className="text-gray-600">Status:</span>
//               <span>{getStatusBadge(payment.status)}</span>
//             </div>
            
//             <div className="flex justify-between">
//               <span className="text-gray-600">Category:</span>
//               <span className="capitalize">{payment.category?.replace('_', ' ')}</span>
//             </div>
            
//             <div className="flex justify-between">
//               <span className="text-gray-600">Payment Method:</span>
//               <span className="capitalize flex items-center">
//                 <span className="mr-2">{getPaymentMethodIcon(payment.paymentMethod)}</span>
//                 {payment.paymentMethod?.replace('_', ' ')}
//               </span>
//             </div>
//           </div>
//         </div>
        
//         <div className="bg-gray-50 p-4 rounded-lg">
//           <h3 className="text-lg font-semibold mb-4 border-b pb-2">Related Information</h3>
          
//           <div className="space-y-3">
//             <div className="flex justify-between">
//               <span className="text-gray-600">Property:</span>
//               <Link 
//                 to={`/properties/${payment.propertyId}`}
//                 className="text-blue-600 hover:underline"
//               >
//                 {payment.property?.name || 'N/A'}
//               </Link>
//             </div>
            
//             <div className="flex justify-between">
//               <span className="text-gray-600">Tenant:</span>
//               <Link 
//                 to={`/tenants/${payment.tenantId}`}
//                 className="text-blue-600 hover:underline"
//               >
//                 {payment.tenant?.name || 'N/A'}
//               </Link>
//             </div>
            
//             <div className="flex justify-between">
//               <span className="text-gray-600">Created:</span>
//               <span>{formatDate(payment.createdAt)}</span>
//             </div>
            
//             <div className="flex justify-between">
//               <span className="text-gray-600">Last Updated:</span>
//               <span>{formatDate(payment.updatedAt)}</span>
//             </div>
            
//             {payment.receiptUrl && (
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Receipt:</span>
//                 <a 
//                   href={payment.receiptUrl}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-blue-600 hover:underline"
//                 >
//                   View Receipt
//                 </a>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
      
//       {payment.description && (
//         <div className="mt-6 bg-gray-50 p-4 rounded-lg">
//           <h3 className="text-lg font-semibold mb-2">Description</h3>
//           <p className="text-gray-700">{payment.description}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PaymentDetail;