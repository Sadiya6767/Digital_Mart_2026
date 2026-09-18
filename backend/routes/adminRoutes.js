const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

// POST /api/admin/login
router.post('/login', adminController.login);

// GET /api/admin/candidates
router.get('/candidates', authMiddleware, adminController.getCandidates);

// GET /api/admin/candidates/:id
router.get('/candidates/:id', authMiddleware, adminController.getCandidateDetails);

// GET /api/admin/resume/:id
router.get('/resume/:id', authMiddleware, adminController.getResume);

// GET /api/admin/settings
router.get('/settings', authMiddleware, adminController.getSettings);

// PUT /api/admin/settings
router.put('/settings', authMiddleware, adminController.updateSettings);

// POST /api/admin/reset-active-session
router.post('/reset-active-session', authMiddleware, adminController.resetActiveSession);

// DELETE /api/admin/candidates/:id
router.delete('/candidates/:id', authMiddleware, adminController.deleteCandidate);

// POST /api/admin/candidates/bulk-delete
router.post('/candidates/bulk-delete', authMiddleware, adminController.bulkDeleteCandidates);

// POST /api/admin/candidates/delete-all
router.post('/candidates/delete-all', authMiddleware, adminController.deleteAllCandidates);

module.exports = router;
