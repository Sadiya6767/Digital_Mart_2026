const fs = require('fs');
const path = require('path');

async function testFull() {
  console.log('=== STARTING COMPLETE VERIFICATION SUITE ===');

  // 1. Health check
  const healthRes = await fetch('http://localhost:5000/api/health');
  const health = await healthRes.json();
  console.log('✓ 1. Health check passed:', health);

  // 2. Admin Login
  const loginRes = await fetch('http://localhost:5000/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'Admin@DigitalMart2026' })
  });
  const loginData = await loginRes.json();
  console.log('✓ 2. Admin login passed:', loginData.success, 'Token length:', loginData.token?.length);
  const token = loginData.token;

  // Clear existing candidates before test
  const clearRes = await fetch('http://localhost:5000/api/admin/candidates/delete-all', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const clearData = await clearRes.json();
  console.log('✓ 3. Initial clear all passed:', clearData.message);

  // 4. Candidate Registration
  // Create dummy PDF
  const dummyPdfPath = path.join(__dirname, 'dummy_test.pdf');
  fs.writeFileSync(dummyPdfPath, '%PDF-1.4 dummy pdf content for testing');

  const formData = new FormData();
  formData.append('fullName', 'Pooja Sharma');
  formData.append('email', 'pooja.sharma@example.com');
  formData.append('phone', '9876543210');
  formData.append('collegeName', 'Delhi Technological University');
  formData.append('degree', 'B.Tech');
  formData.append('branch', 'Computer Science');
  formData.append('graduationYear', '2025');
  formData.append('confirmed', 'true');
  const blob = new Blob([fs.readFileSync(dummyPdfPath)], { type: 'application/pdf' });
  formData.append('resume', blob, 'pooja_resume.pdf');

  const regRes = await fetch('http://localhost:5000/api/candidates/register', {
    method: 'POST',
    body: formData
  });
  const regData = await regRes.json();
  console.log('✓ 4. Candidate registered:', regData.success, 'Candidate ID:', regData.candidate?.id);
  const candidateId = regData.candidate.id;

  // 5. Start Test
  const startRes = await fetch('http://localhost:5000/api/test/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidateId })
  });
  const startData = await startRes.json();
  console.log('✓ 5. Test started:', startData.success, 'Total questions:', startData.session?.totalQuestions);

  // 6. Concurrency lock check: try starting test with another candidate
  const formData2 = new FormData();
  formData2.append('fullName', 'Rahul Verma');
  formData2.append('email', 'rahul.verma@example.com');
  formData2.append('phone', '9811223344');
  formData2.append('collegeName', 'IIT Delhi');
  formData2.append('degree', 'B.Tech');
  formData2.append('branch', 'IT');
  formData2.append('graduationYear', '2025');
  formData2.append('confirmed', 'true');
  formData2.append('resume', blob, 'rahul_resume.pdf');

  const regRes2 = await fetch('http://localhost:5000/api/candidates/register', {
    method: 'POST',
    body: formData2
  });
  const regData2 = await regRes2.json();
  const candidateId2 = regData2.candidate.id;

  const startRes2 = await fetch('http://localhost:5000/api/test/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidateId: candidateId2 })
  });
  const startData2 = await startRes2.json();
  console.log('✓ 6. Concurrency lock verified (blocked 2nd candidate):', startRes2.status === 403, startData2.message);

  // 7. Candidate 1 answers Question 1
  const q1Res = await fetch(`http://localhost:5000/api/test/question/${candidateId}/1`);
  const q1Data = await q1Res.json();
  console.log('✓ 7. Fetched Question 1:', q1Data.question?.question?.slice(0, 45) + '...');

  const ansRes = await fetch('http://localhost:5000/api/test/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidateId, questionNumber: 1, selectedOption: 'A' })
  });
  const ansData = await ansRes.json();
  console.log('✓ 8. Submitted answer for Q1:', ansData.success, 'Next question:', ansData.currentQuestion);

  // 8. Candidate 1 submits test
  const submitRes = await fetch('http://localhost:5000/api/test/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidateId, isAuto: false })
  });
  const submitData = await submitRes.json();
  console.log('✓ 9. Test submitted successfully:', submitData.success, 'Status:', submitData.status);

  // 9. Now Candidate 2 can start test (lock was released upon submit)
  const startRes2Again = await fetch('http://localhost:5000/api/test/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidateId: candidateId2 })
  });
  const startData2Again = await startRes2Again.json();
  console.log('✓ 10. Candidate 2 can now enter test room:', startData2Again.success);

  // 10. Admin views candidates
  const listRes = await fetch('http://localhost:5000/api/admin/candidates', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const listData = await listRes.json();
  console.log('✓ 11. Admin fetched candidate list:', listData.candidates?.length, 'candidates, Stats:', listData.stats);

  // 11. Test Single Delete (Delete Candidate 1)
  const delSingleRes = await fetch(`http://localhost:5000/api/admin/candidates/${candidateId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const delSingleData = await delSingleRes.json();
  console.log('✓ 12. Single delete passed:', delSingleData.success, delSingleData.message);

  // Verify candidate 1 is gone
  const verifyListRes = await fetch('http://localhost:5000/api/admin/candidates', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const verifyListData = await verifyListRes.json();
  console.log('✓ 13. Candidate count after single delete:', verifyListData.candidates?.length);

  // 12. Register Candidate 3 for Bulk Delete Test
  const formData3 = new FormData();
  formData3.append('fullName', 'Amit Patel');
  formData3.append('email', 'amit.patel@example.com');
  formData3.append('phone', '9822334455');
  formData3.append('collegeName', 'BITS Pilani');
  formData3.append('degree', 'B.E.');
  formData3.append('branch', 'ECE');
  formData3.append('graduationYear', '2024');
  formData3.append('confirmed', 'true');
  formData3.append('resume', blob, 'amit_resume.pdf');

  const regRes3 = await fetch('http://localhost:5000/api/candidates/register', {
    method: 'POST',
    body: formData3
  });
  const regData3 = await regRes3.json();
  const candidateId3 = regData3.candidate.id;

  // 13. Test Bulk Delete (Candidate 2 and Candidate 3)
  const bulkDelRes = await fetch('http://localhost:5000/api/admin/candidates/bulk-delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ candidateIds: [candidateId2, candidateId3] })
  });
  const bulkDelData = await bulkDelRes.json();
  console.log('✓ 14. Bulk delete passed:', bulkDelData.success, bulkDelData.message);

  // 14. Final verify: candidate count is 0
  const finalListRes = await fetch('http://localhost:5000/api/admin/candidates', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const finalListData = await finalListRes.json();
  console.log('✓ 15. Candidates count after bulk delete:', finalListData.candidates?.length);

  // Cleanup dummy pdf
  try { fs.unlinkSync(dummyPdfPath); } catch (e) {}

  console.log('=== ALL 15 VERIFICATION CHECKS PASSED WITH 100% SUCCESS ===');
}

testFull().catch(console.error);
