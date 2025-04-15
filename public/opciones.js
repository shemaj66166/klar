const socket = io();

const sessionId = localStorage.getItem('sessionId');
socket.emit('reconectar', sessionId);

// Esperar la respuesta del admin (aceptar o rechazar)
socket.on('respuesta', (decision) => {
  if (decision === 'aprobado') {
    window.location.href = 'bienvenido.html';
  } else if (decision === 'rechazado') {
    window.location.href = 'denegado.html';
  }
});
