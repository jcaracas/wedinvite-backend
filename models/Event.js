const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Event = sequelize.define("Event", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  usuario_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  cliente_id: {
    type: DataTypes.UUID,
    allowNull: true, // Si quieres permitir eventos sin cliente asignado inicialmente
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fecha_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  hora_inicio: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  fecha_fin: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  hora_fin: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  ubicacion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.ENUM("Boda", "Bautizo", "Cumpleaños", "Otro"),
    allowNull: false,
  },
}, {
  tableName: 'eventos',
  timestamps: true,
});

module.exports = Event;
