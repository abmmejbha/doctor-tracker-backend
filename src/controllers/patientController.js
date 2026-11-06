const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { escapeRegex, getPagination, getDateRange } = require('../utils/query');

const listPatients = async (req, res, baseFilter = {}) => {
  const { page, limit } = getPagination(req.query);
  const { search, condition, doctor, from, to } = req.query;

  const filter = { ...baseFilter };
  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: rx }, { phone: rx }];
  }
  if (condition) filter.condition = condition;
  if (doctor && !filter.doctor) filter.doctor = doctor;
  const range = getDateRange(from, to);
  if (range) filter.createdAt = range;

  const [data, total] = await Promise.all([
    Patient.find(filter)
      .populate('doctor', 'name specialization')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Patient.countDocuments(filter),
  ]);

  res.json({
    data,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
};

const getPatients = (req, res) => listPatients(req, res);

const getDoctorPatients = (req, res) =>
  listPatients(req, res, { doctor: req.params.id });

const addPatientToDoctor = async (req, res) => {
  const doctor = await Doctor.exists({ _id: req.params.id });
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

  const { name, age, phone, condition } = req.body;
  const patient = await Patient.create({
    name, age, phone, condition, doctor: req.params.id,
  });
  res.status(201).json(patient);
};

const updatePatient = async (req, res) => {
  const { name, age, phone, condition } = req.body;
  const patient = await Patient.findByIdAndUpdate(
    req.params.id,
    { name, age, phone, condition },
    { new: true, runValidators: true }
  );
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  res.json(patient);
};

const deletePatient = async (req, res) => {
  const patient = await Patient.findByIdAndDelete(req.params.id);
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  res.json({ message: 'Patient deleted' });
};

const getConditions = async (req, res) => {
  const list = await Patient.distinct('condition');
  res.json(list.sort());
};

module.exports = {
  getPatients,
  getDoctorPatients,
  addPatientToDoctor,
  updatePatient,
  deletePatient,
  getConditions,
};