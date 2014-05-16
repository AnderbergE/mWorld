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

	this.load.audio('birdheroMusic',          ['assets/audio/subgames/birdhero/bg.mp3', 'assets/audio/subgames/birdhero/bg.ogg']);
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
var airballoons;
var cliffheight;
var cliff;
var cave;
var liftoffButton;
//var resetButton;
var glass;
var balloons;
var balloonStack1;
var balloonStack2;
var balloonStock = 6;
var airBalloonStock = 0;



/* Phaser state function */
BalloonGame.prototype.create = function () {
	var _this = this; // Subscriptions to not have access to 'this' object
	var bgMusic = this.add.audio('birdheroMusic', 1, true);

	_this.disable(false);

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

	airballoons = this.add.group(this.gameGroup);
	airballoons.x = 0;
	airballoons.y = 0;
	airballoons.basket = this.add.sprite(775, 600, 'basket', null, airballoons);
	airballoons.basket.scale.x = 0.2;
	airballoons.basket.scale.y = 0.2;

	balloons = this.add.group(this.gameGroup);
	balloons.x = 0;
	balloons.y = 0;

	balloonStack1 = _this.add.sprite(0, 0, 'balloon6', null, _this.gameGroup);
	balloonStack2 = _this.add.sprite(0, 0, 'balloon6', null, _this.gameGroup);

	var coords = {
		balloons: {
			x: 50, y: 50
		},
		basketBalloons: {
			x: 775, y: 500
		}
	};


	
	airballoons.add(balloonStack2);

	balloonStack1.x = coords.balloons.x;
	balloonStack1.y = coords.balloons.y;
	balloonStack1.scale.x = 0.2;
	balloonStack1.scale.y = 0.2;

	balloonStack2.x = coords.basketBalloons.x;
	balloonStack2.y = coords.basketBalloons.y;
	balloonStack2.scale.x = 0.2;
	balloonStack2.scale.y = 0.2;
	balloonStack2.kill();



	//Kills the sprites not suppose to show up at the moment and revives those who are.
	balloonStockUpdate();
	airBalloonStockUpdate();

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

	function createAirBalloon()
	{
		if (airballoons.length < 3){
			var balloon = _this.add.sprite(coords.basketBalloons.x, coords.basketBalloons.y, 'balloon', null, _this.gameGroup);
			balloon.scale.x = 0.2;
			balloon.scale.y = 0.2;
			balloon.inputEnabled = true;
			balloon.input.enableDrag(false, true);
			balloon.events.onDragStart.add(release, _this);
			balloon.events.onDragStop.add(attatchToBasket, _this);
			airballoons.add(balloon);
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
		if(airballoons.getIndex(balloon) === -1)
		{
			balloonStock -= 1;
			balloonStockUpdate();
		}
		else
		{
			airBalloonStock -=1;
			balloons.add(balloon);
			airBalloonStockUpdate();
		}
	}

	//A little buggy still, if you move balloons in and out too fast some of them can get lost.
	function attatchToBasket(balloon){
		var tl = new TimelineMax();
		if(checkOverlap(balloon, airballoons))
		{
			airBalloonStock += 1;
			airballoons.add(balloon);
			tl.to(balloon, 1, {x: coords.basketBalloons.x, y: coords.basketBalloons.y});
			tl.eventCallback('onComplete', airBalloonStockUpdate);
			balloonStockUpdate();

			console.log('# of enteties in airballoon: ' + airballoons.length);
			console.log('# of enteties in balloons: ' + balloons.length);
			console.log('# balloonstock: ' + balloonStock);
			console.log('# airballoonstock: ' + airBalloonStock);

		}
		else
		{
			balloonStock += 1;
			tl.to(balloon, 1, {x: coords.balloons.x, y: coords.balloons.y});
			tl.eventCallback('onComplete', balloonStockUpdate);
			airBalloonStockUpdate();

			console.log('# of enteties in airballoon: ' + airballoons.length);
			console.log('# of enteties in balloons: ' + balloons.length);
			console.log('# balloonstock: ' + balloonStock);
			console.log('# airballoonstock: ' + airBalloonStock);

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

	function airBalloonStockUpdate() {
		switch(airBalloonStock) {
			case 0:
				balloonStack2.kill();
			break;
			case 1:
				balloonStack2.revive();
				balloonStack2.loadTexture('balloon');
				createAirBalloon();
			break;
			case 2:
				balloonStack2.revive();
				balloonStack2.loadTexture('balloon2');
				createAirBalloon();
			break;
			case 3:
				balloonStack2.revive();
				balloonStack2.loadTexture('balloon3');
				createAirBalloon();
			break;
			case 4:
				balloonStack2.revive();
				balloonStack2.loadTexture('balloon4');
				createAirBalloon();
			break;
			case 5:
				balloonStack2.revive();
				balloonStack2.loadTexture('balloon5');
				createAirBalloon();
			break;
			case 6:
				balloonStack2.revive();
				balloonStack2.loadTexture('balloon6');
				createAirBalloon();
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

		var amount = airBalloonStock;

		var tl = new TimelineMax();
		if (airballoons.y === 0){
			_this.disable(true);
			tl.to(airballoons, amount/2, {x: 0, y: -cliffheight*amount, ease:Power1.easeOut});
			tl.eventCallback('onComplete', winCheck(amount));
		}
		else{
			_this.disable(false);
			tl.to(airballoons, amount/2, {x: 0, y: 0, ease:Power1.easeOut});
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
		console.log('1');
		_this.nextRound();
	};

	this.modePlayerDo = function (intro, tries) {
		console.log('2');
		bgMusic.play();
		if (tries > 0) {
			console.log('3');
			liftoffButton.visible = true;
		} else { // if intro or first try
			console.log('4');
			liftoffButton.visible = true;
			var t = new TimelineMax();
			if (intro) {
				console.log('5');
				t.add(instructionIntro());
			}
		}
	};


	// Make sure the call this when everything is set up.
	this.startGame();
};





