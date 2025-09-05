import { mostrarConsole } from './utils.js';

export function alternarTema() {
  document.body.classList.toggle("dark-mode");
  console.log("🌙 Tema alternado");
}

export function exibirLogs() {
  const token = localStorage.getItem("jwt");
  const logs = {
    token,
    ultimaSincronizacao: new Date().toISOString(),
    destinoAtual: window.location.href
  };
  mostrarConsole({ status: 200, ok: true, url: "logs" }, logs);
}

export function limparLogs() {
  const consoleBox = document.getElementById("console");
  consoleBox.textContent = "";
  console.log("🧹 Logs limpos");
}