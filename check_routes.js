const http = require('http');

const routes = [
  '/',
  '/search',
  '/gigs/find',
  '/leaderboard',
  '/dashboard/student/skill-gap',
  '/dashboard/student/internships',
  '/dashboard/student/smartmatch',
  '/dashboard/student/messages',
  '/network',
  '/profile',
  '/settings',
  '/api/ai/copilot/sessions'
];

async function check() {
  for (const route of routes) {
    const req = http.get(`http://localhost:3000${route}`, (res) => {
      console.log(`${res.statusCode} - ${route}`);
      // if it's 500, read the body to see if it has the "Server Components render" error.
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (data.includes("An error occurred in the Server Components render")) {
          console.log(`CRASH ON: ${route}`);
        }
      });
    });
    req.on('error', (e) => {
      console.error(`Error on ${route}: ${e.message}`);
    });
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}
check();
