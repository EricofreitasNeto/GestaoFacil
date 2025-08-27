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
      unique: true,
      validate: { notEmpty: true }
    },
    cnpj: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        is: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/ // valida CNPJ no formato 00.000.000/0000-00 
    },
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
