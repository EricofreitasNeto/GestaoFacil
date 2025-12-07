module.exports = (sequelize, DataTypes) => {
  const Cliente = sequelize.define('Cliente', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true }
    },
    cnpj: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        // valida CNPJ no formato 00.000.000/0000-00 quando informado
        is: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/
      }
    },
    contatos: {
      type: DataTypes.STRING
    }
  }, {
    tableName: 'clientes', // nome da tabela no banco
    timestamps: true,      // adiciona createdAt e updatedAt
    paranoid: true,        // adiciona deletedAt para soft delete
    indexes: [
      { unique: true, fields: ['nome', 'deletedAt'] },
      { unique: true, fields: ['cnpj', 'deletedAt'] }
    ]
  });

  // Relacionamentos (se os modelos Ativo e Servico existirem)
  Cliente.associate = (models) => {
    Cliente.hasMany(models.Ativo, {
      foreignKey: 'clienteId',
      as: 'ativos'
    });

    Cliente.hasMany(models.Servico, {
      foreignKey: 'clienteId',
      as: 'servicos'
    });

    Cliente.hasMany(models.Local, {
      foreignKey: 'clienteId',
      as: 'locais'
    });

    Cliente.belongsToMany(models.Usuario, {
      through: models.UsuarioCliente,
      foreignKey: 'clienteId',
      otherKey: 'usuarioId',
      as: 'usuarios'
    });
  };

  Cliente.beforeValidate((cliente) => {
    if (cliente.nome) cliente.nome = String(cliente.nome).trim();
    if (cliente.cnpj) cliente.cnpj = String(cliente.cnpj).trim();
  });

  return Cliente;
};
