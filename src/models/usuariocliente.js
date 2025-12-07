module.exports = (sequelize, DataTypes) => {
  const UsuarioCliente = sequelize.define('UsuarioCliente', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    clienteId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'UsuarioClientes',
    timestamps: true,
    paranoid: true,
    indexes: [
      { unique: true, fields: ['usuarioId', 'clienteId'] }
    ]
  });

  return UsuarioCliente;
};
