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
      unique: true
    },
    cnpj: {
      type: DataTypes.STRING,
      unique: true
    },
    contatos: {
      type: DataTypes.STRING
    }
  }, {
    tableName: 'clientes', // nome da tabela no banco
    timestamps: true,      // adiciona createdAt e updatedAt
    paranoid: true         // adiciona deletedAt para soft delete
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
  };

  return Cliente;
};
