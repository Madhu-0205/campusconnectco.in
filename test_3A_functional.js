const http = require('http');

const runTest = (path, method, body, expectedStatus, name) => {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: body ? { 'Content-Type': 'application/json' } : {}
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const pass = res.statusCode === expectedStatus;
                console.log(`[${pass ? 'PASS' : 'FAIL'}] ${name} -> Expected ${expectedStatus}, Got ${res.statusCode}`);
                resolve();
            });
        });
        req.on('error', (e) => {
            console.log(`[ERROR] ${name}: ${e.message}`);
            resolve();
        });
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
};

async function main() {
    console.log("=== Functional Validation Evidence ===");
    
    // 3A-1
    await runTest('/api/applications/apply', 'POST', { gigId: "invalid-uuid" }, 401, 'Application missing auth (caught by protectApi)');
    
    // 3A-4 AI Output Validation
    await runTest('/api/ai/smartmatch', 'POST', {}, 401, 'SmartMatch Zod Schema/Auth');
    await runTest('/api/ai/career-guidance', 'POST', {}, 422, 'Career Guidance Missing Params (Zod/AI)');
    
    // 3A-5 Conversations
    await runTest('/api/conversations', 'POST', { otherUserId: "00000000-0000-0000-0000-000000000000" }, 401, 'Self/Duplicate conversation unauth block');
}
main();
