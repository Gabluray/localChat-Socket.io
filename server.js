const express = require('express');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: { origin: '*' }
});

app.use(express.static(path.join(__dirname, 'chat')));
app.set('views', path.join(__dirname, 'chat'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use('/', (req, res) => {
  res.render('index.html');
});

let messages = [];
let onlineCount = 0;

io.on('connection', socket => {
  onlineCount++;
  console.log(`Socket conectado: ${socket.id} | Online: ${onlineCount}`);

  // Envia mensagens salvas e contagem atual
  socket.emit('previousMessages', messages);
  io.emit('userCount', onlineCount);

  // Recebe e repassa mensagem (sem duplicar para quem enviou)
  socket.on('sendMessage', data => {
    messages.push(data);
    socket.broadcast.emit('receiveMessage', data);
  });

  // Repassa evento de "digitando"
  socket.on('typing', data => {
    socket.broadcast.emit('typing', data);
  });

  socket.on('disconnect', () => {
    onlineCount = Math.max(0, onlineCount - 1);
    console.log(`Socket desconectado: ${socket.id} | Online: ${onlineCount}`);
    io.emit('userCount', onlineCount);
  });
});

server.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
