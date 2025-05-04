const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const EventoUsuario = sequelize.define("EventoUsuario", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  evento_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  usuario_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  rol_en_evento: {
    type: DataTypes.ENUM("Novio", "Novia"),
    allowNull: false,
  }
}, {
  tableName: 'evento_usuario',
  timestamps: false,
});

module.exports = EventoUsuario;
