/**
 * Created by zjl on 2017/3/10.
 */
$(document).ready(function(){
    var canvas = $("#gameCanvas");
    var cxt = canvas.get(0).getContext("2d");
    //画布尺寸
    var canvasWidth = canvas.width();
    var canvasHeight = canvas.height();

    //游戏状态
    var playGame;
    //圆形平台
    var platformX;
    var platformY;
    var platformOuterRadius;
    var platformInnerRadius;

    var asteroids;    //存储小行星的数组
    //玩家小行星设置
    var player;
    var playerOriginalX;
    var playerOriginalY;
    var playerSelected;      //玩家小行星当前是否被选中
    var playerMaxAbsVelocity;    //限制玩家使用的小行星的最快速度
	var playerVelocityDampener;  //存储玩家使用的小行星的速度
	//确定玩家小行星的速度
    var powerX;
	var powerY;
    //分数
    var score;


    var ui = $("#gameUI");
    var uiIntro = $("#gameIntro");
    var uiStats = $("#gameStats");
    var uiComplete = $("#gameComplete");
    var uiPlay = $("#gamePlay");
    var uiReset = $(".gameReset");
    var uiRemaining = $("#gameRemaining");
    var uiScore = $(".gameScore");

    //小行星
    var Asteroid = function(x,y,radius,mass,friction,red,green,blue){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.mass = mass;
        this.friction = friction;   //每个小行星产生的摩擦力大小
        this.vX = 0;
        this.vY = 0;
        this.player = false;  //是否是玩家使用的较大行星
         //每个小球都有自己的颜色
        this.red = red;
        this.green = green;
        this.blue = blue;

    };

    //重置玩家小行星
    function resetPlayer(){
        player.x = playerOriginalX;
        player.y = playerOriginalY;
        player.vX = 0;
        player.vY = 0;
    }


    //重置和启动游戏
    function startGame(){
        uiScore.html("0");
        uiStats.show();
        //初始游戏状态
        playGame = false;
        platformX = canvasWidth/2;
        platformY = 150;
        platformOuterRadius = 100;
        platformInnerRadius = 75;

        //初始化小行星
        asteroids = new Array();

         //设置玩家小行星
        playerSelected = false;
		playerMaxAbsVelocity = 30;
		playerVelocityDampener = 0.3;
        //鼠标移动不可能产生-1这种值，即没必要对位于跟踪元素范围外的鼠标移动进行检测
		powerX = -1;
		powerY = -1;
        score = 0; //初始化分数

        var pRadius = 15;
        var pMass = 10;
        var pFriction = 0.97;
        playerOriginalX = canvasWidth/2;
		playerOriginalY = canvasHeight-150;
        //颜色
        player = new Asteroid(playerOriginalX, playerOriginalY, pRadius, pMass, pFriction,255,255,255);
		player.player = true;  //玩家小行星
        asteroids.push(player);

        //设置其他小行星
        var outerRing = 8;   //外圈上的小行星数目
        var ringCount = 3; //圈数
        var ringSpacing = (platformInnerRadius/(ringCount-1)); //每个圈之间的距离
        //循环每一圈
        for(var r = 0; r < ringCount; r++){
            var currentRing = 0;  //当前圈上的小行星数目
            var angle = 0;  //没颗小行星之间的角度
            var ringRadius = 0;
            //是否是最内圈
            if(r == ringCount - 1){
                currentRing = 1;
            }else{
                currentRing = outerRing -(r*3);
                angle = 360/currentRing;
                ringRadius = platformInnerRadius - (ringSpacing*r);
            }
            //当前圈小球的设置
            for(var a = 0;a<currentRing;a++){
                var x = 0;
                var y = 0;
                //是否是最里圈
                if(r == ringCount - 1){
                    x = platformX;
                    y = platformY;
                }else{
                    x = platformX+(ringRadius*Math.cos((angle*a)*(Math.PI/180)));
					y = platformY+(ringRadius*Math.sin((angle*a)*(Math.PI/180)));
                }
                var radius = 10;
                var mass = 5;
                var friction = 0.95;

                //颜色
                var red = Math.floor(Math.random()*255);
                var green = Math.floor(Math.random()*255);
                var blue = Math.floor(Math.random()*255);
                asteroids.push(new Asteroid(x,y,radius,mass,friction,red,green,blue));
            }
        }
        uiRemaining.html(asteroids.length-1);

        $(window).mousedown(function(e){
            //玩家小行星没有被选中且位于起点位置
            if(!playerSelected && player.x == playerOriginalX && player.y == playerOriginalY){
                var canvasOffset = canvas.offset();
                //计算画布上玩家鼠标的相对位置
                var canvasX = Math.floor(e.pageX-canvasOffset.left);
				var canvasY = Math.floor(e.pageY-canvasOffset.top);

                if (!playGame) {
					playGame = true;
					animate();
				}
                //计算玩家小行星与鼠标之间的距离
               var dX = player.x-canvasX;
				var dY = player.y-canvasY;
				var distance = Math.sqrt((dX*dX)+(dY*dY));
				var padding = 5;
                //玩家单击了小行星
				if (distance < player.radius+padding) {
					powerX = player.x;
					powerY = player.y;
					playerSelected = true;
				}
            }

        });
        $(window).mousemove(function(e){
            if(playerSelected){
               var canvasOffset = canvas.offset();
                //计算画布上玩家鼠标的相对位置
                var canvasX = Math.floor(e.pageX-canvasOffset.left);
				var canvasY = Math.floor(e.pageY-canvasOffset.top);

                var dX = canvasX-player.x;
				var dY = canvasY-player.y;
				var distance = Math.sqrt((dX*dX)+(dY*dY));
                //使用playerVelocityDampener来缓冲距离，使得玩家可把鼠标拖拽得更远一些，但最终速度会小一些，以便显得更真实
                if (distance*playerVelocityDampener < playerMaxAbsVelocity) {
					powerX = canvasX;
					powerY = canvasY;
				} else {
					var ratio = playerMaxAbsVelocity/(distance*playerVelocityDampener);
					powerX = player.x+(dX*ratio);
					powerY = player.y+(dY*ratio);
				}
            }

        });
        $(window).mouseup(function(e){
            if (playerSelected) {
				var dX = powerX-player.x;
				var dY = powerY-player.y;

				player.vX = -(dX*playerVelocityDampener);
				player.vY = -(dY*playerVelocityDampener);
                uiScore.html(++score);  //更新分数
            }
            playerSelected = false;
			powerX = -1;
			powerY = -1;
        });
        //开始动画循环
        animate();
    }

    //初始化游戏环境
    function init(){
        uiStats.hide();
		uiComplete.hide();

		uiPlay.click(function(e) {
			e.preventDefault();
			uiIntro.hide();
			startGame();
		});

		uiReset.click(function(e) {
			e.preventDefault();
			uiComplete.hide();
			startGame();
		});
    }



    //动画循环
    function animate(){
        //清除
        cxt.clearRect(0,0,canvasWidth,canvasHeight);
        //绘制平台
        cxt.fillStyle = "rgb(100,100,100)";
        cxt.beginPath();
        cxt.arc(platformX,platformY,platformOuterRadius,0,Math.PI*2,false);
        cxt.closePath();
        cxt.fill();
        //绘制鼠标拖动线
        if(playerSelected){
            cxt.strokeStyle = "rgb(255,255,255)";
            cxt.lineWidth = 3;
            cxt.beginPath();
            cxt.moveTo(player.x,player.y);
            cxt.lineTo(powerX,powerY);
            cxt.closePath();
            cxt.stroke();
        }
        //绘制小行星
    //    cxt.fillStyle = "rgb(255,255,255)";
        var deadAsteroids = new Array();  //临时数组 存储已经飞出平台的小行星
        var asteroidsLength = asteroids.length;
        for(var i = 0; i<asteroidsLength; i++){
            var tmpAsteroid = asteroids[i];
            cxt.fillStyle = "rgb("+tmpAsteroid.red+","+tmpAsteroid.green+","+tmpAsteroid.blue+")";
            for(var j = i+1;j<asteroidsLength;j++){
                 var tmpAsteroidB = asteroids[j];
                var dX = tmpAsteroidB.x - tmpAsteroid.x;
				var dY = tmpAsteroidB.y - tmpAsteroid.y;
				var distance = Math.sqrt((dX*dX)+(dY*dY));
                if(distance < tmpAsteroid.radius + tmpAsteroidB.radius){
                    //将小球的碰撞转换为理想碰撞，并利用坐标旋转公式计算转换后的坐标和速度
                    var angle = Math.atan2(dY, dX);    //旋转角度
					var sine = Math.sin(angle);
					var cosine = Math.cos(angle);
                    //旋转小行星的位置和速度
                    var x = 0;
					var y = 0;
                    var vX = tmpAsteroid.vX * cosine + tmpAsteroid.vY * sine;
					var vY = tmpAsteroid.vY * cosine - tmpAsteroid.vX * sine;
                    //旋转小行星B的位置和速度
                    var xB = dX * cosine + dY * sine;
					var yB = dY * cosine - dX * sine;
                    var vXb = tmpAsteroidB.vX * cosine + tmpAsteroidB.vY * sine;
					var vYb = tmpAsteroidB.vY * cosine - tmpAsteroidB.vX * sine;

                    //能量守恒和动量守恒定律求解碰撞后的速度
                    var vTotal = vX - vXb;
					vX = ((tmpAsteroid.mass - tmpAsteroidB.mass) * vX + 2 * tmpAsteroidB.mass * vXb) / (tmpAsteroid.mass + tmpAsteroidB.mass);
					vXb = vTotal + vX;
                    //将小行星分开
                    xB = x + (tmpAsteroid.radius + tmpAsteroidB.radius);

                    //旋转回之前的位置和速度
                    tmpAsteroid.x = tmpAsteroid.x + (x * cosine - y * sine);
					tmpAsteroid.y = tmpAsteroid.y + (y * cosine + x * sine);
                    tmpAsteroid.vX = vX * cosine - vY * sine;
					tmpAsteroid.vY = vY * cosine + vX * sine;

                    tmpAsteroidB.x = tmpAsteroid.x + (xB * cosine - yB * sine);
					tmpAsteroidB.y = tmpAsteroid.y + (yB * cosine + xB * sine);
                    tmpAsteroidB.vX = vXb * cosine - vYb * sine;
					tmpAsteroidB.vY = vYb * cosine + vXb * sine;
                }
            }

            //计算新的位置
            tmpAsteroid.x += tmpAsteroid.vX;
            tmpAsteroid.y += tmpAsteroid.vY;

            //更新速度
            if(Math.abs(tmpAsteroid.vX)>0.1){
                tmpAsteroid.vX *= tmpAsteroid.friction;
            }else{
                tmpAsteroid.vX = 0;
            }
            if(Math.abs(tmpAsteroid.vY)>0.1){
                tmpAsteroid.vY *= tmpAsteroid.friction;
            }else{
                tmpAsteroid.vY = 0;
            }
            //检测是否飞出平台
            if(!tmpAsteroid.player){
                var dXp = tmpAsteroid.x - platformX;
				var dYp = tmpAsteroid.y - platformY;
                var distanceP = Math.sqrt((dXp*dXp)+(dYp*dYp));
				if (distanceP > platformOuterRadius) {
					// 让小行星逐渐消失
					if (tmpAsteroid.radius > 0) {
						tmpAsteroid.radius -= 2;
					} else {
						deadAsteroids.push(tmpAsteroid);
					};
				};
            }
            //重置玩家小行星
            if (player.x != playerOriginalX && player.y != playerOriginalY) {
				if (player.vX == 0 && player.vY == 0) {
					resetPlayer();
				} else if (player.x+player.radius < 0) {
					resetPlayer();
				} else if (player.x-player.radius > canvasWidth) {
					resetPlayer();
				} else if (player.y+player.radius < 0) {
					resetPlayer();
				} else if (player.y-player.radius > canvasHeight) {
					resetPlayer();
				}
			}

            cxt.beginPath();
            cxt.arc(tmpAsteroid.x,tmpAsteroid.y,tmpAsteroid.radius,0,Math.PI*2,true);
            cxt.closePath();
            cxt.fill();
        }

        var deadAsteroidsLength = deadAsteroids.length;
		if (deadAsteroidsLength > 0) {
			for (var di = 0; di < deadAsteroidsLength; di++) {
				var tmpDeadAsteroid = deadAsteroids[di];
				asteroids.splice(asteroids.indexOf(tmpDeadAsteroid), 1);
			};

			var remaining = asteroids.length-1; // 不算玩家小行星
			uiRemaining.html(remaining);

			if (remaining == 0) {
				// 获胜
				playGame = false;
				uiStats.hide();
				uiComplete.show();

				// 删除鼠标监听事件
				$(window).unbind("mousedown");
				$(window).unbind("mouseup");
				$(window).unbind("mousemove");
			};
		};

        if(playGame){
            setTimeout(animate,33);
        }
    }
    init();
});