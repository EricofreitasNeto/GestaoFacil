import { API_BASE_URL, getToken, mostrarConsole } from './utils.js';

export async function listarClientes() {
  const token = getToken(); if (!token) return;
  const resposta = await fetch(`${API_BASE_URL}/v1/clientes`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const dados = await resposta.json();
  mostrarConsole(resposta, dados);
}

export async function criarCliente() {
  const token = getToken(); if (!token) return;
  const nome = prompt("Digite o nome do cliente:");
  const cnpj = prompt("Digite o CNPJ (formato 00.000.000/0000-00):");
  const contatos = prompt("Digite os contatos do cliente:");
  if (!nome || !cnpj) return alert("⚠️ Nome e CNPJ são obrigatórios");

  const body = { nome, cnpj, contatos };
  const resposta = await fetch(`${API_BASE_URL}/v1/clientes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  });
  const dados = await resposta.json();
  mostrarConsole(resposta, dados);
}