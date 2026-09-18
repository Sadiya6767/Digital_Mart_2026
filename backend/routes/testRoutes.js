const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

// POST /api/test/start
router.post('/start', testController.startTest);

// GET /api/test/session/:candidateId
router.get('/session/:candidateId', testController.getSession);

// GET /api/test/question/:candidateId/:questionNumber
router.get('/question/:candidateId/:questionNumber', testController.getQuestion);

// POST /api/test/answer
router.post('/answer', testController.submitAnswer);

// POST /api/test/submit
router.post('/submit', testController.submitTest);

module.exports = router;
