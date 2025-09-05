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
  const token = getToken();
  if (!token) {
    console.warn('Token não encontrado. Usuário não autenticado.');
    return;
  }

  const body = {
    nome: "Monitor LG UltraWide",
    numeroSerie: "LGUW123456",
    status: "ativo",
    detalhes: {
      tamanho: "34 polegadas",
      resolucao: "2560x1080",
      conexoes: ["HDMI", "DisplayPort"],
      observacoes: "Sem riscos, adquirido em 2024"
    },
    localId: 1 // ID do local onde o ativo está alocado
  };

  try {
    const response = await fetch(`${process.env.API_URL}/ativos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro ao criar ativo:', errorData);
      return;
    }

    const data = await response.json();
    console.log('Ativo criado com sucesso:', data);
    return data;
  } catch (error) {
    console.error('Erro na requisição:', error);
  }
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