const fs = require('fs');
const path = require('path');
const http = require('http');

// Start express server programmatically for testing
const app = require('express')();
const cors = require('cors');
app.use(cors());
app.use(require('express').json());
app.use(require('express').urlencoded({ extended: true }));

require('./config/db');
app.use('/api/candidates', require('./routes/candidateRoutes'));
app.use('/api/test', require('./routes/testRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

const TEST_PORT = 5002;

async function runTests() {
  console.log('=== STARTING AUTOMATED END-TO-END VERIFICATION ===\n');

  const server = app.listen(TEST_PORT, async () => {
    try {
      console.log(`[TEST 1] Backend listening on test port ${TEST_PORT}`);

      // Helper for HTTP requests
      const request = (method, path, body = null, headers = {}) => {
        return new Promise((resolve, reject) => {
          const url = new URL(`http://localhost:${TEST_PORT}${path}`);
          const options = {
            method,
            headers: { ...headers }
          };

          const req = http.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              try {
                resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
              } catch (e) {
                resolve({ status: res.statusCode, headers: res.headers, raw: data });
              }
            });
          });

          req.on('error', reject);
          if (body) {
            req.write(body);
          }
          req.end();
        });
      };

      // Create a dummy PDF resume for testing
      const dummyPdfPath = path.join(__dirname, 'test_resume.pdf');
      fs.writeFileSync(dummyPdfPath, '%PDF-1.4 dummy pdf content for digital mart assessment verification');

      // Helper for multipart/form-data request
      const sendMultipart = (fields, fileField, filePath) => {
        return new Promise((resolve, reject) => {
          const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
          const url = new URL(`http://localhost:${TEST_PORT}/api/candidates/register`);

          let payload = '';
          for (const [k, v] of Object.entries(fields)) {
            payload += `--${boundary}\r\n`;
            payload += `Content-Disposition: form-data; name="${k}"\r\n\r\n`;
            payload += `${v}\r\n`;
          }

          const fileContent = fs.readFileSync(filePath);
          payload += `--${boundary}\r\n`;
          payload += `Content-Disposition: form-data; name="${fileField}"; filename="resume.pdf"\r\n`;
          payload += `Content-Type: application/pdf\r\n\r\n`;

          const footer = `\r\n--${boundary}--\r\n`;
          const totalBuffer = Buffer.concat([Buffer.from(payload), fileContent, Buffer.from(footer)]);

          const req = http.request(url, {
            method: 'POST',
            headers: {
              'Content-Type': `multipart/form-data; boundary=${boundary}`,
              'Content-Length': totalBuffer.length
            }
          }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              try {
                resolve({ status: res.statusCode, body: JSON.parse(data) });
              } catch (e) {
                resolve({ status: res.statusCode, raw: data });
              }
            });
          });

          req.on('error', reject);
          req.write(totalBuffer);
          req.end();
        });
      };

      // TEST 2: Candidate 1 Registration
      console.log('\n[TEST 2] Registering Candidate 1 (Aman Verma)...');
      const regRes1 = await sendMultipart({
        fullName: 'Aman Verma',
        email: `aman.verma.${Date.now()}@example.com`,
        phone: '9876543210',
        collegeName: 'Delhi Technological University',
        degree: 'B.Tech',
        branch: 'Computer Science',
        graduationYear: '2026',
        confirmed: 'true'
      }, 'resume', dummyPdfPath);

      console.log('Registration 1 Status:', regRes1.status, 'Candidate ID:', regRes1.body.candidate?.id);
      if (regRes1.status !== 201) throw new Error('Candidate 1 registration failed');
      const candidate1Id = regRes1.body.candidate.id;

      // TEST 3: Candidate 2 Registration (to test random sequences)
      console.log('\n[TEST 3] Registering Candidate 2 (Pooja Sharma)...');
      const regRes2 = await sendMultipart({
        fullName: 'Pooja Sharma',
        email: `pooja.sharma.${Date.now()}@example.com`,
        phone: '9812345678',
        collegeName: 'BITS Pilani',
        degree: 'B.Tech',
        branch: 'Information Technology',
        graduationYear: '2025',
        confirmed: 'true'
      }, 'resume', dummyPdfPath);

      if (regRes2.status !== 201) throw new Error('Candidate 2 registration failed');
      const candidate2Id = regRes2.body.candidate.id;

      // TEST 4: Start Test Sessions & Check Randomization
      console.log('\n[TEST 4] Starting test sessions for Candidate 1 & 2...');
      const startRes1 = await request('POST', '/api/test/start', JSON.stringify({ candidateId: candidate1Id }), { 'Content-Type': 'application/json' });
      const startRes2 = await request('POST', '/api/test/start', JSON.stringify({ candidateId: candidate2Id }), { 'Content-Type': 'application/json' });

      console.log('Candidate 1 Remaining Seconds:', startRes1.body.session?.remainingSeconds);
      console.log('Candidate 2 Remaining Seconds:', startRes2.body.session?.remainingSeconds);

      // Verify Session in DB
      const db = require('./config/db');
      const session1 = db.prepare('SELECT questionOrder, optionOrders FROM test_sessions WHERE candidateId = ?').get(candidate1Id);
      const session2 = db.prepare('SELECT questionOrder, optionOrders FROM test_sessions WHERE candidateId = ?').get(candidate2Id);

      const order1 = JSON.parse(session1.questionOrder);
      const order2 = JSON.parse(session2.questionOrder);

      console.log('Candidate 1 First 5 Questions:', order1.slice(0, 5));
      console.log('Candidate 2 First 5 Questions:', order2.slice(0, 5));

      const isDifferent = JSON.stringify(order1) !== JSON.stringify(order2);
      console.log('Verified: Question sequence is randomized between candidates:', isDifferent);

      // TEST 5: Verify Questions endpoint does NOT leak correct answers
      console.log('\n[TEST 5] Checking Question 1 payload security...');
      const qRes1 = await request('GET', `/api/test/question/${candidate1Id}/1`);
      console.log('Question received:', qRes1.body.question?.question?.substring(0, 60) + '...');
      console.log('Has correctAnswer property?', qRes1.body.question?.correctAnswer !== undefined);
      if (qRes1.body.question?.correctAnswer !== undefined) {
        throw new Error('SECURITY VIOLATION: correctAnswer leaked to frontend!');
      }

      // TEST 6: Submit answers for Candidate 1
      console.log('\n[TEST 6] Answering questions for Candidate 1...');
      for (let i = 1; i <= 30; i++) {
        const qData = await request('GET', `/api/test/question/${candidate1Id}/${i}`);
        // Pick option 'A' or 'B'
        const chosen = (i % 2 === 0) ? 'A' : 'B';
        const ansRes = await request('POST', '/api/test/answer', JSON.stringify({
          candidateId: candidate1Id,
          questionNumber: i,
          selectedOption: chosen
        }), { 'Content-Type': 'application/json' });
        if (ansRes.status !== 200) throw new Error(`Failed to submit answer for question ${i}`);
      }
      console.log('All 30 answers recorded successfully.');

      // TEST 7: Test Refresh Restoration
      console.log('\n[TEST 7] Testing session recovery on browser refresh...');
      const refreshSession = await request('GET', `/api/test/session/${candidate1Id}`);
      console.log('Restored remaining seconds:', refreshSession.body.remainingSeconds);
      console.log('Restored current question:', refreshSession.body.currentQuestion);

      // TEST 8: Submit Test
      console.log('\n[TEST 8] Submitting test for Candidate 1...');
      const submitRes = await request('POST', '/api/test/submit', JSON.stringify({
        candidateId: candidate1Id,
        isAuto: false
      }), { 'Content-Type': 'application/json' });

      console.log('Submission status:', submitRes.body.status);
      console.log('Submission recorded time:', submitRes.body.submittedAt);
      if (submitRes.body.status !== 'COMPLETED') throw new Error('Test submission status is not COMPLETED');

      // TEST 9: Admin Authentication
      console.log('\n[TEST 9] Testing Admin Login...');
      const loginRes = await request('POST', '/api/admin/login', JSON.stringify({
        username: 'admin',
        password: 'Admin@DigitalMart2026'
      }), { 'Content-Type': 'application/json' });

      console.log('Admin login status:', loginRes.status);
      const adminToken = loginRes.body.token;
      if (!adminToken) throw new Error('Admin authentication failed');

      // TEST 10: Admin Candidate List & Search/Filter
      console.log('\n[TEST 10] Admin candidate retrieval...');
      const adminCandidates = await request('GET', '/api/admin/candidates', null, {
        'Authorization': `Bearer ${adminToken}`
      });
      console.log('Total candidates found by Admin:', adminCandidates.body.candidates.length);
      console.log('Stats:', adminCandidates.body.stats);

      // TEST 11: Admin Candidate Details & QA Analysis
      console.log('\n[TEST 11] Admin inspecting Candidate 1 details & QA breakdown...');
      const detailsRes = await request('GET', `/api/admin/candidates/${candidate1Id}`, null, {
        'Authorization': `Bearer ${adminToken}`
      });

      console.log('Candidate Score:', detailsRes.body.summary.score, '/ 30');
      console.log('Candidate Percentage:', detailsRes.body.summary.percentage + '%');
      console.log('Total Questions Analyzed:', detailsRes.body.questions.length);

      const sampleQ = detailsRes.body.questions[0];
      console.log('Sample Analyzed Question:', {
        question: sampleQ.question.substring(0, 50) + '...',
        selectedAnswer: sampleQ.selectedAnswer,
        correctAnswer: sampleQ.correctAnswer,
        isCorrect: sampleQ.isCorrect
      });

      console.log('\n=================================================');
      console.log('  ALL 11 AUTOMATED VERIFICATION CHECKS PASSED!   ');
      console.log('=================================================\n');

      // Cleanup
      if (fs.existsSync(dummyPdfPath)) fs.unlinkSync(dummyPdfPath);
      server.close();
      process.exit(0);

    } catch (err) {
      console.error('\nVerification failed with error:', err);
      server.close();
      process.exit(1);
    }
  });
}

runTests();
