require('dotenv').config();
const connectDB = require('./config/db');
const Doctor = require('./models/Doctor');
const Patient = require('./models/Patient');

const specializations = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'Oncology'];
const hospitals = ['Square Hospital', 'United Hospital', 'Evercare Hospital', 'Labaid Hospital', 'Popular Hospital'];
const conditions = ['Hypertension', 'Diabetes', 'Asthma', 'Migraine', 'Arthritis', 'Fever', 'Back Pain', 'Allergy'];
const firstNames = ['Rahim', 'Karim', 'Nasrin', 'Sultana', 'Hasan', 'Farhana', 'Imran', 'Tania', 'Sabbir', 'Mithila'];
const lastNames = ['Ahmed', 'Hossain', 'Rahman', 'Khan', 'Islam', 'Chowdhury', 'Akter', 'Uddin'];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomDate = (days) => new Date(Date.now() - Math.random() * days * 24 * 60 * 60 * 1000);
const fullName = () => `${pick(firstNames)} ${pick(lastNames)}`;

(async () => {
  await connectDB();
  await Patient.deleteMany({});
  await Doctor.deleteMany({});

  const doctors = await Doctor.insertMany(
    Array.from({ length: 20 }, (_, i) => ({
      name: `Dr. ${fullName()}`,
      specialization: pick(specializations),
      hospital: pick(hospitals),
      phone: `017${Math.floor(10000000 + Math.random() * 89999999)}`,
      email: `doctor${i + 1}@example.com`,
      createdAt: randomDate(30),
    }))
  );

  await Patient.insertMany(
    Array.from({ length: 200 }, () => ({
      name: fullName(),
      age: 5 + Math.floor(Math.random() * 80),
      phone: `018${Math.floor(10000000 + Math.random() * 89999999)}`,
      condition: pick(conditions),
      doctor: pick(doctors)._id,
      createdAt: randomDate(30),
    }))
  );

  console.log('Seeded 20 doctors and 200 patients');
  process.exit(0);
})();