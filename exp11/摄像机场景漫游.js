// MovingCamera.js
 
// 全局变量
var gl;						// WebGL上下文

var mvpStack = [];  // 模视投影矩阵栈，用数组实现，初始为空
var matProj;	    // 投影矩阵
var matCamera = mat4();

var a_Position;  	// shader中attribute变量a_Position的索引
var u_MVPMatrix;	// Shader中uniform变量"u_MVPMatrix"的索引

var sizeGround = 20.0;
var numVerticesGround;
var bufferGround;

var numSpheres = 50;
var posSphere = [];
var sphereRadius = .2
var numVerticesSphere;
var bufferSphere;

var yRot = .0;
var deltaAngle = 60.0;

var numVerticesTorus;
var bufferTorus;

function initTorus(){
	var ptTorus = buildTorus(.4, .2, 40, 20);
	
	bufferTorus = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferTorus);
	gl.bufferData(gl.ARRAY_BUFFER,
		flatten(ptTorus),
		gl.STATIC_DRAW);
	ptTorus.length = 0;
}
function buildTorus(majorRadius, minorRadius, numMajor, numMinor){
	var ptTorus = []; // 用于存放圆环顶点坐标的数组
	numVerticesTorus = numMajor * numMinor * 6; // 顶点数

	var majorStep = 2.0 * Math.PI / numMajor;
	var minorStep = 2.0 * Math.PI / numMinor;

	for(var i = 0; i < numMajor; ++i){
		var a0 = i * majorStep;
		var a1 = a0 + majorStep;
		var x0 = Math.cos(a0);
		var y0 = Math.sin(a0);
		var x1 = Math.cos(a1);
		var y1 = Math.sin(a1);

		for(var j = 0; j < numMinor; ++j){
			var b0 = j * minorStep;
			var b1 = b0 + minorStep;
			var c0 = Math.cos(b0);
			var r0 = minorRadius * c0 + majorRadius;
			var z0 = minorRadius * Math.sin(b0);
			var c1 = Math.cos(b1);
			var r1 = minorRadius * c1 + majorRadius;
			var z1 = minorRadius * Math.sin(b1);

			var left0 = vec3(x0*r0, y0*r0, z0);
			var right0 = vec3(x1*r0, y1*r0, z0);
			var left1 = vec3(x0*r1, y0*r1, z1);
			var right1 = vec3(x1*r1, y1*r1, z1);
			ptTorus.push(left0);
			ptTorus.push(right0);
			ptTorus.push(left0);
			ptTorus.push(left1);
			ptTorus.push(left1);
			ptTorus.push(right0);
		}
	}
	return ptTorus;
}

function initSphere(){
	for(var iShpere = 0; iShpere < numSpheres; iShpere++){
		var x = Math.random()*sizeGround*2-sizeGround;
		var z = Math.random()*sizeGround*2-sizeGround;
		posSphere.push(vec2(x,z));
	}
	
	var ptSphere = buildSphere(sphereRadius, 15, 15);
	
	bufferSphere = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferSphere);
	gl.bufferData(gl.ARRAY_BUFFER,
		flatten(ptSphere),
		gl.STATIC_DRAW);
	ptSphere.length = 0;
	
	gl.vertexAttribPointer(
		a_Position,
		3,
		gl.FLOAT,
		false,
		0,
		0);
}
function buildSphere(radius, columns, rows){
	var vertices = []; // 存放不同顶点的数组

	for (var r = 0; r <= rows; r++){
		var v = r / rows;  // v在[0,1]区间
		var theta1 = v * Math.PI; // theta1在[0,PI]区间

		var temp = vec3(0, 0, 1);
		var n = vec3(temp); // 实现Float32Array深拷贝
		var cosTheta1 = Math.cos(theta1);
		var sinTheta1 = Math.sin(theta1);
		n[0] = temp[0] * cosTheta1 + temp[2] * sinTheta1;
		n[2] = -temp[0] * sinTheta1 + temp[2] * cosTheta1;
		
		for (var c = 0; c <= columns; c++){
			var u = c / columns; // u在[0,1]区间
			var theta2 = u * Math.PI * 2; // theta2在[0,2PI]区间
			var pos = vec3(n);
			temp = vec3(n);
			var cosTheta2 = Math.cos(theta2);
			var sinTheta2 = Math.sin(theta2);
			
			pos[0] = temp[0] * cosTheta2 - temp[1] * sinTheta2;
			pos[1] = temp[0] * sinTheta2 + temp[1] * cosTheta2;
			
			var posFull = mult(pos, radius);
			
			vertices.push(posFull);
		}
	}

	/*生成最终顶点数组数据(使用线段进行绘制)*/
	var spherePoints = []; // 用于存放球顶点坐标的数组

	var colLength = columns + 1;
	for (var r = 0; r < rows; r++){
		var offset = r * colLength;

		for (var c = 0; c < columns; c++){
			var ul = offset  +  c;						// 左上
			var ur = offset  +  c + 1;					// 右上
			var br = offset  +  (c + 1 + colLength);	// 右下
			var bl = offset  +  (c + 0 + colLength);	// 左下

			// 由两条经线和纬线围成的矩形
			// 只绘制从左上顶点出发的3条线段
			spherePoints.push(vertices[ul]);
			spherePoints.push(vertices[ur]);
			spherePoints.push(vertices[ul]);
			spherePoints.push(vertices[bl]);
			spherePoints.push(vertices[ul]);
			spherePoints.push(vertices[br]);
		}
	}

	vertices.length = 0; // 已用不到，释放
	numVerticesSphere = rows * columns * 6; // 顶点数
	
	return spherePoints; // 返回顶点坐标数组
}

