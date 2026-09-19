const path = require('path');
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'digital_mart_assessment_secret_jwt_key_2026',
  SHOW_STUDENT_SCORE: process.env.SHOW_STUDENT_SCORE === 'true' ? true : false,
  ENABLE_TAB_WARNING: process.env.ENABLE_TAB_WARNING !== 'false', // default true
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'Sadiya7890',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'SadiyaAdmin@DigitalMart2026',
  DATABASE_URL: process.env.DATABASE_URL || null,
  UPLOAD_DIR: path.join(__dirname, '../uploads'),
  DB_PATH: path.join(__dirname, '../database/assessment.sqlite')
};
