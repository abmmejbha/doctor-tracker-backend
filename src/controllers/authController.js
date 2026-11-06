const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({
    token: signToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

const me = (req, res) => res.json({ user: req.user });

module.exports = { login, me };