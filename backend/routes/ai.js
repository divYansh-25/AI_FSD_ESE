const express = require('express');
const { analyzeComplaint } = require('../controllers/aiController');

const router = express.Router();

router.post('/analyze', analyzeComplaint);

module.exports = router;
