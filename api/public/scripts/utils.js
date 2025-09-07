export const API_BASE_URL = "https://gestaofacil.onrender.com";

export function getToken() {
  const token = localStorage.getItem("jwt");
  if (!token) alert("⚠️ Faça login primeiro!");
  return token;
}

export function mostrarConsole(resposta, dados) {
  const log = {
    status: resposta.status,
    ok: resposta.ok,
    url: resposta.url,
    body: dados,
    timestamp: new Date().toISOString()
  };
  const consoleBox = document.getElementById("console");
  consoleBox.textContent += "\n> " + JSON.stringify(log, null, 2) + "\n";
  consoleBox.scrollTop = consoleBox.scrollHeight;
}