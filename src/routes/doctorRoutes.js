const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  createDoctor,
  getDoctors,
  getSpecializations,
  getDoctor,
} = require('../controllers/doctorController');

const doctorRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('specialization').trim().notEmpty().withMessage('Specialization is required'),
  body('hospital').trim().notEmpty().withMessage('Hospital is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('email').isEmail().withMessage('Valid email is required'),
];

router.use(protect);

router.get('/specializations', getSpecializations);
router.route('/').get(getDoctors).post(doctorRules, validate, createDoctor);
router.get('/:id', getDoctor);

module.exports = router;