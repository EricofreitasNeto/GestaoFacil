import { registrar, login, rotaProtegida } from './auth.js';
import { listarClientes, criarCliente } from './clientes.js';
import { listarLocais, criarLocal } from './locais.js';
import {
  listarAtivos,
  buscarAtivoPorId,
  criarAtivo,
  atualizarAtivo,
  desativarAtivo
} from './ativos.js';
import { listarTiposServico, criarTipoServico } from './tiposServico.js';
import { listarServicos, criarServico } from './servicos.js';
import { exibirPerfil } from './perfil.js';
import { alternarTema, exibirLogs, limparLogs } from './config.js';
import { getToken, API_BASE_URL, mostrarConsole } from './utils.js';

document.addEventListener("DOMContentLoaded", () => {
  configurarAutenticacao();
  configurarUsuarios();
  configurarAtivos();
  configurarClientes();
  configurarLocais();
  configurarTiposServico();
  configurarServicos();
  configurarPerfil();
  configurarConfiguracoes();
});

// 🔐 Autenticação
function configurarAutenticacao() {
  document.getElementById("btnRegistrar")?.addEventListener("click", registrar);
  document.getElementById("btnLogin")?.addEventListener("click", login);
  document.getElementById("btnRotaProtegida")?.addEventListener("click", rotaProtegida);
}

// 👥 Usuários
function configurarUsuarios() {
  document.getElementById("btnBuscarUsuarios")?.addEventListener("click", async () => {
    const token = getToken(); if (!token) return;
    const resposta = await fetch(`${API_BASE_URL}/v1/usuarios`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const dados = await resposta.json();
    mostrarConsole(resposta, dados);
  });
}

// 📦 Ativos
function configurarAtivos() {
  document.getElementById("btnListarAtivos")?.addEventListener("click", listarAtivos);
  document.getElementById("btnBuscarAtivo")?.addEventListener("click", buscarAtivoPorId);
  document.getElementById("btnCriarAtivo")?.addEventListener("click", criarAtivo);
  document.getElementById("btnAtualizarAtivo")?.addEventListener("click", atualizarAtivo);
  document.getElementById("btnDesativarAtivo")?.addEventListener("click", desativarAtivo);
}

// 👥 Clientes
function configurarClientes() {
  document.getElementById("btnListarClientes")?.addEventListener("click", listarClientes);
  document.getElementById("btnCriarCliente")?.addEventListener("click", criarCliente);
}

// 📍 Locais
function configurarLocais() {
  document.getElementById("btnListarLocais")?.addEventListener("click", listarLocais);
  document.getElementById("btnCriarLocal")?.addEventListener("click", criarLocal);
}

// 🏷️ Tipos de Serviço
function configurarTiposServico() {
  document.getElementById("btnListarTiposServico")?.addEventListener("click", listarTiposServico);
  document.getElementById("btnCriarTipoServico")?.addEventListener("click", criarTipoServico);
}

// 🔧 Serviços Técnicos
function configurarServicos() {
  document.getElementById("btnListarServicos")?.addEventListener("click", listarServicos);
  document.getElementById("btnCriarServico")?.addEventListener("click", criarServico);
}

// 👤 Perfil
function configurarPerfil() {
  document.getElementById("btnExibirPerfil")?.addEventListener("click", exibirPerfil);
}

// ⚙️ Configurações
function configurarConfiguracoes() {
  document.getElementById("btnAlternarTema")?.addEventListener("click", alternarTema);
  document.getElementById("btnExibirLogs")?.addEventListener("click", exibirLogs);
  document.getElementById("btnLimparLogs")?.addEventListener("click", limparLogs);
}