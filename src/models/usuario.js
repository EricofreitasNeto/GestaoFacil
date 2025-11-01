const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define("Usuario", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 100]
      }
    },
    cargo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    telefone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    timestamps: true,
    paranoid: true,
    indexes: [
      { unique: true, fields: ['email', 'deletedAt'] }
    ]
  });

  Usuario.beforeValidate((usuario) => {
    if (usuario.email) usuario.email = String(usuario.email).trim().toLowerCase();
    if (usuario.nome) usuario.nome = String(usuario.nome).trim();
  });

  Usuario.beforeCreate(async (usuario) => {
    usuario.password = await bcrypt.hash(usuario.password, 10);
  });

  Usuario.beforeUpdate(async (usuario) => {
    if (usuario.changed('password')) {
      usuario.password = await bcrypt.hash(usuario.password, 10);
    }
  });

  Usuario.prototype.validPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  return Usuario;
};
