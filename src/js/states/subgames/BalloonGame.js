/* Balloon Game */
BalloonGame.prototype = Object.create(Subgame.prototype);
BalloonGame.prototype.constructor = BalloonGame;
function BalloonGame () {
	Subgame.call(this); // Call parent constructor.
}

/* Phaser state function */
BalloonGame.prototype.preload = function () {

	this.load.image('cliffside',    'assets/img/subgames/balloon/cliffside.png');
	this.load.image('basket',    'assets/img/subgames/balloon/basket.png');

	this.load.image('birdheroBg',      'assets/img/subgames/birdhero/bg.png');
	/*
	this.load.image('birdheroBird',    'assets/img/subgames/birdhero/bird.png');
	this.load.image('birdheroBole',    'assets/img/subgames/birdhero/bole.png');
	this.load.image('birdheroBranch0', 'assets/img/subgames/birdhero/branch1.png');
	this.load.image('birdheroBranch1', 'assets/img/subgames/birdhero/branch2.png');
	this.load.image('birdheroBranch2', 'assets/img/subgames/birdhero/branch2.png');
	this.load.image('birdheroBucket',  'assets/img/subgames/birdhero/bucket.png');
	this.load.image('birdheroChick',   'assets/img/subgames/birdhero/chick.png');
	this.load.image('birdheroCrown',   'assets/img/subgames/birdhero/crown.png');
	this.load.image('birdheroMother',  'assets/img/subgames/birdhero/mother.png');
	this.load.image('birdheroNest',    'assets/img/subgames/birdhero/nest.png');
	this.load.image('birdheroRope',    'assets/img/subgames/birdhero/rope.png');
	this.load.image('birdheroWhat',    'assets/img/subgames/birdhero/what.png');
	this.load.spritesheet('birdheroBeak', 'assets/img/subgames/birdhero/beak.png', 31, 33);
	this.load.audio('birdheroIntro', ['assets/audio/subgames/birdhero/bg.mp3', 'assets/audio/subgames/birdhero/bg.ogg']);
	this.load.audio('birdheroElevator', ['assets/audio/subgames/birdhero/elevator.mp3', 'assets/audio/subgames/birdhero/elevator.ogg']);
	this.load.audio('birdheroElevatorArrive', ['assets/audio/subgames/birdhero/elevator_arrive.mp3', 'assets/audio/subgames/birdhero/elevator_arrive.ogg']);
	this.load.audio('birdheroElevatorDown', ['assets/audio/subgames/birdhero/elevator_down.mp3', 'assets/audio/subgames/birdhero/elevator_down.ogg']);
	*/
};

/* Phaser state function */
BalloonGame.prototype.create = function () {
	//var _this = this; // Subscriptions to not have access to 'this' object
	
	this.music = this.add.audio('birdheroIntro', 1, true);

	var scale = 0.27;

	// Add main game
	this.add.sprite(0, 0, 'birdheroBg', null, this.gameGroup);

	for (var i = 0; i < 6; i++){
		var cliff = this.add.sprite(1024, 718 - (this.cache.getImage('cliffside').height * scale * (i+1) * 0.8), 'cliffside', null, this.gameGroup);
		cliff.scale.x = -scale;
		cliff.scale.y = scale;
	}
	var airballoon = this.add.group(this.gameGroup);
	airballoon.basket = this.add.sprite(680, 660, 'basket', null, airballoon);
	airballoon.basket.scale.x = 0.2;
	airballoon.basket.scale.y = 0.2;

	var balloons = this.add.group(this.gameGroup);
	for (i = 0; i < 3; i++){
		var balloon = this.add.sprite(50 + 100*i, 50, 'balloon', balloons);
		balloon.scale.x = 0.2;
		balloon.scale.y = 0.2;
		balloon.inputEnabled = true;
		balloon.input.enableDrag(false, true);
	}

	for (i = 0; i < 3; i++){
		airballoon.y -= (this.cache.getImage('cliffside').height * scale * 0.8);
	}



	// Make sure the call this when everything is set up.
	this.startGame();
};



