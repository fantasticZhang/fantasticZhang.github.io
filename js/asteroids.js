/**
 * Created by zjl on 2017/3/9.
 */
$(document).ready(function(){
    var canvas = $("#myCanvas");
    var cxt = canvas.get(0).getContext("2d");

    var canvasWidth = canvas.width();
	var canvasHeight = canvas.height();


    //适应屏幕
  //  $(window).resize(resizeCanvas);
  //
	// function resizeCanvas() {
	// 	canvas.attr("width", $(window).get(0).innerWidth);
	// 	canvas.attr("height", $(window).get(0).innerHeight);
  //
	// 	canvasWidth = canvas.width();
	// 	canvasHeight = canvas.height();
	// }
	// resizeCanvas();

    var ifPlay = true;
    var start = $("#start");
    var stop = $("#stop");

    start.hide();
    start.click(function(){
        $(this).hide();
        stop.show();
        ifPlay = true;
        animate();
    });
    stop.click(function(){
        $(this).hide();
        start.show();
        ifPlay = false;
    });

    //定义形状
    var Asteroid = function(x, y,radius,mass,vX,vY,aX,aY,red,green,blue){
        this.x = x;
		this.y = y;
		this.radius = radius;
		this.mass = mass;

		this.vX = vX;
		this.vY = vY;
		this.aX = aX;
		this.aY = aY;

        //每个小球都有自己的颜色
        this.red = red;
        this.green = green;
        this.blue = blue;
    };

    //保存所有形状
    var asteroids = new Array();
    for(var i = 0;i<20;i++){
        //圆点坐标
       var x = 20+(Math.random()*(canvasWidth-40));
		var y = 20+(Math.random()*(canvasHeight-40));
        var radius = 5+Math.random()*10; //半径
		var mass = radius/2;   //质量
       //速度
        var vX = Math.random()*4-2;
		var vY = Math.random()*4-2;
        var aX = 0;
        var aY = 0;
        //颜色
        var red = Math.floor(Math.random()*255);
        var green = Math.floor(Math.random()*255);
        var blue = Math.floor(Math.random()*255);
        asteroids.push(new Asteroid(x,y,radius,mass,vX,vY,aX,aY,red,green,blue));
    }

    function animate(){
        //清除
        cxt.clearRect(0,0,canvasWidth,canvasHeight);
        var red = Math.floor(Math.random()*255);
        //cxt.fillStyle = "rgb(255,255,255)";
        //更新
        var asteroidsLength = asteroids.length;
        for(var i = 0; i < asteroidsLength; i++){
            var tmpAsteroid = asteroids[i];
            cxt.fillStyle = "rgb("+tmpAsteroid.red+","+tmpAsteroid.green+","+tmpAsteroid.blue+")";
           //检测是否和其他形状碰撞
            for(var j = i+1; j < asteroidsLength; j++){
                var tmpAsteroidB = asteroids[j];
                var dX = tmpAsteroidB.x - tmpAsteroid.x;
				var dY = tmpAsteroidB.y - tmpAsteroid.y;
				var distance = Math.sqrt((dX*dX)+(dY*dY));
                if(distance < tmpAsteroid.radius + tmpAsteroidB.radius){
                    //将小球的碰撞转换为理想碰撞，并利用坐标旋转公式计算转换后的坐标和速度
                    var angle = Math.atan2(dY, dX);    //旋转角度
					var sine = Math.sin(angle);
					var cosine = Math.cos(angle);
                    var x = 0;
					var y = 0;
                    var vX = tmpAsteroid.vX * cosine + tmpAsteroid.vY * sine;
					var vY = tmpAsteroid.vY * cosine - tmpAsteroid.vX * sine;

                    var xB = dX * cosine + dY * sine;
					var yB = dY * cosine - dX * sine;
                    var vXb = tmpAsteroidB.vX * cosine + tmpAsteroidB.vY * sine;
					var vYb = tmpAsteroidB.vY * cosine - tmpAsteroidB.vX * sine;

                    //理想碰撞后改变速度和坐标
                    //vX *= -1;
                    //vXb *= -1;
                    //能量守恒和动量守恒定律求解碰撞后的速度
                    var vTotal = vX - vXb;
					vX = ((tmpAsteroid.mass - tmpAsteroidB.mass) * vX + 2 * tmpAsteroidB.mass * vXb) / (tmpAsteroid.mass + tmpAsteroidB.mass);
					vXb = vTotal + vX;
                    xB = x + (tmpAsteroid.radius + tmpAsteroidB.radius);

                    //在旋转回之前的位置
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
            //更新位置
            tmpAsteroid.x += tmpAsteroid.vX;
			tmpAsteroid.y += tmpAsteroid.vY;
            //根据加速度更新速度
            if (Math.abs(tmpAsteroid.vX) < 10) {
				tmpAsteroid.vX += tmpAsteroid.aX;
			}
			if (Math.abs(tmpAsteroid.vY) < 10) {
				tmpAsteroid.vY += tmpAsteroid.aY;
			}

            //检查是否到边界
           if (tmpAsteroid.x-tmpAsteroid.radius < 0) {
				tmpAsteroid.x = tmpAsteroid.radius; // Move away from the edge
				tmpAsteroid.vX *= -1;
				tmpAsteroid.aX *= -1;
			} else if (tmpAsteroid.x+tmpAsteroid.radius > canvasWidth) {
				tmpAsteroid.x = canvasWidth-tmpAsteroid.radius; // Move away from the edge
				tmpAsteroid.vX *= -1;
				tmpAsteroid.aX *= -1;
			};

			if (tmpAsteroid.y-tmpAsteroid.radius < 0) {
				tmpAsteroid.y = tmpAsteroid.radius; // Move away from the edge
				tmpAsteroid.vY *= -1;
				tmpAsteroid.aY *= -1;
			} else if (tmpAsteroid.y+tmpAsteroid.radius > canvasHeight) {
				tmpAsteroid.y = canvasHeight-tmpAsteroid.radius; // Move away from the edge
				tmpAsteroid.vY *= -1;
				tmpAsteroid.aY *= -1;
			};
            //绘制
            cxt.beginPath();
			cxt.arc(tmpAsteroid.x, tmpAsteroid.y, tmpAsteroid.radius, 0, Math.PI*2);
			cxt.closePath();
			cxt.fill();
        }

        if(ifPlay){
            setTimeout(animate,33);
        }
    }
    animate();
});
