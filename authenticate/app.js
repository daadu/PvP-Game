
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , fs = require('fs')

var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
var player = [];
io.sockets.on("connection",function(socket){
	if(player.length <2 ){
		player.push(socket)
		if(player.length == 1){
			player[0].emit("initalize player 1",{});
		}
		socket.emit("number of players",{number: player.id})
	}else{
		socket.emit("not ready",{})
		console.log("\n\n\n\n\nNo more Player")
	}
	console.log(socket)
	player
})
app.get('/', function(req,res){
	fs.readFile('./index.html',function(err,cont){
		if(err){
			res.writeHead(500);
			res.end()
		}else{
			res.writeHead(200,{'Content-Type':'text/html'});
			res.end(cont,'utf-8');
		}
	})
});

app.get('/js/game.js',function(req,res){
	fs.readFile('./js/game.js',function(err,cont){
		if(err){
			res.writeHead(500);
			res.end();
		}else{
			res.writeHead(200,{'Content-Type' : 'text/javascript'});
			res.end(cont,'utf-8');
		}
	})
})

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
