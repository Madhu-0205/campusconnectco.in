 
const http = require('http');

http.get('http://localhost:3000/dashboard/student', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Attempt to extract next js error stack
    const regex = /<span data-nextjs-dialog-content="true".*?>(.*?)<\/span>/is;
    const bodyMatch = data.match(regex);
    if (bodyMatch) {
       console.log("Next.js Error Details:", bodyMatch[1].replace(/<\/?[^>]+(>|$)/g, ""));
    } else {
       console.log("Status:", res.statusCode);
       if(res.statusCode === 500) console.log("Data snippet:", data.substring(0, 1000));
    }
  });
}).on('error', err => console.log('Req error:', err.message));
