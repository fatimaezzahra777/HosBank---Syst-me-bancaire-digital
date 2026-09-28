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

test('Binôme B advisor and Admin workflows', async (context) => {
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
  assert.equal((await request('/api/admin/transfers', 'GET', undefined, adminToken)).status, 200);
  assert.equal((await request('/api/admin/operations', 'GET', undefined, adminToken)).status, 200);
  assert.equal((await request('/api/admin/activities', 'GET', undefined, adminToken)).status, 200);

  const advisorLogin = await request('/api/login', 'POST', { email: 'ahmed@bank.com', password: '123456' });
  const advisorToken = advisorLogin.body.token;
  const assignedClients = await request('/api/clients', 'GET', undefined, advisorToken);
  assert.equal(assignedClients.status, 200);
  assert.ok(assignedClients.body.data.every((client) => client.assignedAdvisorId === advisorLogin.body.user.id));

  const forbiddenAdminData = await request('/api/admin/users', 'GET', undefined, advisorToken);
  assert.equal(forbiddenAdminData.status, 403);

  const acceptedRequest = await request('/api/requests/1/status', 'PATCH', { status: 'ACCEPTEE', advisorId: advisorLogin.body.user.id }, advisorToken);
  assert.equal(acceptedRequest.status, 200);
  assert.equal((await request('/api/requests', 'GET', undefined, advisorToken)).body.data.find((item) => item.id === 1).status, 'ACCEPTEE');
  const invalidTransition = await request('/api/requests/1/status', 'PATCH', { status: 'REFUSEE', advisorId: advisorLogin.body.user.id }, advisorToken);
  assert.equal(invalidTransition.status, 400);

  const addedRequestComment = await request('/api/comments', 'POST', { requestId: 1, content: 'Votre RIB est disponible.' }, advisorToken);
  assert.equal(addedRequestComment.status, 201);
  assert.equal((await request('/api/requests', 'GET', undefined, advisorToken)).body.data.find((item) => item.id === 1).comment, 'Votre RIB est disponible.');

  const newComplaint = await request('/api/complaints', 'POST', { clientId: 1, subject: 'Question sur le compte', description: 'Besoin d’une précision.' }, advisorToken);
  assert.equal(newComplaint.status, 201);
  const complaintId = newComplaint.body.data.id;
  assert.equal((await request(`/api/complaints/${complaintId}/status`, 'PATCH', { status: 'EN_COURS' }, advisorToken)).status, 200);
  assert.equal((await request('/api/comments', 'POST', { complaintId, content: 'Nous analysons votre demande.' }, advisorToken)).status, 201);

  assert.equal((await request('/api/requests/5/status', 'PATCH', { status: 'ACCEPTEE' }, advisorToken)).status, 200);
  const clientCards = await request('/api/clients/1/cards', 'GET', undefined, advisorToken);
  assert.ok(clientCards.body.data.some((card) => card.type === 'VIRTUAL'));
  assert.equal((await request('/api/requests/6/status', 'PATCH', { status: 'ACCEPTEE' }, advisorToken)).status, 200);
  const clientAccounts = await request('/api/clients/2/accounts', 'GET', undefined, advisorToken);
  assert.ok(clientAccounts.body.data.some((account) => account.type === 'SAVINGS' && account.balance === 0));

  assert.equal((await request('/api/requests/4/status', 'PATCH', { status: 'TRAITEE' }, advisorToken)).status, 200);
  const oppositionCards = await request('/api/clients/2/cards', 'GET', undefined, advisorToken);
  assert.ok(oppositionCards.body.data.some((card) => card.status === 'OPPOSITION'));

  const createdAccount = await request('/api/admin/accounts', 'POST', { clientId: 1, type: 'SAVINGS', balance: 100 }, adminToken);
  assert.equal(createdAccount.status, 201);
  assert.equal(createdAccount.body.data.status, 'ACTIVE');
  assert.equal((await request(`/api/admin/accounts/${createdAccount.body.data.id}`, 'PATCH', { balance: 125, type: 'CURRENT' }, adminToken)).status, 200);
  assert.equal((await request(`/api/admin/accounts/${createdAccount.body.data.id}/status`, 'PATCH', { status: 'CLOSED' }, adminToken)).status, 200);

  assert.equal((await request('/api/admin/cards/1/status', 'PATCH', { status: 'BLOCKED' }, adminToken)).status, 200);
  assert.equal((await request('/api/admin/cards/1/status', 'PATCH', { status: 'ACTIVE' }, adminToken)).status, 200);

  const createdAdvisor = await request('/api/admin/users', 'POST', { firstName: 'Samira', lastName: 'Omar', email: 'samira@bank.com', role: 'Chargé Client' }, adminToken);
  assert.equal(createdAdvisor.status, 201);
  assert.equal((await request('/api/admin/clients/assign', 'PATCH', { clientId: 2, advisorId: createdAdvisor.body.data.id }, adminToken)).status, 200);
  const movedClientLogin = await request('/api/login', 'POST', { email: 'samira@bank.com', password: '123456' });
  assert.equal(movedClientLogin.status, 200);
  const movedClients = await request('/api/clients', 'GET', undefined, movedClientLogin.body.token);
  assert.deepEqual(movedClients.body.data.map((client) => client.id), [2]);

  const unauthorized = await request('/api/clients');
  assert.equal(unauthorized.status, 401);
});
