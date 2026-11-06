const Doctor = require('../models/Doctor');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createDoctor = async (req, res) => {
  const { name, specialization, hospital, phone, email } = req.body;
  const doctor = await Doctor.create({ name, specialization, hospital, phone, email });
  res.status(201).json(doctor);
};

const getDoctors = async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
  const { search, specialization, from, to } = req.query;

  const filter = {};

  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: rx }, { hospital: rx }, { email: rx }];
  }
  if (specialization) filter.specialization = specialization;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  const [data, total] = await Promise.all([
    Doctor.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Doctor.countDocuments(filter),
  ]);

  res.json({
    data,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
};

const getSpecializations = async (req, res) => {
  const list = await Doctor.distinct('specialization');
  res.json(list.sort());
};

const getDoctor = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
  res.json(doctor);
};

module.exports = { createDoctor, getDoctors, getSpecializations, getDoctor };