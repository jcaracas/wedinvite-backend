const express = require("express");
const Invitado = require("../models/Invitado");

const router = express.Router();

// 🔹 Agregar un invitado a un evento
router.post("/", async (req, res) => {
  try {
    const invitado = await Invitado.create(req.body);
    res.status(201).json(invitado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Listar invitados de un evento
router.get("/:evento_id", async (req, res) => {
  try {
    const invitados = await Invitado.findAll({ where: { evento_id: req.params.evento_id } });
    res.json(invitados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
