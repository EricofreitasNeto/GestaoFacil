module.exports = (sequelize, DataTypes) => {
  const Servico = sequelize.define("Servico", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM("Aberto", "Em andamento", "Concluído", "Encerrado", "Cancelado"),
      defaultValue: "Aberto"
    },
    data_inicio: {
      type: DataTypes.DATE,
      allowNull: true
    },
    data_fim: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    timestamps: true,
    paranoid: true
  });

  Servico.associate = (models) => {
    Servico.belongsTo(models.Cliente, {
      foreignKey: "clienteId",
      as: "cliente"
    });

    Servico.belongsTo(models.Ativo, {
      foreignKey: "ativoId",
      as: "ativo"
    });

    Servico.belongsTo(models.TipoServico, {
      foreignKey: "tipoServicoId",
      as: "tipoServico"
    });

    Servico.belongsTo(models.Usuario, {
      foreignKey: "solicitanteId",
      as: "solicitante"
    });

    Servico.belongsTo(models.Usuario, {
      foreignKey: "responsavelId",
      as: "responsavel"
    });
  };

  return Servico;
};