// middlewares/verificarRol.js

function verificarRol(rolesPermitidos) {
  return (req, res, next) => {
    const tipoUsuario = req.user.tipo_usuario; // asumimos que ya tienes el usuario en req.user
    console.log('Tipo de usuario:', tipoUsuario); // Para depuración
    if (!rolesPermitidos.includes(tipoUsuario)) {
      return res.status(403).json({ error: 'No tienes permiso para acceder a este recurso' });
    }

    next();
  };
}

module.exports = verificarRol;

  