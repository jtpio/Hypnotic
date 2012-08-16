function Portal(mesh, textures, pos, type, facing){
	this.mesh = mesh;
	this.textures = textures;
	this.pos = pos;
	this.type = type;
	this.facing = facing;
	this.shader = new ShaderProgram("portal-vs", "portal-fs");
	this.time = 0.0;
	
	this.shader.vertexPositionAttribute = this.shader.getAttribute("aVertexPosition");
	gl.enableVertexAttribArray(this.shader.vertexPositionAttribute);
	
	this.shader.textureCoordAttribute = this.shader.getAttribute("aTextureCoord");
	gl.enableVertexAttribArray(this.shader.textureCoordAttribute);
	
	this.shader.samplerUniform = this.shader.getUniform("uSampler");
	
	this.shader.pMatrixUniform = this.shader.getUniform("uPMatrix");
    this.shader.mvMatrixUniform = this.shader.getUniform("uMVMatrix");
    
    
	// texture side coords
	this.vertexTextureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
	var textureCoords = [
	  // Front face
	  0.0, 0.0,
	  1.0, 0.0,
	  1.0, 1.0,
	  0.0, 1.0,

	  // Back face
	  1.0, 0.0,
	  1.0, 1.0,
	  0.0, 1.0,
	  0.0, 0.0,

	  // Top face
	  0.0, 1.0,
	  0.0, 0.0,
	  1.0, 0.0,
	  1.0, 1.0,

	  // Bottom face
	  1.0, 1.0,
	  0.0, 1.0,
	  0.0, 0.0,
	  1.0, 0.0,

	  // Right face
	  1.0, 0.0,
	  1.0, 1.0,
	  0.0, 1.0,
	  0.0, 0.0,

	  // Left face
	  0.0, 0.0,
	  1.0, 0.0,
	  1.0, 1.0,
	  0.0, 1.0,
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
	this.vertexTextureCoordBuffer.itemSize = 2;
	this.vertexTextureCoordBuffer.numItems = 24;
	
    this.cubeVertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cubeVertexIndexBuffer);
	var cubeVertexIndices = [
		0, 1, 2,      0, 2, 3,    
		4, 5, 6,      4, 6, 7,
		8, 9, 10,     8, 10, 11, 
		12, 13, 14,   12, 14, 15, 
		16, 17, 18,   16, 18, 19, 
		20, 21, 22,   20, 22, 23
	];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
	this.cubeVertexIndexBuffer.itemSize = 1;
	this.cubeVertexIndexBuffer.numItems = 36;
    
    this.rho = 0;
    this.sign = 1;
}

Portal.prototype.update = function(dt) {
	this.time += dt;
	
	this.rho += this.sign*0.2;
	if (this.rho < 0.0 || this.rho > 10.0) {
		this.sign = -this.sign;
	}

}


Portal.prototype.draw = function() {
	
	this.shader.bind();
	
	mvPushMatrix();
	mat4.translate(mvMatrix, [this.pos.x, this.pos.y, this.pos.z]);
	if (this.facing == "right") {
		mat4.rotate(mvMatrix, degToRad(75), [0.0, 1.0, 0.0]);
	} else {
		mat4.rotate(mvMatrix, degToRad(-75), [0.0, 1.0, 0.0]);
	}
	
	mat4.rotate(mvMatrix, degToRad(10), [1.0, 0.0, 0.0]);
	mat4.rotate(mvMatrix, degToRad(this.rho), [1.0, 1.0, 0.0]);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.vbo);
	gl.vertexAttribPointer(this.shader.vertexPositionAttribute, this.mesh.vbo.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
    gl.vertexAttribPointer(this.shader.textureCoordAttribute, this.vertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cubeVertexIndexBuffer);
	
	// Draw textures
	gl.activeTexture(gl.TEXTURE0);
	gl.uniform1i(this.shader.samplerUniform, 0);
	setMatrixUniforms(this.shader);
	
	// front face
	if (this.type == "orange") {
		gl.bindTexture(gl.TEXTURE_2D, this.textures.portalOrange);
	} else if (this.type == "blue") {
		gl.bindTexture(gl.TEXTURE_2D, this.textures.portalBlue);
	} else {
		// default is orange
		gl.bindTexture(gl.TEXTURE_2D, this.textures.portalOrange);
	}
	gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
	
	// back face
	gl.bindTexture(gl.TEXTURE_2D, this.textures.wallBehind);
	gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 12);
	
	// top face
	gl.bindTexture(gl.TEXTURE_2D, this.textures.wallSide);
	gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 24);
	
	// bottom face
	gl.bindTexture(gl.TEXTURE_2D, this.textures.wallSide);
	gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 36);
	
	// right face
	gl.bindTexture(gl.TEXTURE_2D, this.textures.wallSide);
	gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 48);
	
	// left face
	gl.bindTexture(gl.TEXTURE_2D, this.textures.wallSide);
	gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 60);
	
	mvPopMatrix();
	
}