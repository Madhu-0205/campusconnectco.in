const http = require('http');

const runTest = (path, expectedStatus, name) => {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET'
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
        req.end();
    });
};

async function main() {
    console.log("Starting Regression Tests for Authorization...");
    await runTest('/api/founder/verify-role', 401, 'Founder Role Check (Unauthenticated)');
    await runTest('/api/applications', 401, 'Applications API (Unauthenticated)');
    await runTest('/api/payments/escrow/release', 401, 'Escrow Release API (Unauthenticated)');
    await runTest('/api/messages', 401, 'Messages API (Unauthenticated)');
    // If we get 401 for all these, then protectApi is still working perfectly inside the try/catch.
}

main();
