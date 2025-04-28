const express = require('express');
const router = express.Router();
const Cliente = require('../models/Cliente');

// Crear nuevo cliente
router.post('/', async (req, res) => {
  try {
    const { nombre, email, telefono, direccion } = req.body;

    // Verificar si el email ya existe
    const clienteExistente = await Cliente.findOne({ where: { email } });
    if (clienteExistente) {
      return res.status(400).json({ error: 'Este correo ya está registrado como cliente' });
    }

    // Crear cliente
    const cliente = await Cliente.create({ nombre, email, telefono, direccion });
    res.status(201).json({ cliente, mensaje: 'Cliente registrado exitosamente' });

  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener todos los clientes (opcional)
router.get('/', async (req, res) => {
  try {
    const clientes = await Cliente.findAll();
    res.json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener cliente por ID (opcional)
router.get('/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(cliente);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
