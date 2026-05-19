const { validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');

// POST /api/complaints
exports.addComplaint = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    // const complaint = await Complaint.create(req.body);
    const complaint = await Complaint.create({ ...req.body, userId: req.user?._id });
    res.status(201).json({ message: 'Complaint stored successfully', complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/complaints
exports.getAllComplaints = async (req, res) => {
  try {
    const { category, status } = req.query;
    // const filter = {};
    // if (category) filter.category = category;
    // if (status) filter.status = status;
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (req.user?.role !== 'admin') filter.userId = req.user?._id;
    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/complaints/search?location=xyz
exports.searchByLocation = async (req, res) => {
  try {
    const { location } = req.query;
    if (!location) return res.status(400).json({ message: 'Location query param required' });
    const complaints = await Complaint.find({ location: { $regex: location, $options: 'i' } }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/complaints/:id
exports.getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/complaints/:id
exports.updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json({ message: 'Updated status shown', complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/complaints/:id
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json({ message: 'Complaint removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
