const Medicine = require('../models/Medicine');

exports.createMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.create(req.body);
    res.status(201).json({ medicine });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMedicines = async (req, res) => {
  try {
    const { search = '', lowStock, expiringSoon } = req.query;
    const query = { isActive: true };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    let medicines = await Medicine.find(query).sort({ name: 1 });

    if (lowStock === 'true') {
      medicines = medicines.filter((m) => m.stockQuantity <= m.reorderLevel);
    }
    if (expiringSoon === 'true') {
      const in30Days = new Date();
      in30Days.setDate(in30Days.getDate() + 30);
      medicines = medicines.filter((m) => new Date(m.expiryDate) <= in30Days);
    }

    res.json({ medicines });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.json({ medicine });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.json({ medicine });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.json({ message: 'Medicine deactivated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};