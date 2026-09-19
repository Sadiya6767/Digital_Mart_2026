const bcrypt = require('bcryptjs');
const db = require('../config/db');
const config = require('../config/config');

const questions = [
  // ==================== WEB DEVELOPMENT (20 EASY QUESTIONS) ====================
  // 1
  {
    category: 'WEB_DEVELOPMENT',
    question: 'Which HTML tag is used to create the largest heading on a web page?',
    optionA: '<h6>',
    optionB: '<head>',
    optionC: '<h1>',
    optionD: '<heading>',
    correctAnswer: 'C',
    difficulty: 'BASIC'
  },
  // 2
  {
    category: 'WEB_DEVELOPMENT',
    question: 'Which HTML tag is used to create a hyperlink to another web page?',
    optionA: '<link>',
    optionB: '<a>',
    optionC: '<href>',
    optionD: '<url>',
    correctAnswer: 'B',
    difficulty: 'BASIC'
  },
  // 3
  {
    category: 'WEB_DEVELOPMENT',
    question: 'Which HTML attribute specifies an alternate text for an image if the image cannot be displayed?',
    optionA: 'title',
    optionB: 'src',
    optionC: 'alt',
    optionD: 'description',
    correctAnswer: 'C',
    difficulty: 'BASIC'
  },
  // 4
  {
    category: 'WEB_DEVELOPMENT',
    question: 'Which CSS property is used to change the text color of an element?',
    optionA: 'text-color',
    optionB: 'font-color',
    optionC: 'color',
    optionD: 'background-color',
    correctAnswer: 'C',
    difficulty: 'BASIC'
  },
  // 5
  {
    category: 'WEB_DEVELOPMENT',
    question: 'Which CSS property controls the space between the content of an element and its border?',
    optionA: 'margin',
    optionB: 'padding',
    optionC: 'spacing',
    optionD: 'border-spacing',
    correctAnswer: 'B',
    difficulty: 'BASIC'
  },
  // 6
  {
    category: 'WEB_DEVELOPMENT',
    question: 'Which CSS property is used to make text bold?',
    optionA: 'font-weight: bold;',
    optionB: 'font-style: bold;',
    optionC: 'text-bold: true;',
    optionD: 'font-bold: yes;',
    correctAnswer: 'A',
    difficulty: 'BASIC'
  },
  // 7
  {
    category: 'WEB_DEVELOPMENT',
    question: 'In CSS Flexbox, which property is used to align items horizontally along the main axis by default?',
    optionA: 'align-items',
    optionB: 'justify-content',
    optionC: 'align-content',
    optionD: 'flex-direction',
    correctAnswer: 'B',
    difficulty: 'BASIC'
  },
  // 8
  {
    category: 'WEB_DEVELOPMENT',
    question: 'Which JavaScript keyword is used to declare a variable whose value should NOT be reassigned?',
    optionA: 'var',
    optionB: 'let',
    optionC: 'const',
    optionD: 'fixed',
    correctAnswer: 'C',
    difficulty: 'BASIC'
  },
  // 9
  {
    category: 'WEB_DEVELOPMENT',
    question: 'Which built-in JavaScript function displays a popup message box with an OK button?',
    optionA: 'msg()',
    optionB: 'alert()',
    optionC: 'popup()',
    optionD: 'prompt()',
    correctAnswer: 'B',
    difficulty: 'BASIC'
  },
  // 10
  {
    category: 'WEB_DEVELOPMENT',
    question: 'Which method in JavaScript is used to print messages to the browser developer console?',
    optionA: 'console.log()',
    optionB: 'print()',
    optionC: 'document.write()',
    optionD: 'log.debug()',
    correctAnswer: 'A',
    difficulty: 'BASIC'
  },
  // 11
  {
    category: 'WEB_DEVELOPMENT',
    question: 'How do you check both value and data type equality in JavaScript?',
    optionA: '==',
    optionB: '=',
    optionC: '===',
    optionD: '!=',
    correctAnswer: 'C',
    difficulty: 'BASIC'
  },
  // 12
  {
    category: 'WEB_DEVELOPMENT',
    question: 'Which JavaScript method adds one or more elements to the end of an array?',
    optionA: 'push()',
    optionB: 'pop()',
    optionC: 'shift()',
    optionD: 'unshift()',
    correctAnswer: 'A',
    difficulty: 'BASIC'
  },
  // 13
  {
    category: 'WEB_DEVELOPMENT',
    question: 'In React, what are "props" primarily used for?',
    optionA: 'To modify CSS styling dynamically',
    optionB: 'To pass data from a parent component to a child component',
    optionC: 'To connect directly to a database',
    optionD: 'To restart the browser server',
    correctAnswer: 'B',
    difficulty: 'BASIC'
  },
  // 14
  {
    category: 'WEB_DEVELOPMENT',
    question: 'Which React Hook is used to manage and update state inside a functional component?',
    optionA: 'useEffect',
    optionB: 'useState',
    optionC: 'useContext',
    optionD: 'useReducer',
    correctAnswer: 'B',
    difficulty: 'BASIC'
  },
  // 15
  {
    category: 'WEB_DEVELOPMENT',
    question: 'Which HTTP method is most commonly used to fetch or retrieve data from a web server?',
    optionA: 'POST',
    optionB: 'GET',
    optionC: 'DELETE',
    optionD: 'PUT',
    correctAnswer: 'B',
    difficulty: 'BASIC'
  },
  // 16
  {
    category: 'WEB_DEVELOPMENT',
    question: 'Which HTTP status code indicates that a requested page or resource could not be found?',
    optionA: '200',
    optionB: '301',
    optionC: '404',
    optionD: '500',
    correctAnswer: 'C',
    difficulty: 'BASIC'
  },
  // 17
  {
    category: 'WEB_DEVELOPMENT',
    question: 'Which Git command is used to save staged changes with a descriptive message?',
    optionA: 'git add',
    optionB: 'git commit -m "message"',
    optionC: 'git push',
    optionD: 'git init',
    correctAnswer: 'B',
    difficulty: 'BASIC'
  },
  // 18
  {
    category: 'WEB_DEVELOPMENT',
    question: 'Which Git command uploads your local repository commits to a remote repository like GitHub?',
    optionA: 'git pull',
    optionB: 'git clone',
    optionC: 'git push',
    optionD: 'git fetch',
    correctAnswer: 'C',
    difficulty: 'BASIC'
  },
  // 19
  {
    category: 'WEB_DEVELOPMENT',
    question: 'Which SQL statement is used to fetch all columns from a table named "users"?',
    optionA: 'GET * FROM users;',
    optionB: 'SELECT * FROM users;',
    optionC: 'FIND ALL users;',
    optionD: 'EXTRACT * FROM users;',
    correctAnswer: 'B',
    difficulty: 'BASIC'
  },
  // 20
  {
    category: 'WEB_DEVELOPMENT',
    question: 'Which SQL clause is used to filter records that satisfy a specific condition?',
    optionA: 'ORDER BY',
    optionB: 'GROUP BY',
    optionC: 'WHERE',
    optionD: 'HAVING',
    correctAnswer: 'C',
    difficulty: 'BASIC'
  },

  // 21
  {
    category: 'WEB_DEVELOPMENT',
    question: 'Which HTML5 input attribute ensures that a user cannot submit a form without filling in the field?',
    optionA: 'validate',
    optionB: 'required',
    optionC: 'mandatory',
    optionD: 'needed',
    correctAnswer: 'B',
    difficulty: 'BASIC'
  },
  // 22
  {
    category: 'WEB_DEVELOPMENT',
    question: 'Which CSS rule is used to apply styles conditionally based on the screen width for responsive web design?',
    optionA: '@media',
    optionB: '@screen',
    optionC: '@responsive',
    optionD: '@viewport',
    correctAnswer: 'A',
    difficulty: 'BASIC'
  },
  // 23
  {
    category: 'WEB_DEVELOPMENT',
    question: 'Which CSS display value enables a two-dimensional layout system with rows and columns?',
    optionA: 'display: block;',
    optionB: 'display: grid;',
    optionC: 'display: flex;',
    optionD: 'display: inline;',
    correctAnswer: 'B',
    difficulty: 'BASIC'
  },
  // 24
  {
    category: 'WEB_DEVELOPMENT',
    question: 'Which JavaScript array method creates a new array populated with the results of calling a provided function on every element?',
    optionA: 'filter()',
    optionB: 'map()',
    optionC: 'forEach()',
    optionD: 'reduce()',
    correctAnswer: 'B',
    difficulty: 'INTERMEDIATE'
  },
  // 25
  {
    category: 'WEB_DEVELOPMENT',
    question: 'In modern JavaScript, what does the "async/await" syntax primarily simplify?',
    optionA: 'Working with asynchronous code and Promises',
    optionB: 'Drawing 3D graphics on the canvas',
    optionC: 'Compiling JavaScript to machine code',
    optionD: 'Managing CSS keyframe animations',
    correctAnswer: 'A',
    difficulty: 'INTERMEDIATE'
  },
  // 26
  {
    category: 'WEB_DEVELOPMENT',
    question: 'In React, what does passing an empty dependency array `[]` to `useEffect` mean?',
    optionA: 'The effect executes on every single render',
    optionB: 'The effect runs only once after the initial render (component mount)',
    optionC: 'The effect is permanently disabled',
    optionD: 'The component will never re-render',
    correctAnswer: 'B',
    difficulty: 'INTERMEDIATE'
  },
  // 27
  {
    category: 'WEB_DEVELOPMENT',
    question: 'Which HTTP status code indicates that a new resource has been successfully created on the server?',
    optionA: '200 OK',
    optionB: '201 Created',
    optionC: '204 No Content',
    optionD: '304 Not Modified',
    correctAnswer: 'B',
    difficulty: 'INTERMEDIATE'
  },
  // 28
  {
    category: 'WEB_DEVELOPMENT',
    question: 'Which client-side web storage mechanism allows data to persist even after the browser window or tab is closed?',
    optionA: 'sessionStorage',
    optionB: 'localStorage',
    optionC: 'Memory Cache',
    optionD: 'Page State',
    correctAnswer: 'B',
    difficulty: 'BASIC'
  },
  // 29
  {
    category: 'WEB_DEVELOPMENT',
    question: 'Which Git command creates and immediately switches to a new branch named "feature-login"?',
    optionA: 'git branch -n feature-login',
    optionB: 'git checkout -b feature-login',
    optionC: 'git branch --switch feature-login',
    optionD: 'git merge feature-login',
    correctAnswer: 'B',
    difficulty: 'BASIC'
  },
  // 30
  {
    category: 'WEB_DEVELOPMENT',
    question: 'Which SQL keyword is used to sort the query result set in ascending or descending order?',
    optionA: 'SORT BY',
    optionB: 'ARRANGE BY',
    optionC: 'ORDER BY',
    optionD: 'GROUP BY',
    correctAnswer: 'C',
    difficulty: 'BASIC'
  },

  // ==================== BUSINESS DEVELOPMENT / SALES (20 QUESTIONS) ====================
  {
    category: 'BUSINESS_DEVELOPMENT',
    question: 'What is the primary role of a Business Development Executive (BDE)?',
    optionA: 'Writing computer algorithms',
    optionB: 'Identifying new business opportunities, generating leads, and building client relationships',
    optionC: 'Designing office furniture',
    optionD: 'Managing internal payroll only',
    correctAnswer: 'B',
    difficulty: 'BASIC'
  },
  // 22
  {
    category: 'BUSINESS_DEVELOPMENT',
    question: 'What does "B2B" stand for in business and sales?',
    optionA: 'Business-to-Buyer',
    optionB: 'Business-to-Business',
    optionC: 'Brand-to-Brand',
    optionD: 'Buyer-to-Business',
    correctAnswer: 'B',
    difficulty: 'BASIC'
  },
  // 23
  {
    category: 'BUSINESS_DEVELOPMENT',
    question: 'What does "B2C" stand for in business?',
    optionA: 'Business-to-Consumer',
    optionB: 'Business-to-Company',
    optionC: 'Brand-to-Customer',
    optionD: 'Buyer-to-Client',
    correctAnswer: 'A',
    difficulty: 'BASIC'
  },
  // 24
  {
    category: 'BUSINESS_DEVELOPMENT',
    question: 'What does the abbreviation "CRM" stand for in sales management?',
    optionA: 'Customer Relationship Management',
    optionB: 'Company Resource Monitor',
    optionC: 'Client Rate Measurement',
    optionD: 'Corporate Revenue Model',
    correctAnswer: 'A',
    difficulty: 'BASIC'
  },
  // 25
  {
    category: 'BUSINESS_DEVELOPMENT',
    question: 'In sales terminology, what is a "Lead"?',
    optionA: 'A finalized legal contract',
    optionB: 'A potential client who has shown interest in your company\'s services',
    optionC: 'A former customer who canceled their subscription',
    optionD: 'An employee in the accounts department',
    correctAnswer: 'B',
    difficulty: 'BASIC'
  },
  // 26
  {
    category: 'BUSINESS_DEVELOPMENT',
    question: 'What is the primary goal of a "Cold Call" to a prospective business?',
    optionA: 'To argue about competitor prices',
    optionB: 'To introduce your company, generate interest, and book a follow-up discovery meeting',
    optionC: 'To demand immediate credit card payment on the spot',
    optionD: 'To conduct personal interviews',
    correctAnswer: 'B',
    difficulty: 'BASIC'
  },
  // 27
  {
    category: 'BUSINESS_DEVELOPMENT',
    question: 'What is the most effective subject line for a business outreach email to a prospect?',
    optionA: 'HEY URGENT OPEN THIS NOW',
    optionB: 'A clear, professional, and personalized subject line relevant to their business needs',
    optionC: 'Free Money and Guaranteed 1000% Profit',
    optionD: 'No subject line at all',
    correctAnswer: 'B',
    difficulty: 'BASIC'
  },
  // 28
  {
    category: 'BUSINESS_DEVELOPMENT',
    question: 'Why is regular follow-up important after presenting a business proposal to a client?',
    optionA: 'To irritate the client until they reply',
    optionB: 'To answer any pending questions, keep your solution top of mind, and move the deal forward',
    optionC: 'To reduce the project price without client request',
    optionD: 'It is not important; clients will always call back themselves',
    correctAnswer: 'B',
    difficulty: 'BASIC'
  },
  // 29
  {
    category: 'BUSINESS_DEVELOPMENT',
    question: 'If a potential client says "I am interested, but can you call me next Tuesday at 3 PM?", what should a BDE do?',
    optionA: 'Call them immediately 5 times today anyway',
    optionB: 'Record the note in the CRM and schedule a reminder to call exactly on Tuesday at 3 PM',
    optionC: 'Ignore the request and never call back',
    optionD: 'Send an email asking them to call you instead',
    correctAnswer: 'B',
    difficulty: 'BASIC'
  },
  // 30
  {
    category: 'BUSINESS_DEVELOPMENT',
    question: 'What is "Objection Handling" in a sales conversation?',
    optionA: 'Hanging up the phone when a customer asks a question',
    optionB: 'Addressing a prospect\'s doubts or concerns (like budget or timing) with clear, value-driven solutions',
    optionC: 'Arguing with the prospect to prove them wrong',
    optionD: 'Giving away the product for free',
    correctAnswer: 'B',
    difficulty: 'BASIC'
  },
  // 31
  {
    category: 'BUSINESS_DEVELOPMENT',
    question: 'Which skill is most critical during an initial client consultation call?',
    optionA: 'Talking continuously without letting the client speak',
    optionB: 'Active listening to understand the client\'s genuine problems and business goals',
    optionC: 'Complaining about competitor companies',
    optionD: 'Rushing through a slide deck in 2 minutes',
    correctAnswer: 'B',
    difficulty: 'BASIC'
  },
  // 32
  {
    category: 'BUSINESS_DEVELOPMENT',
    question: 'What is a "Sales Funnel"?',
    optionA: 'A tool used to measure factory oil',
    optionB: 'The visual representation of the stages a customer goes through from awareness to final purchase',
    optionC: 'A list of employee salaries',
    optionD: 'An invoice format',
    correctAnswer: 'B',
    difficulty: 'BASIC'
  },
  // 33
  {
    category: 'BUSINESS_DEVELOPMENT',
    question: 'What does "Closing a Deal" mean in sales?',
    optionA: 'Canceling the project',
    optionB: 'Successfully agreeing on terms and securing the client agreement or purchase',
    optionC: 'Shutting down the company office for the weekend',
    optionD: 'Rejecting a client inquiry',
    correctAnswer: 'B',
    difficulty: 'BASIC'
  },
  // 34
  {
    category: 'BUSINESS_DEVELOPMENT',
    question: 'What does "SEO" stand for in digital marketing services offered by Digital Mart Solutions?',
    optionA: 'Sales Executive Officer',
    optionB: 'Search Engine Optimization',
    optionC: 'Social Engagement Operation',
    optionD: 'Site Engineering Office',
    correctAnswer: 'B',
    difficulty: 'BASIC'
  },
  // 35
  {
    category: 'BUSINESS_DEVELOPMENT',
    question: 'Why do businesses invest in Search Engine Optimization (SEO)?',
    optionA: 'To increase visibility and rank higher organically on search engines like Google',
    optionB: 'To delete negative emails',
    optionC: 'To print paper brochures faster',
    optionD: 'To block users from visiting the website',
    correctAnswer: 'A',
    difficulty: 'BASIC'
  },
  // 36
  {
    category: 'BUSINESS_DEVELOPMENT',
    question: 'What is the meaning of "Upselling" to an existing client?',
    optionA: 'Offering a higher-end version, upgrade, or add-on service to an existing customer',
    optionB: 'Selling products at a loss',
    optionC: 'Returning money to the customer',
    optionD: 'Terminating a client contract early',
    correctAnswer: 'A',
    difficulty: 'BASIC'
  },
  // 37
  {
    category: 'BUSINESS_DEVELOPMENT',
    question: 'What is "Word of Mouth" marketing?',
    optionA: 'Paid TV advertisements',
    optionB: 'Satisfied customers recommending your business to friends and colleagues',
    optionC: 'Sending anonymous postal letters',
    optionD: 'Radio jingles only',
    correctAnswer: 'B',
    difficulty: 'BASIC'
  },
  // 38
  {
    category: 'BUSINESS_DEVELOPMENT',
    question: 'What is the main purpose of building rapport with a prospective client?',
    optionA: 'To establish trust, open communication, and a long-term business relationship',
    optionB: 'To discover their personal secrets',
    optionC: 'To delay completing the project work',
    optionD: 'To sell unnecessary products',
    correctAnswer: 'A',
    difficulty: 'BASIC'
  },
  // 39
  {
    category: 'BUSINESS_DEVELOPMENT',
    question: 'What does "Target Audience" mean in marketing and business development?',
    optionA: 'The group of consumers or businesses most likely to buy your product or service',
    optionB: 'People who will never use your service',
    optionC: 'The company\'s board of directors',
    optionD: 'All internet users in the entire world',
    correctAnswer: 'A',
    difficulty: 'BASIC'
  },
  // 40
  {
    category: 'BUSINESS_DEVELOPMENT',
    question: 'When a customer has a complaint about a delayed milestone, what is the best first reaction?',
    optionA: 'Blame another teammate and deny responsibility',
    optionB: 'Listen calmly, acknowledge the issue empathetically, and provide a clear updated timeline for resolution',
    optionC: 'Block the customer\'s phone number',
    optionD: 'Argue that the delay is not important',
    correctAnswer: 'B',
    difficulty: 'BASIC'
  }
];

