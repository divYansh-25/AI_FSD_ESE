const express = require('express');

const { body } = require('express-validator');
const {
  addComplaint,
  getAllComplaints,
  searchByLocation,
  getComplaint,
  updateComplaint,
  deleteComplaint
} = require('../controllers/complaintController');
const { protect } = require('../middleware/auth');

const router = express.Router();


router.get('/search', searchByLocation);

// router.get('/', getAllComplaints);
router.get('/', protect, getAllComplaints);

router.post('/',protect, [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('location').notEmpty().withMessage('Location is required')
], addComplaint);

router.get('/:id', getComplaint);
router.put('/:id', protect, updateComplaint);
router.delete('/:id', protect, deleteComplaint);

module.exports = router;
