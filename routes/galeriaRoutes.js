const express = require("express");
const Galeria = require('../models/Galeria'); // Asegúrate de que el modelo Galeria esté correctamente definido
const {upload} = require('../middlewares/multer'); // Middleware para manejar la subida de archivos
const Evento = require('../models/Event'); // Modelo de eventos, si es necesario para validaciones
const authJWT = require('../middlewares/authJWT');  
const sharp = require('sharp'); // Para procesar imágenes
const path = require('path');

const router = express.Router();

// Subir múltiples fotos
router.post('/upload/:codigo',authJWT, upload.array('photos', 10), async (req, res) => {
    const { codigo } = req.params;
    const usuario_id = req.user.id;
    const evento = await Evento.findOne({ where: { codigo } });
    if (!evento) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }
    try {
        const fotosProcesadas = [];

        for (let file of req.files) {
            const nombreFinal = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.webp';
            const rutaCompleta = path.join(__dirname, '../public/uploads/galeria', nombreFinal);

            // Convertir a webp y guardar
            await sharp(file.buffer)
                .webp({ quality: 80 })
                .toFile(rutaCompleta);

            fotosProcesadas.push({
                evento_id: evento.id,
                usuario_id: usuario_id,
                imagen_url: nombreFinal
            });
        }



        const nuevasFotos = await Galeria.bulkCreate(fotosProcesadas);
        res.status(201).json(nuevasFotos);
    } catch (error) {
        console.error("Error subiendo imágenes:", error);
        res.status(500).json({ error: "No se pudo subir las imágenes" });
    }
});

// Obtener fotos de un evento
router.get('/:codigo', async (req, res) => {
    const { codigo } = req.params;
    const evento = await Evento.findOne({ where: { codigo } });
    try {
        const fotos = await Galeria.findAll({ where: { evento_id: evento.id } });
        res.json(fotos);
    } catch (error) {
        console.error("Error al obtener imágenes:", error);
        res.status(500).json({ error: "No se pudieron obtener las imágenes" });
    }
});

// Eliminar una imagen
const fs = require('fs');
router.delete('/galeria/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const imagen = await Galeria.findByPk(id);
        if (!imagen) return res.status(404).json({ error: "Imagen no encontrada" });

        // Eliminar archivo físicamente
        fs.unlinkSync(`uploads/galeria/${imagen.ruta_imagen}`);

        // Eliminar de la base de datos
        await imagen.destroy();
        res.json({ mensaje: "Imagen eliminada correctamente" });
    } catch (error) {
        console.error("Error al eliminar imagen:", error);
        res.status(500).json({ error: "No se pudo eliminar la imagen" });
    }
});

module.exports = router;