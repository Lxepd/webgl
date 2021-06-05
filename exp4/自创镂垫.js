var NumTimesToSubdivide = 4; //递归次数
var NumTriangles = Math.pow(30, NumTimesToSubdivide); //产生的三角形个数
var NumVertices = 4 * NumTriangles; //顶点数

var points = [];
var colors = [];

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
	vec2(-1.0,-1.0),vec2(0.0,1.0),vec2(1.0,-1.0),
	vec2(1.0,1.0)
	];
	// var colors = [
	// 	vec3(1.0,1.0,0.0),vec3(0.0,1.0,0.0),vec3(0.0,0.0,1.0)
	// ];

	//递归细分原始三角形
	divideTriangle(vertices[0], vertices[1],vertices[2],
		NumTimesToSubdivide);

	gl.viewport(0,0,canvas.width,canvas.height);
	gl.clearColor(0.0,0.0,0.0,1.0);
	
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
	
	/*将顶点颜色属性数据传输到GPU*/
	var colorsBufferId = gl.createBuffer(); //创建Buffer
	// 将id为colorsBufferId的buffer绑定为当前Array Buffer
	gl.bindBuffer(gl.ARRAY_BUFFER,colorsBufferId);
	// 为当前Array Buffer提供数据，传输到GPU
	gl.bufferData(gl.ARRAY_BUFFER, // Buffer类型
		flatten(colors), // Buffer数据来源，flatten将colors转换为GPU可接受的格式
		gl.STATIC_DRAW); // 表明将如何使用Buffer（STATIC_DRAW表明是一次提供数据，多遍绘制）
	
	/*为shader属性变量与buffer数据建立关联*/
	// 获取名称为"a_Color"的shader attribute变量的位置
	var a_Color = gl.getAttribLocation(program,"a_Color");
	if(a_Color<0)// getAttribLocation获取失败则返回-1
	{
		alert("获取attribute变量a_Color失败！");
		return;
	}
	// 指定利用当前Array Buffer为a_Color提供数据的具体方式
	gl.vertexAttribPointer(a_Color, // shader attribute变量位置
		3, // 每个顶点属性有3个分量
		gl.FLOAT, // 数组数据类型(浮点型)
		false, // 不进行归一化处理
		0, // 相邻顶点属性地址相差0个字节
		0); // 从第一个顶点属性在Buffer中偏移量为0字节
	gl.enableVertexAttribArray(a_Color); // 启用顶点属性数组
	

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

		for(var i=0;i<5;i++)
		{
		//计算三角形各边的中点
		var ab = mult(0.5*Math.cos(i*3.14/2),add(a,b));
		var ac = mult(0.5*Math.cos(i*3.14/2),add(a,c));
		var bc = mult(0.5*Math.cos(i*3.14/2),add(b,c));
		
		var pp = 20;
		var aab = mult(0.5*Math.sin(i*3.14/pp),add(a,ab));
		var bab = mult(0.5*Math.sin(i*3.14/pp),add(b,ab));
		var bbc = mult(0.5*Math.sin(i*3.14/pp),add(b,bc));
		var cbc = mult(0.5*Math.sin(i*3.14/pp),add(c,bc));
		var cca = mult(0.5*Math.sin(i*3.14/pp),add(c,ac));
		var aca = mult(0.5*Math.sin(i*3.14/pp),add(a,ac));
		
		//除了中间的三角形，继续细分其他三角形
		divideTriangle(a,aab,aca,k-1);
		divideTriangle(b,bbc,bab,k-1);
		divideTriangle(c,cca,cbc,k-1);
		
		divideTriangle(ab,bc,ac,k-1);
		}
	}
	else
	{

		triangle(a,b,c); // 递归结束时“绘制”三角形
		colors.push(vec3(1.0,1.0,1.0));
		colors.push(vec3(0.0,1.0,0.0));
		colors.push(vec3(1.0,1.0,1.0));
		
		
	}
}