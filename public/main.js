// Conectar con el servidor usando Socket.IO
const socket = io();

// Esperar respuesta desde Telegram
socket.on('decision', (data) => {
  console.log('📨 Respuesta desde Telegram:', data);

  if (data.url) {
    // Redirigir automáticamente
    window.location.href = data.url;
  } else {
    alert('⚠ Hubo un error con la decisión.');
  }
});
