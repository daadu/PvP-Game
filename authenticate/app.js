
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
var players = [];
io.sockets.on("connection",function(socket){
	if(players.length < 2){
		players.push(socket);
		if(players.length == 1){
			socket.emit("wait",{})
		}else{
			var ballAngel = Math.random()
			socket.emit("initialize",{player_1 : false,randomAngle : ballAngel});
			players[0].emit("initialize",{player_1 : true,randomAngle : ballAngel})
		}
		socket.on("gameover",function(data){
			players = [];
			io.sockets.emit("gameover_fromserver",{})
		})
		socket.on("disconnect",function(data){
			players = [];
			io.sockets.emit("gameover_fromserver",{})
		})
		socket.on("gamedata",function(data){
			if(data.player_1){
				players[1].emit("serverdata",{to_player_1:false,ball:data.ball,bat:data.bat})
			}else{
				players[0].emit("serverdata",{to_player_1:true,ball:data.ball,bat:data.bat})
			}
		})
	}else{
		socket.emit("limit",{})
	}
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

app.listen(8080);
console.log(app.address())
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
