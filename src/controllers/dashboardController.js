const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

const dailyCounts = (Model, since) =>
  Model.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Dhaka' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: '$_id', count: 1 } },
  ]);

const getStats = async (req, res) => {
  const days = Math.min(Math.max(parseInt(req.query.days) || 30, 1), 365);
  const since = new Date();
  since.setDate(since.getDate() - days + 1);
  since.setHours(0, 0, 0, 0);

  const [totalDoctors, totalPatients, patientsPerDoctor, conditions, patientsByDate, doctorsByDate] =
    await Promise.all([
      Doctor.countDocuments(),
      Patient.countDocuments(),
      Patient.aggregate([
        { $group: { _id: '$doctor', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'doctors', localField: '_id', foreignField: '_id', as: 'doctor' } },
        { $unwind: '$doctor' },
        {
          $project: {
            _id: 0,
            doctorId: '$_id',
            name: '$doctor.name',
            specialization: '$doctor.specialization',
            count: 1,
          },
        },
      ]),
      Patient.aggregate([
        { $group: { _id: '$condition', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
        { $project: { _id: 0, condition: '$_id', count: 1 } },
      ]),
      dailyCounts(Patient, since),
      dailyCounts(Doctor, since),
    ]);

  res.json({
    totals: { doctors: totalDoctors, patients: totalPatients },
    patientsPerDoctor,
    conditions,
    patientsByDate,
    doctorsByDate,
    days,
  });
};

module.exports = { getStats };