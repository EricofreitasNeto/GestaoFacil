import { API_BASE_URL, mostrarConsole } from './utils.js';

export async function registrar() {
  const body = {
    nome: "Erico",
    email: "erico@teste.com",
    cargo: "admin",
    telefone: "85999999999",
    password: "123456",
    confirmPassword: "123456"
  };
  const resposta = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const dados = await resposta.json();
  mostrarConsole(resposta, dados);
}

export async function login() {
  const body = { email: "erico@teste.com", password: "123456" };
  const resposta = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const dados = await resposta.json();
  mostrarConsole(resposta, dados);
  if (dados.token) localStorage.setItem("jwt", dados.token);
}

export async function rotaProtegida() {
  const token = localStorage.getItem("jwt");
  if (!token) return alert("⚠️ Faça login primeiro!");
  const resposta = await fetch(`${API_BASE_URL}/auth/dados-secretos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
  });
  const dados = await resposta.json();
  mostrarConsole(resposta, dados);
}