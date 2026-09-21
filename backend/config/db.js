const path = require('path');
const fs = require('fs');
const config = require('./config');

const isPostgres = Boolean(config.DATABASE_URL || process.env.DATABASE_URL);

let dbWrapper;

if (isPostgres) {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: config.DATABASE_URL || process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    max: 30, // Optimized for 100+ concurrent students
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
  });

  function convertSql(sql) {
    let paramIndex = 1;
    let converted = sql.replace(/\?/g, () => `$${paramIndex++}`);
    return converted;
  }

  const camelMap = {
    questionorder: 'questionOrder',
    optionorders: 'optionOrders',
    currentquestion: 'currentQuestion',
    starttime: 'startTime',
    endtime: 'endTime',
    candidateid: 'candidateId',
    questionid: 'questionId',
    selectedanswer: 'selectedAnswer',
    iscorrect: 'isCorrect',
    answeredat: 'answeredAt',
    fullname: 'fullName',
    collegename: 'collegeName',
    graduationyear: 'graduationYear',
    resumepath: 'resumePath',
    resumedata: 'resumeData',
    registeredat: 'registeredAt',
    teststartedat: 'testStartedAt',
    testsubmittedat: 'testSubmittedAt',
    totalquestions: 'totalQuestions',
    optiona: 'optionA',
    optionb: 'optionB',
    optionc: 'optionC',
    optiond: 'optionD',
    correctanswer: 'correctAnswer',
    isactive: 'isActive',
    passwordhash: 'passwordHash',
    createdat: 'createdAt',
    jobprofile: 'jobProfile'
  };

  function normalizeRow(row) {
    if (!row || typeof row !== 'object') return row;
    const copy = { ...row };
    for (const [key, val] of Object.entries(row)) {
      const camel = camelMap[key.toLowerCase()];
      if (camel && copy[camel] === undefined) {
        copy[camel] = val;
      }
    }
    return new Proxy(copy, {
      get(target, prop) {
        if (typeof prop === 'string') {
          if (prop in target) return target[prop];
          const lower = prop.toLowerCase();
          if (lower in target) return target[lower];
          const camel = camelMap[lower];
          if (camel && camel in target) return target[camel];
        }
        return target[prop];
      }
    });
  }

  dbWrapper = {
    isPostgres: true,
    pool,
    async get(sql, params = []) {
      const converted = convertSql(sql);
      const res = await pool.query(converted, params);
      return normalizeRow(res.rows[0]);
    },
    async all(sql, params = []) {
      const converted = convertSql(sql);
      const res = await pool.query(converted, params);
      return (res.rows || []).map(normalizeRow);
    },
    async run(sql, params = []) {
      let converted = convertSql(sql);
      const isInsert = /^\s*INSERT\s+INTO\s+/i.test(sql);
      if (isInsert && !/RETURNING/i.test(converted) && !/app_settings/i.test(converted)) {
        converted += ' RETURNING id';
      }
      const res = await pool.query(converted, params);
      return {
        lastInsertRowid: res.rows?.[0]?.id,
        changes: res.rowCount
      };
    },
    async exec(sql) {
      return pool.query(sql);
    },
    prepare(sql) {
      return {
        get: (...params) => dbWrapper.get(sql, params),
        all: (...params) => dbWrapper.all(sql, params),
        run: (...params) => dbWrapper.run(sql, params)
      };
    }
  };

  // Auto initialize tables for PostgreSQL / Neon
  async function initPg() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS questions (
          id SERIAL PRIMARY KEY,
          category TEXT NOT NULL,
          question TEXT NOT NULL,
          optionA TEXT NOT NULL,
          optionB TEXT NOT NULL,
          optionC TEXT NOT NULL,
          optionD TEXT NOT NULL,
          correctAnswer TEXT NOT NULL,
          difficulty TEXT NOT NULL,
          isActive INTEGER DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS candidates (
          id SERIAL PRIMARY KEY,
          fullName TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          phone TEXT NOT NULL,
          collegeName TEXT NOT NULL,
          degree TEXT NOT NULL,
          branch TEXT NOT NULL,
          graduationYear INTEGER NOT NULL,
          jobProfile TEXT NOT NULL DEFAULT 'Web Development',
          resumePath TEXT NOT NULL,
          resumeData TEXT,
          registeredAt TEXT NOT NULL,
          testStartedAt TEXT,
          testSubmittedAt TEXT,
          score INTEGER DEFAULT 0,
          totalQuestions INTEGER DEFAULT 30,
          percentage REAL DEFAULT 0.0,
          status TEXT DEFAULT 'REGISTERED'
        );

        CREATE TABLE IF NOT EXISTS test_sessions (
          id SERIAL PRIMARY KEY,
          candidateId INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
          questionOrder TEXT NOT NULL,
          optionOrders TEXT NOT NULL,
          currentQuestion INTEGER DEFAULT 1,
          startTime TEXT NOT NULL,
          endTime TEXT NOT NULL,
          status TEXT DEFAULT 'IN_PROGRESS'
        );

        CREATE TABLE IF NOT EXISTS answers (
          id SERIAL PRIMARY KEY,
          candidateId INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
          questionId INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
          selectedAnswer TEXT NOT NULL,
          isCorrect INTEGER NOT NULL,
          answeredAt TEXT NOT NULL,
          UNIQUE(candidateId, questionId)
        );

        CREATE TABLE IF NOT EXISTS admin_users (
          id SERIAL PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          passwordHash TEXT NOT NULL,
          createdAt TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS app_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_sessions_candidate ON test_sessions(candidateId);
        CREATE INDEX IF NOT EXISTS idx_answers_candidate ON answers(candidateId);
        CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
        CREATE INDEX IF NOT EXISTS idx_sessions_status ON test_sessions(status);
        CREATE INDEX IF NOT EXISTS idx_questions_active ON questions(isActive);
      `);

      // Ensure resumeData & jobProfile & totalQuestions columns exist if table existed previously
      try {
        await pool.query('ALTER TABLE candidates ADD COLUMN IF NOT EXISTS resumeData TEXT;');
      } catch (e) {
        // Ignored
      }
      try {
        await pool.query("ALTER TABLE candidates ADD COLUMN IF NOT EXISTS jobProfile TEXT DEFAULT 'Web Development';");
      } catch (e) {
        // Ignored
      }
      try {
        await pool.query("ALTER TABLE candidates ADD COLUMN IF NOT EXISTS totalQuestions INTEGER DEFAULT 30;");
      } catch (e) {
        // Ignored
      }
      try {
        await pool.query('CREATE INDEX IF NOT EXISTS idx_candidates_jobprofile ON candidates(jobProfile);');
      } catch (e) {
        // Ignored
      }

      // Default settings
      await pool.query(`
        INSERT INTO app_settings (key, value)
        VALUES ('SHOW_STUDENT_SCORE', $1)
        ON CONFLICT (key) DO NOTHING;
      `, [config.SHOW_STUDENT_SCORE ? 'true' : 'false']);

      await pool.query(`
        INSERT INTO app_settings (key, value)
        VALUES ('ENABLE_TAB_WARNING', $1)
        ON CONFLICT (key) DO NOTHING;
      `, [config.ENABLE_TAB_WARNING ? 'true' : 'false']);

      // Ensure admin exists
      const bcrypt = require('bcryptjs');
      const adminRes = await pool.query('SELECT id FROM admin_users WHERE username = $1', [config.ADMIN_USERNAME]);
      if (adminRes.rows.length === 0) {
        const hash = bcrypt.hashSync(config.ADMIN_PASSWORD, 10);
        await pool.query('INSERT INTO admin_users (username, passwordHash, createdAt) VALUES ($1, $2, $3)', [
          config.ADMIN_USERNAME,
          hash,
          new Date().toISOString()
        ]);
        console.log(`[Neon Postgres] Default admin created: ${config.ADMIN_USERNAME}`);
      }

      // Check if questions need auto-seeding (ensure full 60 questions: 30 Web Dev + 30 Biz Dev)
      const qCountRes = await pool.query('SELECT COUNT(*) as count FROM questions');
      const currentCount = parseInt(qCountRes.rows[0].count, 10);
      if (currentCount < 60) {
        console.log(`[Neon Postgres] Questions table has ${currentCount} questions. Ensuring full 60 questions...`);
        const { questions } = require('../database/seedQuestions');
        for (const q of questions) {
          const exists = await pool.query('SELECT id FROM questions WHERE question = $1', [q.question]);
          if (exists.rows.length === 0) {
            await pool.query(`
              INSERT INTO questions (category, question, optionA, optionB, optionC, optionD, correctAnswer, difficulty, isActive)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1)
            `, [q.category, q.question, q.optionA, q.optionB, q.optionC, q.optionD, q.correctAnswer, q.difficulty]);
          }
        }
        console.log(`[Neon Postgres] Successfully verified and updated questions bank.`);
      }

      console.log('[Neon Postgres] Connected and verified successfully.');
    } catch (err) {
      console.error('[Neon Postgres] Initialization error:', err);
    }
  }

  initPg();

} else {
  // SQLite Fallback
  const { DatabaseSync } = require('node:sqlite');
  const dbDir = path.dirname(config.DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const sqliteDb = new DatabaseSync(config.DB_PATH);

  try {
    sqliteDb.exec('PRAGMA foreign_keys = ON;');
    sqliteDb.exec('PRAGMA journal_mode = WAL;');
  } catch (err) {
    console.warn('Pragma warning:', err.message);
  }

  function initSqlite() {
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        question TEXT NOT NULL,
        optionA TEXT NOT NULL,
        optionB TEXT NOT NULL,
        optionC TEXT NOT NULL,
        optionD TEXT NOT NULL,
        correctAnswer TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        isActive INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS candidates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        collegeName TEXT NOT NULL,
        degree TEXT NOT NULL,
        branch TEXT NOT NULL,
        graduationYear INTEGER NOT NULL,
        jobProfile TEXT NOT NULL DEFAULT 'Web Development',
        resumePath TEXT NOT NULL,
        resumeData TEXT,
        registeredAt TEXT NOT NULL,
        testStartedAt TEXT,
        testSubmittedAt TEXT,
        score INTEGER DEFAULT 0,
        totalQuestions INTEGER DEFAULT 30,
        percentage REAL DEFAULT 0.0,
        status TEXT DEFAULT 'REGISTERED'
      );

      CREATE TABLE IF NOT EXISTS test_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        candidateId INTEGER NOT NULL,
        questionOrder TEXT NOT NULL,
        optionOrders TEXT NOT NULL,
        currentQuestion INTEGER DEFAULT 1,
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        status TEXT DEFAULT 'IN_PROGRESS',
        FOREIGN KEY (candidateId) REFERENCES candidates(id)
      );

      CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        candidateId INTEGER NOT NULL,
        questionId INTEGER NOT NULL,
        selectedAnswer TEXT NOT NULL,
        isCorrect INTEGER NOT NULL,
        answeredAt TEXT NOT NULL,
        UNIQUE(candidateId, questionId),
        FOREIGN KEY (candidateId) REFERENCES candidates(id),
        FOREIGN KEY (questionId) REFERENCES questions(id)
      );

      CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        passwordHash TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_candidate ON test_sessions(candidateId);
      CREATE INDEX IF NOT EXISTS idx_answers_candidate ON answers(candidateId);
      CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
      CREATE INDEX IF NOT EXISTS idx_sessions_status ON test_sessions(status);
      CREATE INDEX IF NOT EXISTS idx_questions_active ON questions(isActive);
    `);

    // Ensure resumeData & jobProfile & totalQuestions columns exist if SQLite table was created prior
    try {
      sqliteDb.exec('ALTER TABLE candidates ADD COLUMN resumeData TEXT;');
    } catch (e) {
      // Ignored if already exists
    }
    try {
      sqliteDb.exec("ALTER TABLE candidates ADD COLUMN jobProfile TEXT DEFAULT 'Web Development';");
    } catch (e) {
      // Ignored if already exists
    }
    try {
      sqliteDb.exec("ALTER TABLE candidates ADD COLUMN totalQuestions INTEGER DEFAULT 30;");
    } catch (e) {
      // Ignored if already exists
    }
    try {
      sqliteDb.exec('CREATE INDEX IF NOT EXISTS idx_candidates_jobprofile ON candidates(jobProfile);');
    } catch (e) {
      // Ignored if already exists
    }

    const insertSetting = sqliteDb.prepare('INSERT OR IGNORE INTO app_settings (key, value) VALUES (?, ?)');
    insertSetting.run('SHOW_STUDENT_SCORE', config.SHOW_STUDENT_SCORE ? 'true' : 'false');
    insertSetting.run('ENABLE_TAB_WARNING', config.ENABLE_TAB_WARNING ? 'true' : 'false');

    // Check if questions need auto-seeding (ensure full 60 questions: 30 Web Dev + 30 Biz Dev)
    try {
      const qCount = sqliteDb.prepare('SELECT COUNT(*) as count FROM questions').get();
      if (!qCount || qCount.count < 60) {
        console.log(`[SQLite] Questions table has ${qCount ? qCount.count : 0} questions. Ensuring full 60 questions...`);
        const { questions } = require('../database/seedQuestions');
        const checkQ = sqliteDb.prepare('SELECT id FROM questions WHERE question = ?');
        const insertQ = sqliteDb.prepare(`
          INSERT INTO questions (category, question, optionA, optionB, optionC, optionD, correctAnswer, difficulty, isActive)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        `);
        for (const q of questions) {
          const exists = checkQ.get(q.question);
          if (!exists) {
            insertQ.run(q.category, q.question, q.optionA, q.optionB, q.optionC, q.optionD, q.correctAnswer, q.difficulty);
          }
        }
        console.log(`[SQLite] Successfully ensured all ${questions.length} questions.`);
      }
    } catch (e) {
      console.warn('[SQLite] Auto-seed warning:', e.message);
    }
  }

  initSqlite();

  dbWrapper = {
    isPostgres: false,
    sqliteDb,
    async get(sql, params = []) {
      return sqliteDb.prepare(sql).get(...params);
    },
    async all(sql, params = []) {
      return sqliteDb.prepare(sql).all(...params);
    },
    async run(sql, params = []) {
      const res = sqliteDb.prepare(sql).run(...params);
      return {
        lastInsertRowid: res.lastInsertRowid,
        changes: res.changes
      };
    },
    async exec(sql) {
      return sqliteDb.exec(sql);
    },
    prepare(sql) {
      return sqliteDb.prepare(sql);
    }
  };
}

module.exports = dbWrapper;
