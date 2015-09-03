var app = require('express')();
var http = require('http').Server(app);
var path = require('path');
var swig = require('swig');
var io = require('socket.io')(http);
var moment = require('moment');
var mongoose = require('mongoose');
var Message;
var messageSchema = new mongoose.Schema({
    content: {
      type: String
    },
    sentAt: {
      type: Date
    }
});
mongoose.connect("mongodb://austin809:147159aa@ds035713.mongolab.com:35713/node-chatroom", function(err){
  if(err) throw err;
});
mongoose.connection.on('connected', function() {
  Message = mongoose.model('message', messageSchema);
  io.on('connection', function(socket){
    socket.on('new message', function(msg){
      var savedMsg = new Message({
        content: msg,
        sentAt: moment()
      });
      savedMsg.save(function(err){
        if (err) throw err;
        io.emit('new message', savedMsg);
      })
    });
  });
  console.log("Mongo successfully connected");
});

app.get('/', function(req, res){
  var messages = Message.find({}).sort('sentAt').exec(function(err, messages) {
    if (err) throw err;
    res.render('index', {messages: messages});
  })
});
mongoose.connection.on('disconnected', function(){
  console.log('Mongo has disconnected');
})



app.set('views', path.join(__dirname, 'views'));
app.set('port', 3000);
app.set('view engine', 'html');
app.engine('html', swig.renderFile);





http.listen(3000, function(){
  console.log('listening on port ' + 3000);
});
