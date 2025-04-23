// src/components/payments/PaymentForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPaymentById, createPayment, updatePayment } from '../../services/paymentService';
import { getProperties } from '../../services/propertyService';
import { getTenants } from '../../services/tenantService';
import { useToast } from '../../hooks/useToast';
import Spinner from '../common/Spinner';
import FormField from '../common/FormField';

const PaymentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [propertyTenants, setPropertyTenants] = useState([]);
  const [formData, setFormData] = useState({
    propertyId: '',
    tenantId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    status: 'paid',
    description: '',
    category: 'rent',
    receiptUrl: ''
  });

  // Load properties and tenants on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [propertiesResponse, tenantsResponse] = await Promise.all([
          getProperties(),
          getTenants()
        ]);
        setProperties(propertiesResponse.data);
        setTenants(tenantsResponse.data);
      } catch (error) {
        console.error('Error loading data:', error);
        showToast('Failed to load properties and tenants', 'error');
      }
    };

    loadData();
  }, [showToast]);

  // Load payment data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const loadPayment = async () => {
        try {
          setLoading(true);
          const response = await getPaymentById(id);
          const payment = response.data;
          
          setFormData({
            propertyId: payment.propertyId || '',
            tenantId: payment.tenantId || '',
            amount: payment.amount.toString() || '',
            paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toISOString().split('T')[0] : '',
            paymentMethod: payment.paymentMethod || 'bank_transfer',
            status: payment.status || 'paid',
            description: payment.description || '',
            category: payment.category || 'rent',
            receiptUrl: payment.receiptUrl || ''
          });
          
          // Set selected property for tenant filtering
          if (payment.propertyId) {
            setSelectedProperty(payment.propertyId);
            const propertyTenants = tenants.filter(tenant => 
              tenant.propertyId === payment.propertyId
            );
            setPropertyTenants(propertyTenants);
          }
        } catch (error) {
          console.error('Error loading payment:', error);
          showToast('Failed to load payment details', 'error');
        } finally {
          setLoading(false);
        }
      };

      loadPayment();
    }
  }, [id, isEditMode, tenants, showToast]);

  // Filter tenants by property
  useEffect(() => {
    if (selectedProperty) {
      const filteredTenants = tenants.filter(tenant => 
        tenant.propertyId === selectedProperty
      );
      setPropertyTenants(filteredTenants);
      
      // Reset tenant selection if current tenant doesn't belong to selected property
      if (!filteredTenants.some(t => t._id === formData.tenantId)) {
        setFormData(prev => ({ ...prev, tenantId: '' }));
      }
    } else {
      setPropertyTenants([]);
    }
  }, [selectedProperty, tenants, formData.tenantId]);

  const handlePropertyChange = (e) => {
    const propertyId = e.target.value;
    setSelectedProperty(propertyId);
    setFormData(prev => ({ ...prev, propertyId }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let paymentData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };
      
      if (isEditMode) {
        await updatePayment(id, paymentData);
        showToast('Payment updated successfully', 'success');
      } else {
        await createPayment(paymentData);
        showToast('Payment created successfully', 'success');
      }
      
      navigate('/payments');
    } catch (error) {
      console.error('Error saving payment:', error);
      showToast('Failed to save payment', 'error');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-6">
        {isEditMode ? 'Edit Payment' : 'Add New Payment'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Property"
            name="propertyId"
            type="select"
            value={formData.propertyId}
            onChange={handlePropertyChange}
            required
          >
            <option value="">Select a property</option>
            {properties.map(property => (
              <option key={property._id} value={property._id}>
                {property.name}
              </option>
            ))}
          </FormField>
          
          <FormField
            label="Tenant"
            name="tenantId"
            type="select"
            value={formData.tenantId}
            onChange={handleChange}
            required
            disabled={!selectedProperty}
          >
            <option value="">Select a tenant</option>
            {propertyTenants.map(tenant => (
              <option key={tenant._id} value={tenant._id}>
                {tenant.name}
              </option>
            ))}
          </FormField>
          
          <FormField
            label="Amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
          />
          
          <FormField
            label="Payment Date"
            name="paymentDate"
            type="date"
            value={formData.paymentDate}
            onChange={handleChange}
            required
          />
          
          <FormField
            label="Payment Method"
            name="paymentMethod"
            type="select"
            value={formData.paymentMethod}
            onChange={handleChange}
            required
          >
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash">Cash</option>
            <option value="check">Check</option>
            <option value="credit_card">Credit Card</option>
            <option value="paypal">PayPal</option>
            <option value="other">Other</option>
          </FormField>
          
          <FormField
            label="Status"
            name="status"
            type="select"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
            <option value="partial">Partial</option>
          </FormField>
          
          <FormField
            label="Category"
            name="category"
            type="select"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="rent">Rent</option>
            <option value="deposit">Security Deposit</option>
            <option value="utility">Utility</option>
            <option value="late_fee">Late Fee</option>
            <option value="maintenance">Maintenance</option>
            <option value="other">Other</option>
          </FormField>
          
          <FormField
            label="Receipt URL"
            name="receiptUrl"
            type="text"
            value={formData.receiptUrl}
            onChange={handleChange}
            placeholder="Link to receipt (optional)"
          />
          
          <div className="col-span-1 md:col-span-2">
            <FormField
              label="Description"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleChange}
              placeholder="Additional details about this payment"
              rows={3}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={() => navigate('/payments')}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {isEditMode ? 'Update Payment' : 'Create Payment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;






// // src/components/payments/PaymentForm.jsx
// import { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { fetchPayment, createPayment, updatePayment } from '../../services/paymentService';
// import { fetchProperties } from '../../services/propertyService';
// import { fetchTenants } from '../../services/tenantService';
// import { useToast } from '../../hooks/useToast';
// import Spinner from '../common/Spinner';
// import FormField from '../common/FormField';

// const PaymentForm = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { showToast } = useToast();
//   const isEditMode = !!id;

//   const [loading, setLoading] = useState(isEditMode);
//   const [properties, setProperties] = useState([]);
//   const [tenants, setTenants] = useState([]);
//   const [selectedProperty, setSelectedProperty] = useState('');
//   const [propertyTenants, setPropertyTenants] = useState([]);
//   const [formData, setFormData] = useState({
//     propertyId: '',
//     tenantId: '',
//     amount: '',
//     paymentDate: new Date().toISOString().split('T')[0],
//     paymentMethod: 'bank_transfer',
//     status: 'paid',
//     description: '',
//     category: 'rent',
//     receiptUrl: ''
//   });

//   // Load properties and tenants on component mount
//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const [propertiesData, tenantsData] = await Promise.all([
//           fetchProperties(),
//           fetchTenants()
//         ]);
//         setProperties(propertiesData);
//         setTenants(tenantsData);
//       } catch (error) {
//         console.error('Error loading data:', error);
//         showToast('Failed to load properties and tenants', 'error');
//       }
//     };

//     loadData();
//   }, [showToast]);

//   // Load payment data if in edit mode
//   useEffect(() => {
//     if (isEditMode) {
//       const loadPayment = async () => {
//         try {
//           setLoading(true);
//           const payment = await fetchPayment(id);
//           setFormData({
//             propertyId: payment.propertyId || '',
//             tenantId: payment.tenantId || '',
//             amount: payment.amount.toString() || '',
//             paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toISOString().split('T')[0] : '',
//             paymentMethod: payment.paymentMethod || 'bank_transfer',
//             status: payment.status || 'paid',
//             description: payment.description || '',
//             category: payment.category || 'rent',
//             receiptUrl: payment.receiptUrl || ''
//           });
          
//           // Set selected property for tenant filtering
//           if (payment.propertyId) {
//             setSelectedProperty(payment.propertyId);
//             const propertyTenants = tenants.filter(tenant => 
//               tenant.propertyId === payment.propertyId
//             );
//             setPropertyTenants(propertyTenants);
//           }
//         } catch (error) {
//           console.error('Error loading payment:', error);
//           showToast('Failed to load payment details', 'error');
//         } finally {
//           setLoading(false);
//         }
//       };

//       loadPayment();
//     }
//   }, [id, isEditMode, tenants, showToast]);

//   // Filter tenants by property
//   useEffect(() => {
//     if (selectedProperty) {
//       const filteredTenants = tenants.filter(tenant => 
//         tenant.propertyId === selectedProperty
//       );
//       setPropertyTenants(filteredTenants);
      
//       // Reset tenant selection if current tenant doesn't belong to selected property
//       if (!filteredTenants.some(t => t._id === formData.tenantId)) {
//         setFormData(prev => ({ ...prev, tenantId: '' }));
//       }
//     } else {
//       setPropertyTenants([]);
//     }
//   }, [selectedProperty, tenants, formData.tenantId]);

//   const handlePropertyChange = (e) => {
//     const propertyId = e.target.value;
//     setSelectedProperty(propertyId);
//     setFormData(prev => ({ ...prev, propertyId }));
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     try {
//       let paymentData = {
//         ...formData,
//         amount: parseFloat(formData.amount)
//       };
      
//       let result;
      
//       if (isEditMode) {
//         result = await updatePayment(id, paymentData);
//         showToast('Payment updated successfully', 'success');
//       } else {
//         result = await createPayment(paymentData);
//         showToast('Payment created successfully', 'success');
//       }
      
//       navigate('/payments');
//     } catch (error) {
//       console.error('Error saving payment:', error);
//       showToast('Failed to save payment', 'error');
//     }
//   };

//   if (loading) return <Spinner />;

//   return (
//     <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
//       <h2 className="text-2xl font-bold mb-6">
//         {isEditMode ? 'Edit Payment' : 'Add New Payment'}
//       </h2>
      
//       <form onSubmit={handleSubmit}>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <FormField
//             label="Property"
//             name="propertyId"
//             type="select"
//             value={formData.propertyId}
//             onChange={handlePropertyChange}
//             required
//           >
//             <option value="">Select a property</option>
//             {properties.map(property => (
//               <option key={property._id} value={property._id}>
//                 {property.name}
//               </option>
//             ))}
//           </FormField>
          
//           <FormField
//             label="Tenant"
//             name="tenantId"
//             type="select"
//             value={formData.tenantId}
//             onChange={handleChange}
//             required
//             disabled={!selectedProperty}
//           >
//             <option value="">Select a tenant</option>
//             {propertyTenants.map(tenant => (
//               <option key={tenant._id} value={tenant._id}>
//                 {tenant.name}
//               </option>
//             ))}
//           </FormField>
          
//           <FormField
//             label="Amount"
//             name="amount"
//             type="number"
//             value={formData.amount}
//             onChange={handleChange}
//             required
//             min="0"
//             step="0.01"
//           />
          
//           <FormField
//             label="Payment Date"
//             name="paymentDate"
//             type="date"
//             value={formData.paymentDate}
//             onChange={handleChange}
//             required
//           />
          
//           <FormField
//             label="Payment Method"
//             name="paymentMethod"
//             type="select"
//             value={formData.paymentMethod}
//             onChange={handleChange}
//             required
//           >
//             <option value="bank_transfer">Bank Transfer</option>
//             <option value="cash">Cash</option>
//             <option value="check">Check</option>
//             <option value="credit_card">Credit Card</option>
//             <option value="paypal">PayPal</option>
//             <option value="other">Other</option>
//           </FormField>
          
//           <FormField
//             label="Status"
//             name="status"
//             type="select"
//             value={formData.status}
//             onChange={handleChange}
//             required
//           >
//             <option value="paid">Paid</option>
//             <option value="pending">Pending</option>
//             <option value="overdue">Overdue</option>
//             <option value="partial">Partial</option>
//           </FormField>
          
//           <FormField
//             label="Category"
//             name="category"
//             type="select"
//             value={formData.category}
//             onChange={handleChange}
//             required
//           >
//             <option value="rent">Rent</option>
//             <option value="deposit">Security Deposit</option>
//             <option value="utility">Utility</option>
//             <option value="late_fee">Late Fee</option>
//             <option value="maintenance">Maintenance</option>
//             <option value="other">Other</option>
//           </FormField>
          
//           <FormField
//             label="Receipt URL"
//             name="receiptUrl"
//             type="text"
//             value={formData.receiptUrl}
//             onChange={handleChange}
//             placeholder="Link to receipt (optional)"
//           />
          
//           <div className="col-span-1 md:col-span-2">
//             <FormField
//               label="Description"
//               name="description"
//               type="textarea"
//               value={formData.description}
//               onChange={handleChange}
//               placeholder="Additional details about this payment"
//               rows={3}
//             />
//           </div>
//         </div>
        
//         <div className="flex justify-end space-x-4 mt-6">
//           <button
//             type="button"
//             onClick={() => navigate('/payments')}
//             className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
//           >
//             {isEditMode ? 'Update Payment' : 'Create Payment'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default PaymentForm;