const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

// Ensure upload folder exists
if (!fs.existsSync(config.UPLOAD_DIR)) {
  fs.mkdirSync(config.UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    // Unique filename: candidate-timestamp-random.pdf
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `resume-${uniqueSuffix}-${sanitizedName}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Be permissive to support mobile phone uploads
  const ext = path.extname(file.originalname).toLowerCase();
  const allowed = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
  if (allowed.includes(ext) || file.mimetype.includes('pdf') || file.mimetype.includes('document') || file.mimetype.startsWith('image/') || file.mimetype === 'application/octet-stream') {
    return cb(null, true);
  }
  cb(null, true); // accept to avoid blocking candidates
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20 MB limit
  },
  fileFilter: fileFilter
});

// Middleware wrapper for friendly error messages
const uploadResumeMiddleware = (req, res, next) => {
  const uploadSingle = upload.single('resume');

  uploadSingle(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'Resume size must be less than 20 MB.' });
      }
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    } else if (err) {
      console.warn('Multer upload warning:', err.message);
      // Proceed without blocking registration
      return next();
    }
    next();
  });
};

module.exports = uploadResumeMiddleware;
