# 📘 Sistema de Gestão de Ativos e Serviços

Este projeto tem como objetivo oferecer uma estrutura completa para o gerenciamento de ativos, serviços técnicos e fluxo operacional com controle de SLA.

---

## 🔑 Entidades Principais

### 🧍 Cliente
Representa a organização ou pessoa que possui ativos e solicita serviços.

- **Atributos**: `id`, `nome`, `cnpj`, `contatos`
- **Relacionamentos**:
  - Possui vários **Ativos**
  - Solicita vários **Serviços**

### 👤 Usuário
Técnicos, gestores ou solicitantes envolvidos no ciclo de atendimento.

- **Atributos**: `id`, `nome`, `cargo`, `email`, `telefone`
- **Relacionamentos**:
  - Pode ser **Solicitante** de serviços
  - Pode ser **Responsável** pela execução

### 📍 Local
Define onde os ativos estão alocados (ex: cidade, filial, prédio).

- **Atributos**: `id`, `nome`
- **Relacionamentos**:
  - Contém vários **Ativos**

### ⚙️ Ativo
Equipamento, sistema ou recurso monitorado.

- **Atributos**: `id`, `codigo`, `nome`, `tipo`, `status`
- **Relacionamentos**:
  - Pertence a um **Cliente**
  - Está alocado em um **Local**
  - Associado a vários **Serviços**

### 🧾 Tipo de Serviço
Classificação dos serviços com regras de SLA.

- **Atributos**: `id`, `nome`, `descricao`, `tempo_medio`, `sla_horas`
- **Relacionamentos**:
  - Classifica vários **Serviços**
- **Regras**:
  - Permite verificar se um serviço foi concluído dentro do SLA

### 🛠️ Serviço
Chamado, manutenção ou atendimento técnico.

- **Atributos**: `id`, `titulo`, `descricao`, `status`, `data_inicio`, `data_fim`
- **Relacionamentos**:
  - Associado a um **Cliente**
  - Vinculado a um **Ativo**
  - Possui um **Tipo de Serviço**
  - Possui um **Solicitante** e um **Responsável** (Usuários)

---

## 🔄 Fluxo do Ciclo de Vida de um Serviço

```text
Aberto → Em andamento → Concluído → Encerrado

Remover do comit pdf