import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getInvoiceById, recordPayment } from '../services/invoiceService';

const InvoiceDetail = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const [error, setError] = useState('');

  const fetchInvoice = () => {
    getInvoiceById(id).then(({ invoice }) => setInvoice(invoice));
  };

  useEffect(() => {
    fetchInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await recordPayment(id, { amount: Number(amount), paymentMethod: method });
      setAmount('');
      fetchInvoice();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    }
  };

  if (!invoice) return <div className="p-8 text-center">Loading...</div>;

  const balance = invoice.totalAmount - invoice.paidAmount;

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl print:shadow-none">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <h1 className="text-2xl font-bold text-blue-700">Invoice</h1>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              Print Receipt
            </button>
            <Link to="/invoices" className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
              Back
            </Link>
          </div>
        </div>

        <div className="mb-4">
          <p>
            <strong>Patient:</strong> {invoice.patient?.firstName} {invoice.patient?.lastName}
          </p>
          <p>
            <strong>Phone:</strong> {invoice.patient?.phone}
          </p>
          <p>
            <strong>Date:</strong> {new Date(invoice.createdAt).toLocaleDateString()}
          </p>
        </div>

        <table className="w-full text-left mb-4 border-t border-b">
          <thead>
            <tr className="border-b">
              <th className="py-2">Description</th>
              <th className="py-2">Category</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i} className="border-b">
                <td className="py-2">{item.description}</td>
                <td className="py-2 capitalize">{item.category}</td>
                <td className="py-2 text-right">Rs. {item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-right space-y-1 mb-6">
          <p>Total: <strong>Rs. {invoice.totalAmount.toFixed(2)}</strong></p>
          <p>Paid: <strong>Rs. {invoice.paidAmount.toFixed(2)}</strong></p>
          <p className={balance > 0 ? 'text-red-600' : 'text-green-600'}>
            Balance: <strong>Rs. {balance.toFixed(2)}</strong>
          </p>
        </div>

        {balance > 0 && (
          <form onSubmit={handlePayment} className="print:hidden border-t pt-4">
            <h2 className="font-bold mb-2">Record Payment</h2>
            {error && <div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-2">{error}</div>}
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                max={balance}
                required
                className="border rounded px-3 py-2 flex-1"
              />
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="insurance">Insurance</option>
              </select>
              <button
                type="submit"
                className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800"
              >
                Record
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetail;