var MaxNumSquares = 1000; //最多支持1000个正方形
//顶点数，每个正方形含2个三角形，即6个顶点
var MaxNumVertices = MaxNumSquares * 6;
var HalfSize = 5.0; //正方形边长的一半
var count = 0; //正方形数目
var canvas; // canvas元素
var gl; //WebGL上下文

var drawRect = false;

window.onload = function main()
{
	canvas = document.getElementById("webgl");
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
	
	gl.viewport(0,0,canvas.width,canvas.height);
	gl.clearColor(0.9, 0.9, 0.9, 1.0);

	var program = initShaders(gl,"vertex-shader","fragment-shader");
	gl.useProgram(program);
	
	var dataBufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,dataBufferId);
	gl.bufferData(gl.ARRAY_BUFFER, 
        Float32Array.BYTES_PER_ELEMENT * 6 * MaxNumVertices
        ,gl.STATIC_DRAW);
	
	var a_Position = gl.getAttribLocation(program,"a_Position");
	if(a_Position<0)
	{
		alert("获取attribute变量a_Position失败！");
		return;
	}
	
	gl.vertexAttribPointer(a_Position, 
        3, 
        gl.FLOAT, 
        false, 
        Float32Array.BYTES_PER_ELEMENT * 6,
        0);
	gl.enableVertexAttribArray(a_Position);

    var a_Color = gl.getAttribLocation(program, "a_Color");
    if(a_Color < 0)
    {
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

    var u_matMVP = gl.getUniformLocation(program, "u_matMVP");
    if(!u_matMVP)
    {
        alert("获取attribute变量u_matMVP失败！");
    }
    var matProj = ortho2D(0, canvas.width, 0, canvas.height);
    gl.uniformMatrix4fv(u_matMVP, false, flatten(matProj));

    canvas.addEventListener("click", function(event){
         addSquare(event.clientX, event.clientY);
     });

   canvas.onmousedown = function(){
       if(event.button == 0)
        drawRect = true;
   };
   canvas.onmouseup = function(){
       if(event.button == 0)
        drawRect = false;
   };
   canvas.onmousemove = function(){
       if(drawRect)
        addSquare(event.clientX, event.clientY);
   }

	gl.clear(gl.COLOR_BUFFER_BIT);
};

var ssize = HalfSize;

function render()
{
    HalfSize = ssize;
    var MaxHalfSize = Math.random() * 5.0;
    HalfSize *= MaxHalfSize;

	gl.clear(gl.COLOR_BUFFER_BIT);
	
	gl.drawArrays(gl.TRIANGLES,0, count * 6);
};

function addSquare(x, y){
    //到上限则不再添加
    if(count >= MaxNumSquares)
    {
        alert("正方形数目已到达上限！");
        return;
    }
    //获取canvas在页面窗口坐标系下的矩形
    var rect = canvas.getBoundingClientRect();
    //从页面客户区窗口坐标转换为WebGL建模坐标
    x -= rect.left;
    y = canvas.height - (y - rect.top);

    //新Square的顶点数据（须和颜色数据一样是三维的）
    var vertices = [
        vec3(x - HalfSize, y + HalfSize, 0), //左上
        vec3(x - HalfSize, y - HalfSize, 0), //左下
        vec3(x + HalfSize, y - HalfSize, 0), //右下
        vec3(x - HalfSize, y + HalfSize, 0), //左上
        vec3(x + HalfSize, y - HalfSize, 0), //右下
        vec3(x + HalfSize, y + HalfSize, 0), //右上
    ];

    // 随机得到4个顶点的颜色
	var colorLeftUp = vec3(Math.random(), Math.random(), Math.random());
	var colorLeftDown = vec3(Math.random(), Math.random(), Math.random());
	var colorRightUp = vec3(Math.random(), Math.random(), Math.random());
	var colorRightDown = vec3(Math.random(), Math.random(), Math.random());
	
	var colors = [// 新Square的顶点颜色数据
		colorLeftUp, colorLeftDown, colorRightDown,
		colorLeftUp, colorRightDown, colorRightUp
	];
	
	// 随机得到新正方形的颜色
	var data = []; // 新Square的坐标和颜色数据(交织在一起)
	for(var i = 0; i < 6; i++){
		data.push(vertices[i]);	
		data.push(colors[i]);
	}

    /*
    //随机得到新正方形的颜色
    var randColor = vec3(Math.random(), Math.random(), Math.random());
    var data = []; //新Square的坐标和颜色数据（交织在一起）
    
    for(var i = 0;i <6; i++)
    {
        data.push(vertices[i]);
        data.push(randColor);
    }*/
    vertices.length = 0; //清空vertices数组


    //加载顶点位置数据（含坐标和颜色）
    gl.bufferSubData(gl.ARRAY_BUFFER,
        count * 6 * 2 * 3 * Float32Array.BYTES_PER_ELEMENT, //偏移量
        flatten(data));
    data.length = 0; //清空data数组

    count++; //正方形数目加 1

    requestAnimFrame(render); //请求刷新显示
}