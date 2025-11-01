module.exports = (sequelize, DataTypes) => {
  const Ativo = sequelize.define("Ativo", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false
    },
    numeroSerie: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    clienteId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "ativo"
    },
    detalhes: {
      type: DataTypes.JSON, //  dados dinâmicos
      allowNull: true,
      defaultValue: {}
    }
  }, {
    timestamps: true,
    paranoid: true,
    indexes: [
      { unique: true, fields: ['numeroSerie', 'deletedAt'] }
    ]
  });

  Ativo.associate = (models) => {
    Ativo.belongsTo(models.Local, { foreignKey: "localId", as: "local" });
    Ativo.belongsTo(models.Cliente, { foreignKey: "clienteId", as: "cliente" });
    Ativo.hasMany(models.Servico, { foreignKey: "ativoId", as: "servicos" });
  };

  Ativo.beforeValidate((ativo) => {
    if (ativo.nome) ativo.nome = String(ativo.nome).trim();
    if (ativo.numeroSerie) ativo.numeroSerie = String(ativo.numeroSerie).trim();
    if (ativo.status) ativo.status = String(ativo.status).trim().toLowerCase();
  });

  return Ativo;
};
