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
    }
  }, {
    timestamps: true,
    paranoid: true
  });

  //Usuario.hasMany(models.Servico, { foreignKey: 'solicitanteId', as: 'servicosSolicitados' });
  //Usuario.hasMany(models.Servico, { foreignKey: 'responsavelId', as: 'servicosResponsavel' });

 
  return Usuario;
};