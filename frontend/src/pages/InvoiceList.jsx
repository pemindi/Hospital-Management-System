import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getInvoices } from '../services/invoiceService';

const statusColors = {
  unpaid: 'bg-red-100 text-red-700',
  partial: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
};

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = {};
      if (status) params.status = status;
      const data = await getInvoices(params);
      setInvoices(data.invoices);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Billing</h1>
        <div className="flex gap-2">
          <Link to="/dashboard" className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
            Back
          </Link>
          <Link
            to="/invoices/new"
            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
          >
            + Generate Invoice
          </Link>
        </div>
      </div>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="border rounded px-3 py-2 mb-4"
      >
        <option value="">All Statuses</option>
        <option value="unpaid">Unpaid</option>
        <option value="partial">Partial</option>
        <option value="paid">Paid</option>
      </select>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Patient</th>
              <th className="p-3">Total</th>
              <th className="p-3">Paid</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No invoices found
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv._id} className="border-t">
                  <td className="p-3">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    {inv.patient?.firstName} {inv.patient?.lastName}
                  </td>
                  <td className="p-3">Rs. {inv.totalAmount.toFixed(2)}</td>
                  <td className="p-3">Rs. {inv.paidAmount.toFixed(2)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[inv.paymentStatus]}`}>
                      {inv.paymentStatus}
                    </span>
                  </td>
                  <td className="p-3">
                    <Link to={`/invoices/${inv._id}`} className="text-blue-700 underline text-sm">
                      View / Pay
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceList;