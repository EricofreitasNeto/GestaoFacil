module.exports = (sequelize, DataTypes) => {
  const Servico = sequelize.define("Servico", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pendente"
    },
    dataAgendada: {
      type: DataTypes.DATE,
      allowNull: true
    },
    dataConclusao: {
      type: DataTypes.DATE,
      allowNull: true
    },
    detalhes: {
      type: DataTypes.JSON, // 🔹 dados adicionais e variáveis
      allowNull: true,
      defaultValue: {}
    }
  }, {
    timestamps: true,
    paranoid: true
  });

  Servico.associate = (models) => {
    Servico.belongsTo(models.Cliente, { foreignKey: "clienteId", as: "cliente" });
    Servico.belongsTo(models.Usuario, { foreignKey: "usuarioId", as: "responsavel" });
    Servico.belongsTo(models.Ativo, { foreignKey: "ativoId", as: "ativo" });
    Servico.belongsTo(models.TipoServico, { foreignKey: "tipoServicoId", as: "tipoServico" });
  };

  return Servico;
};
