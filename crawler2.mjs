import http from 'http';

const pages = [
  '/browse-gigs', '/checkout', '/client-hub', '/dashboard/founder',
  '/dashboard/student', '/editorial', '/employer/drives', '/employer/talent-search',
  '/get-gig', '/gigs/find', '/join', '/leaderboard', '/manifesto', '/marketplace',
  '/messages', '/network', '/notifications', '/onboarding', '/post-gig', '/pricing',
  '/profile', '/refer', '/search', '/settings', '/skill-selector', '/skills',
  '/success-stories', '/trust'
];

async function check(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ path, status: res.statusCode, error: data.includes('An error occurred in the Server Components render') });
      });
    }).on('error', (err) => resolve({ path, error: err.message }));
  });
}

for (const p of pages) {
  const res = await check(p);
  if (res.error === true) {
    console.log(`ERROR FOUND ON: ${p}`);
  } else if (res.status === 500) {
    console.log(`500 ON: ${p}`);
  } else {
    console.log(`OK: ${p} (${res.status})`);
  }
}
