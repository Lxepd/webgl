//实验1

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
	//三角形
	// vec2(-0.5,-0.5),vec2(0.5,-0.5),vec2(-0.5,0.5),
	// vec2(-0.5,0.5),vec2(0.5,-0.5),vec2(0.5,0.5)
	//三角扇
	//vec2(-0.5,-0.5),vec2(0.5,-0.5),
	//vec2(0.5,0.5),vec2(-0.5,0.5)
	//三角条带
	// vec2(-0.5,-0.5),vec2(0.5,-0.5),
	// vec2(-0.5,0.5),vec2(0.5,0.5)
	
	vec2(-0.9,-0.9),vec2(0.9,-0.9),vec2(0.9,0.9),vec2(-0.9,0.9), //白色背景   
	//阴影
	//H
	vec2(-0.5,0.8),vec2(-0.5,0.2),vec2(-0.38,0.8),vec2(-0.38,0.2),
	vec2(-0.375,0.575),vec2(-0.375,0.475),vec2(0,0.575),vec2(0,0.475),
	vec2(0.022,0.85),vec2(0.022,0.18),vec2(0.1,0.85),vec2(0.1,0.18),
	//J
	vec2(-0.15,0.18),vec2(0.27,0.18),vec2(-0.15,0.1),vec2(0.27,0.1),
	vec2(0.022,0.1),vec2(0.1,0.1),vec2(0.022,-0.3),vec2(0.1,-0.3),
	
	vec2(0.1,-0.3),vec2(0.022,-0.3),vec2(0.08,-0.4),vec2(0.02,-0.47),
    vec2(0.022,-0.47),vec2(0.022,-0.4),vec2(-0.1,-0.47),vec2(-0.1,-0.4),
	vec2(-0.1,-0.47),vec2(-0.15,-0.45),vec2(-0.1,-0.3),vec2(-0.15,-0.36),
	//非阴影
	//H
	vec2(-0.5,0.8),vec2(-0.5,0.2),vec2(-0.4,0.75),vec2(-0.4,0.15),

	vec2(-0.4,0.55),vec2(-0.4,0.45),vec2(-0.2,0.425),vec2(-0.2,0.325),
	vec2(-0.2,0.425),vec2(-0.2,0.325),vec2(0,0.6),vec2(0,0.5),   

	vec2(-0.05,0.75),vec2(-0.05,0.15),vec2(0.02,0.85),vec2(0.02,0.25),
	//J
	vec2(-0.2,0.18),vec2(0.22,0.22),vec2(-0.17,0.1),vec2(0.32,0.14),
	vec2(0.072,0.1),vec2(0.15,0.14),vec2(0.072,-0.26),vec2(0.15,-0.26),
	
	vec2(0.15,-0.3),vec2(0.072,-0.26),vec2(0.13,-0.4),vec2(-0.03,-0.43),
    vec2(0.072,-0.47),vec2(0.072,-0.36),vec2(-0.15,-0.47),vec2(-0.15,-0.36),
	vec2(-0.15,-0.47),vec2(-0.2,-0.41),vec2(-0.15,-0.3),vec2(-0.2,-0.32),
	//X
	vec2(0.4,-0.2),vec2(0.48,-0.2),vec2(0.55,-0.7),vec2(0.63,-0.7),
	vec2(0.32,-0.6),vec2(0.39,-0.6),vec2(0.62,-0.2),vec2(0.69,-0.2)
	

	//vec2(-0.05,0.75),vec2(-0.05,0.15),vec2(0.02,0.85),vec2(0.02,0.25)
	 ];
	 
	 //顶点颜色数据数组（用三角条带绘制正方形）
	 var colors = [
		 //背景
	 vec3(0.45,0.02,0.37),vec3(1.0,0.74,0.3),vec3(1.0,0.77,0.55),vec3(1.0,0.11,1.0),
	 	//阴影
		 //H
	vec3(0.0,0.0,0.0),vec3(0.0,0.0,0.0),vec3(0.0,0.0,0.0),vec3(0.0,0.0,0.0),
	vec3(0.0,0.0,0.0),vec3(0.0,0.0,0.0),vec3(0.0,0.0,0.0),vec3(0.0,0.0,0.0),
	vec3(0.0,0.0,0.0),vec3(0.0,0.0,0.0),vec3(0.0,0.0,0.0),vec3(0.0,0.0,0.0),
		//J
	vec3(0.0,0.0,0.0),vec3(0.0,0.0,0.0),vec3(0.0,0.0,0.0),vec3(0.0,0.0,0.0),
	vec3(0.0,0.0,0.0),vec3(0.0,0.0,0.0),vec3(0.0,0.0,0.0),vec3(0.0,0.0,0.0),
	vec3(0.0,0.0,0.0),vec3(0.0,0.0,0.0),vec3(0.0,0.0,0.0),vec3(0.0,0.0,0.0),

	vec3(0.0,0.0,0.0),vec3(0.0,0.0,0.0),vec3(0.0,0.0,0.0),vec3(0.0,0.0,0.0),
	vec3(0.0,0.0,0.0),vec3(0.0,0.0,0.0),vec3(0.0,0.0,0.0),vec3(0.0,0.0,0.0),

	//非阴影
		//H
	 vec3(0.0,1.0,1.0),vec3(0.0,1.0,1.0),vec3(1.0,0.35,0.0),vec3(1.0,0.35,0.0),

	 vec3(1.0,0.0,0.0),vec3(1.0,0.0,0.0),vec3(0.0,1.0,0.0),vec3(0.0,1.0,0.0),
	 vec3(0.0,0.29,0.0),vec3(0.0,0.29,0.0),vec3(0.31,0.0,0.0),vec3(0.31,0.0,0.0),

	 vec3(0.0,0.31,0.31),vec3(0.0,0.31,0.31),vec3(0.41,0.14,0.0),vec3(0.41,0.14,0.0),
	 //J
	 vec3(0.45,0.32,0.14),vec3(0.96,0.5,0.34),vec3(0.45,0.32,0.14),vec3(0.96,0.5,0.34),
	 vec3(0.0,0.84,0.19),vec3(0.33,0.0,0.65),vec3(0.0,0.84,0.19),vec3(0.33,0.0,0.65),
	 vec3(1.0,0.0,1.0),vec3(0.0,1.0,0.0),vec3(1.0,0.0,1.0),vec3(0.0,1.0,0.0),
 
	 vec3(0.0,1.0,0.0),vec3(1.0,0.0,0.0),vec3(0.0,1.0,0.0),vec3(1.0,0.0,0.0),
	 vec3(0.0,1.0,1.0),vec3(0.0,1.0,0.0),vec3(0.0,1.0,1.0),vec3(0.0,1.0,0.0),
	 //X
	 vec3(0.0,1.0,0.0),vec3(1.0,0.0,0.0),vec3(0.0,1.0,0.0),vec3(1.0,0.0,0.0),
	 vec3(0.0,1.0,1.0),vec3(0.0,1.0,0.0),vec3(0.0,1.0,1.0),vec3(0.0,1.0,0.0)
	 ];
	
	gl.viewport(0,0,canvas.width,canvas.height);
	gl.clearColor(1.0,1.0,1.0,1.0);
	
	var program = initShaders(gl,"vertex-shader","fragment-shader");
	gl.useProgram(program);
	
	//exp-1
	// var bufferId = gl.createBuffer();
	// gl.bindBuffer(gl.ARRAY_BUFFER,bufferId);
	// gl.bufferData(gl.ARRAY_BUFFER,flatten(vertices),gl.STATIC_DRAW);
	
	// var a_Position = gl.getAttribLocation(program,"a_Position");
	// if(a_Position<0)
	// {
		// alert("获取attribute变量a_Position失败！");
		// return;
	// }
	
	// gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,0,0);
	// gl.enableVertexAttribArray(a_Position);
	
	//exp-2
	var verticesBufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,verticesBufferId);
	gl.bufferData(gl.ARRAY_BUFFER,flatten(vertices),gl.STATIC_DRAW);
	
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
	
	//三角形
	//gl.drawArrays(gl.TRIANGLES,0,6);
	//三角扇
	//gl.drawArrays(gl.TRIANGLE_FAN,0,4);
	//三角条带
	//gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
	
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);
//H	
	gl.drawArrays(gl.TRIANGLE_STRIP,4,12);
//J
	gl.drawArrays(gl.TRIANGLE_STRIP,16,8);

	gl.drawArrays(gl.TRIANGLE_STRIP,24,4);

	gl.drawArrays(gl.TRIANGLE_STRIP,28,4);
	gl.drawArrays(gl.TRIANGLE_STRIP,32,4);
///////////////
	gl.drawArrays(gl.TRIANGLE_STRIP,36,8);
	gl.drawArrays(gl.TRIANGLE_STRIP,44,4);

	gl.drawArrays(gl.TRIANGLE_STRIP,48,4);
	gl.drawArrays(gl.TRIANGLE_STRIP,52,4);
///////////////
	gl.drawArrays(gl.TRIANGLE_STRIP,56,16);
///////////////
	gl.drawArrays(gl.TRIANGLE_STRIP,72,4);
	gl.drawArrays(gl.TRIANGLE_STRIP,76,4);
}