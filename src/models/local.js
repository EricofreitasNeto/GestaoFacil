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
    paranoid: true,
    indexes: [
      { unique: true, fields: ['nome', 'deletedAt'] }
    ]
  });

  Local.beforeValidate((local) => {
    if (local.nome) local.nome = String(local.nome).trim();
  });

  Local.associate = (models) => {
    Local.hasMany(models.Ativo, { foreignKey: "localId", as: "ativos" });
  };

  return Local;
};
