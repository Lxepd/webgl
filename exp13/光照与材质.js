// LightShading.js
// 演示了逐顶点光照计算和逐片元光照计算
// 给出了在多个shader program间切换的方式
 
// 全局变量
var gl;						// WebGL上下文

// 以下全局变量用于控制动画的状态和速度
var angleY = 0.0;		// 绕y轴旋转的角度
var angleX = 0.0;		// 绕x轴旋转的角度
var angleStep = 3.0;	// 角度变化步长(3度)

var program; // shader程序对象
var matProj; // 投影矩阵

var light = [];
light.light_position = vec4(0.0, 0.0, 1.8, 1.0);
light.light_ambient = vec3(0.2, 0.2, 0.2);
light.light_diffuse = vec3(1.0, 1.0, 1.0);
light.light_specular = vec3(1.0, 1.0, 1.0);

var mtlBrass = [];
mtlBrass.material_ambient = vec3(0.329412, 0.223529, 0.027451);
mtlBrass.material_diffuse = vec3(0.780392, 0.568627, 0.113725);
mtlBrass.material_specular = vec3(0.992157, 0.941176, 0.807843);
mtlBrass.material_shininess = 10;

var feicui = [];
feicui.material_ambient = vec3(0.73, 0.35, 0.09);
feicui.material_diffuse = vec3(0.3453, 0.974, 0.6543);
feicui.material_specular = vec3(0.434, 0.974, 0.3123);
feicui.material_shininess = 10;

var tie = [];
tie.material_ambient = vec3(0.93, 0.93, 0.87);
tie.material_diffuse = vec3(0.91, 0.90, 0.92);
tie.material_specular = vec3(0.90, 0.90, 0.91);
tie.material_shininess = 25;

var gold = [];
gold.material_ambient = vec3(0.96, 0.3, 0.08);
gold.material_diffuse = vec3(0.96, 1.0, 0.11);
gold.material_specular = vec3(0.90, 0.88, 0.91);
gold.material_shininess = 70;

var Cube = function(){
	this.numVertices = 36;
	this.vertices = [
		vec3(-0.5, -0.5, 0.5),
		vec3(-0.5, 0.5, 0.5),
		vec3(0.5, 0.5, 0.5),
		vec3(0.5, -0.5, 0.5),
		vec3(-0.5, -0.5, -0.5),
		vec3(-0.5, 0.5, -0.5),
		vec3(0.5, 0.5, -0.5),
		vec3(0.5, -0.5, -0.5)
	];
	this.points = new Array(0);
	this.normals = new Array(0);
	this.pointBuffer = null;
	this.normalBuffer = null;
	this.setMaterial(mtlBrass);
}

Cube.prototype.quad = function(a,b,c,d){
	var u = subtract(this.vertices[b], this.vertices[a]);
	var v = subtract(this.vertices[c], this.vertices[b]);

	var normal = normalize(cross(u, v));

	this.normals.push(normal);
	this.points.push(this.vertices[a]);
	this.normals.push(normal);
	this.points.push(this.vertices[b]);
	this.normals.push(normal);
	this.points.push(this.vertices[c]);
	this.normals.push(normal);
	this.points.push(this.vertices[a]);
	this.normals.push(normal);
	this.points.push(this.vertices[c]);
	this.normals.push(normal);
	this.points.push(this.vertices[d]);
}

Cube.prototype.genVertices = function(){
	this.quad(1, 0, 3, 2); //Q
	this.quad(2, 3, 7, 6); //Y
	this.quad(3, 0, 4, 7); //X
	this.quad(6, 5, 1, 2); //S
	this.quad(4, 5, 6, 7); //H
	this.quad(5, 4, 0, 1); //L
}

Cube.prototype.init = function(){
	this.genVertices();

	this.pointBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.pointBuffer);
	gl.bufferData(gl.ARRAY_BUFFER,
		flatten(this.points),
		gl.STATIC_DRAW);
	this.points.length = 0;
	this.vertices.length = 0;

	this.normalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals),
		gl.STATIC_DRAW);
	this.normals.length = 0;
}

