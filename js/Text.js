function Text(mesh, pos){
	this.mesh = mesh;
	this.pos = pos;
	this.shader = new ShaderProgram("text-vs", "text-fs");
	this.time = 0.0;
	
	this.shader.vertexPositionAttribute = this.shader.getAttribute("aVertexPosition");
	gl.enableVertexAttribArray(this.shader.vertexPositionAttribute);
	
	this.shader.pMatrixUniform = this.shader.getUniform("uPMatrix");
    this.shader.mvMatrixUniform = this.shader.getUniform("uMVMatrix");
      
    this.shader.time = this.shader.getUniform("time"); 
      
    this.rho = 0;
	this._rho = 0;
}

Text.prototype.update = function(dt) {
	this.time += dt;
	
	this.rho+=0.1;
	this._rho = (Math.cos(this.rho)+Math.sin(this.rho))*30.0;
	
}

Text.prototype.draw = function() {
	
	this.shader.bind();
	
	mvPushMatrix();
	mat4.translate(mvMatrix, [this.pos.x, this.pos.y, this.pos.z]);
	mat4.rotate(mvMatrix, degToRad(this._rho), [0.0, 1.0, 0.0]);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.vbo);
	gl.vertexAttribPointer(this.shader.vertexPositionAttribute, this.mesh.vbo.itemSize, gl.FLOAT, false, 0, 0);
	
	gl.uniform1f(this.shader.getUniform("time"), this.time);

	setMatrixUniforms(this.shader);
	gl.drawArrays(gl.TRIANGLES, 0, this.mesh.vbo.numItems);
	
	mvPopMatrix();
	
}