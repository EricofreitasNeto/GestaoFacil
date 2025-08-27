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
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "ativo"
    },
    detalhes: {
      type: DataTypes.JSON, // 🔹 dados dinâmicos
      allowNull: true,
      defaultValue: {}
    }
  }, {
    timestamps: true,
    paranoid: true
  });

  Ativo.associate = (models) => {
    Ativo.belongsTo(models.Local, { foreignKey: "localId", as: "local" });
    Ativo.hasMany(models.Servico, { foreignKey: "ativoId", as: "servicos" });
  };

  return Ativo;
};
