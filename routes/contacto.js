const express = require('express');
const router = express.Router();
const MensajeContacto = require('../models/MensajeContacto');
const authJWT = require('../middlewares/authJWT');  
const verificarRol = require('../middlewares/verificarRol'); // Middleware para verificar roles


// Ruta protegida
// Obtener todos los mensajes de contacto
router.get('/mensajes', authJWT, async (req, res) => {
  try {
    const mensajes = await MensajeContacto.findAll({ order: [['createdAt', 'DESC']] });
    res.status(200).json(mensajes);
  } catch (error) {
    console.error('Error al obtener los mensajes:', error);
    res.status(500).json({ error: 'Error al obtener los mensajes' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nombre, email, mensaje } = req.body;
    await MensajeContacto.create({ nombre, email, mensaje });
    res.status(201).json({ mensaje: 'Mensaje guardado con Exito...!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar el mensaje' });
  }
});

// Nuevo endpoint para contar mensajes no leídos
router.get('/mensajes/no-leidos', authJWT, verificarRol(['Admin', 'Asesor']), async (req, res) => {
  try {
    const cantidadNoLeidos = await MensajeContacto.count({
      where: { leido: false }
    });

    res.json({ mensajes_no_leidos: cantidadNoLeidos });
  } catch (error) {
    console.error('Error al contar mensajes no leídos:', error);
    res.status(500).json({ error: 'Error al contar los mensajes no leídos' });
  }
});

module.exports = router;
