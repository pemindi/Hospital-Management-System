import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  getPatientReport, getAppointmentReport, getRevenueReport,
  getPharmacyReport, getLaboratoryReport, getStaffReport,
} from '../services/reportService';

const TABS = ['Patients', 'Appointments', 'Revenue', 'Pharmacy', 'Laboratory', 'Staff'];
const COLORS = ['#1d4ed8', '#16a34a', '#dc2626', '#ca8a04', '#7c3aed', '#0891b2'];

const StatCard = ({ label, value }) => (
  <div className="bg-white p-4 rounded-lg shadow text-center">
    <p className="text-2xl font-bold text-blue-700">{value}</p>
    <p className="text-sm text-gray-600">{label}</p>
  </div>
);

const Reports = () => {
  const [activeTab, setActiveTab] = useState('Patients');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    setData(null); // clear stale data from the previous tab so we never render mismatched shapes

    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const fetchers = {
      Patients: getPatientReport,
      Appointments: getAppointmentReport,
      Revenue: getRevenueReport,
      Pharmacy: getPharmacyReport,
      Laboratory: getLaboratoryReport,
      Staff: getStaffReport,
    };

    try {
      const result = await fetchers[activeTab](params);
      setData(result);
    } catch (err) {
      // This is the critical fix: without this catch, a failed request left
      // loading stuck at true forever and could crash the whole page.
      setError(err.response?.data?.message || 'Failed to load this report. Check the console for details.');
      console.error('Report fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchReport();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Reports</h1>
        <Link to="/dashboard" className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Back</Link>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded text-sm font-medium ${
              activeTab === tab ? 'bg-blue-700 text-white' : 'bg-white text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <form onSubmit={handleFilter} className="mb-6 flex gap-2 items-end">
        <div>
          <label className="block text-xs font-medium mb-1">From</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">To</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border rounded px-3 py-2" />
        </div>
        <button type="submit" className="bg-gray-700 text-white px-4 py-2 rounded">Apply</button>
      </form>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : !data ? (
        error ? null : <p className="text-gray-500">No data available.</p>
      ) : (
        <>
          {activeTab === 'Patients' && (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <StatCard label="Total Patients" value={data.totalPatients ?? 0} />
              </div>
              <div className="bg-white p-4 rounded-lg shadow" style={{ height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={data.genderBreakdown || []} dataKey="count" nameKey="_id" outerRadius={100} label>
                      {(data.genderBreakdown || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {activeTab === 'Appointments' && (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <StatCard label="Total Appointments" value={data.totalAppointments ?? 0} />
              </div>
              <div className="bg-white p-4 rounded-lg shadow mb-4" style={{ height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={data.dailyTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#1d4ed8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-4 rounded-lg shadow" style={{ height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={data.statusBreakdown || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#16a34a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {activeTab === 'Revenue' && (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <StatCard label="Total Billed" value={`Rs. ${Number(data.totalBilled ?? 0).toFixed(2)}`} />
                <StatCard label="Total Collected" value={`Rs. ${Number(data.totalCollected ?? 0).toFixed(2)}`} />
                <StatCard label="Outstanding" value={`Rs. ${Number(data.outstandingBalance ?? 0).toFixed(2)}`} />
              </div>
              <div className="bg-white p-4 rounded-lg shadow mb-4" style={{ height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={data.dailyTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#16a34a" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-4 rounded-lg shadow" style={{ height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={data.byCategory || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#1d4ed8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {activeTab === 'Pharmacy' && (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <StatCard label="Medicines In Stock" value={data.totalMedicinesInStock ?? 0} />
                <StatCard label="Low Stock Items" value={data.lowStockCount ?? 0} />
                <StatCard label="Expiring Soon (30d)" value={data.expiringSoonCount ?? 0} />
              </div>
              <div className="bg-white p-4 rounded-lg shadow" style={{ height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={data.topMedicines || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="totalDispensed" fill="#7c3aed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {activeTab === 'Laboratory' && (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <StatCard label="Total Tests" value={data.totalTests ?? 0} />
              </div>
              <div className="bg-white p-4 rounded-lg shadow mb-4" style={{ height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={data.statusBreakdown || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0891b2" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-4 rounded-lg shadow" style={{ height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={data.topTestTypes || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ca8a04" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {activeTab === 'Staff' && (
            <>
              <div className="bg-white p-4 rounded-lg shadow mb-4" style={{ height: 300 }}>
                <h3 className="font-bold mb-2 px-2 pt-2">Attendance</h3>
                <ResponsiveContainer>
                  <BarChart data={data.attendanceBreakdown || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#16a34a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-4 rounded-lg shadow" style={{ height: 300 }}>
                <h3 className="font-bold mb-2 px-2 pt-2">Leave Requests</h3>
                <ResponsiveContainer>
                  <BarChart data={data.leaveBreakdown || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#dc2626" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;