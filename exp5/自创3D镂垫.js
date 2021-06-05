//颜色
var colors = [
vec3(1.0, 0.65, 0.4),
vec3(0.4, 0.26, 0.8),
vec3(0.5, 0.25, 0.66),
];
var diycolors = [
vec3(0.5, 0.47, 0.6),
vec3(0.64, 0.2, 0.9),
vec3(0.25, 0.6, 0.46),
vec3(0.9, 0.5, 0.9)
];

var attributes = [];

var NumTimesToSubdivide = 4; //递归次数
var NumTetrahedrons = Math.pow(4, NumTimesToSubdivide);
var NumTriangles = 4 * NumTetrahedrons; //产生的三角形个数
var NumVertices = 21 * NumTriangles; //顶点数

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
	vec3(-0.35, 0.32, -1.0),
	vec3(0.0, 0.9, 0.0), vec3(0.0, 0.3, 0.0), vec3(-1.0, 0.0, 0.0),
	
	vec3(0.35, 0.32, -1.0),
	vec3(0.0, 0.9, 0.0), vec3(0.0, 0.3, 0.0), vec3(1.0, 0.0, 0.0),

	vec3(0.35, -0.32, -1.0),
	vec3(1.0, 0.0, 0.0), vec3(0.0, -0.9, 0.0), vec3(0.0, -0.3, 0.0),

	vec3(-0.35, -0.32, -1.0),
	vec3(-1.0, 0.0, 0.0), vec3(0.0, -0.9, 0.0), vec3(0.0, -0.3, 0.0),

	vec3(-0.8,0.8, 0.0), vec3(-0.8,-0.8, 0.0), vec3(0.8,-0.8, 0.0), vec3(0.8,0.8, 0.0),
	vec3(0.0,0.0, -1.0)
	];
	
	//递归细分原始三角形
	divideTetra(vertices[0], vertices[1],vertices[2], vertices[3],
		NumTimesToSubdivide);
	 divideTetra(vertices[4], vertices[5],vertices[6], vertices[7],
		NumTimesToSubdivide);
	divideTetra(vertices[8], vertices[9],vertices[10], vertices[11],
		NumTimesToSubdivide);
	divideTetra(vertices[12], vertices[13],vertices[14], vertices[15],
 		NumTimesToSubdivide);
	diy(vertices[16], vertices[17],vertices[18], vertices[19],vertices[20],
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
	{
		tetra(a,b,c,d); // 递归结束时“绘制”三角形
	}
}
//生成四面体，参数为四面体的4个顶点
function tetra(a, b, c, d)
{
	triangle(a, b, c, 0);
	triangle(a, c, d, 1);
	triangle(a, d, b, 2);
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

function diy(a,b,c,d,e,k)
{
	var yid = [];
	if(k>0)
	{
		yid[0] = mult(0.5, add(a,b));
		yid[1] = mult(0.5, add(a,d));
		yid[2] = mult(0.5, add(d,c));
		yid[3] = mult(0.5, add(b,c));

		yid[4] = mult(0.25, add(a,e));
		yid[5] = mult(0.25, add(b,e));
		yid[6] = mult(0.25, add(c,e));
		yid[7] = mult(0.25, add(d,e));

		yid[8] = mult(0.69, add(yid[4],e));
		yid[9] = mult(0.69, add(yid[5],e));
		yid[10] = mult(0.69, add(yid[6],e));
		yid[11] = mult(0.69, add(yid[7],e));

		diy(yid[4], e, yid[0], yid[1], yid[8], k-1);
		diy(yid[5], e, yid[0], yid[3], yid[9], k-1);
		diy(yid[6], e, yid[2], yid[3], yid[10], k-1);
		diy(yid[7], e, yid[2], yid[1], yid[11], k-1);
	}
	else
	{
		diytetra(a,b,c,d,e); // 递归结束时“绘制”三角形
	}
}
function diytetra(a, b, c, d, e)
{
	diytriangle(e,a,b, 0);
	diytriangle(e,b,c, 1);
	diytriangle(e,c,d, 2);
	diytriangle(e,d,a, 3);
}

function diytriangle(a,b,c, colorIndex)
{
	attributes.push(a);
	attributes.push(diycolors[colorIndex]);
	attributes.push(b);
	attributes.push(diycolors[colorIndex]);
	attributes.push(c);
	attributes.push(diycolors[colorIndex]);
}