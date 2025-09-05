import { API_BASE_URL, getToken, mostrarConsole } from './utils.js';

export async function listarServicos() {
  const token = getToken(); if (!token) return;
  const resposta = await fetch(`${API_BASE_URL}/v1/servicos`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const dados = await resposta.json();
  mostrarConsole(resposta, dados);
}

export async function criarServico() {
  const token = getToken(); if (!token) return;
  const descricao = prompt("Descrição do serviço:");
  const ativoId = prompt("ID do ativo:");
  const tipoServicoId = prompt("ID do tipo de serviço:");
  const usuarioId = prompt("ID do técnico responsável:");
  if (!descricao || !ativoId || !tipoServicoId || !usuarioId) return alert("⚠️ Todos os campos são obrigatórios");

  const body = { descricao, ativoId, tipoServicoId, usuarioId };
  const resposta = await fetch(`${API_BASE_URL}/v1/servicos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  });
  const dados = await resposta.json();
  mostrarConsole(resposta, dados);
}