function Ufo(mesh, pos, portalPos1, portalPos2){
	this.mesh = mesh;
	this.initPos = {x: pos.x, y:pos.y, z:pos.z, _y:pos._y};
	this.pos = {x: pos.x, y:pos.y, z:pos.z, _y:pos._y};
	this.portalPos1 = portalPos1;
	this.portalPos2 = portalPos2;
	this.shader = new ShaderProgram("ufo-vs", "ufo-fs");
	this.time = 0.0;
	
	this.shader.vertexPositionAttribute = this.shader.getAttribute("aVertexPosition");
	gl.enableVertexAttribArray(this.shader.vertexPositionAttribute);
	
	this.shader.pMatrixUniform = this.shader.getUniform("uPMatrix");
    this.shader.mvMatrixUniform = this.shader.getUniform("uMVMatrix");
      
    this.rho = 0;
  
}

Ufo.prototype.update = function(dt) {
	this.time += dt;
		
	// portal !
	if (this.pos.x <= this.portalPos1.x && this.pos.y == this.portalPos1.y) {
		this.pos.x = this.portalPos2.x-0.2;
		this.pos.y = this.portalPos2.y;
		this.pos.z = this.portalPos2.z;
	} 
	
	updateUfoPos(this.pos);
	
	// out of screen
	if (this.pos.x <= -10.0) {
		this.pos.x = this.initPos.x;
		this.pos.y = this.initPos.y;
		this.pos.z = this.initPos.z;
	}
	
	this.rho++;
}

function updateUfoPos(pos) {
	pos.x -= 0.06;
	pos._y = pos.y+Math.cos(pos.x)*0.6;
}

Ufo.prototype.draw = function() {
	
	this.shader.bind();
	
	mvPushMatrix();
	mat4.translate(mvMatrix, [this.pos.x, this.pos._y, this.pos.z]);
	//mat4.rotate(mvMatrix, degToRad(this.rho), [1.0, 1.0, 1.0]);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.vbo);
	gl.vertexAttribPointer(this.shader.vertexPositionAttribute, this.mesh.vbo.itemSize, gl.FLOAT, false, 0, 0);
	
	setMatrixUniforms(this.shader);
	gl.drawArrays(gl.POINTS, 0, this.mesh.vbo.numItems);
	
	mvPopMatrix();
	
}