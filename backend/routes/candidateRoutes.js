const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const uploadResumeMiddleware = require('../middleware/upload');

// POST /api/candidates/register
router.post('/register', uploadResumeMiddleware, candidateController.registerCandidate);

// GET /api/candidates/:id
router.get('/:id', candidateController.getCandidateById);

module.exports = router;
