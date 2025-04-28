const express = require("express");
const Event = require("../models/Event");

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

module.exports = router;
