var MaxNumSquares = 1000; //最多支持1000个正方形
//顶点数，每个正方形含2个三角形，即6个顶点
var MaxNumVertices = MaxNumSquares * 6;
var count = 0; //正方形数目
var canvas; // canvas元素
var gl; //WebGL上下文

var clearpencount = 0;

var drawRect = false;
var lasttime = 0;
var pentype = 0;
var distance = 125;

var ssize = 0.5;

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

    canvas.onmousedown = function(){
        if (event.button == 0)
        {
            //addSquare(event.clientX, event.clientY);
            drawRect = true;
        }
    };
    canvas.onmouseup = function(){
        if (event.button == 0)
            drawRect = false;
    };
    canvas.onmousemove = function(){
        if (drawRect) {
            var nowtime = Date.now();
            var elapsed = nowtime - lasttime; //毫秒
            if (elapsed > distance) {
                lasttime = nowtime;
                addSquare(event.clientX, event.clientY);
            }
        }
    };

	gl.clear(gl.COLOR_BUFFER_BIT);

    var penmenu = document.getElementById("penkind");
    penmenu.onclick = function(){
        pentype = event.target.value;
    };
    var drslider = document.getElementById("drawslider");
    drslider.onchange = function(){
        distance = event.srcElement.value;
    };
    var sislider = document.getElementById("sizeslider");
    sislider.onchange = function(){
        ssize = event.srcElement.value;
    };
};

function render()
{
	gl.clear(gl.COLOR_BUFFER_BIT);

    for(var i = 0; i< count; i++)
    {
        gl.drawArrays(gl.TRIANGLES,i * 25, 15);
        gl.drawArrays(gl.LINE_LOOP,i * 25 + 15, 4);
        gl.drawArrays(gl.LINE_LOOP,i * 25 + 19, 4);
        gl.drawArrays(gl.LINE_LOOP,i * 25 + 23, 2);
    }

};

function addSquare(x, y){
    if (count >= MaxNumSquares) {
        alert("到达上限！");
        return;
    }

    //获取canvas在页面窗口坐标系下的矩形
    var rect = canvas.getBoundingClientRect();
    //从页面客户区窗口坐标转换为WebGL建模坐标
    x -= rect.left;
    y = canvas.height - (y - rect.top);

    //新Square的顶点数据（须和颜色数据一样是三维的）
    var vertices1 = [
        vec3(x - 25 * ssize, y + 30 * ssize, 0), vec3(x - 25 * ssize, y, 0),
        vec3(x + 25 * ssize, y - 15 * ssize, 0), vec3(x + 25 * ssize, y - 15 * ssize, 0),
        vec3(x - 25 * ssize, y + 30 * ssize, 0),  vec3(x + 25 * ssize, y + 15 * ssize, 0),

        vec3(x - 25 * ssize, y + 20 * ssize, 0), vec3(x - 25 * ssize, y + 10 * ssize, 0),
        vec3(x + 25 * ssize, y - 5 * ssize, 0), vec3(x - 25 * ssize, y + 20 * ssize, 0),
        vec3(x + 25 * ssize, y - 5 * ssize, 0), vec3(x + 25 * ssize, y + 5 * ssize, 0),

        vec3(x - 25 * ssize, y + 30 * ssize, 0), vec3(x + 25 * ssize, y + 15 * ssize, 0),
        vec3(x + 25 * ssize, y + 35 * ssize, 0),
/////////////////////////
        vec3(x - 25 * ssize, y + 30 * ssize, 0), vec3(x - 25 * ssize, y, 0),
        vec3(x + 25 * ssize, y - 15 * ssize, 0), vec3(x + 25 * ssize, y + 35 * ssize, 0),

        vec3(x - 25 * ssize, y + 20 * ssize, 0),
        vec3(x - 25 * ssize, y + 10 * ssize, 0),
        vec3(x + 25 * ssize, y - 5 * ssize, 0),
        vec3(x + 25 * ssize, y + 5 * ssize, 0),

        vec3(x - 25 * ssize, y + 30 * ssize, 0),
        vec3(x + 25 * ssize, y + 15 * ssize, 0)

    ];

    //随机得到新正方形的颜色
    var colors = [
        vec3(1.0, 1.0, 0.24), vec3(1.0, 0.73, 0.92), vec3(1.0, 1.0, 1.0),
        vec3(0.0, 0.0, 0.0),
    ];
    var data = []; //新Square的坐标和颜色数据（交织在一起）
    
    for(var i = 0;i < 6; i++)
    {
        data.push(vertices1[i]);
                data.push(colors[0]);
    }
    for(var i = 6;i < 12; i++)
    {
        data.push(vertices1[i]);
        data.push(colors[1]);
    }
    for(var i = 12;i < 15; i++)
    {
        data.push(vertices1[i]);
        data.push(colors[2]);
    }
    for(var i = 15;i < 25; i++)
    {
        data.push(vertices1[i]);
        data.push(colors[3]);
    }
    
    count++; //正方形数目加

    vertices1.length = 0; //清空vertices数组
    gl.bufferSubData(gl.ARRAY_BUFFER,
        (count * 25 * 2 * 3 + clearpencount * 25 * 2 * 3) * Float32Array.BYTES_PER_ELEMENT, //偏移量
        flatten(data));
    data.length = 0; //清空data数组

    requestAnimFrame(render); //请求刷新显示
}