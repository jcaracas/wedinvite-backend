const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MensajeContacto = sequelize.define('MensajeContacto', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mensaje: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
    leido: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
}, {
  tableName: 'mensajes_contacto',
  timestamps: true,
});

module.exports = MensajeContacto;
