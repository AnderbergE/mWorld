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
	this.load.image('cave',      'assets/img/subgames/balloon/cave.png');
	this.load.image('emptyglass',      'assets/img/subgames/balloon/emptyglass.png');
	this.load.image('fullglass',      'assets/img/subgames/balloon/fullglass.png');

	this.load.image('balloonBg',      'assets/img/subgames/balloon/bg.png');
	this.load.image('balloon2',      'assets/img/subgames/balloon/balloon2.png');
	this.load.image('balloon3',      'assets/img/subgames/balloon/balloon3.png');
	this.load.image('balloon4',      'assets/img/subgames/balloon/balloon4.png');
	this.load.image('balloon5',      'assets/img/subgames/balloon/balloon5.png');
	this.load.image('balloon6',      'assets/img/subgames/balloon/balloon6.png');

	this.load.audio('birdheroIntro', ['assets/audio/subgames/birdhero/bg.mp3', 'assets/audio/subgames/birdhero/bg.ogg']);
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
var cave;
var liftoffButton;
var resetButton;
var glass;
var balloons;
var balloonStack1;
//var balloonStack2;
var balloonStock = 6;
var bgMusic = this.add.audio('birdheroMusic', 1, true);


/* Phaser state function */
BalloonGame.prototype.create = function () {
	var _this = this; // Subscriptions to not have access to 'this' object


	_this.disable(false);
	
	this.music = this.add.audio('birdheroIntro', 1, true);

	cliffheight = this.cache.getImage('cliffside').height;

	// Add main game
	background = this.add.sprite(0, 0, 'balloonBg', null, this.gameGroup);


	// Adding the platforms on the cliff wall.
	for (var i = 0; i < 5; i++){

		cave = this.add.sprite(960, 635 - (cliffheight * scale * (i+1) * 2), 'cave', null, this.gameGroup);
		cave.scale.x = -0.6;
		cave.scale.y = 0.6;

		cliff = this.add.sprite(1024, 670 - (cliffheight * scale * (i+1) * 2), 'cliffside', null, this.gameGroup);
		cliff.scale.x = -scale;
		cliff.scale.y = scale;

		cave = this.add.sprite(1060-this.cache.getImage('cliffside').width*2.5, 635 - (cliffheight * scale * (i+1) * 2 + cliffheight), 'cave', null, this.gameGroup);
		cave.scale.x = 0.6;
		cave.scale.y = 0.6;

		cliff = this.add.sprite(1024-this.cache.getImage('cliffside').width*2.5, 670 - (cliffheight * scale * (i+1) * 2 + cliffheight), 'cliffside', null, this.gameGroup);
		cliff.scale.x = scale;
		cliff.scale.y = scale;

	}

	/*glass = this.add.sprite(960, 635 - (cliffheight * scale * (1+1) * 2), 'fullglass', null, this.gameGroup);
	glass.scale.x = -0.5;
	glass.scale.y = 0.5;
	*/
	glass = this.add.sprite(1070-this.cache.getImage('cliffside').width*2.5, 635 - (cliffheight * scale * (1+1) * 2 + cliffheight), 'fullglass', null, this.gameGroup);
	glass.scale.x = 0.4;
	glass.scale.y = 0.4;

	airballoon = this.add.group(this.gameGroup);
	airballoon.x = 0;
	airballoon.y = 0;
	airballoon.basket = this.add.sprite(775, 600, 'basket', null, airballoon);
	airballoon.basket.scale.x = 0.2;
	airballoon.basket.scale.y = 0.2;

	balloons = this.add.group(this.gameGroup);
	balloons.x = 0;
	balloons.y = 0;

	balloonStack1 = _this.add.sprite(0, 0, 'balloon6', null, _this.gameGroup);

	var coords = {
		balloons: {
			x: 50, y: 50
		},
		basketBalloons: {
			x: 820-balloonStack1.width/2, y: 600-balloonStack1.height
		}
	};

	balloonStack1.x = coords.balloons.x;
	balloonStack1.y = coords.balloons.y;
	balloonStack1.scale.x = 0.2;
	balloonStack1.scale.y = 0.2;



	//Kills the sprites not suppose to show up at the moment and revives those who are.
	balloonStockUpdate();

	//Creates one draggable balloon at the stack.
	//createBalloon();

	liftoffButton = game.add.button(game.world.centerX, 660, 'wood', takeOff, this);
	liftoffButton.visible = false;
	
	/*
	var buttons = new ButtonPanel(this.amount, this.representation, {
	y: this.world.height-(this.representation.length*75)-25, background: 'balloon', onClick: move
	});
	this.hudGroup.add(buttons);

	showNumbers();
	*/

	//Creates one draggable balloon at the stack.
	function createBalloon()
	{
		if (balloons.length < 1){
			var balloon = _this.add.sprite(coords.balloons.x, coords.balloons.y, 'balloon', null, _this.gameGroup);
			balloon.scale.x = 0.2;
			balloon.scale.y = 0.2;
			balloon.inputEnabled = true;
			balloon.input.enableDrag(false, true);
			balloon.events.onDragStart.add(release, _this);
			balloon.events.onDragStop.add(attatchToBasket, _this);
			balloons.add(balloon);
		}

	}


	/* Does not reset the ballons in airballoon.
	function resetBalloons()
	{
		balloonStock = 6;
		balloons.removeAll(true);
		airballoon.removeBetween(1, 19, true);
		createBalloon();
	}*/

	function release(balloon) {
		if(airballoon.getIndex(balloon) === -1)
		{
			balloonStock -= 1;
		}
		balloonStockUpdate();
		balloons.add(balloon);
	}

	//A little buggy still, if you move balloons in and out too fast some of them can get lost.
	function attatchToBasket(balloon){

		if(checkOverlap(balloon, airballoon))
		{
			airballoon.add(balloon);
			balloon.x = 775-balloon.width/2+(airballoon.length-2)*15;
			balloon.y = 600-balloon.height;
			balloonStockUpdate();

			console.log('# of enteties in airballoon: ' + airballoon.length);
			console.log('# of enteties in balloons: ' + balloons.length);

		}
		else
		{
			balloonStock += 1;
			var tl = new TimelineMax();
			tl.to(balloon, 1, {x: coords.balloons.x, y: coords.balloons.y});
			tl.eventCallback('onComplete', balloonStockUpdate);

		}
	}

	//Kills the sprites not suppose to show up at the moment and revives those who are.
	function balloonStockUpdate() {
		switch(balloonStock) {
			case 0:
				balloonStack1.kill();
			break;
			case 1:
				balloonStack1.revive();
				balloonStack1.loadTexture('balloon');
				createBalloon();
			break;
			case 2:
				balloonStack1.revive();
				balloonStack1.loadTexture('balloon2');
				createBalloon();
			break;
			case 3:
				balloonStack1.revive();
				balloonStack1.loadTexture('balloon3');
				createBalloon();
			break;
			case 4:
				balloonStack1.revive();
				balloonStack1.loadTexture('balloon4');
				createBalloon();
			break;
			case 5:
				balloonStack1.revive();
				balloonStack1.loadTexture('balloon5');
				createBalloon();
			break;
			case 6:
				balloonStack1.revive();
				balloonStack1.loadTexture('balloon6');
				createBalloon();
			break;
		}
	}


	function checkOverlap(spriteA, spriteB)
	{
		var boundsA = spriteA.getBounds();
		var boundsB = spriteB.getBounds();
		return Phaser.Rectangle.intersects(boundsA, boundsB);
	}

	function takeOff() {

		var amount = airballoon.length-1;

		var tl = new TimelineMax();
		if (airballoon.y === 0){
			tl.to(airballoon, amount/2, {x: 0, y: -cliffheight*amount, ease:Power1.easeOut});
			tl.eventCallback('onComplete', winCheck(airballoon.length-1));
		}
		else{
			tl.to(airballoon, amount/2, {x: 0, y: 0, ease:Power1.easeOut});
		}
	}

	function winCheck(number) {

		var result = _this.tryNumber(number);
		var tl = new TimelineMax();

		if (!result) { /* Correct :) */
			tl.addLabel('correct');
		} else { /* Incorrect :( */
			tl.addLabel('wrong');
	}

	function instructionIntro () {
		var t = new TimelineMax();
		t.addLabel('test');
		/*t.addSound('birdheroInstruction1a', bird);
		t.add(bird.pointAtFeathers());
		t.addSound('birdheroInstruction1b', bird);
		t.eventCallback('onComplete', function () {
			_this.sound.removeByKey('birdheroInstruction1a');
			_this.sound.removeByKey('birdheroInstruction1b');
		});*/
		return t;
	}

	this.modeIntro = function () {
		this.nextMode();
	};

	this.modePlayerDo = function (intro, tries) {
		bgMusic.play();
		if (tries > 0) {
			liftoffButton.visible = true;
		} else { // if intro or first try
			var t = new TimelineMax();
			if (intro) {
				t.add(instructionIntro());
			}
		}
	};


	// Make sure the call this when everything is set up.
	this.startGame();
};





