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
	this.load.audio('birdheroAgentTry',       ['assets/audio/agent/panda/i_try.mp3', 'assets/audio/agent/panda/i_try.ogg']);
	this.load.spritesheet('spritesheet', 'assets/img/subgames/balloon/skatterna-i-berget-objekt.png',170,349,6);
	this.load.image('eyes',      'assets/img/subgames/balloon/eyes.png');

	this.load.audio('birdheroAgentHmm',       LANG.SPEECH.AGENT.hmm);
	this.load.audio('birdheroAgentCorrected', LANG.SPEECH.AGENT.showMe);
	this.load.audio('birdheroAgentOops',      LANG.SPEECH.AGENT.tryAgain);

	this.load.image('balloonBg',      'assets/img/subgames/balloon/balloonBg.png');
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
var scale = 0.85;
var airballoons;
var cliffheight;
var cliff;
//var cave;
var chest;
var liftoffButton;
//var resetButton;
var balloons;
var balloonStack1;
var balloonStack2;
var eyes;
var balloonStock = 6;
var airBalloonStock = 0;



/* Phaser state function */
BalloonGame.prototype.create = function () {
	var _this = this; // Subscriptions to not have access to 'this' object
	var bgMusic = this.add.audio('birdheroMusic', 1, true);
	
	_this.disable(false);

	var coords = {
		balloons: {
			x: 50, y: 100
		},
		agent: {
			start: { x: 250, y: 950 },
			stop: { x: 390, y: 500 },
			scale: 0.25
		},
		basketBalloons: {
			x: 790, y: 440
		},
		beetle: {
			start: { x: 790, y: 1000 },
			stop: { x: 640, y: 450 },
			basketStop: { x: 785, y: 500 },
			scale: 0.65
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

		//Right
		cliff = this.add.sprite(1000, 450 - (cliffheight * scale * (i+1) * 2), 'spritesheet', 2, this.gameGroup);
		cliff.scale.x = -scale;
		cliff.scale.y = scale;

		//Left
		cliff = this.add.sprite(1024-170*2.2, 450 - (cliffheight * scale * (i+1) * 2 + cliffheight*scale), 'spritesheet', 2, this.gameGroup);
		cliff.scale.x = scale;
		cliff.scale.y = scale;

	}

	chest = _this.add.sprite(1200, 900, 'spritesheet', 3, _this.gameGroup);
	chest.visible = false;
	eyes = _this.add.sprite(1200, 900, 'eyes', 3, _this.gameGroup);

	// Setting up balloon related sprites and groups.
	airballoons = this.add.group(this.gameGroup);
	airballoons.x = 0;
	airballoons.y = 0;

	var beetle = this.add.sprite(coords.beetle.start.x, coords.beetle.start.y, 'spritesheet', 4, this.gameGroup);
	beetle.scale.set(coords.beetle.scale);
	airballoons.add(beetle);

	airballoons.basket = this.add.sprite(785, 510, 'spritesheet', 5, airballoons);
	airballoons.basket.scale.x = 0.7;
	airballoons.basket.scale.y = 0.7;

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

	// x = game.world.centerX
	liftoffButton = game.add.button(100, 660, 'wood', takeOff, this);
	liftoffButton.visible = false;
	this.hudGroup.add(liftoffButton);

	var yesnos = new ButtonPanel(2, GLOBAL.NUMBER_REPRESENTATION.yesno, {
		y: this.world.height-100, background: 'wood', onClick: pushYesno
	});
	yesnos.visible = false;
	this.hudGroup.add(yesnos);

	function showYesnos () {
		yesnos.reset();
		fade(liftoffButton, false);
		fade(yesnos, true);

		if (_this.agent.visible) { _this.agent.eyesFollowPointer(); }
	}

	function showLiftoff () {
		fade(liftoffButton, true);
		fade(yesnos, false);

		if (_this.agent.visible) { _this.agent.eyesFollowPointer(); }
	}

	function pushYesno (value) {
		if (!value) {
			say('birdheroAgentCorrected', _this.agent).play();
			showLiftoff();
		}
		else { agentFloatBalloons(_this.agent.lastGuess); }
	}

	function agentFloatBalloons(guess)
	{
		airBalloonStock = guess;
		balloonStock = 6-guess;
		balloonStockUpdate();
		airBalloonStockUpdate();
		takeOff();
	}

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
			tl.eventCallback('onComplete', function() {
				airBalloonStockUpdate();
			});
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
		tl.eventCallback('onStart', function () { _this.skipper = tl; });
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
				tl.to(airballoons, amount/2, {x: 0, y: -cliffheight*amount*scale-50, ease:Power1.easeOut});
				console.log('Correct!');
				tl.addCallback(function () {
					fade(eyes, false);
					fade(chest, true);
				});
				tl.add(_this.addWater(chest.x, chest.y), '-=3');
				tl.to(airballoons, amount/2, {x: 0, y: 0, ease:Power1.easeOut});
				//TODO: Add victory animation. 
			} else if (result > 0)
			{
				tl.to(airballoons, amount/2, {x: 0, y: -cliffheight*amount*scale-50, ease:Power1.easeIn});
				console.log('Too many!');
				tl.to(beetle, 0.5, {x: coords.beetle.basketStop.x, y: coords.beetle.basketStop.y-50, ease:Power4.easeIn});
				tl.addCallback(function () {
					resetBalloons();
					//returnBalloonsFrom(0,-cliffheight*amount);
				});
				tl.to(beetle, 0.5, {x: coords.beetle.basketStop.x, y: coords.beetle.basketStop.y, ease:Power4.easeIn});
				tl.to(airballoons, amount/2, {x: 0, y: 0, ease:Bounce.easeOut});
			} else
			{
				
				tl.to(airballoons, amount, {x: 0, y: -cliffheight*amount*scale-50, ease:Power1.easeOut});
				console.log('Too few!'); //TODO: Add sound as well.
				//pop balloons
				tl.to(beetle, 0.5, {x: coords.beetle.basketStop.x, y: coords.beetle.basketStop.y-50, ease:Power4.easeIn});
				tl.addCallback(function () {
					resetBalloons();
					//returnBalloonsFrom(0,-cliffheight*amount);
				});
				tl.to(beetle, 0.5, {x: coords.beetle.basketStop.x, y: coords.beetle.basketStop.y, ease:Power4.easeIn});
				tl.to(airballoons, amount/2, {x: 0, y: 0, ease:Bounce.easeOut});

				//TODO: Add animation of balloon falling down with a bounce after balloons float back. Next round.
			}

			//Possible that you could add next round in here as it might not do anything for balloongame unless you actually guess correct.
			tl.eventCallback('onComplete', function(){
				_this.disable(false);
				_this.agent.eyesFollowPointer();
				_this.nextRound();
			});
		}
	}

	function resetBalloons() {

		var amount = airBalloonStock;

		for (var i = 0; i < amount; i++){
			returnStart();
			deleteExcessSprite(airballoons.getAt(3));
		}
	}
