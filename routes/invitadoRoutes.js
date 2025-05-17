const express = require("express");
const Invitado = require("../models/Invitado");
const Evento = require("../models/Event");
const User = require("../models/User"); 
const authJWT = require("../middlewares/authJWT");
const generarPassword = require("../utils/generarPassword");
const router = express.Router();
const {enviarCorreo} = require("../utils/mailer"); // Asegúrate de tener esta función para enviar correos
const bcrypt = require('bcrypt');
const XLSX = require('xlsx');
const { Sequelize, Op } = require('sequelize');


router.post('/respuesta', async (req, res) => {
  const { nombre, email, codigo, estado_confirmacion, acompanantes, comentario } = req.body;

  try {
    // Validar campos obligatorios
    if (!nombre || !email || !codigo || !estado_confirmacion) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios." });
    }

    // Buscar el evento
    const evento = await Evento.findOne({ where: { codigo } });
    if (!evento) {
      return res.status(404).json({ mensaje: "Evento no encontrado." });
    }

    if (evento.estado !== 'Activo') {
      return res.status(403).json({ mensaje: "Este evento no está disponible para confirmar asistencia." });
    }

    // Validar si el invitado ya respondió previamente
    const yaRegistrado = await Invitado.findOne({
      where: {
        email,
        evento_id: evento.id
      }
    });

    if (yaRegistrado) {
      return res.status(409).json({ mensaje: "Ya has respondido a esta invitación anteriormente. Para cambiar el estado debes iniciar sesión." });
    }

    // Crear nuevo invitado
    await Invitado.create({
      nombre,
      email,
      acompanantes,
      estado_confirmacion,
      evento_id: evento.id,
      comentario
    });

    // Si no rechazó, crear usuario y enviar correo
    if (estado_confirmacion.toLowerCase() !== 'rechazado') {
      let usuario = await User.findOne({ where: { email } });

      if (!usuario) {
        const passwordGenerada = generarPassword(); // Función que debes tener definida
        const hash = await bcrypt.hash(passwordGenerada, 10);

        usuario = await User.create({
          nombre,
          email,
          contrasenia: hash,
          tipo_usuario: 'Invitado'
        });

        // Responder al cliente inmediatamente
        res.status(200).json({ mensaje: 'Tu respuesta ha sido registrada. Revisa tu correo con tus credenciales.' });

        // Enviar correo en segundo plano
        enviarCorreo({
          to: email,
          subject: 'Confirmación de asistencia y acceso',
          html: `<p>Gracias por confirmar tu asistencia al evento "${evento.titulo}".</p>
                <p>Tu acceso ha sido creado. Aquí están tus credenciales:</p>
                <ul>
                  <li><strong>Email:</strong> ${email}</li>
                  <li><strong>Contraseña:</strong> ${passwordGenerada}</li>
                </ul>`
        }).then(resultado => {
          if (!resultado.exito) {
            console.error("❌ Error al enviar correo:", resultado.error);
          } else {
            console.log("✅ Correo enviado a", email);
          }
        }).catch(err => {
          console.error("❌ Error inesperado al enviar correo:", err);
        });

      } else {
        // Usuario ya existe
        res.status(200).json({ mensaje: 'Tu respuesta ha sido registrada. Ya tienes acceso, revisa tu correo.' });

        // Enviar correo en segundo plano
        enviarCorreo({
          to: email,
          subject: 'Confirmación de asistencia',
          html: `<p>Gracias por confirmar tu asistencia al evento "${evento.titulo}".</p>
                <p>Ya cuentas con acceso. Si olvidaste tu contraseña puedes recuperarla desde el sitio web.</p>`
        }).then(resultado => {
          if (!resultado.exito) {
            console.error("❌ Error al enviar correo:", resultado.error);
          } else {
            console.log("✅ Correo enviado a", email);
          }
        }).catch(err => {
          console.error("❌ Error inesperado al enviar correo:", err);
        });
      }

    } else {
      // Invitado rechazó la invitación
      return res.status(200).json({ mensaje: 'Tu respuesta ha sido registrada. Lamentamos no verte en el evento.' });
    }

  } catch (error) {
    console.error("❌ Error general:", error);
    return res.status(500).json({ mensaje: "Error interno del servidor." });
  }
});