Cube.prototype.setMaterial = function(mtl){
	this.material_ambient = mtl.material_ambient;
	this.material_diffuse = mtl.material_diffuse;
	this.material_specular = mtl.material_specular;
	this.material_shininess = mtl.material_shininess;

	if(program){
		var ambient_product = mult(light.light_ambient, this.material_ambient);
		var diffuse_product = mult(light.light_diffuse, this.material_diffuse);
		var specular_product = mult(light.light_specular, this.material_specular);

		gl.uniform3fv(program.u_AmbientProduct, flatten(ambient_product));
		gl.uniform3fv(program.u_DiffuseProduct, flatten(diffuse_product));
		gl.uniform3fv(program.u_SpecularProduct, flatten(specular_product));
		gl.uniform1f(program.u_Shininess, this.material_shininess);
	}
}

Cube.prototype.useProgram = function(program){
	gl.useProgram(program);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.pointBuffer);
	gl.vertexAttribPointer(
		program.a_Position,
		3,
		gl.FLOAT,
		false,
		0,
		0
	);
	gl.enableVertexAttribArray(program.a_Position);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
	gl.vertexAttribPointer(
		program.a_Normal,
		3,
		gl.FLOAT,
		false,
		0,0
	);
	gl.enableVertexAttribArray(program.a_Normal);

	var ambient_product = mult(light.light_ambient, this.material_ambient);
	var diffuse_product = mult(light.light_diffuse, this.material_diffuse);
	var specular_product = mult(light.light_specular, this.material_specular);

	gl.uniform4fv(program.u_LightPosition, flatten(light.light_position));
	gl.uniform3fv(program.u_AmbientProduct, flatten(ambient_product));
	gl.uniform3fv(program.u_DiffuseProduct, flatten(diffuse_product));
	gl.uniform3fv(program.u_SpecularProduct, flatten(specular_product));
	gl.uniform1f(program.u_Shininess, this.material_shininess);
}

Cube.prototype.draw = function(){
	gl.drawArrays(gl.TRIANGLES, 0, this.numVertices);
}

