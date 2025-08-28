module.exports = (sequelize, DataTypes) => {
  const TipoServico = sequelize.define("TipoServico", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 100] // de 3 a 100 caracteres
      }
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true,
    paranoid: true,
    defaultScope: {
      where: { ativo: true }
    }
  });

  TipoServico.associate = (models) => {
    TipoServico.hasMany(models.Servico, {
      foreignKey: "tipoServicoId",
      as: "servicos"
    });
  };

  return TipoServico;
};