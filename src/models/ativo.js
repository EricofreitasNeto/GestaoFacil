module.exports = (sequelize, DataTypes) => {
  const Ativo = sequelize.define("Ativo", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    codigo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "ativo"
    }
  }, {
    timestamps: true,
    paranoid: true
  });

    Ativo.associate = (models) => {
    Ativo.belongsTo(models.Cliente, { foreignKey: "clienteId", as: "cliente" });
    Ativo.belongsTo(models.Local, { foreignKey: "localId", as: "local" });
    Ativo.hasMany(models.Servico, { foreignKey: "ativoId", as: "servicos" });
  };

  return Ativo;
};

