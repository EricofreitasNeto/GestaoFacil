import { API_BASE_URL, getToken, mostrarConsole } from './utils.js';

export async function listarAtivos() {
  const token = getToken(); if (!token) return;
  const resposta = await fetch(`${API_BASE_URL}/v1/ativos`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const dados = await resposta.json();
  mostrarConsole(resposta, dados);
}

export async function buscarAtivoPorId() {
  const token = getToken(); if (!token) return;
  const id = prompt("Digite o ID do ativo:");
  if (!id) return;
  const resposta = await fetch(`${API_BASE_URL}/v1/ativos/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const dados = await resposta.json();
  mostrarConsole(resposta, dados);
}

export async function criarAtivo() {
  const token = getToken(); if (!token) return;
  const body = {
    nome: "Notebook Dell",
    numeroSerie: "DELL987654",
    status: "ativo",
    detalhes: "Core i7, 16GB RAM",
    localId: 1
  };
  const resposta = await fetch(`${API_BASE_URL}/v1/ativos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  });
  const dados = await resposta.json();
  mostrarConsole(resposta, dados);
}

export async function atualizarAtivo() {
  const token = getToken(); if (!token) return;
  const id = prompt("Digite o ID do ativo a atualizar:");
  if (!id) return;
  const body = {
    nome: "Notebook Dell XPS",
    numeroSerie: "DELL987654",
    status: "manutenção",
    detalhes: "Atualização de SSD",
    localId: 2
  };
  const resposta = await fetch(`${API_BASE_URL}/v1/ativos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  });
  const dados = await resposta.json();
  mostrarConsole(resposta, dados);
}

export async function desativarAtivo() {
  const token = getToken(); if (!token) return;
  const id = prompt("Digite o ID do ativo a desativar:");
  if (!id) return;
  const resposta = await fetch(`${API_BASE_URL}/v1/ativos/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  const dados = await resposta.json();
  mostrarConsole(resposta, dados);
}