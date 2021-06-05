var gl;
var angle1 = 0.0;
var angle2 = 0.0;
var angle3 = 0.0;

var delta1 = 200.0;
var delta2 = -200.0;
var delta3 = 20.0;

var size = 25;
var u_Angle;

var isCloseRandom = 0;
var colors = [0.0, 0.0, 0.0];

var canvas = document.getElementById("webgl");
gl = WebGLUtils.setupWebGL(canvas);
var program = initShaders(gl,"vertex-shader","fragment-shader");
var u_Color = gl.getUniformLocation(program, "u_Color");

var rSlider = document.getElementById("rColorSlide");
var gSlider = document.getElementById("gColorSlide");
var bSlider = document.getElementById("bColorSlide");

//页面加载完成后会调用此函数，函数名随意
window.onload = function main()
{

	if(!canvas)
	{
		alert("获取canvas元素失败！");
		returnl
	}
	
	
	if(!gl)
	{
		alert("获取WebGL上下文失败！");
		return;
	}
	
	var vertices = [
		vec2(0, 0), vec2(-size/2, size/2), vec2(-size/2, 0),
		vec2(0, 0), vec2(size/2, size/2), vec2(0, size/2),
		vec2(0, 0), vec2(size/2, -size/2), vec2(size/2, 0),
		vec2(0, 0), vec2(-size/2, -size/2), vec2(0, -size/2),
		
		vec2(3, size + 1), vec2(-size/2, -size/2 + 1), vec2(-size/2, size/2 + 1),
		vec2(-3, -size - 1), vec2(size/2, -size/2 - 1), vec2(size/2, size/2 - 1),
		vec2(size + 1, -3), vec2(size/2 + 1, size/2), vec2(-size/2 + 1, size/2),
		vec2(-size - 1, 3), vec2(size/2 - 1, -size/2), vec2(-size/2 - 1, -size/2),

		vec2(0, size + 12), vec2(- size - 12, 0), vec2(0, - size - 12), vec2(size + 12, 0),
		vec2(8, size + 11), vec2(- size - 11, 8), vec2(-8, - size - 11), vec2(size + 11, -8),
		vec2(16, size + 8), vec2(- size - 8, 16), vec2(-16, - size - 8), vec2(size + 8, -16),
		vec2(24, size + 3), vec2(- size - 3, 24), vec2(-24, - size - 3), vec2(size + 3, -24),
		vec2(30, size - 3), vec2(- size + 3, 30), vec2(-30, - size + 3), vec2(size - 3, -30),
		vec2(34, size - 13), vec2(- size + 13, 34), vec2(-34, - size + 13), vec2(size - 13, -34),

		vec2(0,size + 18), vec2(2, size + 16), vec2(- 2, size+16), vec2(0, size + 10),
		vec2(size + 18, 0), vec2(size + 16, 2), vec2(size+16, - 2), vec2(size + 10, 0),
		vec2(0,-size - 18), vec2(2, -size - 16), vec2(- 2, -size-16), vec2(0, -size - 10),
		vec2(-size - 18, 0), vec2(-size - 16, 2), vec2(-size-16, - 2), vec2(-size - 10, 0),
	];

	gl.clearColor(1.0,1.0,1.0,1.0);
	
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

	if(!u_Color)
	{
		alert("获取uniform变量u_Color失败！");
		return;
	}
	gl.uniform3f(u_Color,colors[0], colors[1], colors[2]);
	render();
	////////菜单
	
	if(!rSlider){
		alert("获取按钮元素rSlider失败！");
	}
	rSlider.addEventListener("change", function(event){
		colors[0] = event.target.value;
		gl.uniform3f(u_Color, colors[0], colors[1], colors[2]);
	});

	if(!gSlider){
		alert("获取按钮元素gSlider失败！");
	}
	gSlider.addEventListener("change", function(event){
		colors[1] = event.target.value;
		gl.uniform3f(u_Color, colors[0], colors[1], colors[2]);
	});

	if(!bSlider){
		alert("获取按钮元素bSlider失败！");
	}
	bSlider.addEventListener("change", function(event){
		colors[2] = event.target.value;
		gl.uniform3f(u_Color, colors[0], colors[1], colors[2]);
	});

	var myMenu = document.getElementById("mymenu");
	if(!myMenu){
		alert("获取按钮元素myMenu失败！");
	}
	myMenu.addEventListener("click", function(event){
		switch(myMenu.selectedIndex)
		{
			case 0:
				break;
			case 1:
				delta1 *= -1;
				delta2 *= -1;
				break
			case 2:
				delta1 *= 2.0;
				delta2 *= 2.0;
				break;
			case 3:
				delta1 /= 2.0;
				delta2 /= 2.0;
				break;
		}
	});

	var colorRandom = document.getElementById("colorrandom");
	if(!colorRandom){
		alert("获取按钮元素colorRandom失败！");
	}
	colorRandom.addEventListener("click", function(){
		isCloseRandom = colorRandom.selectedIndex;
	});

	var AngleSlide = document.getElementById("angleslide");
	AngleSlide.addEventListener("change", function(event){
		delta1 = event.target.value;
	});
};

