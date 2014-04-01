//window.addEventListener("load",windowLoaded,false);
var loop;
function init(data){//windowLoaded(){
	gameApp(data);
}
function gameApp(clientData){
	window.addEventListener("mousemove",mouseMoved,false);
	var canvas = document.getElementById("canvas");
	canvas.width = 380;
	canvas.height = 400;
	var context = canvas.getContext('2d');
	var myBat,hisBat;
	myBat = new basicBat(clientData.player_1);
	hisBat = new basicBat(!clientData.player_1);
	var ball = new basicBall();

	var mouseEventManager = new Object();

	socket.on("serverdata",function(data){
		ball.x = data.ball.x;
		ball.y = data.ball.y;
		ball.vx = data.ball.vx;
		ball.vy = data.ball.vy;

		hisBat.x = data.bat.x;
	})
	function basicBall(){
		this.radius = 15;
		this.x = canvas.width/2;
		this.y = canvas.height/2;
		this.speed = 2;
		this.angle = Math.floor(clientData.randomAngle*360)
		this.radians = this.angle * Math.PI/ 180;
		this.vx = Math.cos(this.angle) * this.speed;
		this.vy = Math.sin(this.angle) * this.speed;
		this.draw = function(){
			context.restore();
			context.beginPath();
			context.arc(this.x, this.y,this.radius, (Math.PI/180)*0, (Math.PI/180)*360, false);
			context.fillStyle = "#3498db"
			context.fill();
			context.closePath();
			context.save();
		}
		this.update = function(){
			this.nextx = (this.x += this.vx);
			this.nexty = (this.y += this.vy);
		}
		this.testWall = function(){
			if (this.nextx+this.radius > canvas.width) {
				this.vx = this.vx*-1;
				this.nextx = canvas.width - this.radius;
			} else if (this.nextx-this.radius < 0 ) {
				this.vx = this.vx*-1;
				this.nextx =this.radius;
			}else if (this.nexty+this.radius > canvas.height ) {//niche wall
				/*this.vy = this.vy*-1;
				this.nexty = canvas.height - this.radius;*/
				console.log("GAME OVER");
				clearTimeout(loop);
				socket.emit("gameover",{});
			} else if(this.nexty-this.radius < 0) {//upar wall
				/*this.vy = this.vy*-1;
				this.nexty = this.radius;*/
				console.log("Game over")
				clearTimeout(loop);
				socket.emit("gameover",{});
			}
		}
		this.render = function(){
			ball.x = ball.nextx;
			ball.y = ball.nexty;
			this.draw();
		}
	}
	function basicBat(player1){
		this.player1 = !!player1;
		this.width = 100;
		this.thickness = 12;
		this.speed = 0;
		this.vy = 0;
		this.vx = 0;
		this.angle = 0;
		this.radians = this.angle * Math.PI/ 180;
		/*this.angle;
		this.vy;*/
		this.x = canvas.width/2;
		this.y = this.player1?canvas.height-this.thickness/2:this.thickness/2;
		this.draw = function(){
			context.restore();
			context.lineWidth = this.thickness;
			context.lineCap = "round";
			context.beginPath();
			context.moveTo(this.x-this.width/2,this.y);
			context.lineTo(this.x+this.width/2,this.y);
			context.strokeStyle = (this.player1)?"#2c3e50":"#27ae60";
			context.stroke();
			context.closePath();
			context.save();
		}
	}
	function drawScreen(){
		//console.log(myBat,hisBat,ball)
		canvas.width = canvas.width;
		myBat.draw();
		hisBat.draw();
		ball.update();
		ball.testWall();
		ball.render();
	}
	function mouseMoved(e){
		if(!mouseEventManager.start){
			mouseEventManager.start = e.clientX;
		}else{
			if(e.clientX >= canvas.width){
				mouseEventManager.end = canvas.width;
			}else{
				mouseEventManager.end = e.clientX;
			}
		}
	}
	function handleEvents(){
		if(mouseEventManager.start){
			window.removeEventListener("mousemove",mouseMoved)
			myBat.x = mouseEventManager.end;
			mouseEventManager.start = false;
			window.addEventListener("mousemove",mouseMoved,false);
		}
	}
	function hitTest(ball,bat){
		var lowerLimit = bat.x - bat.width/2;
		var upperLimit = lowerLimit + bat.width;
		var retval = false;
		//console.log(distance,ball.radius,bat.thickness)
		if (ball.x <= upperLimit && ball.x>= lowerLimit)
		{
			retval = true;
		}
		return retval;
	}
	function collide(ball,bat){
		console.log("ITS a collision");
		ball.vy = ball.vy*-1;
		//ball.nexty = canvas.height - ball.radius- myBat.thickness/2;
		if(ball.y < canvas.height){
			ball.nexty = myBat.thickness + ball.radius;
		}else{
			ball.nexty = canvas.height - myBat.thickness - ball.radius;
		}
	}
	var sendAfter = 10;//loops
	var sendCounter = 0;
	function gameLoop(){
		loop = setTimeout(gameLoop,1000/30);
		handleEvents();
		//Collision chek
		var condition = myBat.player1 ? ball.y>=canvas.height-myBat.thickness-ball.radius:    ball.y <= myBat.thickness + ball.radius; 
		if( condition){
			if(hitTest(ball,myBat)){
				collide(ball,myBat)
			}else{
				delete ball;
				//socket.disconnect();
				//globalConnectionStatus = false;
				
			}
		}
		//sending data to socket
		
		if(myBat.player1 && ball.y>canvas.height/2){
			if(!(sendCounter%sendAfter)){
				socket.emit("gamedata",{player_1:true,
					ball:{x : ball.x, y : ball.y, vx : ball.vx, vy : ball.vy},
					bat : {x : myBat.x}
				})
			}
			sendCounter++;
		}
		if(!myBat.player1 && ball.y<canvas.height/2){
			if(!(sendCounter%sendAfter)){
				socket.emit("gamedata",{player_1:false,
					ball:{x : ball.x, y : ball.y, vx : ball.vx, vy : ball.vy},
					bat : {x : myBat.x}
				})
			}
			sendCounter++;
		}
		drawScreen();
	}
	gameLoop();
	//drawScreen();
}