var cube = new Cube();

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
    gl.clearColor(1.0, 1.0, 1.0, 1.0); // 设置背景色为白色
	gl.enable(gl.DEPTH_TEST);	// 开启深度检测
	gl.enable(gl.CULL_FACE);	// 开启面剔除，默认剔除背面
	// 设置视口，占满整个canvas
	gl.viewport(0, 0, canvas.width, canvas.height);
	// 设置投影矩阵：透视投影，根据视口宽高比指定视域体
	matProj = perspective(35.0, 		// 垂直方向视角
		canvas.width / canvas.height, 	// 视域体宽高比
		0.1, 							// 相机到近裁剪面距离
		10.0);							// 相机到远裁剪面距离
	
	var VertexButton = document.getElementById("VB");
	VertexButton.onclick = function(){
		var vProgram = initShaders(gl, "vertex-vShading",
			"fragment-vShading");
			console.log(vProgram);
		vProgram.a_Position = gl.getAttribLocation(vProgram, "a_Position");
		if(vProgram.a_Position < 0)
			console.log("获取attribute变量a_Position索引失败");
		vProgram.a_Normal = gl.getAttribLocation(vProgram, "a_Normal");
		if(vProgram.a_Normal < 0)
			console.log("获取attribute变量a_Normal索引失败");

		vProgram.u_matModel = gl.getUniformLocation(vProgram, "u_matModel");
		if(!vProgram.u_matModel)
			console.log("获取uniform变量u_matModel索引失败");
		vProgram.u_matView = gl.getUniformLocation(vProgram, "u_matView");
		if(!vProgram.u_matView)
			console.log("获取uniform变量u_matView索引失败");

		vProgram.u_LightPosition = gl.getUniformLocation(vProgram, "u_LightPosition");
		if(!vProgram.u_LightPosition)
			console.log("获取uniform变量u_LightPosition索引失败");
		vProgram.u_Shininess = gl.getUniformLocation(vProgram, "u_Shininess");
		if(!vProgram.u_Shininess)
			console.log("获取uniform变量u_Shininess索引失败");
		vProgram.u_Projection = gl.getUniformLocation(vProgram, "u_Projection");
		if(!vProgram.u_Projection)
			console.log("获取uniform变量u_Projection索引失败");
		vProgram.u_NormalMat = gl.getUniformLocation(vProgram, "u_NormalMat");
		if(!vProgram.u_NormalMat)
			console.log("获取uniform变量u_NormalMat索引失败");

		vProgram.u_AmbientProduct = gl.getUniformLocation(vProgram, "u_AmbientProduct");
		if(!vProgram.u_AmbientProduct)
			console.log("获取uniform变量u_AmbientProduct索引失败");
		vProgram.u_DiffuseProduct = gl.getUniformLocation(vProgram, "u_DiffuseProduct");
		if(!vProgram.u_DiffuseProduct)
			console.log("获取uniform变量u_DiffuseProduct索引失败");
		vProgram.u_SpecularProduct = gl.getUniformLocation(vProgram, "u_SpecularProduct");
		if(!vProgram.u_SpecularProduct)
			console.log("获取uniform变量u_SpecularProduct索引失败");

		program = vProgram;
		cube.useProgram(program);
		requestAnimationFrame(render);
	}

	var FragmentButton = document.getElementById("FB");
	FragmentButton.onclick = function(){
		var fProgram = initShaders(gl, "vertex-fShading",
			"fragment-fShading");
		console.log(fProgram);

		fProgram.a_Position = gl.getAttribLocation(fProgram, "a_Position");
		if(fProgram.a_Position < 0)
			console.log("获取attribute变量a_Position索引失败");
		fProgram.a_Normal = gl.getAttribLocation(fProgram, "a_Normal");
		if(fProgram.a_Normal < 0)
			console.log("获取attribute变量a_Normal索引失败");

		fProgram.u_matModel = gl.getUniformLocation(fProgram, "u_matModel");
		if(!fProgram.u_matModel)
			console.log("获取uniform变量u_matModel索引失败");
		fProgram.u_matView = gl.getUniformLocation(fProgram, "u_matView");
		if(!fProgram.u_matView)
			console.log("获取uniform变量u_matView索引失败");

		fProgram.u_LightPosition = gl.getUniformLocation(fProgram, "u_LightPosition");
		if(!fProgram.u_LightPosition)
			console.log("获取uniform变量u_LightPosition索引失败");
		fProgram.u_Shininess = gl.getUniformLocation(fProgram, "u_Shininess");
		if(!fProgram.u_Shininess)
			console.log("获取uniform变量u_Shininess索引失败");
		fProgram.u_Projection = gl.getUniformLocation(fProgram, "u_Projection");
		if(!fProgram.u_Projection)
			console.log("获取uniform变量u_Projection索引失败");
		fProgram.u_NormalMat = gl.getUniformLocation(fProgram, "u_NormalMat");
		if(!fProgram.u_NormalMat)
			console.log("获取uniform变量u_NormalMat索引失败");

		fProgram.u_AmbientProduct = gl.getUniformLocation(fProgram, "u_AmbientProduct");
		if(!fProgram.u_AmbientProduct)
			console.log("获取uniform变量u_AmbientProduct索引失败");
		fProgram.u_DiffuseProduct = gl.getUniformLocation(fProgram, "u_DiffuseProduct");
		if(!fProgram.u_DiffuseProduct)
			console.log("获取uniform变量u_DiffuseProduct索引失败");
		fProgram.u_SpecularProduct = gl.getUniformLocation(fProgram, "u_SpecularProduct");
		if(!fProgram.u_SpecularProduct)
			console.log("获取uniform变量u_SpecularProduct索引失败");

		program = fProgram;
		cube.useProgram(program);
		requestAnimationFrame(render);
	}

	var vProgram = initShaders(gl, "vertex-vShading",
		"fragment-vShading");
		console.log(vProgram);
	vProgram.a_Position = gl.getAttribLocation(vProgram, "a_Position");
	if(vProgram.a_Position < 0)
		console.log("获取attribute变量a_Position索引失败");
	vProgram.a_Normal = gl.getAttribLocation(vProgram, "a_Normal");
	if(vProgram.a_Normal < 0)
		console.log("获取attribute变量a_Normal索引失败");

	vProgram.u_matModel = gl.getUniformLocation(vProgram, "u_matModel");
	if(!vProgram.u_matModel)
		console.log("获取uniform变量u_matModel索引失败");
	vProgram.u_matView = gl.getUniformLocation(vProgram, "u_matView");
	if(!vProgram.u_matView)
		console.log("获取uniform变量u_matView索引失败");

	vProgram.u_LightPosition = gl.getUniformLocation(vProgram, "u_LightPosition");
	if(!vProgram.u_LightPosition)
		console.log("获取uniform变量u_LightPosition索引失败");
	vProgram.u_Shininess = gl.getUniformLocation(vProgram, "u_Shininess");
	if(!vProgram.u_Shininess)
		console.log("获取uniform变量u_Shininess索引失败");
	vProgram.u_Projection = gl.getUniformLocation(vProgram, "u_Projection");
	if(!vProgram.u_Projection)
		console.log("获取uniform变量u_Projection索引失败");
	vProgram.u_NormalMat = gl.getUniformLocation(vProgram, "u_NormalMat");
	if(!vProgram.u_NormalMat)
		console.log("获取uniform变量u_NormalMat索引失败");

	vProgram.u_AmbientProduct = gl.getUniformLocation(vProgram, "u_AmbientProduct");
	if(!vProgram.u_AmbientProduct)
		console.log("获取uniform变量u_AmbientProduct索引失败");
	vProgram.u_DiffuseProduct = gl.getUniformLocation(vProgram, "u_DiffuseProduct");
	if(!vProgram.u_DiffuseProduct)
		console.log("获取uniform变量u_DiffuseProduct索引失败");
	vProgram.u_SpecularProduct = gl.getUniformLocation(vProgram, "u_SpecularProduct");
	if(!vProgram.u_SpecularProduct)
		console.log("获取uniform变量u_SpecularProduct索引失败");

	program = vProgram;
	cube.init();
	cube.useProgram(program);

	var myMenu = document.getElementById("mymenu");
	if(!myMenu){
		alert("获取按钮元素myMenu失败！");
	}
	myMenu.addEventListener("click", function(event){
		switch(myMenu.selectedIndex)
		{
			case 0:
				cube.setMaterial(mtlBrass);
				break
			case 1:
				cube.setMaterial(feicui);
				break;
			case 2:
				cube.setMaterial(tie);
				break;
			case 3:
				cube.setMaterial(gold);
				break;
		}

		requestAnimationFrame(render);
	});

	// 进行绘制
    render();
};