function initGround(){
	var ptGround = buildGround(sizeGround, 1.0);
	
	bufferGround = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferGround);
	gl.bufferData(gl.ARRAY_BUFFER,
		flatten(ptGround),
		gl.STATIC_DRAW);
	ptGround.length = 0;
	
	gl.vertexAttribPointer(
		a_Position,
		3,
		gl.FLOAT,
		false,
		0,
		0);
}
function buildGround(fExtent, fStep){
	var ptGround = [];
	numVerticesGround = 0;
	for(var iLine = -fExtent;iLine <= fExtent; iLine += fStep)
	{
		//z Line
		ptGround.push(vec3(iLine, 0, fExtent));
		ptGround.push(vec3(iLine, 0, -fExtent));
		//x Line
		ptGround.push(vec3(fExtent, 0, iLine));
		ptGround.push(vec3(-fExtent, 0, iLine));
		
		ptGround.push(vec3(fExtent, 5, iLine));
		ptGround.push(vec3(iLine, 5, fExtent));
		ptGround.push(vec3(-fExtent, 5, iLine));
		ptGround.push(vec3(iLine, 5, fExtent));

		ptGround.push(vec3(-fExtent, 5, iLine));
		ptGround.push(vec3(iLine, 5, -fExtent));
		ptGround.push(vec3(fExtent, 5, iLine));
		ptGround.push(vec3(iLine, 5, -fExtent));


		numVerticesGround += 16;
	}
	
	return ptGround;
}

// 页面加载完成后会调用此函数，函数名可任意(不一定为main)
window.onload = function main(){
	// 获取页面中id为webgl的canvas元素
    var canvas = document.getElementById("webgl");
	if(!canvas){ // 获取失败？
		alert("获取canvas元素失败！"); 
		return;
	}
	
	// 利用辅助程序文件中的功能获取WebGL上下文
	// 成功则后面可通过gl来调用WebGL的函数
    gl = WebGLUtils.setupWebGL(canvas);    
    if (!gl){ // 失败则弹出信息
		alert("获取WebGL上下文失败！"); 
		return;
	}        

	/*设置WebGL相关属性*/
    gl.clearColor(0.0, 0.0, 0.5, 1.0); // 设置背景色为蓝色
	gl.enable(gl.DEPTH_TEST);	// 开启深度检测
	// 设置视口，占满整个canvas
	gl.viewport(0, 0, canvas.width, canvas.height);
	// 设置投影矩阵：透视投影，根据视口宽高比指定视域体
	matProj = perspective(35.0, 		// 垂直方向视角
		canvas.width / canvas.height, 	// 视域体宽高比
		1.0, 							// 相机到近裁剪面距离
		50.0);							// 相机到远裁剪面距离
	
	/*加载shader程序并为shader中attribute变量提供数据*/
	// 加载id分别为"vertex-shader"和"fragment-shader"的shader程序，
	// 并进行编译和链接，返回shader程序对象program
    var program = initShaders(gl, "vertex-shader", 
		"fragment-shader");
    gl.useProgram(program);	// 启用该shader程序对象 
	
	// 获取名称为"a_Position"的shader attribute变量的位置
    a_Position = gl.getAttribLocation(program, "a_Position");
	if(a_Position < 0){ // getAttribLocation获取失败则返回-1
		alert("获取attribute变量a_Position失败！"); 
		return;
	}	
	gl.enableVertexAttribArray(a_Position);	// 为a_Position启用顶点数组

	// 获取名称为"u_MVPMatrix"的shader uniform变量位置
	u_MVPMatrix = gl.getUniformLocation(program, "u_MVPMatrix");
	if(!u_MVPMatrix){
		alert("获取uniform变量u_MVPMatrix失败！")
		return;
	}
	
	// 获取名称为"u_Color"的shader uniform变量位置
	var u_Color = gl.getUniformLocation(program, "u_Color");
	if(!u_Color){
		alert("获取uniform变量u_Color失败！")
		return;
	}
	gl.uniform3f(u_Color, 1.0, 1.0, 1.0); // 传白色
	
	initGround();
	initSphere();
	initTorus();

	// 进行绘制
    render();
};

