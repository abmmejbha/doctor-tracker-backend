const router = require('express').Router();
const { body } = require('express-validator');
const { login, me } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  login
);
router.get('/me', protect, me);

module.exports = router;