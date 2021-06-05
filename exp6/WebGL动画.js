var gl;
var angle = 0.0;
var delta = 60.0;
var size = 25;
var u_Angle;


//页面加载完成后会调用此函数，函数名随意
window.onload = function main()
{
	var canvas = document.getElementById("webgl");
	if(!canvas)
	{
		alert("获取canvas元素失败！");
		returnl
	}
	
	gl = WebGLUtils.setupWebGL(canvas);
	if(!gl)
	{
		alert("获取WebGL上下文失败！");
		return;
	}
	
	var vertices = [
		vec2(-size, -size), vec2(size, -size),
		vec2(size, size), vec2(-size, size)
	];

	gl.clearColor(0.0,0.0,0.0,1.0);
	
	var program = initShaders(gl,"vertex-shader","fragment-shader");
	gl.useProgram(program);
	
	var bufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,bufferId);
	gl.bufferData(gl.ARRAY_BUFFER,flatten(vertices),gl.STATIC_DRAW);

	var a_Position = gl.getAttribLocation(program,"a_Position");
	if(a_Position<0)
	{
		alert("获取attribute变量a_Position失败！");
		return;
	}
	
	gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(a_Position);
	
	u_Angle = gl.getUniformLocation(program, "u_Angle");
	if(!u_Angle)
	{
		alert("获取uniform变量u_Angle失败！");
		return;
	}

	var u_matProj = gl.getUniformLocation(program, "u_matProj");
	if(!u_matProj)
	{
		alert("获取uniform变量u_matProj失败！");
		return;
	}

	var matProj = ortho2D(-size * 2, size * 2, -size * 2 ,size * 2);
	gl.uniformMatrix4fv(u_matProj, false, flatten(matProj));

	var u_Color = gl.getUniformLocation(program, "u_Color");
	if(!u_Color)
	{
		alert("获取uniform变量u_Color失败！");
		return;
	}
	gl.uniform3f(u_Color, 1.0, 1.0, 1.0);

	render();

	////////菜单
	var myMenu = document.getElementById("mymenu");
	if(!myMenu){
		alert("获取按钮元素myMenu失败！");
	}
	myMenu.addEventListener("click", function(event){
		switch(myMenu.selectedIndex)
		{
			case 0:
				delta *= -1;
				break
			case 1:
				delta *= 2.0;
				break;
			case 2:
				delta /= 2.0;
				break;
		}
	});
	/////////
	var colorMenu = document.getElementById("ColorMenu");
	if(!colorMenu){
		alert("获取按钮元素colorMenu失败！");
	}
	colorMenu.addEventListener("mousedown", function(event){
		switch(event.target.index){
			case 0:
				gl.uniform3f(u_Color,1.0,1.0,1.0);
				break
			case 1:
				gl.uniform3f(u_Color,1.0,0.0,0.0);
				break;
			case 2:
				gl.uniform3f(u_Color,0.0,1.0,0.0);
				break;
			case 3:
				gl.uniform3f(u_Color,0.0,0.0,1.0);
				break;
		}
	});
	////////
	var mySlider = document.getElementById("slide");
	mySlider.addEventListener("change", function(event){
		delta = event.target.value;
	});
	

	window.onresize = function(){
		var rect = canvas.getBoundingClientRect();
		canvas.width = innerWidth - 2 * rect.left;
		canvas.height = innerHeight - 50;

		if(canvas.width > canvas.height)
			gl.viewport((canvas.width - canvas.height)/2, 0,
			canvas.height, canvas.height);
		else
			gl.viewport(0, (canvas.height - canvas.width)/2,
			canvas.width, canvas.width);
	}
};

var lastTime = Date.now();

function render()
{
	var nowTime = Date.now();
	var elapsed = nowTime - lastTime;
	lastTime = nowTime;

	angle += delta * elapsed / 1000.0;
	angle %= 360;

	gl.uniform1f(u_Angle, angle);

	gl.clear(gl.COLOR_BUFFER_BIT);
	
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);

	requestAnimationFrame(render);
}