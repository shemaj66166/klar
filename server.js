const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config(); // Asegurate de tener tu archivo .env con el token

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('🟢 Cliente conectado vía Socket.IO');
  global.socket = socket;
});

// Manda el mensaje con los botones
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, 'Nuevo intento de acceso:\nCorreo: test@example.com\nContraseña: ******', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '✅ Aceptar', callback_data: 'aceptar' }],
        [{ text: '❌ Rechazar', callback_data: 'rechazar' }]
      ]
    }
  });
});

// Cuando se presiona un botón
bot.on('callback_query', (callbackQuery) => {
  const action = callbackQuery.data;
  const chatId = callbackQuery.message.chat.id;

  if (action === 'aceptar') {
    bot.sendMessage(chatId, '🟢 ¡Acceso aprobado!');
    if (global.socket) {
      global.socket.emit('redirect', '/bienvenido.html');
    }
  } else if (action === 'rechazar') {
    bot.sendMessage(chatId, '🔴 Acceso denegado.');
    if (global.socket) {
      global.socket.emit('redirect', '/denegado.html');
    }
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
