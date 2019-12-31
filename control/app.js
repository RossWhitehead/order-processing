var createError = require('http-errors');
var express = require('express');
var path = require('path');
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

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next){
    res.io = io;
    next();
  });

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

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
  });
  
  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });  

module.exports = {app: app, server: server};
