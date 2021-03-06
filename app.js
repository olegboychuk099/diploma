const {Client} = require('pg');
const cookieParser = require('cookie-parser');
let path = require('path');
const express = require('express'),
  app = express(),
  port = parseInt(process.env.PORT, 10) || 3000;

let UsersController = require('./middleware/controllers/file/FilesController.js');
let AuthController = require('./middleware/controllers/auth/AuthController.js');
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, PUT, GET, OPTIONS, DELETE");
  res.header("Access-Control-Allow-Headers", "x-access-token, Origin, X-Requested-With, Content-Type, Accept");
  next();
});
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
app.use(cookieParser());
app.use('/api/v1', UsersController);
app.use('/api/v1', AuthController);

// Create link to Angular build directory
app.use(express.static(__dirname + '/dist/diploma'));

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname + '/dist/diploma/index.html'));
});

const http = require('http').Server(app);
const io = require('socket.io')(http);

const documents = {};

io.on('connection', socket => {
  let previousId;
  const safeJoin = currentId => {
    socket.leave(previousId);
    socket.join(currentId, () => console.log(`Socket ${socket.id} joined room ${currentId}`));
    previousId = currentId;
  }

  socket.on('getFile', docId => {
    safeJoin(docId);
    socket.emit('file', documents[docId]);
  });

  socket.on('addFile', doc => {
    documents[doc.file.id] = doc.file;
    safeJoin(doc.file.id);
    socket.emit('file', doc.file);
  });

  socket.on('editFile', doc => {
    documents[doc.id] = doc;
    socket.to(doc.id).emit('file', doc);
  });

  socket.on('sendMessage', message => {
    socket.to(previousId).emit('message', message);
  });

  socket.on('connectUser', user => {
    const message = {
      message: `${user} joined this room`,
      user: 'system_message',
      time: ''
    };
    socket.to(previousId).emit('message', message);
  });

  socket.on('disconnectUser', user => {
    const message = {
      message: `${user} left this room`,
      user: 'system_message',
      time: ''
    };
    socket.to(previousId).emit('message', message);
  });

  console.log(`Socket ${socket.id} has connected`);
});


http.listen(port, () => {
  console.log('Server started on port 3000');
});

const client = new Client({
  connectionString: 'postgres://wixtgkfktbzpov:2d40f9096d22e9ad3bb47ede4f03b45fe77cf98e86ef00a92dc057e083894161@ec2-54-155-35-88.eu-west-1.compute.amazonaws.com:5432/d8i1usb6pfsfg',
  ssl: {rejectUnauthorized: false},
});

client.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});
