var gl;
var time = 0;

// Audio
var dancer;
var AUDIO_FILE = 'data/music/track';
var playing = false;
var flash = false;

// Meshes
var meshesArrays = {};
var meshes = {};

// objects
var bg;
var portal1;
var portal2;
var ufos = [];
var hypno;

// display booleans
var dUfos = false;
var dText = false;
var rotateCam = "no";

// camera effects
var dz = 0;
var angleZ = 0;

// matrices
var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

// textures
var ready = false;
var textures = {};

function initTextures() {
	// there is no texture packing here, and no batching, maybe next time !
	var portalOrange = new Image();
	portalOrange.onload = function () {
		textures.portalOrange = createTextureFromImage(portalOrange, 0);
	}
	portalOrange.src = "data/img/portal_orange.png";

	var portalBlue = new Image();
	portalBlue.onload = function () {
		textures.portalBlue = createTextureFromImage(portalBlue, 1);
	}
	portalBlue.src = "data/img/portal_blue.png";

	var wallSide = new Image();
	wallSide.onload = function () {
		textures.wallSide = createTextureFromImage(wallSide, 2);
	}
	wallSide.src = "data/img/wall_side.png";
	
	var wallBehind = new Image();
	wallBehind.onload = function () {
		textures.wallBehind = createTextureFromImage(wallBehind, 3);
	}
	wallBehind.src = "data/img/wall_behind.png";
	
}

function initDemo() {
	webGLStart();
	
	// load meshes
	for (mesh in meshesArrays) {
		meshes[mesh] = new MeshBuffer(meshesArrays[mesh])
	}
	
	initTextures();
	
	// create hypnotic background
	bg = new Background();
	
	var portalPos1 = {x: -4.5, y: 1.2, z: -8.0};
	var portalPos2 = {x: 4.0, y: -1.2, z: -6.0};
	portal1 = new Portal(meshes.portal, textures, portalPos1, "orange", "right");
	portal2 = new Portal(meshes.portal, textures, portalPos2, "blue", "left");
	
	for (var i = 0; i < 6; i++) { 
		ufos.push(new Ufo(meshes.icosphere, {x:7.0+3.0*i, y:portalPos1.y, z:portalPos1.z-0.2, _y:portalPos1.y}, portalPos1, portalPos2));
	}
	
	hypno = new Text(meshes.hypnotic, {x:0.0, y:0.0, z:-3.0});
	
	initAudio();
	
	tick();
}

function initAudio() {  
	Dancer.setOptions({
		flashJS  : 'lib/soundmanager2.js',
		flashSWF : 'lib/soundmanager2.swf'
	});
  
	dancer = new Dancer(AUDIO_FILE, ['ogg', 'mp3']);
	var beat = dancer.createBeat({
		onBeat: function (mag) {
			flash = true;
		},
		offBeat: function (mag) {
			flash = false;
		}
	});
	
	dancer.onceAt(0, function () {
		beat.on();
		rotateCam = "no";
	}).onceAt(7.0, function () {
		dUfos = true;
	}).onceAt(27.5, function () {
		dText = true;
		rotateCam = "shake";
	}).onceAt(41.0, function () {
		rotateCam = "plus";
	}).onceAt(45.0, function () {
		rotateCam = "minus";
	}).onceAt(62.8, function () {
		rotateCam = "reinit";
		dText = false;
	}).onceAt(71, function () {
		dUfos = false;
	});

}

function initGL(canvas) {
	try {
		function throwOnGLError(err, funcName, args) {
			throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to" + funcName;
		};

		// fullscreen
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		
		gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch (e) {
	}
	if (!gl) {
		alert("Your browser doesn't support WebGL ...");
	}
}

function webGLStart() {
	var canvas = document.getElementById("canvas");
	initGL(canvas);

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
	
}

function render() {
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	mat4.identity(mvMatrix);

	switch (rotateCam) {
		case "no" :
			angleZ = 0;
			break;
		case "shake":
			angleZ = Math.cos(time/100.0)*2.0;
			dz = Math.cos(time/100.0)*1.0;
			break;
		case "plus":
			angleZ++;
			//dz = 0;
			dz = Math.cos(time/100.0)*1.0;
			break;
		case "minus":
			//dz = 0;
			if (angleZ < -1.0 || angleZ > 1.0) {
				angleZ--;
				dz = Math.cos(time/100.0)*1.0;
			}
			break;
		case "reinit":
			//dz = 0;
			if (angleZ < -1.0 || angleZ > 1.0) {
				angleZ--;
			}
			if (dz < -0.1) {
				dz += 0.05;
			} else if (dz > 0.1) {
				dz -= 0.05;
			}
			break;
		
	}
	mat4.rotate(mvMatrix, degToRad(angleZ), [0.0, 0.0, 1.0]);
	mat4.translate(mvMatrix, [0.0, 0.0, dz]);
	
	// draw background
	mat4.perspective(45, 1, 0.1, 100.0, pMatrix);
	bg.draw(gl.viewportWidth / gl.viewportHeight);
	
	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

	portal1.draw();
	portal2.draw();
	
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
	gl.enable(gl.BLEND);
	
	if (dUfos) {
		for (u in ufos) {
			ufos[u].draw();
		}
	}
	
	gl.disable(gl.BLEND);
	
	if (dText) {
		hypno.draw();
	}

	
}

var lastTime = 0;

function update() {
	var timeNow = new Date().getTime();
	
	if (lastTime != 0) {
		var dt = timeNow - lastTime;
		time+=dt;
		
		bg.update(dt, flash);
		portal1.update(dt);
		portal2.update(dt);
		if (dUfos) {
			for (u in ufos) {
				ufos[u].update(dt);
			}
		}
		
		if (dText) {
			hypno.update(dt);
		}
	}
	
	lastTime = timeNow;
}

function tick() {
	requestAnimFrame(tick);
	if (textures.portalOrange && textures.portalBlue &&
		textures.wallSide && textures.wallBehind && !playing) {
		dancer.play();
		var progress = document.getElementById("progress-bar");
		progress.parentNode.removeChild(progress);
		playing = true;
	}
	
	if (playing) {
		update();
		render();
	}
}