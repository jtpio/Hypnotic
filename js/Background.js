function Background() {
	this.mesh = meshes.bg;
	this.shader = new ShaderProgram("bg-vs", "bg-fs");
	this.time = 0.0;
	this.prevTime = -2000;

	this.circlesPos = new Float32Array([
		0.0,  0.0,
		0.0,  0.0,
		0.0,  0.0,
		0.0,  0.0,
		0.0,  0.0, 
		0.0,  0.0,
		0.0,  0.0,
		0.0,  0.0,
		0.0,  0.0,
		0.0,  0.0,  
		0.0,  0.0,
		0.0,  0.0,
		0.0,  0.0,
		0.0,  0.0,
		0.0,  0.0
	]); 
	this.nbCircles = Math.floor(this.circlesPos.length/2);
	
	var temp = [];
	for (var i = 0.1; i < this.nbCircles; i+=1.0) {
		temp.push(i);
	}
	this.radiuses = new Float32Array(temp);
	
	this.positionAttribute = this.shader.getAttribute("aVertexPosition");
	gl.enableVertexAttribArray(this.positionAttribute);
	
	this.shader.pMatrixUniform = this.shader.getUniform("uPMatrix");
    this.shader.mvMatrixUniform = this.shader.getUniform("uMVMatrix");
    
    // animation
    this.rho = 0;
    this.sign = 1;
}

Background.prototype.update = function(dt, beat) {
	this.time += dt;
	
	for (var i = 0; i < this.nbCircles; ++i) {
		this.radiuses[i] += 0.05;	
	}

	this.shader.bind();
	if (this.radiuses[9] > 15.0) {
		for (var i = this.nbCircles-1; i > 0; --i) {
			this.radiuses[i] = this.radiuses[i-1];
		}
		this.radiuses[0] = 0.0;
	}
	
	for(var i = 0; i < this.nbCircles; ++i){
		gl.uniform2f(
			this.shader.getUniform("mCirclePos["+i+"]"), 
			this.circlesPos[2*i],this.circlesPos[2*i+1]
			);
		gl.uniform1f(this.shader.getUniform("mRadiuses["+i+"]"), this.radiuses[i]);  
	}
	
	this.rho+=this.sign*0.5;
	if (this.rho < -45 || this.rho > 45) {
		this.sign = -this.sign;
	}
	
	// flash beat
	if (beat || (this.time - this.prevTime) <= 500) {
		if (beat) {
			this.prevTime = this.time;
		}
		gl.uniform1f(this.shader.getUniform("flash"), true);
		gl.uniform1f(this.shader.getUniform("decay"), this.time - this.prevTime);
	} else {
		gl.uniform1f(this.shader.getUniform("flash"), false);  
	}
	
}


Background.prototype.draw = function(ratio) {
	this.shader.bind();

	mvPushMatrix();
	mat4.translate(mvMatrix, [0.0, 0.0, -20.0]);
	mat4.rotate(mvMatrix, degToRad(this.rho), [0.0, 1.0, 1.0]);

	// set screen ratio
	gl.uniform1f(this.shader.getUniform("ratio"), ratio);  
	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.vbo);
	gl.vertexAttribPointer(this.positionAttribute, this.mesh.vbo.itemSize, gl.FLOAT, false, 0, 0);
	setMatrixUniforms(this.shader);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.mesh.vbo.numItems);
	
	mvPopMatrix();
}
