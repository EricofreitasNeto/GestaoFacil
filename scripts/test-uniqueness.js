/*
  Node test runner for uniqueness and soft-delete behavior.
  Usage: BASE_URL=http://localhost:3000 node scripts/test-uniqueness.js
*/

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function request(path, { method = 'GET', headers = {}, body } = {}) {
  const url = `${BASE_URL}${path}`;
  const opts = { method, headers: { ...headers } };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  try {
    const res = await fetch(url, opts);
    const text = await res.text();
    let json;
    try { json = text ? JSON.parse(text) : null; } catch (_) { json = text; }
    return { status: res.status, body: json };
  } catch (err) {
    return { status: 0, body: { error: String(err) } };
  }
}

function expectStatus(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

(async () => {
  console.log(`BaseUrl: ${BASE_URL}`);
  const ts = Date.now();

  // 1) Register or login as admin
  const email = `admin.teste+uniq_${ts}@exemplo.com`;
  const password = '123456';

  console.log('[Auth] Registrando usuário de teste (se não existir)...');
  const reg = await request('/auth/register', {
    method: 'POST',
    body: { nome: 'Admin Test', cargo: 'admin', email, telefone: '85999999999', password, confirmPassword: password }
  });
  if (reg.status === 201) console.log('[Auth] Registrado com sucesso');
  else if (reg.status === 409) console.log('[Auth] Usuário já existe (OK)');
  else console.log(`[Auth] Aviso: status ${reg.status} ao registrar`);

  console.log('[Auth] Fazendo login...');
  const login = await request('/auth/login', { method: 'POST', body: { email, password } });
  expectStatus(login.status, 200, 'Login');
  const token = login.body?.token;
  if (!token) throw new Error('Token não retornado no login');
  const auth = { Authorization: `Bearer ${token}` };

  // 2) Cliente: criar, duplicar (409), soft delete e recriar (201)
  const clienteNome = `ClienteTeste_${ts}`;
  // Generate a unique CNPJ per run (format: 00.000.000/0000-00)
  const rand14 = Array.from({ length: 14 }, () => Math.floor(Math.random() * 10)).join('');
  const cnpj = `${rand14.slice(0,2)}.${rand14.slice(2,5)}.${rand14.slice(5,8)}/${rand14.slice(8,12)}-${rand14.slice(12,14)}`;
  console.log(`[Cliente] Criando ${clienteNome}...`);
  const c1 = await request('/v1/clientes', { method: 'POST', headers: auth, body: { nome: clienteNome, cnpj, contatos: 'teste@exemplo.com' } });
  expectStatus(c1.status, 201, 'Cliente criar');
  const clienteId = c1.body?.id;
  console.log(`[Cliente] OK id=${clienteId}`);

  console.log('[Cliente] Tentando duplicar por nome... (espera 409)');
  const cDupNome = await request('/v1/clientes', { method: 'POST', headers: auth, body: { nome: clienteNome, cnpj: '98.765.432/0001-10', contatos: 'dup1@ex.com' } });
  expectStatus(cDupNome.status, 409, 'Cliente duplicado nome');

  console.log('[Cliente] Tentando duplicar por CNPJ... (espera 409)');
  const cDupCnpj = await request('/v1/clientes', { method: 'POST', headers: auth, body: { nome: `${clienteNome}_2`, cnpj, contatos: 'dup2@ex.com' } });
  expectStatus(cDupCnpj.status, 409, 'Cliente duplicado CNPJ');

  console.log('[Cliente] Soft delete...');
  const cDel = await request(`/v1/clientes/${clienteId}`, { method: 'DELETE', headers: auth });
  expectStatus(cDel.status, 200, 'Cliente delete');
  console.log('[Cliente] Deletado (OK)');

  console.log('[Cliente] Recriando mesmo nome/CNPJ após soft delete... (espera 201)');
  const cRe = await request('/v1/clientes', { method: 'POST', headers: auth, body: { nome: clienteNome, cnpj, contatos: 're@ex.com' } });
  expectStatus(cRe.status, 201, 'Cliente recriar');
  console.log(`[Cliente] Recriado (OK) id=${cRe.body?.id}`);

  // 3) Ativo: criar e duplicar numeroSerie (409)
  const ns = `NS${ts}`;
  console.log(`[Ativo] Criando ativo com numeroSerie=${ns}...`);
  const a1 = await request('/v1/ativos', { method: 'POST', headers: auth, body: { nome: `AtivoTeste_${ts}`, numeroSerie: ns, status: 'ativo' } });
  expectStatus(a1.status, 201, 'Ativo criar');
  console.log(`[Ativo] OK id=${a1.body?.id}`);

  console.log('[Ativo] Tentando duplicar numeroSerie... (espera 409)');
  const aDup = await request('/v1/ativos', { method: 'POST', headers: auth, body: { nome: `AtivoDup_${ts}`, numeroSerie: ns, status: 'ativo' } });
  expectStatus(aDup.status, 409, 'Ativo duplicado numeroSerie');

  // 4) Usuário: tentar registrar e-mail duplicado via /auth/register
  console.log('[Usuario] Tentando registrar e-mail duplicado... (espera 409)');
  const uDup = await request('/auth/register', { method: 'POST', body: { nome: 'Outro', cargo: 'admin', email, telefone: '85999990000', password, confirmPassword: password } });
  if (uDup.status !== 409) {
    console.log(`[Usuario] Aviso: esperado 409, veio ${uDup.status}`);
  } else {
    console.log('[Usuario] 409 por e-mail (OK)');
  }

  console.log('\nTodos os testes executados com sucesso.');
  process.exit(0);
})().catch((err) => {
  console.error('Falha nos testes:', err.message || err);
  process.exit(1);
});
