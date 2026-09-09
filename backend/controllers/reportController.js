const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Invoice = require('../models/Invoice');
const DispenseRecord = require('../models/DispenseRecord');
const Medicine = require('../models/Medicine');
const LabTest = require('../models/LabTest');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');

// Helper: build a { $gte, $lte } date range from query params, defaulting to "all time"
const buildDateRange = (startDate, endDate) => {
  const range = {};
  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    range.$gte = start;
  }
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    range.$lte = end;
  }
  return range;
};

// @desc    Patient report: new registrations, gender + blood group breakdown
// @route   GET /api/reports/patients?startDate=&endDate=
exports.getPatientReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = buildDateRange(startDate, endDate);
    const query = { isActive: true };
    if (Object.keys(dateFilter).length) query.createdAt = dateFilter;

    const totalPatients = await Patient.countDocuments(query);

    const genderBreakdown = await Patient.aggregate([
      { $match: query },
      { $group: { _id: '$gender', count: { $sum: 1 } } },
    ]);

    const bloodGroupBreakdown = await Patient.aggregate([
      { $match: query },
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
    ]);

    res.json({ totalPatients, genderBreakdown, bloodGroupBreakdown });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Appointment report: counts by status, daily trend
// @route   GET /api/reports/appointments?startDate=&endDate=
exports.getAppointmentReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = buildDateRange(startDate, endDate);
    const query = {};
    if (Object.keys(dateFilter).length) query.date = dateFilter;

    const totalAppointments = await Appointment.countDocuments(query);

    const statusBreakdown = await Appointment.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Group by calendar day for a simple trend line
    const dailyTrend = await Appointment.aggregate([
      { $match: query },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ totalAppointments, statusBreakdown, dailyTrend });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Revenue report: total, by category, daily trend
// @route   GET /api/reports/revenue?startDate=&endDate=
exports.getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = buildDateRange(startDate, endDate);
    const query = {};
    if (Object.keys(dateFilter).length) query.createdAt = dateFilter;

    const totals = await Invoice.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalBilled: { $sum: '$totalAmount' },
          totalCollected: { $sum: '$paidAmount' },
        },
      },
    ]);

    // Unwind breaks each invoice's `items` array into separate rows,
    // so we can group by category across ALL invoices at once
    const byCategory = await Invoice.aggregate([
      { $match: query },
      { $unwind: '$items' },
      { $group: { _id: '$items.category', total: { $sum: '$items.amount' } } },
    ]);

    const dailyTrend = await Invoice.aggregate([
      { $match: query },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$paidAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalBilled: totals[0]?.totalBilled || 0,
      totalCollected: totals[0]?.totalCollected || 0,
      outstandingBalance: (totals[0]?.totalBilled || 0) - (totals[0]?.totalCollected || 0),
      byCategory,
      dailyTrend,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Pharmacy report: dispensed totals, top medicines, low stock count
// @route   GET /api/reports/pharmacy?startDate=&endDate=
exports.getPharmacyReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = buildDateRange(startDate, endDate);
    const query = {};
    if (Object.keys(dateFilter).length) query.createdAt = dateFilter;

    const topMedicines = await DispenseRecord.aggregate([
      { $match: query },
      { $group: { _id: '$medicine', totalDispensed: { $sum: '$quantity' } } },
      { $sort: { totalDispensed: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'medicines', // MongoDB collection name (lowercase, pluralized automatically by Mongoose)
          localField: '_id',
          foreignField: '_id',
          as: 'medicineInfo',
        },
      },
      { $unwind: '$medicineInfo' },
      { $project: { name: '$medicineInfo.name', totalDispensed: 1 } },
    ]);

    const allMedicines = await Medicine.find({ isActive: true });
    const lowStockCount = allMedicines.filter((m) => m.stockQuantity <= m.reorderLevel).length;

    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);
    const expiringSoonCount = allMedicines.filter((m) => new Date(m.expiryDate) <= in30Days).length;

    res.json({ topMedicines, lowStockCount, expiringSoonCount, totalMedicinesInStock: allMedicines.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Laboratory report: tests by status, tests by type
// @route   GET /api/reports/laboratory?startDate=&endDate=
exports.getLaboratoryReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = buildDateRange(startDate, endDate);
    const query = {};
    if (Object.keys(dateFilter).length) query.createdAt = dateFilter;

    const totalTests = await LabTest.countDocuments(query);

    const statusBreakdown = await LabTest.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const topTestTypes = await LabTest.aggregate([
      { $match: query },
      { $group: { _id: '$testType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json({ totalTests, statusBreakdown, topTestTypes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Staff report: attendance summary, leave summary
// @route   GET /api/reports/staff?startDate=&endDate=
exports.getStaffReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = buildDateRange(startDate, endDate);
    const attendanceQuery = {};
    if (Object.keys(dateFilter).length) attendanceQuery.date = dateFilter;

    const attendanceBreakdown = await Attendance.aggregate([
      { $match: attendanceQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const leaveQuery = {};
    if (Object.keys(dateFilter).length) leaveQuery.createdAt = dateFilter;

    const leaveBreakdown = await Leave.aggregate([
      { $match: leaveQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({ attendanceBreakdown, leaveBreakdown });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Quick summary stats for the main dashboard (all logged-in roles can view)
// @route   GET /api/reports/dashboard-summary
exports.getDashboardSummary = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments({ isActive: true });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todaysAppointments = await Appointment.countDocuments({
      date: { $gte: startOfToday, $lte: endOfToday },
    });

   const todaysRevenueResult = await Invoice.aggregate([
     { $match: { createdAt: { $gte: startOfToday, $lte: endOfToday } } },
     { $group: { _id: null, total: { $sum: '$paidAmount' } } },
   ]);

    const pendingLabRequests = await LabTest.countDocuments({
      status: { $in: ['requested', 'sample_collected', 'in_progress'] },
    });

    const allMedicines = await Medicine.find({ isActive: true });
    const lowStockAlerts = allMedicines.filter((m) => m.stockQuantity <= m.reorderLevel).length;

    res.json({
      totalPatients,
      todaysAppointments,
      todaysRevenue: todaysRevenueResult[0]?.total || 0,
      pendingLabRequests,
      lowStockAlerts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};