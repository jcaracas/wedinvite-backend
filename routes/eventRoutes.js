const express = require("express");
const Event = require("../models/Event");
const authJWT = require('../middlewares/authJWT');  
const verificarRol = require('../middlewares/verificarRol'); // Middleware para verificar roles
const Cliente = require("../models/Cliente"); // Asegúrate de importar tu modelo Cliente
const { Op } = require("sequelize"); // Asegúrate de importar Sequelize si lo usas para las consultas



const router = express.Router();

// 🔹 Crear un evento
router.post("/", async (req, res) => {
  try {
    const evento = await Event.create(req.body);
    res.status(201).json(evento);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Obtener eventos de un usuario
router.get("/usuario/:usuario_id", async (req, res) => {
  try {
    const eventos = await Event.findAll({ where: { usuario_id: req.params.usuario_id } });
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Eliminar un evento
router.delete("/:id", async (req, res) => {
  try {
    await Event.destroy({ where: { id: req.params.id } });
    res.json({ mensaje: "Evento eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/proximos', authJWT, verificarRol(['admin', 'asesor']), async (req, res) => {
  try {
    const dias = parseInt(req.query.dias) || 7;
    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + dias);
    const fechaInicio = new Date();
    console.log(dias, fechaFin, fechaInicio);
    
    const eventos = await Event.findAll({
      where: {
        fechaEvento: {
          [Op.gte]: fechaInicio,
          [Op.lte]: fechaFin,
        },
      },
      include: [{ model: Cliente, as: 'Cliente', attributes: ['nombre'] }],
    });

    const eventosConNombreCliente = eventos.map(evento => ({
      id: evento.id,
      fechaEvento: evento.fechaEvento,
      tipo: evento.tipo,
      nombreCliente: evento.Cliente ? evento.Cliente.nombre : 'Cliente Desconocido',
    }));

    res.json(eventosConNombreCliente);
  } catch (error) {
    console.error('Error al obtener los eventos próximos:', error);
    res.status(500).json({ error: 'Error al obtener los eventos próximos' });
  }
});

module.exports = router;
