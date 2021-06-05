//实验1

var NumPoints = 50000;
var points = [];
var colors = [];

//页面加载完成后会调用此函数，函数名随意
window.onload = function main()
{
	var canvas = document.getElementById("webgl");
	if(!canvas)
	{
		alert("获取canvas元素失败！");
		return;
	}
	
	var gl = WebGLUtils.setupWebGL(canvas);
	if(!gl)
	{
		alert("获取WebGL上下文失败！");
		return;
	}
	
	var vertices = [
		vec2(-1.0,-1.0),vec2(0.0,1.0),vec2(1.0,-1.0)
	];
	
	var a = Math.random();
	var b = (1-a)*Math.random();
	var p = add(mult(a,vertices[0]),add(mult(b,vertices[1]),
				mult(1-a-b,vertices[2])));
				
	console.log("初始点p：(%f,%d)",p[0],p[1]);
	
	for(var i=0;i<NumPoints;++i)
	{
		var j=Math.floor(Math.random()*3);
		var p = mult(0.5,add(p,vertices[j]));

		points.push(p);
		colors.push(vec3(Math.random(),Math.random(),Math.random()));
	}
	gl.viewport(0,0,canvas.width,canvas.height);
	gl.clearColor(1.0,1.0,1.0,1.0);
	
	var program = initShaders(gl,"vertex-shader","fragment-shader");
	gl.useProgram(program);
	
	var verticesBufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,verticesBufferId);
	gl.bufferData(gl.ARRAY_BUFFER,flatten(points),gl.STATIC_DRAW);
	
	var a_Position = gl.getAttribLocation(program,"a_Position");
	if(a_Position<0)
	{
		alert("获取attribute变量a_Position失败！");
		return;
	}

	gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(a_Position);

	var colorBufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,colorBufferId);
	gl.bufferData(gl.ARRAY_BUFFER,flatten(colors),gl.STATIC_DRAW);

	var a_Color = gl.getAttribLocation(program,"a_Color");
	if(a_Color<0)
	{
		alert("获取attribute变量a_Color失败！");
		return;
	}

	gl.vertexAttribPointer(a_Color,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(a_Color);

	render(gl);
};

function render(gl)
{
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	gl.drawArrays(gl.POINTS,0,points.length);
}