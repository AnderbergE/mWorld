/* Balloon Game */
BalloonGame.prototype = Object.create(Subgame.prototype);
BalloonGame.prototype.constructor = BalloonGame;
function BalloonGame () {
	Subgame.call(this); // Call parent constructor.
}

/* Phaser state function */
BalloonGame.prototype.preload = function () {

	this.load.image('cliffside',    'assets/img/subgames/balloon/indent.png');
	this.load.image('basket',    'assets/img/subgames/balloon/basket.png');

	this.load.image('balloonBg',      'assets/img/subgames/balloon/bg.png');
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

var background;
var scale = 1;
var airballoon;
var cliffheight;
var cliff;
var liftoffButton;
var resetButton;
var balloons;

/* Phaser state function */
BalloonGame.prototype.create = function () {
	var _this = this; // Subscriptions to not have access to 'this' object
	this.disable(false);
	
	this.music = this.add.audio('birdheroIntro', 1, true);

	cliffheight = this.cache.getImage('cliffside').height;

	// Add main game
	background = this.add.sprite(0, 0, 'balloonBg', null, this.gameGroup);

	// Adding the platforms on the cliff wall.
	for (var i = 0; i < 5; i++){
		cliff = this.add.sprite(1024, 670 - (cliffheight * scale * (i+1) * 2), 'cliffside', null, this.gameGroup);
		cliff.scale.x = -scale;
		cliff.scale.y = scale;
		cliff = this.add.sprite(1024-this.cache.getImage('cliffside').width*2.5, 670 - (cliffheight * scale * (i+1) * 2 + cliffheight), 'cliffside', null, this.gameGroup);
		cliff.scale.x = scale;
		cliff.scale.y = scale;
	}
	airballoon = this.add.group(this.gameGroup);
	airballoon.x = 775;
	airballoon.y = 600;
	airballoon.basket = this.add.sprite(0, 0, 'basket', null, airballoon);
	airballoon.basket.scale.x = 0.2;
	airballoon.basket.scale.y = 0.2;

	balloons = this.add.group(this.gameGroup);
	balloons.x = 0;
	balloons.y = 0;
	createBalloons();


	liftoffButton = game.add.button(game.world.centerX, 660, 'wood', move, this);
	resetButton = game.add.button(game.world.centerX- 60, 660, 'wood', resetBalloons, this);
	
	/*
	var buttons = new ButtonPanel(this.amount, this.representation, {
	y: this.world.height-(this.representation.length*75)-25, background: 'balloon', onClick: move
	});
	this.hudGroup.add(buttons);

	showNumbers();
	*/


	function createBalloons()
	{
		for (i = 0; i < 6; i++){

			var balloon = _this.add.sprite(50 + 80*i, 50, 'balloon', null, _this.gameGroup);
			balloon.scale.x = 0.2;
			balloon.scale.y = 0.2;
			balloon.inputEnabled = true;
			balloon.input.enableDrag(false, true);
			//balloon.events.onDragStart.add(release, _this);
			balloon.events.onDragStop.add(attatchToBasket, _this);
			balloons.add(balloon);
			airballoon.add(balloon);
			balloons.add(balloon);

		}
	}


	// Does not reset the ballons in airballoon.
	function resetBalloons()
	{
		//balloon.kill();
		balloons.removeAll(true);
		airballoon.removeBetween(1, 19, true);
		createBalloons();
	}

	// this one throws the balloons away to x: -31 and y: -126 for some reason. Will look into it.
	/*function release(balloon){
		balloons.add(balloon);
	}*/

	function attatchToBasket(balloon){
		if(airballoon.getIndex(balloon) !== -1)
		{
			balloons.add(balloon);
			balloon.x = game.input.x - 20;
			balloon.y = game.input.y - 20;
		}
		if(checkOverlap(balloon, airballoon))
		{
			airballoon.add(balloon);
			console.log('# of enteties in airballoon: ' + airballoon.length);
			balloon.x = -balloon.width/2+(airballoon.length-2)*15;
			balloon.y = -balloon.height;
		}
	}

	function checkOverlap(spriteA, spriteB)
	{
		var boundsA = spriteA.getBounds();
		var boundsB = spriteB.getBounds();
		return Phaser.Rectangle.intersects(boundsA, boundsB);
	}

	function move() {

		var amount = airballoon.length-1;

		var tl = new TimelineMax();
		if (airballoon.y === 600){
			tl.to(airballoon, 1, {x: 775, y: airballoon.y-cliffheight*amount});
		}
		else{
			tl.to(airballoon, 1, {x: 775, y: 600});
		}

	}

	/*
	function showNumbers () {
		_this.hudGroup.visible = true;
		buttons.reset();
		buttons.visible = true;
		//yesnos.visible = false;
		_this.disable(false);
		//_this.agent.eyesFollowPointer();
	}*/
	

	// Make sure the call this when everything is set up.
	this.startGame();
};





