window.addEventListener("load",windowLoaded,false);

function windowLoaded(){
	gameApp();
}
function gameApp(){
	var canvas = document.getElementById("canvas");
	canvas.width = 380;
	canvas.height = 400;
	var context = canvas.getContext('2d');

	var myBat = new basicBat(true);
	var hisBat = new basicBat(false);
	var ball = new basicBall();

	function basicBall(){
		this.radius = 15;
		this.x = canvas.width/2;
		this.y = canvas.height/2;
		this.speed = 7;
		this.angle = Math.floor(Math.random()*360)
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
			}else if (this.nexty+this.radius > canvas.height ) {
				this.vy = this.vy*-1;
				this.nexty = canvas.height - this.radius;
			} else if(this.nexty-this.radius < 0) {
				this.vy = this.vy*-1;
				this.nexty = this.radius;
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
	function gameLoop(){
		setTimeout(gameLoop,1000/30);
		drawScreen();
	}
	gameLoop();
	//drawScreen();
}