async function seed() {
  console.log('--- Starting Database Seeding (50 Questions: 30 Web Dev + 20 Biz Dev) ---');

  // Seed or update Admin user
  const adminCheck = await db.get('SELECT id FROM admin_users WHERE username = ?', [config.ADMIN_USERNAME]);
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(config.ADMIN_PASSWORD, salt);
  if (!adminCheck) {
    await db.run(`
      INSERT INTO admin_users (username, passwordHash, createdAt)
      VALUES (?, ?, ?)
    `, [config.ADMIN_USERNAME, passwordHash, new Date().toISOString()]);
    console.log(`Default admin user seeded: ${config.ADMIN_USERNAME}`);
  } else {
    await db.run('UPDATE admin_users SET passwordHash = ? WHERE username = ?', [passwordHash, config.ADMIN_USERNAME]);
    console.log(`Admin user verified and password updated: ${config.ADMIN_USERNAME}`);
  }

  // Clear existing records to re-seed cleanly
  await db.run('DELETE FROM answers');
  await db.run('DELETE FROM test_sessions');
  await db.run('DELETE FROM candidates');
  await db.run('DELETE FROM questions');

  let inserted = 0;
  for (const q of questions) {
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
  }
  console.log(`Successfully seeded ${inserted} questions (30 Web Dev + 20 Biz Dev)!`);
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
