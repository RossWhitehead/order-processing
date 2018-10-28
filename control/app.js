var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const kafka = require('kafka-node');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);

io.on('connection', function(socket){
    console.log('Socket connection, ', socket.id);
    socket.on('disconnect', function(){
        console.log('Socket disconnected, ', socket.id);
      });
  });

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(function(req, res, next){
    res.io = io;
    next();
  });

app.use(express.static('public'))

app.use('/', indexRouter);
app.use('/users', usersRouter);

// Initialize Kafka consumer
const Consumer = kafka.Consumer,
    client = new kafka.Client(),
    consumer = new Consumer(
        client,
        [
            { topic: 'orders'}, 
            { topic: 'payments'}, 
            { topic: 'shipments'} 
        ],
        {
            autoCommit: true
        }
    );

consumer.on('message', function (message) {
    io.emit('kafka-message', message);
});

module.exports = {app: app, server: server};
