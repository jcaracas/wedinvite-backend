const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Invitado = sequelize.define("Invitado", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  evento_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  estado_confirmacion: {
    type: DataTypes.ENUM("Pendiente", "Confirmado", "Rechazado"),
    defaultValue: "Pendiente",
  },
}, { timestamps: true });

module.exports = Invitado;