// 绘制函数
function render() {
	animation();
	updateCamera();
	//TC();
	
	
	// 清颜色缓存和深度缓存
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   
	var matMVP = mult(matProj, mult(translate(0, -spaceY, 0), matCamera));

	/*绘制地面*/
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferGround);
	gl.vertexAttribPointer(
		a_Position,
		3,
		gl.FLOAT,
		false,
		0,
		0);
	mvpStack.push(matMVP);
	matMVP = mult(matMVP, translate(.0, -.4, .0));
	gl.uniformMatrix4fv(u_MVPMatrix, false,
		flatten(matMVP));
	gl.drawArrays(gl.LINES, 0, numVerticesGround);
	matMVP = mvpStack.pop();
	
	/*绘制每个球*/
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferSphere);
	gl.vertexAttribPointer(
		a_Position,
		3,
		gl.FLOAT,
		false,
		0,
		0);
	for(var i = 0; i < numSpheres; i++){
		mvpStack.push(matMVP);
		matMVP = mult(matMVP, translate(posSphere[i][0],
			-.2, posSphere[i][1]));
		matMVP = mult(matMVP, rotateX(90));
		gl.uniformMatrix4fv(u_MVPMatrix, false,
			flatten(matMVP));
		gl.drawArrays(gl.LINES, 0, numVerticesSphere);
		matMVP = mvpStack.pop();
	}
	
	matMVP = mult(matMVP, translate(.0, .0, -2.5));
	
	////////
	mvpStack.push(matMVP);
	
	matMVP = mult(matMVP, rotateY(-yRot * 2.0));
	matMVP = mult(matMVP, translate(1.0, .0, .0));
	matMVP = mult(matMVP, rotateX(90));
	gl.uniformMatrix4fv(u_MVPMatrix, false,
		flatten(matMVP));
	gl.drawArrays(gl.LINES, 0, numVerticesSphere);
	
	matMVP = mvpStack.pop();
	
	/////////////
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferTorus);
	gl.vertexAttribPointer(
		a_Position,
		3,
		gl.FLOAT,
		false,
		0,
		0);
	matMVP = mult(matMVP, rotateY(yRot));
	gl.uniformMatrix4fv(u_MVPMatrix, false,
		flatten(matMVP));
	gl.drawArrays(gl.LINES, 0, numVerticesTorus);
	
	requestAnimFrame(render);
}

var last = Date.now();
var spaceTime = 0;
function animation(){
	var now = Date.now();
	var elapsed = now - last;

	last = now;
	
	yRot += deltaAngle * elapsed / 800.0;
	
	yRot %= 360;
	
	if(isSpace)
	{
		spaceTime += elapsed / 1000.0;
		spaceY = spaceSpeed * spaceTime - 1 / 2 * g * Math.pow(spaceTime, 2); 

		if(spaceY <= 0)
		{
			spaceY = 0;
			spaceTime = 0;
			isSpace = false;
		}
	}
}

