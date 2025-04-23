// src/pages/PaymentsPage.jsx
import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getPaymentById, recordPayment, sendPaymentReminder } from '../../services/paymentService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import PaymentDashboard from '../components/payments/PaymentDashboard';
import PaymentList from '../components/payments/PaymentList';
import PaymentForm from '../components/payments/PaymentForm';
import PaymentDetail from '../components/payments/PaymentDetail';
import Spinner from '../components/common/Spinner';

const PaymentsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(
    location.pathname === '/payments' ? 'dashboard' : 'list'
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'dashboard') {
      navigate('/payments');
    } else if (tab === 'list') {
      navigate('/payments/list');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
        <button
          onClick={() => navigate('/payments/new')}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Record New Payment
        </button>
      </div>

      {/* Tabs for switching between dashboard and list views */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('dashboard')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => handleTabChange('list')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'list'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Payments
          </button>
        </nav>
      </div>

      <Routes>
        <Route path="/" element={<PaymentDashboard />} />
        <Route path="/list" element={<PaymentList />} />
        <Route path="/new" element={<PaymentForm />} />
        <Route path="/edit/:paymentId" element={<PaymentForm />} />
        <Route path="/:paymentId" element={<PaymentDetail />} />
        <Route path="/send-reminder/:paymentId" element={<PaymentReminderForm />} />
        <Route path="/record/:paymentId" element={<RecordPaymentForm />} />
      </Routes>
    </div>
  );
};

// Component for sending payment reminders
const PaymentReminderForm = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    includeInvoice: true,
    sendCopy: false
  });
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        setLoading(true);
        const response = await getPaymentById(paymentId);
        setPayment(response.data);
        
        // Pre-fill the subject and message
        setFormData({
          ...formData,
          subject: `Payment Reminder: Rent for ${response.data.property?.name || 'your property'}`,
          message: `Dear ${response.data.tenant?.name || 'Tenant'},

This is a friendly reminder that your rent payment of ${formatCurrency(response.data.amount)} was due on ${formatDate(response.data.dueDate)}. As of today, the payment is ${response.data.daysLate} days overdue.

Please arrange for payment as soon as possible to avoid any late fees.

If you have already made the payment, please disregard this reminder.

Thank you for your attention to this matter.

Regards,
Property Management Team`
        });
      } catch (err) {
        setError('Failed to load payment details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [paymentId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSending(true);
      await sendPaymentReminder(paymentId, formData);
      setSuccessMessage('Payment reminder sent successfully!');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/payments');
      }, 2000);
    } catch (err) {
      setError('Failed to send reminder');
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Send Payment Reminder</h2>
      
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}
      
      {payment && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Tenant</p>
              <p className="font-medium">{payment.tenant?.name || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Property</p>
              <p className="font-medium">{payment.property?.name || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Amount Due</p>
              <p className="font-medium">{formatCurrency(payment.amount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Due Date</p>
              <p className="font-medium">{formatDate(payment.dueDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Days Late</p>
              <p className="font-medium text-red-600">{payment.daysLate} days</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeInvoice"
              name="includeInvoice"
              checked={formData.includeInvoice}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="includeInvoice" className="ml-2 block text-sm text-gray-700">
              Include Invoice PDF
            </label>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="sendCopy"
              name="sendCopy"
              checked={formData.sendCopy}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="sendCopy" className="ml-2 block text-sm text-gray-700">
              Send me a copy
            </label>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/payments')}
            className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSending}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSending ? 'Sending...' : 'Send Reminder'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Component for recording a payment for an overdue invoice
const RecordPaymentForm = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    notes: '',
    includeLateFee: false,
    lateFeeAmount: '0'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        setLoading(true);
        const response = await getPaymentById(paymentId);
        setPayment(response.data);
        
        // Calculate suggested late fee (e.g., 5% of amount)
        const suggestedLateFee = response.data.amount * 0.05;
        
        // Pre-fill the amount with the due amount
        setFormData({
          ...formData,
          amount: response.data.amount.toString(),
          lateFeeAmount: suggestedLateFee.toFixed(2)
        });
      } catch (err) {
        setError('Failed to load payment details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [paymentId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const calculateTotalAmount = () => {
    const baseAmount = parseFloat(formData.amount) || 0;
    const lateFee = formData.includeLateFee ? (parseFloat(formData.lateFeeAmount) || 0) : 0;
    return (baseAmount + lateFee).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      const paymentData = {
        amount: parseFloat(formData.amount),
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      };
      
      // Include late fee if checked
      if (formData.includeLateFee) {
        paymentData.lateFee = parseFloat(formData.lateFeeAmount);
      }
      
      await recordPayment(paymentId, paymentData);
      setSuccessMessage('Payment recorded successfully!');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/payments');
      }, 2000);
    } catch (err) {
      setError('Failed to record payment');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Record Payment</h2>
      
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}
      
      {payment && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Tenant</p>
              <p className="font-medium">{payment.tenant?.name || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Property</p>
              <p className="font-medium">{payment.property?.name || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Original Due Date</p>
              <p className="font-medium">{formatDate(payment.dueDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Days Late</p>
              <p className="font-medium text-red-600">{payment.daysLate} days</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Amount
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date
            </label>
            <input
              type="date"
              id="paymentDate"
              name="paymentDate"
              value={formData.paymentDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
            Payment Method
          </label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="cash">Cash</option>
            <option value="check">Check</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="credit_card">Credit Card</option>
            <option value="debit_card">Debit Card</option>
            <option value="paypal">PayPal</option>
            <option value="venmo">Venmo</option>
            <option value="zelle">Zelle</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeLateFee"
                name="includeLateFee"
                checked={formData.includeLateFee}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="includeLateFee" className="ml-2 block text-sm text-gray-700">
                Include Late Fee
              </label>
            </div>
            
            {formData.includeLateFee && (
              <div className="w-1/3">
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    id="lateFeeAmount"
                    name="lateFeeAmount"
                    value={formData.lateFeeAmount}
                    onChange={handleChange}
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {formData.includeLateFee && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Base Amount:</span>
              <span className="font-medium">{formatCurrency(parseFloat(formData.amount) || 0)}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-gray-700">Late Fee:</span>
              <span className="font-medium">{formatCurrency(parseFloat(formData.lateFeeAmount) || 0)}</span>
            </div>
            <div className="flex justify-between items-center mt-1 pt-2 border-t border-gray-200">
              <span className="text-sm font-medium">Total Amount:</span>
              <span className="font-bold">{formatCurrency(parseFloat(calculateTotalAmount()))}</span>
            </div>
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/payments')}
            className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Recording...' : 'Record Payment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentsPage;