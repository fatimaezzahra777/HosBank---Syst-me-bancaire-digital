const token = sessionStorage.getItem('hosbankToken');
const user = JSON.parse(sessionStorage.getItem('hosbankUser') || 'null');
const isAdmin = user && user.role === 'Administrateur';
const cache = { clients: [], requests: [], complaints: [], interactions: [], users: [], roles: [], accounts: [], cards: [], operations: [] };
const message = document.querySelector('#message');

if (!token || !user) window.location.replace('/login');

document.querySelector('#user-name').textContent = user ? `${user.firstName} ${user.lastName} · ${user.role}` : '';
document.querySelectorAll('.admin-only').forEach((element) => { element.hidden = !isAdmin; });

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers }
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Une erreur est survenue.');
  return result.data;
}

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle('error', isError);
}

function row(tableId, values, actions = []) {
  const body = document.querySelector(`#${tableId}`);
  const tr = document.createElement('tr');
  values.forEach((value) => {
    const td = document.createElement('td');
    if (value instanceof Node) td.append(value);
    else td.textContent = value === null || value === undefined ? '—' : String(value);
    tr.append(td);
  });
  if (actions.length) {
    const td = document.createElement('td');
    const group = document.createElement('div');
    group.className = 'row-actions';
    actions.forEach((action) => group.append(action));
    td.append(group);
    tr.append(td);
  }
  body.append(tr);
}

function resetTable(tableId) {
  document.querySelector(`#${tableId}`).replaceChildren();
}

function button(label, action) {
  const element = document.createElement('button');
  element.type = 'button';
  element.textContent = label;
  element.addEventListener('click', action);
  return element;
}

function statusSelect(value, options, onChange) {
  const select = document.createElement('select');
  options.forEach((status) => {
    const option = document.createElement('option');
    option.value = status;
    option.textContent = status.replaceAll('_', ' ');
    option.selected = status === value;
    select.append(option);
  });
  select.addEventListener('change', () => onChange(select.value));
  return select;
}

function fillSelect(selectId, items, labelFor, valueFor = (item) => item.id) {
  const select = document.querySelector(`#${selectId}`);
  if (!select) return;
  select.replaceChildren();
  if (selectId === 'history-client') {
    const allClients = document.createElement('option');
    allClients.value = '';
    allClients.textContent = 'Tous les clients';
    select.append(allClients);
  }
  items.forEach((item) => {
    const option = document.createElement('option');
    option.value = valueFor(item);
    option.textContent = labelFor(item);
    select.append(option);
  });
}

function clientName(id) {
  return cache.clients.find((client) => client.id === Number(id))?.fullName || `Client ${id}`;
}

async function loadClients() {
  cache.clients = await api(isAdmin ? '/api/clients' : `/api/clients?advisorId=${user.id}`);
  if (!isAdmin) cache.users = await api('/api/advisors');
  resetTable('clients-table');
  for (const client of cache.clients) {
    const advisor = cache.users.find((item) => item.id === client.assignedAdvisorId);
    const accounts = await api(`/api/clients/${client.id}/accounts`);
    const cards = await api(`/api/clients/${client.id}/cards`);
    row('clients-table', [client.fullName, client.phone, advisor ? `${advisor.firstName} ${advisor.lastName}` : 'Non affecté', accounts.length, cards.length], [button('Ouvrir', () => showClient(client, accounts, cards))]);
  }
  ['complaint-client', 'history-client'].forEach((id) => fillSelect(id, cache.clients, (client) => client.fullName));
  if (isAdmin) {
    fillSelect('assignment-client', cache.clients, (client) => client.fullName);
    fillSelect('account-client', cache.clients, (client) => client.fullName);
    renderAccounts();
    renderCards();
  }
  document.querySelector('#metric-clients').textContent = cache.clients.length;
}

function showClient(client, accounts, cards) {
  const detail = document.querySelector('#client-details');
  detail.replaceChildren();
  const heading = document.createElement('h3');
  heading.textContent = client.fullName;
  detail.append(heading);
  const summary = document.createElement('div');
  summary.className = 'client-summary';
  [
    `Téléphone : ${client.phone}`,
    `Chargé client : ${cache.users.find((item) => item.id === client.assignedAdvisorId)?.firstName || 'Non affecté'}`,
    `Comptes : ${accounts.map((account) => `${account.type} · ${account.balance} €`).join(', ') || 'Aucun'}`,
    `Cartes : ${cards.map((card) => `${card.type} · ${card.status}`).join(', ') || 'Aucune'}`,
    `Demandes : ${cache.requests.filter((item) => item.clientId === client.id).map((item) => `${item.type} (${item.status})`).join(', ') || 'Aucune'}`,
    `Réclamations : ${cache.complaints.filter((item) => item.clientId === client.id).map((item) => `${item.subject} (${item.status})`).join(', ') || 'Aucune'}`
  ].forEach((text) => { const span = document.createElement('span'); span.textContent = text; summary.append(span); });
  detail.append(summary);
}

async function loadRequests() {
  const results = await api('/api/requests');
  const visibleIds = new Set(cache.clients.map((client) => client.id));
  cache.requests = results.filter((request) => visibleIds.has(request.clientId));
  resetTable('requests-table');
  cache.requests.forEach((request) => {
    const statuses = request.type === 'OPPOSITION_CARTE' ? ['DEMANDEE', 'TRAITEE'] : request.type === 'PIN' ? ['EN_ATTENTE', 'TRAITEE', 'REFUSEE'] : ['EN_ATTENTE', 'ACCEPTEE', 'REFUSEE'];
    const select = statusSelect(request.status, statuses, async (status) => {
      try { await api(`/api/requests/${request.id}/status`, { method: 'PATCH', body: JSON.stringify({ status, advisorId: user.id }) }); await loadWorkspace(); showMessage('Demande mise à jour.'); } catch (error) { showMessage(error.message, true); }
    });
    row('requests-table', [clientName(request.clientId), request.type, request.createdAt, request.status, request.comment], [select]);
  });
  document.querySelector('#metric-requests').textContent = cache.requests.filter((item) => ['EN_ATTENTE', 'DEMANDEE'].includes(item.status)).length;
}

async function loadComplaints() {
  const results = await api('/api/complaints');
  const visibleIds = new Set(cache.clients.map((client) => client.id));
  cache.complaints = results.filter((complaint) => visibleIds.has(complaint.clientId));
  resetTable('complaints-table');
  cache.complaints.forEach((complaint) => {
    const select = statusSelect(complaint.status, ['OUVERTE', 'EN_COURS', 'TRAITEE', 'REFUSEE'], async (status) => {
      try { await api(`/api/complaints/${complaint.id}/status`, { method: 'PATCH', body: JSON.stringify({ status, advisorId: user.id }) }); await loadWorkspace(); showMessage('Réclamation mise à jour.'); } catch (error) { showMessage(error.message, true); }
    });
    row('complaints-table', [clientName(complaint.clientId), complaint.subject, complaint.description, complaint.createdAt, complaint.status], [select]);
  });
  document.querySelector('#metric-complaints').textContent = cache.complaints.filter((item) => item.status !== 'TRAITEE').length;
  fillSelect('comment-target', [
    ...cache.requests.map((item) => ({ id: `request:${item.id}`, label: `Demande ${item.type} · ${clientName(item.clientId)}` })),
    ...cache.complaints.map((item) => ({ id: `complaint:${item.id}`, label: `Réclamation ${item.subject}` }))
  ], (item) => item.label, (item) => item.id);
}

async function loadHistory() {
  const results = await api('/api/interactions');
  const visibleIds = new Set(cache.clients.map((client) => client.id));
  cache.interactions = results.filter((interaction) => visibleIds.has(interaction.clientId));
  renderHistory();
}

function renderHistory() {
  resetTable('history-table');
  const clientId = Number(document.querySelector('#history-client').value);
  cache.interactions.filter((item) => !clientId || item.clientId === clientId).forEach((item) => {
    const advisor = cache.users.find((person) => person.id === item.advisorId);
    row('history-table', [item.createdAt, clientName(item.clientId), advisor ? `${advisor.firstName} ${advisor.lastName}` : '—', item.type, item.description, item.comment]);
  });
}

async function loadAdmin() {
  if (!isAdmin) return;
  [cache.users, cache.roles, cache.accounts, cache.cards, cache.operations] = await Promise.all([
    api('/api/admin/users'), api('/api/admin/roles'), api('/api/admin/accounts'), api('/api/admin/cards'), api('/api/admin/operations')
  ]);
  fillSelect('role-list', cache.roles, (role) => role.name, (role) => role.name);
  fillSelect('assignment-advisor', cache.users.filter((item) => item.role === 'Chargé Client'), (item) => `${item.firstName} ${item.lastName}`);
  renderUsers();
  renderAccounts();
  renderCards();
  renderOperations();
  const stats = await api('/api/admin/activities');
  document.querySelector('#metric-operations').textContent = stats.totalOperations;
  resetTable('statistics-table');
  row('statistics-table', [stats.totalRequests, stats.totalComplaints, stats.totalInteractions, stats.totalOperations]);
}

function renderUsers() {
  resetTable('users-table');
  cache.users.forEach((item) => {
    const edit = button('Modifier', async () => {
      const firstName = window.prompt('Prénom', item.firstName);
      if (firstName === null) return;
      const lastName = window.prompt('Nom', item.lastName);
      if (lastName === null) return;
      try { await api(`/api/admin/users/${item.id}`, { method: 'PATCH', body: JSON.stringify({ firstName, lastName }) }); await loadWorkspace(); showMessage('Utilisateur modifié.'); } catch (error) { showMessage(error.message, true); }
    });
    const toggle = button(item.status === 'ACTIVE' ? 'Désactiver' : 'Activer', async () => {
      try { await api(`/api/admin/users/${item.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }) }); await loadWorkspace(); } catch (error) { showMessage(error.message, true); }
    });
    const role = statusSelect(item.role, cache.roles.map((entry) => entry.name), async (nextRole) => {
      try { await api(`/api/admin/users/${item.id}`, { method: 'PATCH', body: JSON.stringify({ role: nextRole }) }); await loadWorkspace(); showMessage('Rôle modifié.'); } catch (error) { showMessage(error.message, true); }
    });
    row('users-table', [`${item.firstName} ${item.lastName}`, item.email, role, item.status], [edit, toggle]);
  });
}

function renderAccounts() {
  resetTable('accounts-table');
  cache.accounts.forEach((item) => {
    const select = statusSelect(item.status, ['ACTIVE', 'BLOCKED', 'CLOSED'], async (status) => {
      try { await api(`/api/admin/accounts/${item.id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); await loadWorkspace(); } catch (error) { showMessage(error.message, true); }
    });
    const edit = button('Modifier solde', async () => {
      const balance = window.prompt('Nouveau solde', item.balance);
      if (balance === null) return;
      const type = window.prompt('Type : CURRENT ou SAVINGS', item.type);
      if (type === null) return;
      const clientId = window.prompt(`Identifiant client (${cache.clients.map((client) => `${client.id}: ${client.fullName}`).join(', ')})`, item.clientId);
      if (clientId === null) return;
      try { await api(`/api/admin/accounts/${item.id}`, { method: 'PATCH', body: JSON.stringify({ balance: Number(balance), type: type.toUpperCase(), clientId: Number(clientId) }) }); await loadWorkspace(); showMessage('Compte modifié.'); } catch (error) { showMessage(error.message, true); }
    });
    row('accounts-table', [clientName(item.clientId), item.accountNumber, item.rib, item.type, `${item.balance} €`, item.status], [select, edit]);
  });
}

function renderCards() {
  resetTable('cards-table');
  cache.cards.forEach((item) => {
    const select = statusSelect(item.status, ['ACTIVE', 'BLOCKED', 'OPPOSITION', 'EXPIRED'], async (status) => {
      try { await api(`/api/admin/cards/${item.id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); await loadWorkspace(); } catch (error) { showMessage(error.message, true); }
    });
    row('cards-table', [clientName(item.clientId), item.cardNumber, item.type, item.status], [select]);
  });
}

function renderOperations() {
  resetTable('operations-table');
  cache.operations.forEach((item) => row('operations-table', [item.date, item.type, item.accountId, `${item.amount} €`, item.status]));
}

async function loadWorkspace() {
  try {
    await loadAdmin();
    await loadClients();
    await Promise.all([loadRequests(), loadComplaints(), loadHistory()]);
    resetTable('activity-table');
    cache.interactions.slice(0, 8).forEach((item) => row('activity-table', [item.createdAt, clientName(item.clientId), item.type, item.description, item.comment]));
  } catch (error) {
    showMessage(error.message, true);
  }
}

document.querySelectorAll('.nav-link').forEach((link) => link.addEventListener('click', (event) => {
  event.preventDefault();
  document.querySelectorAll('.nav-link').forEach((item) => item.classList.toggle('active', item === link));
  document.querySelectorAll('.page-section').forEach((section) => section.classList.toggle('visible', section.id === link.dataset.section));
  document.querySelector('#page-title').textContent = link.textContent;
  window.history.replaceState(null, '', link.getAttribute('href'));
}));

document.querySelectorAll('[data-refresh]').forEach((buttonElement) => buttonElement.addEventListener('click', loadWorkspace));
document.querySelector('#history-client').addEventListener('change', renderHistory);
document.querySelector('#logout').addEventListener('click', () => { sessionStorage.clear(); window.location.assign('/login'); });

document.querySelector('#complaint-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.currentTarget));
  values.advisorId = user.id;
  try { await api('/api/complaints', { method: 'POST', body: JSON.stringify(values) }); event.currentTarget.reset(); await loadWorkspace(); showMessage('Réclamation créée.'); } catch (error) { showMessage(error.message, true); }
});

document.querySelector('#comment-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.currentTarget));
  const [kind, id] = values.target.split(':');
  const payload = { userId: user.id, content: values.content, requestId: kind === 'request' ? Number(id) : null, complaintId: kind === 'complaint' ? Number(id) : null };
  try { await api('/api/comments', { method: 'POST', body: JSON.stringify(payload) }); event.currentTarget.reset(); await loadWorkspace(); showMessage('Commentaire ajouté.'); } catch (error) { showMessage(error.message, true); }
});

document.querySelector('#user-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  try { await api('/api/admin/users', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) }); event.currentTarget.reset(); await loadWorkspace(); showMessage('Utilisateur créé.'); } catch (error) { showMessage(error.message, true); }
});

document.querySelector('#assignment-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  try { await api('/api/admin/clients/assign', { method: 'PATCH', body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) }); await loadWorkspace(); showMessage('Affectation enregistrée.'); } catch (error) { showMessage(error.message, true); }
});

document.querySelector('#account-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  try { await api('/api/admin/accounts', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) }); event.currentTarget.reset(); await loadWorkspace(); showMessage('Compte créé.'); } catch (error) { showMessage(error.message, true); }
});

loadWorkspace();