const { validateServicoPayload, ServicoValidationError } = require('../src/services/servicoValidator');

function createModels({ ativo, cliente, usuario }) {
  return {
    Ativo: {
      findByPk: jest.fn().mockImplementation(async () => ativo ?? null),
    },
    Cliente: {
      findByPk: jest.fn().mockImplementation(async (id) => {
        if (cliente && cliente.id === id) return cliente;
        return null;
      }),
    },
    Usuario: {
      findByPk: jest.fn().mockImplementation(async (id) => {
        if (usuario && usuario.id === id) return usuario;
        return null;
      }),
    },
  };
}

describe('servicoValidator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejeita quando cliente não corresponde ao ativo', async () => {
    const models = createModels({
      ativo: { id: 10, status: 'ativo', clienteId: 2 },
      cliente: { id: 3 },
    });

    await expect(
      validateServicoPayload(models, { ativoId: 10, clienteId: 3 })
    ).rejects.toMatchObject({
      message: expect.stringMatching(/Cliente informado não está associado/),
      statusCode: 400,
    });
  });

  it('rejeita quando usuário informado não existe', async () => {
    const models = createModels({
      ativo: { id: 10, status: 'ativo', clienteId: 2 },
      cliente: { id: 2 },
    });

    await expect(
      validateServicoPayload(models, { ativoId: 10, clienteId: 2, usuarioId: 99 })
    ).rejects.toMatchObject({
      message: expect.stringMatching(/Usuário informado não existe/),
      statusCode: 400,
    });
  });

  it('aceita payload válido e resolve cliente/ativo', async () => {
    const models = createModels({
      ativo: { id: 5, status: 'ativo', clienteId: 7 },
      cliente: { id: 7 },
      usuario: { id: 9, clienteId: 7 },
    });

    const result = await validateServicoPayload(models, {
      ativoId: 5,
      clienteId: 7,
      usuarioId: 9,
    });

    expect(result.resolvedAtivoId).toBe(5);
    expect(result.resolvedClienteId).toBe(7);
    expect(result.usuario.id).toBe(9);
  });

  it('rejeita quando usuário pertence a outro cliente', async () => {
    const models = createModels({
      ativo: { id: 5, status: 'ativo', clienteId: 7 },
      cliente: { id: 7 },
      usuario: { id: 9, clienteId: 8 },
    });

    await expect(
      validateServicoPayload(models, { ativoId: 5, clienteId: 7, usuarioId: 9 })
    ).rejects.toMatchObject({
      message: expect.stringMatching(/pertence ao cliente/),
      statusCode: 400,
    });
  });
});
