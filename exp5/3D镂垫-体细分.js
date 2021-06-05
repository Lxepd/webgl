var colors = [
vec3(1.0, 0.0, 0.0),
vec3(0.0, 1.0, 0.0),
vec3(0.0, 0.0, 1.0),
vec3(0.0, 0.0, 0.0)
];
var attributes = [];

var NumTimesToSubdivide = 4; //递归次数
var NumTetrahedrons = Math.pow(4, NumTimesToSubdivide);
var NumTriangles = 4 * NumTetrahedrons; //产生的三角形个数
var NumVertices = 3 * NumTriangles; //顶点数

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
	vec3(0.0, 0.0, -1.0),vec3(0.0, 0.942809, -0.333333),
	vec3(-0.816497, -0.471405, -0.333333),vec3(0.816497, -0.471405, -0.333333)
	];
	
	//递归细分原始三角形
	divideTetra(vertices[0], vertices[1],vertices[2], vertices[3],
		NumTimesToSubdivide);
	
	gl.viewport(0,0,canvas.width,canvas.height);
	gl.clearColor(1.0,1.0,1.0,1.0);
	gl.enable(gl.DEPTH_TEST);
	
	var program = initShaders(gl,"vertex-shader","fragment-shader");
	gl.useProgram(program);
	
	var verticesBufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,verticesBufferId);
	gl.bufferData(gl.ARRAY_BUFFER,flatten(attributes),gl.STATIC_DRAW);
	attributes.length = 0;
	
	var a_Position = gl.getAttribLocation(program,"a_Position");
	if(a_Position<0)
	{
		alert("获取attribute变量a_Position失败！");
		return;
	}
	
	gl.vertexAttribPointer(a_Position,3,gl.FLOAT,false,Float32Array.BYTES_PER_ELEMENT * 6,0);
	gl.enableVertexAttribArray(a_Position);
	
	var a_Color = gl.getAttribLocation(program, "a_Color");
	if(a_Color < 0){
			alert("获取attribute变量a_Color失败！");
			return;
	}
	
	gl.vertexAttribPointer(a_Color,
		3,
		gl.FLOAT,
		false,
		Float32Array.BYTES_PER_ELEMENT * 6,
		Float32Array.BYTES_PER_ELEMENT * 3);
	gl.enableVertexAttribArray(a_Color);
	
	render(gl);
};

function render(gl)
{
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	gl.drawArrays(gl.TRIANGLES,0,NumVertices);
}

//将三角形的顶点坐标加入数组中
//a，b，c为三角形三个顶点坐标
function triangle(a,b,c, colorIndex)
{
	attributes.push(a);
	attributes.push(colors[colorIndex]);
	attributes.push(b);
	attributes.push(colors[colorIndex]);
	attributes.push(c);
	attributes.push(colors[colorIndex]);
}
//生成四面体，参数为四面体的4个顶点
function tetra(a, b, c, d){
	triangle(a, b, c, 0);
	triangle(a, c, d, 1);
	triangle(a, d, b, 2);
	triangle(b, d, c, 3);
}

//递归细分三角形
//k用于控制细分次数
function divideTetra(a,b,c,d,k)
{
	var mid = [];
	if(k>0)
	{
		//计算三角形各边的中点
		mid[0] = mult(0.5, add(a, b));
		mid[1] = mult(0.5, add(a, c));
		mid[2] = mult(0.5, add(a, d));
		mid[3] = mult(0.5, add(b, c));
		mid[4] = mult(0.5, add(c, d));
		
		mid[5] = mult(0.5, add(b, d));
		//细分4个四面体
		divideTetra(a,mid[0], mid[1], mid[2], k-1);
		divideTetra(mid[0], b, mid[3], mid[5], k-1);
		divideTetra(mid[1], mid[3], c, mid[4], k-1);
		divideTetra(mid[2], mid[5], mid[4], d, k-1);
	}
	else
		tetra(a,b,c,d); // 递归结束时“绘制”三角形
}