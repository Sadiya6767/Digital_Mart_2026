const db = require('../config/db');
const path = require('path');
const fs = require('fs');

// Validate email format
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

// Validate 10-digit Indian phone number (starts with 6-9, optionally with +91 or 0)
function isValidIndianPhone(phone) {
  const cleanPhone = String(phone).replace(/[\s\-+]/g, '');
  const tenDigit = cleanPhone.length === 12 && cleanPhone.startsWith('91') 
    ? cleanPhone.slice(2) 
    : (cleanPhone.length === 11 && cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone);
  return /^[6-9]\d{9}$/.test(tenDigit);
}

exports.registerCandidate = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      collegeName,
      degree,
      branch,
      graduationYear,
      jobProfile,
      confirmed
    } = req.body;

    // 1. Validate required fields
    if (!fullName || !email || !phone || !collegeName || !degree || !branch || !graduationYear) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (confirmed !== 'true' && confirmed !== true) {
      return res.status(400).json({ success: false, message: 'Please confirm that the information provided is correct.' });
    }

    // Validate job profile (must be Web Development or Business Development Executive)
    const allowedProfiles = ['Web Development', 'Business Development Executive'];
    const validProfile = (jobProfile && allowedProfiles.includes(jobProfile.trim()))
      ? jobProfile.trim()
      : 'Web Development';

    // 2. Validate email
    const trimmedEmail = email.trim().toLowerCase();
    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    // 3. Validate phone number
    if (!isValidIndianPhone(phone)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit Indian mobile number.' });
    }

    // 4. Validate graduation year
    const gradYearNum = parseInt(graduationYear, 10);
    const currentYear = new Date().getFullYear();
    if (isNaN(gradYearNum) || gradYearNum < currentYear - 6 || gradYearNum > currentYear + 6) {
      return res.status(400).json({ success: false, message: 'Please enter a reasonable graduation year.' });
    }

    // 5. Validate resume file
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload your resume (PDF only, max 5 MB).' });
    }

    const resumePath = req.file.filename;
    let resumeData = null;
    if (req.file.path) {
      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        resumeData = fileBuffer.toString('base64');
      } catch (readErr) {
        console.warn('Could not read resume file to base64:', readErr.message);
      }
    }

    // 6. Check existing candidate
    const existing = await db.get('SELECT * FROM candidates WHERE email = ?', [trimmedEmail]);

    if (existing) {
      if (existing.status === 'COMPLETED' || existing.status === 'AUTO_SUBMITTED') {
        return res.status(400).json({
          success: false,
          code: 'ALREADY_COMPLETED',
          message: 'This email has already completed the assessment.'
        });
      }

      // If IN_PROGRESS or REGISTERED, allow them to proceed/resume
      return res.status(200).json({
        success: true,
        message: 'Existing registration found. You may continue your assessment.',
        candidate: {
          id: existing.id,
          fullName: existing.fullName,
          email: existing.email,
          jobProfile: existing.jobProfile || existing.jobprofile || 'Web Development',
          status: existing.status
        }
      });
    }

    // 7. Insert new candidate with selected job profile
    let candidateId;
    try {
      const result = await db.run(`
        INSERT INTO candidates (
          fullName, email, phone, collegeName, degree, branch, graduationYear,
          jobProfile, resumePath, resumeData, registeredAt, totalQuestions, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 30, 'REGISTERED')
      `, [
        fullName.trim(),
        trimmedEmail,
        phone.trim(),
        collegeName.trim(),
        degree.trim(),
        branch.trim(),
        gradYearNum,
        validProfile,
        resumePath,
        resumeData,
        new Date().toISOString()
      ]);
      candidateId = Number(result.lastInsertRowid);
    } catch (insertErr) {
      console.warn('Initial candidate insert failed, ensuring schema migration:', insertErr.message);
      // Run fallback migrations on-the-fly
      try {
        if (db.isPostgres) {
          await db.pool.query("ALTER TABLE candidates ADD COLUMN IF NOT EXISTS jobProfile TEXT DEFAULT 'Web Development';");
          await db.pool.query("ALTER TABLE candidates ADD COLUMN IF NOT EXISTS totalQuestions INTEGER DEFAULT 30;");
          await db.pool.query('ALTER TABLE candidates ADD COLUMN IF NOT EXISTS resumeData TEXT;');
        } else {
          try { db.sqliteDb.exec("ALTER TABLE candidates ADD COLUMN jobProfile TEXT DEFAULT 'Web Development';"); } catch(e){}
          try { db.sqliteDb.exec("ALTER TABLE candidates ADD COLUMN totalQuestions INTEGER DEFAULT 30;"); } catch(e){}
          try { db.sqliteDb.exec("ALTER TABLE candidates ADD COLUMN resumeData TEXT;"); } catch(e){}
        }
      } catch (migErr) {
        console.error('On-the-fly migration error:', migErr.message);
      }

      // Retry insert with guaranteed columns
      const retryResult = await db.run(`
        INSERT INTO candidates (
          fullName, email, phone, collegeName, degree, branch, graduationYear,
          jobProfile, resumePath, resumeData, registeredAt, totalQuestions, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 30, 'REGISTERED')
      `, [
        fullName.trim(),
        trimmedEmail,
        phone.trim(),
        collegeName.trim(),
        degree.trim(),
        branch.trim(),
        gradYearNum,
        validProfile,
        resumePath,
        resumeData,
        new Date().toISOString()
      ]);
      candidateId = Number(retryResult.lastInsertRowid);
    }

    return res.status(201).json({
      success: true,
      message: 'Registration successful! You can now start the assessment.',
      candidate: {
        id: candidateId,
        fullName: fullName.trim(),
        email: trimmedEmail,
        jobProfile: validProfile,
        status: 'REGISTERED'
      }
    });

  } catch (err) {
    console.error('Registration error details:', err.message, err);
    return res.status(500).json({ 
      success: false, 
      message: err.message ? `Registration failed: ${err.message}` : 'Server error during registration. Please try again.' 
    });
  }
};

exports.getCandidateById = async (req, res) => {
  try {
    const candidateId = parseInt(req.params.id, 10);
    const candidate = await db.get('SELECT id, fullName, email, phone, collegeName, degree, branch, graduationYear, jobProfile, status, registeredAt, testStartedAt, testSubmittedAt FROM candidates WHERE id = ?', [candidateId]);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found.' });
    }
    return res.status(200).json({ success: true, candidate });
  } catch (err) {
    console.error('Get candidate error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve candidate information.' });
  }
};
