import { API_BASE_URL, getToken, mostrarConsole } from './utils.js';

export async function listarLocais() {
  const token = getToken(); if (!token) return;
  const resposta = await fetch(`${API_BASE_URL}/v1/locais`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const dados = await resposta.json();
  mostrarConsole(resposta, dados);
}

export async function criarLocal() {
  const token = getToken(); if (!token) return;
  const nome = prompt("Digite o nome do local:");
  const clienteId = prompt("Digite o ID do cliente vinculado:");
  if (!nome || !clienteId) return alert("⚠️ Nome e clienteId são obrigatórios");

  const body = { nome, clienteId: parseInt(clienteId) };
  const resposta = await fetch(`${API_BASE_URL}/v1/locais`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  });
  const dados = await resposta.json();
  mostrarConsole(resposta, dados);
}