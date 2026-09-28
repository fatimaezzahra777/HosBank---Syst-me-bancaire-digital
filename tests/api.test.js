const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const http = require('node:http');
const path = require('node:path');
const { test } = require('node:test');

const port = 3100 + Math.floor(Math.random() * 1000);
const appPath = path.join(__dirname, '..', 'src', 'app.js');

function request(pathname, method = 'GET', body, token) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      hostname: '127.0.0.1',
      port,
      path: pathname,
      method,
      headers: { 'Content-Type': 'application/json' }
    };

    if (token) requestOptions.headers.Authorization = `Bearer ${token}`;

    const outgoing = http.request(requestOptions, (response) => {
      let responseBody = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { responseBody += chunk; });
      response.on('end', () => {
        resolve({ status: response.statusCode, body: responseBody ? JSON.parse(responseBody) : {} });
      });
    });

    outgoing.on('error', reject);
    if (body) outgoing.write(JSON.stringify(body));
    outgoing.end();
  });
}

test('Binôme B login, role access, request handling and account creation', async (context) => {
  const server = spawn(process.execPath, [appPath], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT: String(port) },
    stdio: 'ignore'
  });
  context.after(() => server.kill());

  let ready = false;
  for (let attempt = 0; attempt < 40 && !ready; attempt += 1) {
    try {
      await request('/api/login', 'POST', { email: 'nadia@bank.com', password: '123456' });
      ready = true;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  assert.equal(ready, true, 'server should start on the test port');

  const adminLogin = await request('/api/login', 'POST', { email: 'nadia@bank.com', password: '123456' });
  assert.equal(adminLogin.status, 200);
  const adminToken = adminLogin.body.token;
  const adminUsers = await request('/api/admin/users', 'GET', undefined, adminToken);
  assert.equal(adminUsers.status, 200);

  const advisorLogin = await request('/api/login', 'POST', { email: 'ahmed@bank.com', password: '123456' });
  const advisorToken = advisorLogin.body.token;
  const assignedClients = await request('/api/clients', 'GET', undefined, advisorToken);
  assert.equal(assignedClients.status, 200);
  assert.ok(assignedClients.body.data.every((client) => client.assignedAdvisorId === advisorLogin.body.user.id));

  const forbiddenAdminData = await request('/api/admin/users', 'GET', undefined, advisorToken);
  assert.equal(forbiddenAdminData.status, 403);

  const acceptedRequest = await request('/api/requests/1/status', 'PATCH', { status: 'ACCEPTEE', advisorId: advisorLogin.body.user.id }, advisorToken);
  assert.equal(acceptedRequest.status, 200);
  const invalidTransition = await request('/api/requests/1/status', 'PATCH', { status: 'REFUSEE', advisorId: advisorLogin.body.user.id }, advisorToken);
  assert.equal(invalidTransition.status, 400);

  const createdAccount = await request('/api/admin/accounts', 'POST', { clientId: 1, type: 'SAVINGS', balance: 100 }, adminToken);
  assert.equal(createdAccount.status, 201);
  assert.equal(createdAccount.body.data.status, 'ACTIVE');

  const unauthorized = await request('/api/clients');
  assert.equal(unauthorized.status, 401);
});const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const appPath = path.join(__dirname, '..', 'src', 'app.js');
const server = spawn('node', [appPath], { cwd: path.join(__dirname, '..') });

server.stdout.on('data', () => {});
server.stderr.on('data', () => {});

setTimeout(() => {
  http.get('http://localhost:3000/api/clients', (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('STATUS:', res.statusCode);
      console.log('BODY:', data);

      if (res.statusCode !== 200) {
        console.error('Test failed: /api/clients did not return 200');
        process.exit(1);
      }

      server.kill();
      console.log('Test passed');
    });
  }).on('error', (err) => {
    console.error('Request failed:', err.message);
    server.kill();
    process.exit(1);
  });
}, 1000);