window.onresize = function(){
	var rect = canvas.getBoundingClientRect();
	canvas.width = innerWidth - 2 * rect.left;
	canvas.height = innerHeight - 80;

	if(canvas.width > canvas.height)
		gl.viewport((canvas.width - canvas.height)/2, 0,
		canvas.height, canvas.height);
	else
		gl.viewport(0, (canvas.height - canvas.width)/2,
		canvas.width, canvas.width);
}

var lastTime = Date.now();
var colorTime = 0.0;

function render()
{
	var nowTime = Date.now();
	var elapsed = nowTime - lastTime;
	lastTime = nowTime;

	angle1 += delta1 * elapsed / 500.0;
	angle1 %= 360;

	angle2 += delta2 * elapsed / 500.0;
	angle2 %= 360;

	angle3 += delta3 * elapsed / 1000.0;
	angle3 %= 360;

	colorTime += elapsed / 1000.0;
	if(colorTime > 1.5 && isCloseRandom == 0)
	{
		colorTime= 0 ;
		RandomColor();
	}
	//console.log(colors[0]);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.uniform1f(u_Angle, angle1);
	gl.drawArrays(gl.TRIANGLES,0,24);

	gl.uniform1f(u_Angle, angle2);
	gl.drawArrays(gl.LINE_LOOP,24,4);
	gl.drawArrays(gl.LINE_LOOP,28,4);
	gl.drawArrays(gl.LINE_LOOP,32,4);
	gl.drawArrays(gl.LINE_LOOP,36,4);
	gl.drawArrays(gl.LINE_LOOP,40,4);
	gl.drawArrays(gl.LINE_LOOP,44,4);

	gl.uniform1f(u_Angle, angle3);
	gl.drawArrays(gl.TRIANGLE_STRIP,48,4);
	gl.drawArrays(gl.TRIANGLE_STRIP,52,4);
	gl.drawArrays(gl.TRIANGLE_STRIP,56,4);
	gl.drawArrays(gl.TRIANGLE_STRIP,60,4);

	requestAnimationFrame(render);
}

function RandomColor()
{
	
	colors[0] +=0.1;
	if(colors[0] = 1.0)
		colors[0] = Math.random()*1.0;
	rSlider.value = colors[0];

	colors[1] +=0.1;
	if(colors[1] = 1.0)
		colors[1] = Math.random()*1.0;
	gSlider.value = colors[1];

	colors[2] +=0.1;
	if(colors[2] = 1.0)
		colors[2] = Math.random()*1.0;
	bSlider.value = colors[2];

	gl.uniform3f(u_Color,colors[0], colors[1], colors[2]);
}