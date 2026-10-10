const bcrypt = require('bcryptjs');
const db = require('../config/db');
const config = require('../config/config');
const questions = require('./questionsData');

async function seed() {
  console.log('--- Initializing Advanced Question Bank Seeding (60 Questions) ---');
  let inserted = 0;
  for (const q of questions) {
    const exists = await db.get('SELECT id FROM questions WHERE question = ?', [q.question]);
    if (!exists) {
      await db.run(`
        INSERT INTO questions (category, question, optionA, optionB, optionC, optionD, correctAnswer, difficulty, isActive)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `, [
        q.category,
        q.question,
        q.optionA,
        q.optionB,
        q.optionC,
        q.optionD,
        q.correctAnswer,
        q.difficulty
      ]);
      inserted++;
    } else {
      await db.run('UPDATE questions SET isActive = 1, category = ?, difficulty = ? WHERE id = ?', [
        q.category,
        q.difficulty,
        exists.id
      ]);
    }
  }
  console.log(`Successfully seeded & verified ${questions.length} advance questions (${inserted} new inserts)!`);
  console.log('--- Seeding Completed Successfully ---');
}

if (require.main === module) {
  seed().then(() => {
    process.exit(0);
  }).catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}

module.exports = { seed, questions };