/*router.get('/test-correo', async (req, res) => {
  try {
    const resultado = await enviarCorreo({
      to: 'josecaracas@gmail.com', // reemplaza por un correo real de prueba
      subject: '🚀 Prueba de envío de correo desde WedInvite',
      html: `<h1>Hola!</h1><p>Este es un correo de prueba desde WedInvite.</p>`
    });

    if (!resultado.exito) {
      console.error("Error al enviar correo:", resultado.error);
      return res.status(500).json({ mensaje: 'Falló el envío de correo.', error: resultado.error });
    }

    console.log("Correo enviado con éxito:", resultado.mensajeId);
    res.status(200).json({ mensaje: 'Correo enviado con éxito.', id: resultado.mensajeId });
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ mensaje: 'Error interno del servidor.', error });
  }
});*/

// Obtener invitados por evento para usuario tipo Novia
router.get('/evento/:codigo', authJWT, async (req, res) => {
  const { codigo } = req.params;
  try {
    const evento = await Evento.findOne({ where: { codigo } });
    if (!evento) {
      return res.status(404).json({ mensaje: 'Evento no encontrado' });
    }

    const invitados = await Invitado.findAll({
      where: { evento_id: evento.id },
      attributes: ['nombre', 'email', 'acompanantes', 'estado_confirmacion', 'comentario']
    });

    res.status(200).json(invitados);
  } catch (error) {
    console.error('Error al obtener invitados:', error);
    res.status(500).json({ mensaje: 'Error al consultar invitados' });
  }
});

router.post('/enviar-excel', authJWT, async (req, res) => {
  const { codigo } = req.body;
  const email = req.user.email; // Se extrae directamente del token

  if (!email || !codigo) {
    return res.status(400).json({ mensaje: "Faltan datos requeridos." });
  }

  console.log("Código del evento:", codigo);
  console.log("Email del usuario:", email);

  try {
    const evento = await Evento.findOne({ where: { codigo } });
    if (!evento) return res.status(404).json({ mensaje: "Evento no encontrado." });

    const invitados = await Invitado.findAll({ where: { evento_id: evento.id } });

    const data = invitados.map(inv => ({
      Nombre: inv.nombre,
      Email: inv.email,
      Acompañantes: inv.acompanantes,
      Estado: inv.estado_confirmacion,
      Comentario: inv.comentario || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invitados");

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    const resultadoEnvio = await enviarCorreo({
      to: email,
      subject: `Lista de invitados - ${evento.titulo}`,
      html: `<p>Hola,</p><p>Adjuntamos el archivo Excel con la lista de invitados del evento <strong>${evento.titulo}</strong>.</p>`,
      attachments: [{
        filename: `invitados-${evento.titulo}.xlsx`,
        content: buffer,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }]
    });

    if (!resultadoEnvio.exito) {
      console.error("Error al enviar correo:", resultadoEnvio.error);
      return res.status(500).json({ mensaje: "Error al enviar el correo." });
    } 

    res.json({ mensaje: "Archivo Excel enviado exitosamente al correo." });

  } catch (error) {
    console.error("Error al enviar Excel:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
});

router.get('/estado/:codigo', authJWT, async (req, res) => {
  try {
    const { codigo } = req.params;

    // Busca el evento por código
    const evento = await Evento.findOne({ where: { codigo: codigo } });
    if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });

    // Agrupa por estado_confirmacion
    const invitados = await Invitado.findAll({
      where: { evento_id: evento.id },
      attributes: ['estado_confirmacion', [Sequelize.fn('COUNT', Sequelize.col('estado_confirmacion')), 'total']],
      group: ['estado_confirmacion']
    });

    // Formato de respuesta: { Confirmado: 10, Pendiente: 5, Rechazado: 2 }
    const resultado = {};
    invitados.forEach(inv => {
      resultado[inv.estado_confirmacion] = parseInt(inv.dataValues.total);
    });

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener resumen:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/mensajes/:codigo', authJWT, async (req, res) => {
  try {
    const { codigo } = req.params;

    const evento = await Evento.findOne({ where: { codigo: codigo } });
    if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });

    const mensajes = await Invitado.findAll({
      where: {
        evento_id: evento.id,
        comentario: { [Op.ne]: null }
      },
      order: [['updatedAt', 'DESC']],
      limit: 5,
      attributes: ['nombre', 'comentario']
    });

    res.json(mensajes);
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


module.exports = router;
