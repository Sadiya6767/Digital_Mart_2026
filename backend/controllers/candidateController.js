const db = require('../config/db');
const path = require('path');
const fs = require('fs');

// Validate email format
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

// Validate phone number (allows standard Indian/mobile numbers)
function isValidIndianPhone(phone) {
  if (!phone) return false;
  const digits = String(phone).replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 13;
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

    // 0. Check if assessment is currently enabled by administrator
    const testSetting = await db.get("SELECT value FROM app_settings WHERE key = 'ENABLE_TEST'");
    if (testSetting && testSetting.value === 'false') {
      return res.status(403).json({
        success: false,
        code: 'TEST_DISABLED',
        message: 'The assessment is currently disabled by the administrator. Registrations are closed.'
      });
    }

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
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number.' });
    }

    // 4. Validate graduation year (permissive range: 1990 - 2040)
    const gradYearNum = parseInt(graduationYear, 10);
    if (isNaN(gradYearNum) || gradYearNum < 1990 || gradYearNum > 2040) {
      return res.status(400).json({ success: false, message: 'Please select a valid graduation year.' });
    }

    // 5. Resume file handling (resilient, accepts upload or default fallback)
    const resumePath = req.file ? req.file.filename : 'pending_submission.pdf';
    let resumeData = null;
    if (req.file && req.file.path) {
      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        if (fileBuffer.length <= 2 * 1024 * 1024) {
          resumeData = fileBuffer.toString('base64');
        }
      } catch (readErr) {
        console.warn('Could not read resume file to base64:', readErr.message);
      }
    }

    // 6. Check existing candidate
    const existing = await db.get('SELECT * FROM candidates WHERE email = ?', [trimmedEmail]);

    if (existing) {
      // Seamlessly update details and reset status so candidate can take assessment
      await db.run(`
        UPDATE candidates SET
          fullName = ?, phone = ?, collegeName = ?, degree = ?, branch = ?,
          graduationYear = ?, jobProfile = ?, status = 'REGISTERED',
          score = 0, percentage = 0, cheatingWarnings = 0, violationReason = NULL,
          testStartedAt = NULL, testSubmittedAt = NULL,
          resumePath = COALESCE(?, resumePath),
          resumeData = COALESCE(?, resumeData)
        WHERE id = ?
      `, [
        fullName.trim(),
        phone.trim(),
        collegeName.trim(),
        degree.trim(),
        branch.trim(),
        gradYearNum,
        validProfile,
        req.file ? resumePath : null,
        resumeData,
        existing.id
      ]);

      try {
        await db.run('DELETE FROM answers WHERE candidateId = ?', [existing.id]);
        await db.run('DELETE FROM test_sessions WHERE candidateId = ?', [existing.id]);
      } catch (clearErr) {
        console.warn('Error clearing candidate test session:', clearErr.message);
      }

      return res.status(200).json({
        success: true,
        message: 'Registration updated successfully! Starting assessment...',
        candidate: {
          id: existing.id,
          fullName: fullName.trim(),
          email: trimmedEmail,
          jobProfile: validProfile,
          status: 'REGISTERED'
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 50, 'REGISTERED')
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
          await db.pool.query("ALTER TABLE candidates ADD COLUMN IF NOT EXISTS totalQuestions INTEGER DEFAULT 50;");
          await db.pool.query('ALTER TABLE candidates ADD COLUMN IF NOT EXISTS resumeData TEXT;');
        } else {
          try { db.sqliteDb.exec("ALTER TABLE candidates ADD COLUMN jobProfile TEXT DEFAULT 'Web Development';"); } catch(e){}
          try { db.sqliteDb.exec("ALTER TABLE candidates ADD COLUMN totalQuestions INTEGER DEFAULT 50;"); } catch(e){}
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 50, 'REGISTERED')
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
