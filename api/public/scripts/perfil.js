import { API_BASE_URL, getToken, mostrarConsole } from './utils.js';

export async function exibirPerfil() {
  const token = getToken(); if (!token) return;
  const resposta = await fetch(`${API_BASE_URL}/v1/usuarios/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const dados = await resposta.json();
  mostrarConsole(resposta, dados);
}