/*
	//Animation to float the balloons back. Not used anymore.
	function returnBalloonsFrom(fromX, fromY) {
		var tl = new TimelineMax();
		var amount = airBalloonStock;
		for (var i = 2; i < amount+2; i++){
			tl.to(airballoons.getAt(i), 1, {x: balloonStack1.x-fromX, y: balloonStack1.y-fromY,
				onStart:returnStart,
				onComplete:deleteExcessSprite,
				onCompleteParams:[airballoons.getAt(i)],
				ease:Power1.easeOut});
			//For some reason these happen before the above animation.
			//These are different things I have tried but they all happen before the above animation which I though 'onComplete' was suppose to prevent.
			//What we want to do is delete the sprite once it finishes moving. Alternatively hide it or move it to the balloons group. Neither of which I'm capable of doing AFTER the animation ends.
			//tl.eventCallback('onComplete', airballoons.getAt(i).x = -1000);
			//tl.eventCallback('onComplete', airballoons.getAt(i).y = -1000);
			//tl.eventCallback('onComplete', airballoons.getAt(i).kill);
			//tl.eventCallback('onComplete', airballoons.remove(airballoons.getAt(i)));
			//tl.eventCallback('onComplete', balloons.add(airballoons.getAt(i)));
		}
		tl.to(airballoons, amount/2, {x: 0, y: 0, ease:Power1.easeOut});
	}
*/
	function returnStart() {
		airBalloonStock -= 1;
		airBalloonStockUpdate();
	}

	function deleteExcessSprite(sprite) {
		console.log(sprite);
		sprite.destroy();
		balloonStock += 1;
		balloonStockUpdate();
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


	function renderChest (correctAnswer) {

		fade(chest, false);

		if(correctAnswer % 2 === 0)
			{
				chest.x = 690;
				eyes.x = 703;
			}
		else
			{
				chest.x = 890;
				eyes.x = 903;
			}

			chest.y = 465 - (cliffheight * scale * (correctAnswer));
			eyes.y = 535 - (cliffheight * scale * (correctAnswer));
			chest.scale.x = 0.4;
			chest.scale.y = 0.4;
			eyes.scale.x = 0.3;
			eyes.scale.y = 0.3;
			fade(eyes, true);


	}

	function agentGuess () {
		_this.agent.guessNumber(_this.currentNumber, 1, _this.amount);

		return TweenMax.fromTo(_this.agent.thought.scale, 1.5,
			{ x: 0, y: 0 },
			{ x: 1, y: 1,
				ease: Elastic.easeOut,
				onStart: function () {
					_this.agent.thought.visible = true;
					if (_this.agent.thought.guess) { _this.agent.thought.guess.destroy(); }
					say('birdheroAgentHmm', _this.agent).play();
				},
				onComplete: function () {
					_this.agent.thought.guess = new NumberButton(_this.agent.lastGuess, _this.representation, {
						x: -50, y: -50, size: 100
					});
					_this.agent.thought.add(_this.agent.thought.guess);
					// TODO: Agent should say something here based on how sure it is.
					showYesnos();
				}
			});
	}

	this.modeIntro = function () {
		console.log('ModeIntro');
		_this.disable(true);
		bgMusic.play();
		var tl = new TimelineMax();
		tl.eventCallback('onStart', function () { _this.skipper = tl; });
		tl.to(beetle, 3, {x: coords.beetle.stop.x, y: coords.beetle.stop.y, ease:Power1.easeIn});
		tl.to(beetle, 2, {x: coords.beetle.basketStop.x, y: coords.beetle.basketStop.y, ease:Power1.easeIn});

		tl.eventCallback('onComplete', function () {
			_this.disable(false);
			_this.nextRound();
		});
	};

	this.modePlayerDo = function (intro, tries) {
		if (tries > 0) {
			showLiftoff();
		} else { // if intro or first try	
			//var t = new TimelineMax();
			if (intro) {
				console.log('modeplayerDoIntro');
				console.log('correct answer= ' + _this.currentNumber);
				renderChest(_this.currentNumber);
			}
		showLiftoff();
		}
	};

	this.modePlayerShow = function (intro, tries) {
		if (tries > 0) {
			showLiftoff();
		} else { // if intro or first try
			var tl = new TimelineMax();
			if (intro) {
				_this.disable(true);
				tl.eventCallback('onStart', function () { _this.skipper = tl; });
				tl.add(_this.agent.moveTo.start());
				tl.addSound('birdheroAgentShow', _this.agent);
				tl.add(_this.agent.wave(3, 1), 'agentIntro');
				tl.eventCallback('onComplete', function () {
					_this.sound.removeByKey('birdheroAgentShow');
					renderChest(_this.currentNumber);
					_this.disable(false);
				});
				console.log('modeplayerShow Intro');
				console.log('correct answer= ' + _this.currentNumber);
			}
		tl.addCallback(showLiftoff);
		}
	};

	this.modeAgentTry = function (intro, tries) {
		var tl = new TimelineMax();
		if (tries > 0) {
			tl.addSound('birdheroAgentOops', _this.agent);
			tl.add(agentGuess());
		} else { // if intro or first try
			if (intro) {
				_this.disable(true);
				tl.eventCallback('onStart', function () { _this.skipper = tl; });
				console.log('modeAgentTry Intro');
				console.log('correct answer= ' + _this.currentNumber);
				tl.add(_this.agent.moveTo.start()); // Agent should be here already.
				tl.addSound('birdheroAgentTry', _this.agent);
				tl.eventCallback('onComplete', function () {
					renderChest(_this.currentNumber);
					_this.sound.removeByKey('birdheroAgentTry');
					_this.disable(false);
				});
			}
		tl.add(agentGuess());
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
		balloonStock = 6;
		airBalloonStock = 0;
		_this.agent.fistPump()
			.addCallback(function () {
				balloonStockUpdate();
				airBalloonStockUpdate();
				_this.nextRound();
			});
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





