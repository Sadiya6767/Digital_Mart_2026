module.exports = [
  {
    "category": "WEB_DEVELOPMENT",
    "question": "In the JavaScript Event Loop, what is the exact execution order of: synchronous code, Promises (microtasks), and setTimeout (macrotasks)?",
    "optionA": "setTimeout -> Promises -> Synchronous code",
    "optionB": "Synchronous code -> Microtasks (Promises) -> Macrotasks (setTimeout)",
    "optionC": "Synchronous code -> Macrotasks (setTimeout) -> Microtasks (Promises)",
    "optionD": "Promises -> setTimeout -> Synchronous code",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "What is the primary difference between \"useMemo\" and \"useCallback\" in React?",
    "optionA": "useMemo caches a memoized value, while useCallback caches a memoized callback function definition",
    "optionB": "useMemo is used for network requests, while useCallback is used for state mutation",
    "optionC": "useCallback returns a JSX element, while useMemo returns an integer",
    "optionD": "useMemo triggers re-renders on every scroll, while useCallback does not",
    "correctAnswer": "A",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "What happens when you mutate state directly in React (e.g., state.user.name = \"Alice\") without using the setter function?",
    "optionA": "React automatically detects the property change via Object.observe and updates the UI",
    "optionB": "React will skip re-rendering because it relies on shallow reference equality comparison to detect state changes",
    "optionC": "An immediate fatal runtime TypeError will be thrown in the browser console",
    "optionD": "The browser tab will crash due to infinite recursion",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "Which statement accurately describes a JavaScript \"Closure\"?",
    "optionA": "A function that automatically terminates once its parent component unmounts",
    "optionB": "A function bundled together with references to its surrounding lexical scope, allowing access to an outer function's scope even after the outer function has executed",
    "optionC": "A syntax construct that closes the browser window after script completion",
    "optionD": "A method that encrypts private variables in the browser DOM",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "In modern CSS, what is the fundamental difference between CSS Grid and CSS Flexbox?",
    "optionA": "Flexbox is designed for two-dimensional layouts (rows and columns simultaneously), while Grid is purely one-dimensional",
    "optionB": "Flexbox is primarily one-dimensional (row OR column), while CSS Grid is two-dimensional (rows AND columns simultaneously)",
    "optionC": "Flexbox does not support responsive design, whereas Grid only works on mobile devices",
    "optionD": "Flexbox requires JavaScript polyfills, whereas Grid is natively supported only on WebKit",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "What is the key functional difference between \"Promise.all\" and \"Promise.allSettled\"?",
    "optionA": "Promise.all rejects immediately if any promise rejects, whereas Promise.allSettled waits until all promises finish regardless of resolve or reject",
    "optionB": "Promise.allSettled only executes sequentially, while Promise.all executes synchronously",
    "optionC": "Promise.all converts all HTTP responses to text, while Promise.allSettled returns buffers",
    "optionD": "Promise.allSettled cancels pending network requests if one succeeds",
    "correctAnswer": "A",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "In browser security, why is storing authentication JWT tokens in an httpOnly, Secure, SameSite=Strict cookie preferred over localStorage?",
    "optionA": "Because localStorage is limited to 256 bytes of data",
    "optionB": "Because httpOnly cookies cannot be accessed by client-side JavaScript, effectively neutralizing Cross-Site Scripting (XSS) token theft",
    "optionC": "Because localStorage requires a paid HTTPS certificate from Let's Encrypt",
    "optionD": "Because httpOnly cookies automatically bypass CORS preflight checks",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "What triggers a Cross-Origin Resource Sharing (CORS) \"Preflight\" OPTIONS request?",
    "optionA": "Any GET request made to the same origin with application/json body",
    "optionB": "Non-simple requests, such as HTTP methods PUT, DELETE, or requests with custom headers like Authorization or Content-Type application/json",
    "optionC": "Static images loaded via standard <img> HTML elements",
    "optionD": "Only WebSocket handshakes with origin verification",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "In database optimization, how does a B-Tree Index improve query performance on a table with 10 million rows?",
    "optionA": "By compressing the table into memory so no disk I/O ever occurs",
    "optionB": "By allowing logarithmic O(log N) lookup time instead of a costly full table scan O(N)",
    "optionC": "By automatically deleting duplicate rows upon index creation",
    "optionD": "By converting all SQL queries into asynchronous background jobs",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "What is the risk of using naive shallow copy ({ ...originalObject }) for deeply nested state updates?",
    "optionA": "Nested objects share the same memory reference, so modifying a nested property inadvertently mutates the original object state",
    "optionB": "The JavaScript engine throws a SyntaxError if an object has more than two properties",
    "optionC": "Shallow copy converts all dates and integers into null strings",
    "optionD": "The object prototype is automatically converted into a circular dependency",
    "correctAnswer": "A",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "In web performance optimization, what is the critical difference between \"Debouncing\" and \"Throttling\"?",
    "optionA": "Debounce limits executions to at most once per time window, while throttle delays execution until after a specified silence duration",
    "optionB": "Debounce delays execution until a user stops triggering events for a duration, while Throttle guarantees execution at fixed maximum intervals",
    "optionC": "Debouncing is for CSS animations, while Throttling is exclusively for Node.js clustering",
    "optionD": "Debouncing operates server-side, while Throttling is only supported in Web Workers",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "What is the primary cause of a \"Reflow\" (layout shift) in browser rendering, and why is it expensive?",
    "optionA": "Recalculating element geometry and positions across the render tree, which triggers layout recalculations and repainting of affected ancestors and siblings",
    "optionB": "Downloading an external SVG image via HTTP/2 multiplexing",
    "optionC": "Updating CSS opacity or transform on a GPU composited layer",
    "optionD": "Logging debug messages to the browser console",
    "correctAnswer": "A",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "In SQL databases, what does the \"ACID\" acronym guarantee in transactional operations?",
    "optionA": "Asynchronous, Clustered, Indexed, Distributed",
    "optionB": "Atomicity, Consistency, Isolation, Durability",
    "optionC": "Authentication, Cryptography, Integrity, Decryption",
    "optionD": "Aggregation, Cascading, Iteration, De-normalization",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "How do Parameterized Queries (Prepared Statements) prevent SQL Injection attacks?",
    "optionA": "By encrypting the entire database table with AES-256 before query execution",
    "optionB": "By separating SQL code logic from user-supplied data so user input is treated strictly as literal values rather than executable code",
    "optionC": "By removing all quotes and spaces from the user input string",
    "optionD": "By rejecting queries that exceed 25 characters in length",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "In React, what problem does an empty dependency array [] in useEffect cause if inside the effect you access state that updates over time?",
    "optionA": "An infinite re-rendering crash loop",
    "optionB": "A Stale Closure, where the effect callback permanently captures the initial state value from the first render",
    "optionC": "A memory leak that crashes the V8 garbage collector immediately",
    "optionD": "Automatic unmounting of the parent component hierarchy",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "Which HTTP status code should a RESTful API return when a POST request successfully creates a new resource and includes the resource URI in the response?",
    "optionA": "200 OK",
    "optionB": "201 Created",
    "optionC": "204 No Content",
    "optionD": "202 Accepted",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "In CSS Specificity calculations, which of the following selectors has the highest specificity weight?",
    "optionA": "div.container ul li.active a",
    "optionB": "#main-nav ul li a:hover",
    "optionC": "header nav ul.nav-list > li > a[data-active=\"true\"]",
    "optionD": "body.dark-mode div.wrapper section.content p::first-letter",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "What is the purpose of the HTTP header Strict-Transport-Security (HSTS)?",
    "optionA": "To force user browsers to communicate with the domain exclusively over secure HTTPS connections, preventing SSL-stripping man-in-the-middle attacks",
    "optionB": "To restrict database access exclusively to localhost connections",
    "optionC": "To enforce two-factor authentication on every HTTP request",
    "optionD": "To block browser users from opening the DevTools panel",
    "correctAnswer": "A",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "What is the primary architectural benefit of using Node.js clustering or PM2 worker processes in production?",
    "optionA": "It converts Node.js from an event-driven model into a multi-threaded C++ runtime",
    "optionB": "It spawns child processes across multiple CPU cores to share the incoming traffic load and avoid single-threaded CPU bottlenecks",
    "optionC": "It replaces the V8 engine with a distributed relational database engine",
    "optionD": "It removes the need for database indexing or load balancers",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "In JavaScript, what is the output of typeof NaN and NaN === NaN?",
    "optionA": "\"undefined\" and true",
    "optionB": "\"number\" and false",
    "optionC": "\"object\" and false",
    "optionD": "\"NaN\" and true",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "Why should you never use the array index as the key prop in a dynamic React list where items can be reordered, inserted, or deleted?",
    "optionA": "Because React throws a compile-time JSX syntax error on numeric keys",
    "optionB": "Because it can lead to state inconsistency and subtle rendering bugs in child components, as React relies on stable keys to correctly identify component identity across renders",
    "optionC": "Because it forces the browser to re-download the JavaScript bundle on every click",
    "optionD": "Because array indexes cannot be converted to strings in JavaScript",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "In modern JavaScript, what does the Nullish Coalescing operator (??) do differently compared to Logical OR (||)?",
    "optionA": "?? checks only for null or undefined, whereas || evaluates any falsy value (such as 0, empty string, or false) as triggering the fallback",
    "optionB": "?? throws an exception if the left side is null, while || ignores it",
    "optionC": "?? only works on array elements, while || only works on numbers",
    "optionD": "There is no difference; they are identical aliases",
    "correctAnswer": "A",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "What is the difference between a SQL LEFT JOIN and an INNER JOIN?",
    "optionA": "INNER JOIN returns all rows from the right table, while LEFT JOIN returns rows from neither",
    "optionB": "INNER JOIN returns only matching rows from both tables, while LEFT JOIN returns all rows from the left table plus matched rows from the right (with NULL for non-matches)",
    "optionC": "LEFT JOIN is always executed asynchronously in the background",
    "optionD": "INNER JOIN requires both tables to be stored on different physical servers",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "In Git, what is the key difference between git merge feature and git rebase main on a feature branch?",
    "optionA": "Merge preserves commit history and creates a merge commit, while Rebase rewrites project history by reapplying feature commits on top of the target branch tip for a linear history",
    "optionB": "Rebase permanently deletes all remote branches on GitHub",
    "optionC": "Merge can only be used by repository owners, while Rebase is for contributors",
    "optionD": "Rebase ignores file conflicts and automatically chooses the oldest code",
    "correctAnswer": "A",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "What is the primary mechanism of a Cross-Site Request Forgery (CSRF) attack on authenticated web apps?",
    "optionA": "Injecting malicious JavaScript into the DOM to steal cookies directly from memory",
    "optionB": "Tricking an authenticated user's browser into submitting unauthorized requests to a trusted site where the user is currently logged in, leveraging automatically attached session cookies",
    "optionC": "Brute forcing the administrator's database password through SQL port scanning",
    "optionD": "Overwhelming the server with distributed DDoS packets",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "In React, what is the role of the AbortController in cleanup functions of useEffect fetching operations?",
    "optionA": "To cancel ongoing network requests when the component unmounts or before re-running the effect, preventing memory leaks and state updates on unmounted components",
    "optionB": "To close the browser tab if the API takes longer than 2 seconds",
    "optionC": "To reboot the Express backend server remotely",
    "optionD": "To cache the API response permanently in the browser LocalStorage",
    "correctAnswer": "A",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "Which CSS property creates a new Stacking Context without setting position or z-index?",
    "optionA": "color: inherit;",
    "optionB": "opacity: 0.99; or transform: translateZ(0);",
    "optionC": "margin: 0 auto;",
    "optionD": "text-align: justify;",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "What is the crucial performance benefit of using HTTP/2 Multiplexing over legacy HTTP/1.1?",
    "optionA": "It allows multiple bidirectional requests and responses over a single TCP connection concurrently, eliminating head-of-line blocking at the application layer",
    "optionB": "It reduces all image file sizes by 90% automatically using lossless compression",
    "optionC": "It eliminates the need for DNS lookups across all domains",
    "optionD": "It disables browser cache to ensure live content",
    "correctAnswer": "A",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "What is the difference between Object.freeze() and Object.seal() in JavaScript?",
    "optionA": "Object.freeze prevents adding, deleting, and modifying existing property values; Object.seal prevents adding or deleting properties but allows modifying existing writable properties",
    "optionB": "Object.seal makes an object immutable for 24 hours, while freeze is permanent",
    "optionC": "Object.freeze only works on arrays, while Object.seal only works on functions",
    "optionD": "Both methods are identical and do the exact same operations",
    "correctAnswer": "A",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "In responsive typography, why is rem generally preferred over px for font sizing in production UI design?",
    "optionA": "Because rem scales proportionally with the user's root/browser font accessibility settings, while px is a rigid static value that ignores user accessibility preferences",
    "optionB": "Because px takes 4 times longer for the GPU to render than rem",
    "optionC": "Because rem values automatically convert text into multiple languages",
    "optionD": "Because mobile browsers do not support px font-size values",
    "correctAnswer": "A",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "In React, why is using the array index as a component \"key\" considered an anti-pattern when rendering dynamic, reorderable lists?",
    "optionA": "It triggers a compilation syntax error in modern Babel / JSX transpilers",
    "optionB": "It can cause component state bugs and incorrect UI rendering because React uses keys to match virtual DOM instances across re-renders",
    "optionC": "It disables browser caching for all subsequent API requests",
    "optionD": "Array indices take up more GPU memory than unique UUID string keys",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "In TypeScript, what is the role of the \"keyof\" type operator?",
    "optionA": "It generates a cryptographic public key for database encryption",
    "optionB": "It produces a string or numeric literal union of the known, public property names of an object type",
    "optionC": "It deletes all undefined properties from a JSON object at runtime",
    "optionD": "It forces a variable to be passed strictly by reference in JavaScript",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "During browser rendering, which of the following CSS property changes triggers only the \"Composite\" stage without causing \"Layout (Reflow)\" or \"Paint\"?",
    "optionA": "width and height",
    "optionB": "transform and opacity",
    "optionC": "padding and margin",
    "optionD": "border-width and color",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "In Node.js backend applications, which scenario is most commonly responsible for insidious memory leaks?",
    "optionA": "Using async/await instead of native callback functions",
    "optionB": "Accumulating uncleaned EventEmitters, unevicted global cache maps, or unclosed socket connections",
    "optionC": "Compressing outgoing HTTP response payloads using gzip",
    "optionD": "Defining arrow functions inside class methods",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "When architecting a real-time system, what is a primary structural advantage of Server-Sent Events (SSE) over WebSockets for one-way live notifications?",
    "optionA": "SSE operates over standard HTTP/HTTPS with automatic reconnection and HTTP/2 multiplexing, without requiring full-duplex protocol switching",
    "optionB": "SSE allows binary peer-to-peer audio streaming directly through UDP",
    "optionC": "WebSockets cannot be encrypted with TLS/SSL certificates",
    "optionD": "SSE works exclusively without any server-side running process",
    "correctAnswer": "A",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "What is the primary security objective of implementing a strict \"Content Security Policy (CSP)\" HTTP header?",
    "optionA": "To encrypt SQL database tables at rest",
    "optionB": "To restrict where scripts, styles, and other resources can be loaded from, mitigating Cross-Site Scripting (XSS) and data injection attacks",
    "optionC": "To prevent DDoS attacks by capping TCP packet sizes",
    "optionD": "To automatically generate SSL certificates for subdomain routing",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "In relational database indexing (e.g., PostgreSQL / MySQL), what does the \"Leftmost Prefix Rule\" dictate for a composite index on columns (A, B, C)?",
    "optionA": "The database query must sort alphabetically in reverse order",
    "optionB": "Queries can utilize the index if they filter on (A), (A, B), or (A, B, C), but cannot use it effectively if they only filter on (B) or (C) alone",
    "optionC": "Column C must always have higher numerical cardinality than column A",
    "optionD": "The index is only valid when reading data from left-to-right disk partitions",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "In Progressive Web Apps (PWA), which Service Worker caching strategy returns cached assets immediately for speed while asynchronously fetching fresh versions to update cache?",
    "optionA": "Network-Only",
    "optionB": "Stale-While-Revalidate",
    "optionC": "Cache-Only",
    "optionD": "Offline-Reject",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "In modern JavaScript, what is the key characteristic of a \"WeakMap\" compared to a standard \"Map\"?",
    "optionA": "WeakMap keys must be objects and are held weakly, allowing them to be garbage collected if no other references exist",
    "optionB": "WeakMap has higher throughput when serialized into XML strings",
    "optionC": "WeakMap stores values in browser localStorage automatically across sessions",
    "optionD": "WeakMap keys can only be booleans or 32-bit floats",
    "correctAnswer": "A",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "In Next.js, what does Incremental Static Regeneration (ISR) allow developers to achieve?",
    "optionA": "Convert all React components into pure WebAssembly binaries at runtime",
    "optionB": "Update static pages in the background after deployment without needing a full site rebuild",
    "optionC": "Bypass CORS headers on third-party tracking scripts",
    "optionD": "Force client browsers to reload every asset on every mouse movement",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "Why are parameterized queries (prepared statements) the standard industry defense against SQL Injection?",
    "optionA": "They convert all database tables into read-only files before query execution",
    "optionB": "They separate SQL code logic from user-provided data parameters, ensuring user inputs are treated strictly as literal values rather than executable code",
    "optionC": "They run queries on a sandbox client machine rather than the production database",
    "optionD": "They remove all vowels from incoming input strings",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "What is the technical operational difference between \"Debounce\" and \"Throttle\" in client-side event handling?",
    "optionA": "Debounce runs the function continuously at 60 FPS, while Throttle pauses the main thread",
    "optionB": "Debounce delays execution until a specified quiet period has elapsed with no new events, while Throttle guarantees execution at most once per fixed time interval",
    "optionC": "Debounce works only on mobile touch screens, while Throttle works only on desktops",
    "optionD": "Throttle deletes event listeners, while Debounce registers duplicate listeners",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "In CSS layout mechanics, what creates a new \"Block Formatting Context (BFC)\" and prevents vertical margin collapsing between parent and child?",
    "optionA": "Setting display: inline",
    "optionB": "Setting overflow: hidden (or auto), display: flow-root, or display: flex",
    "optionC": "Setting margin: auto without declaring a width",
    "optionD": "Using font-weight: bold",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "When does a web browser trigger a CORS \"Preflight\" (OPTIONS) request prior to making an HTTP API call?",
    "optionA": "Whenever the request uses GET with standard text/plain Content-Type",
    "optionB": "Whenever the cross-origin request uses non-simple HTTP methods (e.g., PUT, DELETE, PATCH) or custom headers (e.g., Authorization)",
    "optionC": "Whenever the web page is opened in an incognito window",
    "optionD": "Only when the user's internet speed is below 1 Mbps",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "In Docker containerization for full-stack Node.js applications, what is the main benefit of using \"Multi-Stage Builds\"?",
    "optionA": "It enables containers to run on multiple cloud operating systems simultaneously",
    "optionB": "It separates build dependencies and compiler toolchains from the final runtime image, resulting in dramatically smaller and more secure production containers",
    "optionC": "It eliminates the need for an application database server",
    "optionD": "It speeds up client internet connections via HTTP/3 tunneling",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "When handling user authentication tokens, why should sensitive Refresh Tokens be stored in \"HttpOnly, Secure, SameSite=Strict\" cookies instead of browser localStorage?",
    "optionA": "Because cookies take less disk space than localStorage on iOS devices",
    "optionB": "Because HttpOnly cookies cannot be accessed or stolen by malicious JavaScript running in the browser during a Cross-Site Scripting (XSS) attack",
    "optionC": "Because localStorage cannot hold strings longer than 25 characters",
    "optionD": "Because HttpOnly cookies bypass standard HTTPS encryption",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "Why is \"Tree-Shaking\" (dead-code elimination) more effective with ES Modules (import/export) than CommonJS (require/module.exports)?",
    "optionA": "Because CommonJS modules can only be bundled on Linux servers",
    "optionB": "Because ES Modules have static module structure that can be deterministically analyzed at build time before code execution",
    "optionC": "Because ES Modules automatically convert JavaScript to C++",
    "optionD": "Because CommonJS syntax does not support function declarations",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "In Google Core Web Vitals (CWV), what metric replaced First Input Delay (FID) to assess overall page responsiveness throughout the entire session lifecycle?",
    "optionA": "Largest Contentful Paint (LCP)",
    "optionB": "Interaction to Next Paint (INP)",
    "optionC": "Cumulative Layout Shift (CLS)",
    "optionD": "Time to First Byte (TTFB)",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "What core architectural advantage does GraphQL provide over traditional REST API endpoints for complex dashboard interfaces?",
    "optionA": "GraphQL eliminates the need for database servers and backend logic",
    "optionB": "Clients can request exactly the data fields they require in a single query roundtrip, eliminating both over-fetching and under-fetching",
    "optionC": "GraphQL transmits uncompressed binary packets over Bluetooth",
    "optionD": "GraphQL cannot return JSON responses",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "WEB_DEVELOPMENT",
    "question": "In modern responsive design, how do CSS \"Container Queries\" (@container) differ fundamentally from traditional \"Media Queries\" (@media)?",
    "optionA": "Container queries apply styles based on the dimensions of a parent element container rather than the overall browser viewport width",
    "optionB": "Container queries only work inside Docker containers",
    "optionC": "Media queries can only be written in external JavaScript files",
    "optionD": "Container queries require WebGL hardware acceleration to render",
    "correctAnswer": "A",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "In enterprise B2B sales qualification, what does the \"BANT\" framework stand for, and when is it applied?",
    "optionA": "Brand, Audience, Network, Technology - used during website redesign",
    "optionB": "Budget, Authority, Need, Timeline - used in early lead qualification to determine whether a prospect is viable to pursue",
    "optionC": "Billing, Accounting, Negotiation, Turnover - used by the finance department during audits",
    "optionD": "Benchmark, Analytics, Target, Margin - used during quarterly tax filings",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "In the SPIN Selling methodology, what do the four stages represent in consultative client meetings?",
    "optionA": "Speed, Price, Incentive, Negotiation",
    "optionB": "Situation questions, Problem questions, Implication questions, Need-payoff questions",
    "optionC": "Strategy, Production, Inventory, Networking",
    "optionD": "Search, Pitch, Invoice, Next-steps",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "A qualified prospect says: \"Your solution looks impressive, but your price is 30% higher than your primary competitor.\" What is the most effective BDE response?",
    "optionA": "Immediately offer a 35% discount to win the contract today",
    "optionB": "Acknowledge the investment difference, re-anchor on the unique ROI and quantifiable business outcomes your solution delivers, and ask what specific capabilities the competitor is offering for that lower price",
    "optionC": "Tell the prospect that the competitor's team is dishonest and unethical",
    "optionD": "Hang up the phone because the client lacks sufficient budget",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "What is the formula for calculating \"Customer Acquisition Cost\" (CAC) in sales operations?",
    "optionA": "Total Revenue divided by Total Marketing Expenses",
    "optionB": "Total Sales and Marketing Costs over a period divided by the Number of New Customers Acquired in that same period",
    "optionC": "Average Deal Size multiplied by Customer Lifetime in months",
    "optionD": "Gross Margin divided by the number of active salespeople",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "What is considered a healthy benchmark for the \"LTV to CAC ratio\" (Customer Lifetime Value to Customer Acquisition Cost) in a sustainable SaaS/Services business?",
    "optionA": "1:1 (breaking even on every deal)",
    "optionB": "3:1 or higher (creating significant value above acquisition costs)",
    "optionC": "0.5:1 (spending double what the customer generates)",
    "optionD": "100:1 (completely zero marketing expenses)",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "In enterprise deal cycles, what is the role of an \"Internal Champion\" versus an \"Economic Buyer\"?",
    "optionA": "The Champion signs the legal check, while the Economic Buyer uses the tool on a daily basis",
    "optionB": "The Champion is an internal stakeholder who advocates for your solution and navigates internal politics, while the Economic Buyer has final discretionary authority to approve the budget and sign contracts",
    "optionC": "Both roles refer to junior interns who attend discovery calls",
    "optionD": "The Champion is an external competitor, while the Economic Buyer is your CEO",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "During a cold outreach campaign, which factor has the highest statistical impact on email reply rates?",
    "optionA": "Writing a 1,500-word essay detailing every single feature of your product catalog",
    "optionB": "Hyper-personalized research on the prospect's specific business challenges, a compelling relevant value proposition, and a clear, low-friction Call-to-Action (CTA)",
    "optionC": "Attaching 5 large PDF brochures and 3 zip files in the first cold email",
    "optionD": "Using ALL CAPS in the subject line to stand out in the inbox",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "What does \"Sales Pipeline Velocity\" measure, and what are its four core components?",
    "optionA": "How fast a BDE talks on cold calls: Volume, Pitch, Speed, Tone",
    "optionB": "The speed at which qualified leads convert into closed revenue: Number of Opportunities x Win Rate x Average Deal Size / Sales Cycle Length",
    "optionC": "The travel distance between your regional office and the client headquarters",
    "optionD": "The total number of cold emails sent in an hour divided by bounces",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "In B2B negotiation theory, what is \"BATNA\" and why is knowing it crucial before entering high-stakes deal negotiations?",
    "optionA": "Best Allocation of Tactical New Assets; used for equipment leasing",
    "optionB": "Best Alternative To a Negotiated Agreement; it defines your walk-away point and bargaining leverage if talks stall",
    "optionC": "Business Accounting Tracking for Net Assets; used for debt collection",
    "optionD": "Base Annual Target for New Accounts; used to calculate quarterly bonuses",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "A prospect on a discovery call says: \"We are currently happy with our existing vendor and have a contract with them.\" What is the strategic BDE move?",
    "optionA": "Ask when their current contract is up for renewal, inquire what gaps or minor bottlenecks they occasionally experience, and establish a relationship to be first in line for future review",
    "optionB": "Offer to pay their contract termination fee immediately from your personal wallet",
    "optionC": "End the conversation immediately and remove the company from your CRM forever",
    "optionD": "Criticize the prospect for making a poor vendor decision",
    "correctAnswer": "A",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "What is the fundamental difference between an MQL (Marketing Qualified Lead) and an SQL (Sales Qualified Lead)?",
    "optionA": "MQLs have expressed interest through marketing engagement (content download, webinar), while SQLs have been vetted by sales as having clear intent, need, and budget to purchase",
    "optionB": "MQLs are based in Asia, while SQLs are based in North America",
    "optionC": "MQLs are signed paying clients, while SQLs are cold unregistered contacts",
    "optionD": "There is no difference; they are synonymous terms",
    "correctAnswer": "A",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "What is \"Account-Based Marketing / Selling\" (ABM) and how does it contrast with traditional volume-based outbound sales?",
    "optionA": "ABM targets millions of random consumers with automated generic mass emails",
    "optionB": "ABM treats high-value strategic accounts as individual distinct markets, orchestrating deeply customized campaigns across multiple key decision-makers within specific organizations",
    "optionC": "ABM is a retail storefront strategy used only in grocery stores",
    "optionD": "ABM eliminates sales teams and relies solely on organic word-of-mouth",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "What is the primary danger of offering premature discounts during early sales conversations before value is established?",
    "optionA": "The prospect may ask for a higher price instead",
    "optionB": "It erodes the perceived value of your solution, sets a dangerous precedent for future renewals, and signals that your initial price was inflated or arbitrary",
    "optionC": "It triggers automatic legal fines from the Ministry of Corporate Affairs",
    "optionD": "It causes the CRM software to reject the deal record",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "What is a \"Discovery Call\" and what percentage of talk-time should an expert BDE aim for versus the prospective client?",
    "optionA": "BDE should speak 90% of the time pitching product slide decks",
    "optionB": "BDE should speak roughly 30-40% of the time, asking targeted open-ended questions and listening actively while the prospect talks 60-70% about their business challenges",
    "optionC": "Both parties should remain completely silent during the first 15 minutes",
    "optionD": "Discovery calls should strictly be text-only chat without audio",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "In client retention and expansion, what is the concept of \"Net Revenue Retention\" (NRR), and why do enterprise leaders track it so closely?",
    "optionA": "The total amount of tax paid to the government at year-end",
    "optionB": "The percentage of recurring revenue retained from existing customers over a given period, including expansions/upsells and subtracting downgrades and churn (>100% signifies organic growth without new customer acquisition)",
    "optionC": "The total cost of office electricity and internet bills",
    "optionD": "The amount of money spent on client greeting cards during festivals",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "When presenting a proposal, what is \"Price Anchoring\" and how does it influence buyer perception?",
    "optionA": "Stating a higher baseline or premium tier first, which sets the psychological reference point and makes subsequent recommended packages feel more reasonable and valuable",
    "optionB": "Refusing to state any pricing until the client signs a blank check",
    "optionC": "Hiding all prices in an encrypted password-protected document",
    "optionD": "Quoting a price that is tied directly to the price of physical gold bullion",
    "correctAnswer": "A",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "A high-value lead goes completely silent (\"ghosts\") after receiving a detailed commercial proposal. What is the most effective re-engagement strategy?",
    "optionA": "Send 10 angry emails asking why they have poor manners",
    "optionB": "Send a concise, value-added follow-up sharing a fresh industry insight or case study relevant to their stated bottleneck, followed by a polite \"closing the file\" breakup email if no response ensues",
    "optionC": "Call their personal mobile number continuously every 10 minutes until they pick up",
    "optionD": "Immediately issue an unauthorized invoice to force a reaction",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "What does \"Churn Rate\" measure in a recurring revenue business, and what is the difference between Logo Churn and Revenue Churn?",
    "optionA": "Logo Churn measures the number of distinct customer accounts lost, while Revenue Churn measures the percentage of dollar revenue lost through cancellations and contract downgrades",
    "optionB": "Logo Churn measures graphic designer turnover, while Revenue Churn measures printer ink costs",
    "optionC": "Logo Churn is positive growth, while Revenue Churn is negative growth",
    "optionD": "Both terms measure the speed of company website page loads",
    "correctAnswer": "A",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "In outbound sales cadences, what is the recommended multi-channel outreach pattern across a 14-day cycle for prospective enterprise clients?",
    "optionA": "Sending 50 cold emails in a single hour from a free Yahoo email address",
    "optionB": "A structured combination of personalized email, LinkedIn engagement/InMail, targeted phone calls, and video messages spaced strategically across multiple touchpoints",
    "optionC": "Visiting their physical corporate office unannounced without an appointment",
    "optionD": "Mailing paper letters via courier without any email follow-up",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "What is the role of a \"Gatekeeper\" in B2B sales and how should a professional BDE navigate this dynamic?",
    "optionA": "An aggressive security guard; they should be reported to the local police",
    "optionB": "An executive assistant or office manager who screens executive communication; treat them with deep professional respect, explain the business value clearly, and partner with them to identify the right time to reach the decision-maker",
    "optionC": "A firewall software that deletes incoming spam emails",
    "optionD": "An automated answering machine that cannot be navigated",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "In commercial contracts, what is the function of a \"Scope of Work\" (SOW) document and why is it vital for preventing Scope Creep?",
    "optionA": "It lists employee salary expectations for internal payroll",
    "optionB": "It clearly articulates deliverables, milestones, assumptions, timelines, and boundaries of the project, ensuring both parties are aligned on what is included and what incurs extra billable hours",
    "optionC": "It is a marketing brochure used to win trade show awards",
    "optionD": "It is an insurance policy for company automobiles",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "What is the primary objective of \"Social Selling\" on platforms like LinkedIn for modern BDEs?",
    "optionA": "Posting memes to accumulate personal followers for vanity metrics",
    "optionB": "Building industry credibility, sharing insightful thought leadership, tracking executive job changes, and nurturing professional relationships before formal sales outreach",
    "optionC": "Sending automated copy-pasted sales pitches within 3 seconds of a connection request being accepted",
    "optionD": "Replacing the company CRM entirely with LinkedIn messaging",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "What does \"MEDDIC\" stand for in enterprise sales methodology, and why is it favored for complex six-figure deals?",
    "optionA": "Medical, Engineering, Design, Documentation, Integration, Completion",
    "optionB": "Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion - provides a rigorous checklist to eliminate surprises in enterprise procurement",
    "optionC": "Market, Economy, Dollar, Deficit, Inflation, Capital",
    "optionD": "Meetings, Emails, Demos, Discounts, Invoices, Contracts",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "During contract negotiations, the client asks for an additional deliverable without increasing the budget. What is the principled negotiation response?",
    "optionA": "Accept the demand immediately to avoid making the client uncomfortable",
    "optionB": "Practice \"Give and Get\" - agree to include the additional deliverable in exchange for an earlier contract signing date, longer commitment term, or removing an equivalent lower-priority item",
    "optionC": "Cancel the entire contract and terminate communication with the client",
    "optionD": "Pretend you did not hear the client's request and invoice them anyway",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "What is the \"Assumptive Close\" technique in sales, and when is it appropriately deployed?",
    "optionA": "Assuming the client has already signed without ever sending them a contract",
    "optionB": "Acting with positive confidence that the deal is moving forward naturally once all objections have been resolved (e.g., \"Shall we target next Monday to begin onboarding your team?\")",
    "optionC": "Forcing the client into an aggressive ultimatum within the first 60 seconds of a cold call",
    "optionD": "Assuming the competitor will win the contract and giving up early",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "Why is conducting a \"Loss Analysis\" (Post-Mortem) on lost sales deals just as critical as celebrating won deals?",
    "optionA": "To assign blame and reprimand junior team members in public",
    "optionB": "To uncover objective market feedback on pricing, product gaps, competitor positioning, and qualification flaws in order to refine future sales strategy",
    "optionC": "To file tax deductions for emotional stress",
    "optionD": "Loss analysis has no value; top sales teams only look forward",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "What is the role of \"Sales Enablement\" inside a high-performing business development organization?",
    "optionA": "Providing sales reps with the content, training, playbooks, competitive battlecards, and technology needed to engage buyers effectively at every sales cycle stage",
    "optionB": "Ordering snacks and coffee for the sales department break room",
    "optionC": "Writing legal cease-and-desist letters to competitor companies",
    "optionD": "Managing internal company desktop IT support tickets",
    "correctAnswer": "A",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "In B2B contract terms, what does \"Net 30\" payment terms mean for cash flow and working capital management?",
    "optionA": "The client must pay the invoice within 30 days of the invoice date",
    "optionB": "The client receives a 30% discount on every payment",
    "optionC": "The contract lasts for exactly 30 business hours",
    "optionD": "The vendor has 30 days to begin building the project after receiving 100% upfront cash",
    "correctAnswer": "A",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "What is \"Referral Selling\" and why is it statistically known to yield the highest closing rates in consultative services?",
    "optionA": "Purchasing random lists of scraped phone numbers from dark web forums",
    "optionB": "Leveraging satisfied existing clients and trusted network contacts to introduce you to warm prospects, where transferred trust significantly reduces buyer hesitation and shortens sales cycles",
    "optionC": "Paying affiliate search engine marketers to display clickbait banner ads",
    "optionD": "Requiring all new clients to sign non-compete agreements",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "What is the ultimate difference between a transactional salesperson and a true consultative Strategic Business Development Partner?",
    "optionA": "Transactional reps focus on quick one-off product pushes and discounts, while Strategic Partners deeply understand the client's enterprise objectives, align bespoke solutions to measurable business ROI, and build long-term advisory relationships",
    "optionB": "Transactional reps wear formal suits, while Strategic Partners wear casual t-shirts",
    "optionC": "Transactional reps only speak over telephone, while Strategic Partners communicate only via postal mail",
    "optionD": "There is no distinction; both operate identically in all markets",
    "correctAnswer": "A",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "In enterprise sales methodology, what does the \"MEDDPICC\" framework evaluate to qualify high-value deals?",
    "optionA": "Metrics, Economic Buyer, Decision Criteria, Decision Process, Paper Process, Identify Pain, Champion, Competition",
    "optionB": "Marketing, Equity, Dividends, Depreciation, Profit, Income, Cashflow, Credit",
    "optionC": "Management, Employees, Delegation, Performance, Payroll, Incentives, Compliance, Culture",
    "optionD": "Media, Engagement, Digital, Production, Presentation, Interaction, Content, Conversion",
    "correctAnswer": "A",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "In SaaS sales economics, what does the \"CAC Payback Period\" measure?",
    "optionA": "The number of hours taken for an SDR to dial 100 leads",
    "optionB": "The number of months required for gross profit generated by a new customer to equal the cost incurred to acquire that customer",
    "optionC": "The annual bonus payout percentage awarded to the top account executive",
    "optionD": "The time taken by accounts receivable to print paper invoices",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "Why is a Net Revenue Retention (NRR) rate exceeding 100% considered the holy grail of SaaS and agency business development?",
    "optionA": "It means that the company has terminated all of its marketing expenses",
    "optionB": "It indicates that revenue expansion and upsells from existing clients outweigh revenue lost to churn and downgrades, enabling organic growth even without new customer acquisitions",
    "optionC": "It guarantees that no client will ever request customer support",
    "optionD": "It indicates that the company is legally exempt from corporate taxation",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "When building an outbound B2B email sequence, which practice consistently yields the highest response and meeting-booked rates?",
    "optionA": "Sending identical generic mass blasts to 50,000 unverified email addresses without personalization",
    "optionB": "Using concise, hyper-relevant pain-point messaging tailored to the prospect's industry/role with a low-friction call-to-action (e.g. asking for interest rather than demanding a 45-min calendar slot)",
    "optionC": "Attaching a 50MB PDF brochure and video file directly to the very first cold email",
    "optionD": "Writing all email subject lines in full capital letters with multiple exclamation marks",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "In formal procurement processes, what is the primary distinction between an \"RFI\" (Request for Information) and an \"RFP\" (Request for Proposal)?",
    "optionA": "An RFI is a binding legal contract, while an RFP is an informal text message",
    "optionB": "An RFI is an exploratory document used by buyers to gather market intelligence and vendor capabilities, whereas an RFP is a formal competitive bidding document requesting specific solutions, pricing, and SLAs",
    "optionC": "An RFI is exclusively used for government defense contracts, while RFPs are used only by non-profit charities",
    "optionD": "RFIs are issued after deals close, whereas RFPs are issued before prospecting begins",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "What is the primary risk of an inadequate handover between the Business Development / Sales team and the Customer Success / Delivery team after closing a deal?",
    "optionA": "Customer data will be automatically erased from the CRM",
    "optionB": "Misaligned expectations, delivery delays, client buyer remorse, and high churn risk within the first 90 days",
    "optionC": "The sales rep will be barred from selling to other prospects forever",
    "optionD": "The client will be unable to make bank wire transfers",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "What is the key strategic benefit of offering a \"Tiered Pricing Model\" (e.g., Starter, Professional, Enterprise) over a single flat-rate price?",
    "optionA": "It reduces the amount of code the software engineers have to write",
    "optionB": "It captures maximum consumer surplus by allowing customers of varying sizes and budgets to self-select the package that matches their value requirements and willingness to pay",
    "optionC": "It eliminates the need for accounting audits and sales invoices",
    "optionD": "It prevents competitors from seeing your company's product features",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "In modern social selling on LinkedIn, which strategy most effectively positions a BDE to connect with C-level enterprise decision makers?",
    "optionA": "Sending immediate generic copy-paste sales pitches within 30 seconds of an accepted connection request",
    "optionB": "Sharing credible industry insights, engaging thoughtfully with the executive's public commentary, and establishing mutual peer credibility before initiating a consultative outreach",
    "optionC": "Tagging 50 executives randomly in promotional product images",
    "optionD": "Automating 500 connection requests per day with zero profile information",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "When a prospect objects with: \"We are already very happy with our current vendor/agency\", what is the most consultative response strategy?",
    "optionA": "Aggressively criticize the competitor's leadership and call their product useless",
    "optionB": "Acknowledge their relationship positively, inquire about their future roadmap priorities, and explore whether there are secondary gaps or niche areas where your solution could complement their current setup",
    "optionC": "Immediately cut your price in half and beg them to switch today",
    "optionD": "Hang up the phone immediately and blacklist the company in the CRM",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "In sales management, what are the four key variables that determine \"Sales Pipeline Velocity\" (V = Number of Ops * Win Rate * Average Deal Size / Cycle Time)?",
    "optionA": "Headcount, Office Rent, Marketing Spend, Employee Turnover",
    "optionB": "Number of Qualified Opportunities, Win Rate percentage, Average Deal Value, and Sales Cycle Length in days",
    "optionC": "Social Media Followers, Website Clicks, Impressions, and Page Views",
    "optionD": "Server Costs, Database Latency, Bug Count, and Sprint Velocity",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "Why is \"Multi-Threading\" considered an essential risk mitigation strategy in high-stakes enterprise sales deals?",
    "optionA": "It allows sales reps to execute multiple computer programs on multi-core processors simultaneously",
    "optionB": "It builds relationships across multiple departments and decision makers (e.g., technical, financial, end-user), preventing the deal from stalling or dying if a single internal champion departs",
    "optionC": "It automatically reduces product manufacturing costs by 50%",
    "optionD": "It bypasses all corporate legal and procurement review requirements",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "During a first-round Discovery Call with a prospective client, what should be the primary objective of a top-performing BDE?",
    "optionA": "Spend 45 minutes walking through every feature slide in the corporate pitch deck without pausing",
    "optionB": "Ask insightful, open-ended questions to uncover the prospect's core operational bottlenecks, business consequences of inaction, and strategic priorities",
    "optionC": "Press the prospect to sign an annual contract before ending the call",
    "optionD": "Offer maximum discounts before understanding their actual requirements",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "What is the primary advantage of establishing a \"Channel Partner / Reseller Ecosystem\" alongside a direct sales team?",
    "optionA": "Channel partners work for zero commission and assume full product liability",
    "optionB": "It accelerates market reach and distribution by leveraging the trusted existing relationships, local presence, and customer bases of established partners without proportional sales headcount increase",
    "optionC": "It eliminates the need to maintain quality control or customer documentation",
    "optionD": "It converts all enterprise software products into consumer retail merchandise",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "When negotiating enterprise software or agency contracts, why must a BDE understand the difference between Gross Margin and Operating Margin?",
    "optionA": "Because gross margin measures revenue minus direct service delivery costs, ensuring custom discount requests do not render individual client accounts unprofitable to service",
    "optionB": "Because operating margin only applies to non-profit entities",
    "optionC": "Because gross margin is determined exclusively by the central bank interest rate",
    "optionD": "Because commercial sales reps are legally forbidden from discussing profit margins",
    "correctAnswer": "A",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "If a prospect on a preliminary cold phone call asks: \"Can you just email me your pricing deck?\", what is the most effective way to maintain momentum?",
    "optionA": "Refuse rudely and demand their credit card number immediately",
    "optionB": "Share a concise ballpark range or explain that pricing depends directly on scope/scale, then offer a quick 10-minute diagnostic discussion to provide a tailored, accurate quote",
    "optionC": "Email them a 200-page spreadsheet without any explanation and never follow up",
    "optionD": "Promise that your service is completely free of charge forever",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "In growth-stage business models, what is the widely accepted benchmark for a healthy Customer Lifetime Value to Customer Acquisition Cost (LTV:CAC) ratio?",
    "optionA": "0.5 : 1 (Spending twice as much on CAC as the customer will ever spend)",
    "optionB": "At least 3 : 1 (The lifetime value generated is at least three times the acquisition cost)",
    "optionC": "100 : 1 (Requiring zero investment into sales or marketing operations)",
    "optionD": "Negative 1 : 1",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "In Account-Based Marketing (ABM), how do Business Development and Marketing teams align their efforts?",
    "optionA": "Marketing only posts memes on social media while sales ignores marketing completely",
    "optionB": "Both teams collaboratively identify a high-value list of specific target accounts, orchestrating personalized outreach, tailored content, and multi-channel touches toward key stakeholders within those exact accounts",
    "optionC": "Sales reps spend their entire working day designing display banner advertisements",
    "optionD": "Marketing takes over customer billing and collections directly",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "On Strategyzer's Value Proposition Canvas, what two components must achieve \"Problem-Solution Fit\"?",
    "optionA": "Office Location and Company Logo",
    "optionB": "The Customer Profile (Customer Jobs, Pains, Gains) and the Value Map (Products/Services, Pain Relievers, Gain Creators)",
    "optionC": "Stock Market Ticker and Dividend Yield",
    "optionD": "Employee Salaries and Annual Vacation Allowances",
    "correctAnswer": "B",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "What is a \"Mutual Action Plan (MAP)\" (or Joint Execution Plan), and why does it improve enterprise close rates?",
    "optionA": "A shared collaborative document that outlines every agreed milestone, owner, and deadline between buyer and seller from evaluation to contract sign-off and go-live, ensuring momentum and transparency",
    "optionB": "A secret internal document hidden from the client to enforce sudden surprise fees",
    "optionC": "An automated script that sends 10 reminder emails per minute to the buyer",
    "optionD": "A document that transfers company equity to the prospective client",
    "correctAnswer": "A",
    "difficulty": "ADVANCED"
  },
  {
    "category": "BUSINESS_DEVELOPMENT",
    "question": "What is the strategic difference between \"Up-Selling\" and \"Cross-Selling\" in account expansion?",
    "optionA": "Up-selling encourages the client to purchase a higher-tier or premium version of the current product, while Cross-selling offers complementary or adjacent products/services that solve related needs",
    "optionB": "Up-selling is strictly illegal under commercial law, whereas Cross-selling is mandatory",
    "optionC": "Cross-selling only applies to physical grocery items, while Up-selling only applies to real estate",
    "optionD": "There is no difference; they are identical synonyms with no distinction",
    "correctAnswer": "A",
    "difficulty": "ADVANCED"
  }
];
