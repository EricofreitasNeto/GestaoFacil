module.exports = (sequelize, DataTypes) => {
  const Local = sequelize.define("Local", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    timestamps: true,
    paranoid: true
  });

  Local.associate = (models) => {
    Local.hasMany(models.Ativo, { foreignKey: "localId", as: "ativos" });
  };

  return Local;
};