// 绘制函数
function render() {
	// 清颜色缓存和深度缓存
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
	var matView = translate(0.0, 0.0, -3.0);
	var matModel = mult(rotateY(angleY), rotateX(angleX));
	var matNormal = normalMatrix(mult(matView, matModel));

	gl.uniformMatrix4fv(program.u_Projection, false, flatten(matProj));
	gl.uniformMatrix4fv(program.u_matView, false, flatten(matView));
	gl.uniformMatrix4fv(program.u_matModel, false, flatten(matModel));
	gl.uniformMatrix3fv(program.u_NormalMat, false, flatten(matNormal));

	cube.draw();
}

// 按键响应
// 用于控制视角
window.onkeydown = function(){
	switch(event.keyCode){
		case 37: // 方向键Left
			angleY -= angleStep;
			if (angleY < -180.0) {
				angleY += 360.0;
			}
			break;
		case 38: // 方向键Up
			angleX -= angleStep;
			if (angleX < -80.0) {
				angleX = -80.0;
			}
			break;
		case 39: // 方向键Right
			angleY += angleStep;
			if (angleY > 180.0) {
				angleY -= 360.0;
			}
			break;
		case 40: // 方向键Down
			angleX += angleStep;
			if (angleX > 80.0) {
				angleX = 80.0;
			}
			break;
		default:
			return;
	}
	requestAnimFrame(render); // 请求重绘
}
