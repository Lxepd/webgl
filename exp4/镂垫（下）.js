var NumTimesToSubdivide = 3; //递归次数
var NumTriangles = Math.pow(3, NumTimesToSubdivide); //产生的三角形个数
var NumVertices = 3 * NumTriangles; //顶点数

var points = [];

//页面加载完成后会调用此函数，函数名随意
window.onload = function main()
{
	var canvas = document.getElementById("webgl");
	if(!canvas)
	{
		alert("获取canvas元素失败！");
		returnl
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
	
	//递归细分原始三角形
	divideTriangle(vertices[0], vertices[1],vertices[2],
		NumTimesToSubdivide);
	
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
	
	render(gl);
};

function render(gl)
{
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	gl.drawArrays(gl.TRIANGLES,0,NumVertices);
}

//将三角形的顶点坐标加入数组中
//a，b，c为三角形三个顶点坐标
function triangle(a,b,c)
{
	points.push(a);
	points.push(b);
	points.push(c);
}

//递归细分三角形
//k用于控制细分次数
function divideTriangle(a,b,c,k)
{
	if(k>0)
	{
		//计算三角形各边的中点
		var ab = mult(0.5,add(a,b));
		var ac = mult(0.5,add(a,c));
		var bc = mult(0.5,add(b,c));
		
		//除了中间的三角形，继续细分其他三角形
		divideTriangle(a,ab,ac,k-1);
		divideTriangle(c,ac,bc,k-1);
		divideTriangle(b,bc,ab,k-1);
	}
	else
		triangle(a,b,c); // 递归结束时“绘制”三角形
}