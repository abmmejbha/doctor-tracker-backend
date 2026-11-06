require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

(async () => {
  await connectDB();
  await User.deleteMany({ email: 'admin@doctortracker.com' });
  await User.create({
    name: 'Admin',
    email: 'admin@doctortracker.com',
    password: 'Admin@123',
  });
  console.log('Admin created: admin@doctortracker.com / Admin@123');
  process.exit(0);
})();