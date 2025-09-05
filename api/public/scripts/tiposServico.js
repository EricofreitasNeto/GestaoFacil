import { API_BASE_URL, getToken, mostrarConsole } from './utils.js';

export async function listarTiposServico() {
  const token = getToken(); if (!token) return;
  const resposta = await fetch(`${API_BASE_URL}/v1/tiposervico`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const dados = await resposta.json();
  mostrarConsole(resposta, dados);
}

export async function criarTipoServico() {
  const token = getToken(); if (!token) return;
  const nome = prompt("Digite o nome do tipo de serviço:");
  if (!nome) return alert("⚠️ Nome é obrigatório");

  const body = { nome };
  const resposta = await fetch(`${API_BASE_URL}/v1/tiposervico`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  });
  const dados = await resposta.json();
  mostrarConsole(resposta, dados);
}
