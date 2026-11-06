const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  getPatients,
  updatePatient,
  deletePatient,
  getConditions,
} = require('../controllers/patientController');

const patientRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('age').isInt({ min: 0, max: 150 }).withMessage('Age must be 0-150'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('condition').trim().notEmpty().withMessage('Condition is required'),
];

router.use(protect);

router.get('/conditions', getConditions);
router.get('/', getPatients);
router.route('/:id').put(patientRules, validate, updatePatient).delete(deletePatient);

module.exports = { router, patientRules };