var matReverse = mat4();
var moveSpeed;
var squatNotSpeed = .1;
var squatSpeed = squatNotSpeed / 3;
var rotatoSpeed = 1.5;
var keytc = [false, false, false, false];
function updateCamera(){
	//蹲下
	if(isSquat)
		moveSpeed = squatSpeed;
	else
		moveSpeed = squatNotSpeed;
	//移动
	if(keyDown[0] && !keytc[0])
	{
		matCamera = mult(translate(0, 0, moveSpeed), matCamera);
		matReverse = mult(matReverse, translate(0, 0, -moveSpeed));
	}
	if(keyDown[1] && !keytc[1])
	{
		matCamera = mult(translate(0, 0, -moveSpeed), matCamera);
		matReverse = mult(matReverse, translate(0, 0, moveSpeed));
	}
	if(keyDown[2] && !keytc[2])
	{
		matCamera = mult(translate(moveSpeed, 0, 0), matCamera);
		matReverse = mult(matReverse, translate(-moveSpeed, 0, 0));
	}
	if(keyDown[3] && !keytc[3])
	{
		matCamera = mult(translate(-moveSpeed, 0, 0), matCamera);
		matReverse = mult(matReverse, translate(moveSpeed, 0, 0));
	}
	//旋转
	if(keyDown[4])
	{
		matCamera = mult(rotateY(1), matCamera);
		matReverse = mult(matReverse, rotateY(-1));
	}
	if(keyDown[5])
	{
		matCamera = mult(rotateY(-1), matCamera);
		matReverse = mult(matReverse, rotateY(1));
	}
		
}

var keyDown = [false, false, false, false, false, false];
var keyIndex;

var isSpace = false;
var spaceY = 0;
var g = 9.8;
var spaceSpeed = 4;

var isSquat = false
window.onkeydown = function(event){
	switch(event.keyCode){
		//移动
		case 87: //W
			keyDown[0] = true;
			keyIndex = 0;
			break;
		case 83: //S
			keyDown[1] = true;
			keyIndex = 1;
			break;
		case 65: //A
			keyDown[2] = true;
			keyIndex = 2;
			break;
		case 68: //D
			keyDown[3] = true;
			keyIndex = 3;
			break;
		//旋转
		case 69: //E
			keyDown[4] = true;
			break;
		case 81: //Q
			keyDown[5] = true;
			break;
		case 32: // Space
			if(!isSpace)
				isSpace = !isSpace;
			break;
		case 86: //V
			if(!isSquat)
			{
				isSquat = !isSquat;
				spaceY -= .18;
			}
			break;
	}

	//禁止默认处理（如上下键对滚动条的控制）
	//event.preventDefault();
}

window.onkeyup = function(){
	switch(event.keyCode){
		case 87: //W
			keyDown[0] = false;
			if(keytc[0])
			{	matCamera[11] -= moveSpeed;
				matReverse[11] += moveSpeed;
			}
			break;
		case 83: //S
			keyDown[1] = false;
			if(keytc[1])
			{	matCamera[11] += moveSpeed;
				matReverse[11] -= moveSpeed;
			}
			break;
		case 65: //A
			keyDown[2] = false;
			if(keytc[2])
			{	matCamera[3] -= moveSpeed;
				matReverse[3] += moveSpeed;
			}
			break;
		case 68: //D
			keyDown[3] = false;
			if(keytc[3])
			{	matCamera[3] += moveSpeed;
				matReverse[3] -= moveSpeed;
			}
			break;
		case 69: //E
			keyDown[4] = false;
			break;
		case 81: //Q
			keyDown[5] = false;
			break;
		case 32: //Space
			break;
		case 86: //V
			isSquat = !isSquat;
			spaceY = 0; 
			break;
	}
}

var sphereIndex;
function TC(){
	// 边界检测

	//静止球碰撞
	var sphereR = 1;
	for(var k = 0; k < posSphere.length; k++)
	{
		if(Math.sqrt(Math.pow(matReverse[3]-posSphere[k][0], 2) +
			 Math.pow(matReverse[11]-posSphere[k][1], 2)) <= sphereR)
			 //console.log(posSphere[k][0]+"   " +posSphere[k][1] );
			{
				sphereIndex = k;

				if(keyDown[0])
					keytc[0] = true;
				if(keyDown[1])
					keytc[1] = true;
				if(keyDown[2])
					keytc[2] = true;
				if(keyDown[3])
					keytc[3] = true;

				console.log(Math.sqrt(Math.pow(matReverse[3]-posSphere[k][0], 2) +
				Math.pow(matReverse[11]-posSphere[k][1], 2)));

			}
			
	}
	for(var k = 0; k < posSphere.length; k++)
	{
		if(k == sphereIndex && Math.sqrt(Math.pow(matReverse[3]-posSphere[k][0], 2) +
		Math.pow(matReverse[11]-posSphere[k][1], 2)) > sphereR)
		{
			keytc[0] = false;
			keytc[1] = false;
			keytc[2] = false;
			keytc[3] = false;
		}
	}
}