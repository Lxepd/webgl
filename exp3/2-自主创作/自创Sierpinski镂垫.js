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
		vec2(0,0),vec2(-0.2,-0.1),vec2(0.2,-0.1),vec2(1.1,0.2),vec2(0,1.2),vec2(0,-1.2),vec2(-1.1,0.2),
		vec2(1.1,0.2),vec2(-1.1,0.2)
		
		
	];
	
	  var a = Math.random();
	  var b = -Math.random();
	  var c = -(a+b)/2*Math.random()* 0.6;
	  var d = -a/2-(b/2) * Math.random();

	  var p = add(add(mult(1-a+c/2,vertices[4]),mult(1-b+d*0.7,vertices[1])),add(mult(c+d/2,vertices[0]),mult(d+c/2+a*0.7,vertices[3])));

	console.log("初始点p：(%f,%d)",p[0],p[1]);
	
	for(var i=0;i<NumPoints;++i)
	{
		 var j=Math.floor(Math.random()*9);
		 var p = mult(0.4,add(p,vertices[j]));
		 points.push(p);

		//colors.push(vec3(Math.random(),Math.random(),Math.random()));
		colors.push(vec3(1.0,0.57,Math.random()*0.6));
	}

	gl.viewport(0,0,canvas.width,canvas.height);
	gl.clearColor(0.0,0.0,0.0,1.0);
	
	var program = initShaders(gl,"vertex-shader","fragment-shader");
	gl.useProgram(program);
	
	var verticesBufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,verticesBufferId);
	gl.bufferData(gl.ARRAY_BUFFER,flatten(points),gl.STATIC_DRAW);
	
	 a_Position = gl.getAttribLocation(program,"a_Position");
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