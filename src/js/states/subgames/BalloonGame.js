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
	this.load.image('birdheroThought', 'assets/img/subgames/birdhero/thoughtbubble.png');
	this.load.audio('birdheroAgentShow',      ['assets/audio/agent/panda/hello.mp3', 'assets/audio/agent/panda/hello.ogg']);

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
var glass;
var liftoffButton;
//var resetButton;
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

	var coords = {
		balloons: {
			x: 50, y: 50
		},
		agent: {
			start: { x: 250, y: 950 },
			stop: { x: 390, y: 500 },
			scale: 0.25
		},
		basketBalloons: {
			x: 775, y: 500
		}
	};

	cliffheight = this.cache.getImage('cliffside').height;

	// Add main game
	background = this.add.sprite(0, 0, 'balloonBg', null, this.gameGroup);

	// Agent is added to the game in the superclass, so set up correct start point.
	this.agent.x = coords.agent.start.x;
	this.agent.y = coords.agent.start.y;
	this.agent.scale.set(coords.agent.scale);
	this.agent.visible = true;
	// Adding thought bubble that is used in the agent try mode.
	this.agent.thought = this.add.group(this.gameGroup);
	this.agent.thought.x = coords.agent.stop.x - 200;
	this.agent.thought.y = coords.agent.stop.y - 200;
	this.agent.thought.visible = false;
	var thoughtBubble = this.add.sprite(0, 0, 'birdheroThought', null, this.agent.thought);
	thoughtBubble.anchor.set(0.5);
	this.gameGroup.bringToTop(this.agent);


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

	glass = _this.add.sprite(1200, 900, 'fullglass', null, _this.gameGroup);

	// Setting up balloon related sprites and groups.
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

	//release and attatchToBasket control the dragging and snapping of balloons.
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

	function attatchToBasket(balloon){
		
		var tl = new TimelineMax();
		if(checkOverlap(balloon, airballoons))
		{
			airBalloonStock += 1;
			airballoons.add(balloon);
			tl.to(balloon, 1, {x: coords.basketBalloons.x, y: coords.basketBalloons.y});
			tl.eventCallback('onComplete', airBalloonStockUpdate);
			balloonStockUpdate();
		}
		else
		{
			balloonStock += 1;
			tl.to(balloon, 1, {x: coords.balloons.x, y: coords.balloons.y});
			tl.eventCallback('onComplete', balloonStockUpdate);
			airBalloonStockUpdate();
		}
		console.log('# balloonstock: ' + balloonStock);
		console.log('# airballoonstock: ' + airBalloonStock);
	}

	function checkOverlap(spriteA, spriteB)
	{
		var boundsA = spriteA.getBounds();
		var boundsB = spriteB.getBounds();
		return Phaser.Rectangle.intersects(boundsA, boundsB);
	}

	function takeOff() {

		var amount = airBalloonStock;
		
		//Begin here tomorrow! TODO: Add fail and success states when balloon takes off. Maybe rewrite the whole thing.
		//var result = _this.tryNumber(amount);

		var tl = new TimelineMax();
		if (amount <= 0)
		{
			console.log('No balloons!');
			//TODO: Add a voice saying you need to attatch balloons to the basket.
		} else {
			var result = _this.tryNumber(amount);
			_this.agent.eyesFollowObject(airballoons.basket);
			_this.disable(true);
			liftoffButton.visible = false;

			if (!result)
			{
				tl.to(airballoons, amount/2, {x: 0, y: -cliffheight*amount, ease:Power1.easeOut});
				console.log('Correct!');
				tl.to(airballoons, amount/2, {x: 0, y: 0, ease:Power1.easeOut});
				//TODO: Add victory animation. Next round.
			} else if (result > 0)
			{
				tl.to(airballoons, amount/2, {x: 0, y: -cliffheight*amount, ease:Power1.easeOut});
				console.log('Too many!');
				tl.to(airballoons, amount/2, {x: 0, y: 0, ease:Power1.easeOut});
				//TODO: Add animation of balloon blowing down then balloons flowing back. Next round.
			} else
			{
				
				tl.to(airballoons, amount/2, {x: 0, y: -cliffheight*amount, ease:Power1.easeOut});
				console.log('Too few!');
				tl.to(airballoons, amount/2, {x: 0, y: 0, ease:Power1.easeOut});
				//TODO: Add animation of balloon falling down with a bounce after balloons float back. Next round.
			}

			//Possible that you could add next round in here as it might not do anything for balloongame unless you actually guess correct.
			tl.eventCallback('onComplete', function(){
				_this.disable(false);
				liftoffButton.visible = true;
				_this.agent.eyesFollowPointer();
				_this.nextRound();
			});
		}
	}

	//Add more for Agent to move elsewhere.
	this.agent.moveTo = {
		start: function () {
			if (_this.agent.x === coords.agent.stop.x &&
				_this.agent.y === coords.agent.stop.y) {
				return new TweenMax(_this.agent);
			}
			return _this.agent.move({ x: coords.agent.stop.x, y: coords.agent.stop.y }, 3);
		}
	};


	function instructionIntro (correctAnswer) {
		//var t = new TimelineMax();
		//t.addLabel('test');
		console.log('test');

		if(correctAnswer % 2 === 0)
			{
				glass.x = 1070-_this.cache.getImage('cliffside').width*2.5;
				glass.y = 635 - (cliffheight * scale * (correctAnswer+1));
			}
		else
			{
				glass.x = 900;
				glass.y = 635 - (cliffheight * scale * (correctAnswer+1));
			}

			glass.scale.x = 0.4;
			glass.scale.y = 0.4;
	}


	this.modeIntro = function () {
		console.log('ModeIntro');
		_this.nextRound();
	};

	this.modePlayerDo = function (intro, tries) {
		bgMusic.play();
		if (tries > 0) {
			liftoffButton.visible = true;
		} else { // if intro or first try	
			//var t = new TimelineMax();
			if (intro) {
				console.log('modeplayerDoIntro');
				console.log('correct answer= ' + _this.currentNumber);
				instructionIntro(_this.currentNumber);
			}
		liftoffButton.visible = true;
		}
	};

	this.modePlayerShow = function (intro, tries) {
		if (tries > 0) {
			liftoffButton.visible = true;
		} else { // if intro or first try
			var t = new TimelineMax();
			if (intro) {

				instructionIntro(_this.currentNumber);
				t.add(_this.agent.moveTo.start());
				t.addLabel('agentIntro');
				t.addSound('birdheroAgentShow', _this.agent);
				t.add(_this.agent.wave(3, 1), 'agentIntro');
				t.eventCallback('onComplete', function () { _this.sound.removeByKey('birdheroAgentShow'); });
				console.log('modeplayerShow Intro');
			}
		liftoffButton.visible = true;
		}
	};

	this.modeAgentTry = function (intro, tries) {
		//var t = new TimelineMax();
		if (tries > 0) {
			liftoffButton.visible = true;
		} else { // if intro or first try
			if (intro) {
				console.log('modeAgentTry Intro');
			}
		liftoffButton.visible = true;
		}
	};

	this.modeAgentDo = function (intro, tries) {
		if (tries > 0) {
			liftoffButton.visible = true;
		} else { // if intro or first try
			console.log('modeAgentDo Intro');
			liftoffButton.visible = true;
		}
	};

	this.modeOutro = function () {
		this.nextRound();
	};

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

	// Make sure the call this when everything is set up.
	this.startGame();
};





