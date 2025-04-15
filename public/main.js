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
});
