/* Balloon Game */
BalloonGame.prototype = Object.create(Subgame.prototype);
BalloonGame.prototype.constructor = BalloonGame;
function BalloonGame () {
	Subgame.call(this); // Call parent constructor.
}

/* Phaser state function */
BalloonGame.prototype.preload = function () {

	this.load.audio('birdheroAgentShow', ['assets/audio/agent/panda/hello.mp3', 'assets/audio/agent/panda/hello.ogg']);
	this.load.audio('birdheroAgentTry', ['assets/audio/agent/panda/i_try.mp3', 'assets/audio/agent/panda/i_try.ogg']);
	this.load.spritesheet('spritesheet', 'assets/img/subgames/balloon/skatterna-i-berget-objekt.png',170,349,6);
	this.load.image('eyes', 'assets/img/subgames/balloon/eyes.png');
	this.load.image('metalLoop', 'assets/img/subgames/balloon/metalloop.png');
	this.load.spritesheet('catbush', 'assets/img/subgames/balloon/catbush2.png',191,88,10);
	this.load.spritesheet('treasures', 'assets/img/subgames/balloon/treasures.png', 75, 110, 6);

	this.load.audio('birdheroAgentHmm', LANG.SPEECH.AGENT.hmm);
	this.load.audio('birdheroAgentCorrected', LANG.SPEECH.AGENT.showMe);
	this.load.audio('birdheroAgentOops', LANG.SPEECH.AGENT.tryAgain);

	this.load.audio('beetleintro1', 'assets/audio/subgames/balloongame/beetleinstructions1.mp3');
	this.load.audio('beetleintro2', 'assets/audio/subgames/balloongame/beetleinstructions2.mp3');
	this.load.audio('beetleintro3', 'assets/audio/subgames/balloongame/beetleinstructions3.mp3');
	this.load.audio('agentintro', 'assets/audio/subgames/balloongame/agentintro.mp3');
	this.load.audio('newtreasure', 'assets/audio/subgames/balloongame/newtreasure.mp3');
	this.load.audio('tryless', 'assets/audio/subgames/balloongame/tryless.mp3');
	this.load.audio('trymore', 'assets/audio/subgames/balloongame/trymore.mp3');
	this.load.audio('success', 'assets/audio/subgames/balloongame/trymore.mp3');
	this.load.audio('agenthmm', 'assets/audio/subgames/balloongame/agenthmm1.mp3');
	this.load.audio('agenttry', 'assets/audio/subgames/balloongame/agenttry.mp3');
	this.load.audio('oops', 'assets/audio/subgames/balloongame/oops.mp3');
	this.load.audio('isitwrong', 'assets/audio/subgames/balloongame/isitwrong.mp3');
	this.load.audio('question', 'assets/audio/subgames/balloongame/agentquestion1.mp3');
	this.load.audio('pop', 'assets/audio/subgames/balloongame/pop.mp3');
	this.load.audio('catbushpurr', 'assets/audio/subgames/balloongame/catbushpurr.mp3');
	this.load.audio('chestunlock', 'assets/audio/subgames/balloongame/chestunlock.mp3');
	this.load.audio('sackjingle', 'assets/audio/subgames/balloongame/belljingle.mp3');

	this.load.image('sky', 'assets/img/subgames/balloon/sky.png');
	this.load.image('background', 'assets/img/subgames/balloon/background.png');
	this.load.image('balloon1', 'assets/img/subgames/balloon/b1.png');
	this.load.image('balloon2', 'assets/img/subgames/balloon/b2.png');
	this.load.image('balloon3', 'assets/img/subgames/balloon/b3.png');
	this.load.image('balloon4', 'assets/img/subgames/balloon/b4.png');
	this.load.image('balloon5', 'assets/img/subgames/balloon/b5.png');
	this.load.image('balloon6', 'assets/img/subgames/balloon/b6.png');
	this.load.image('balloon7', 'assets/img/subgames/balloon/b7.png');
	this.load.image('balloon8', 'assets/img/subgames/balloon/b8.png');
	this.load.image('balloon9', 'assets/img/subgames/balloon/b9.png');
	this.load.image('brokenballoon', 'assets/img/subgames/balloon/brokenballoon.png');
	this.load.image('cloud1', 'assets/img/subgames/balloon/cloud1.png');
	this.load.image('cloud2', 'assets/img/subgames/balloon/cloud2.png');
	this.load.image('map', 'assets/img/subgames/balloon/map.png');
	this.load.image('anchor', 'assets/img/subgames/balloon/anchor.png');
	this.load.image('closedChest', 'assets/img/subgames/balloon/chest.png');
	this.load.image('openChest', 'assets/img/subgames/balloon/chest_open.png');
	this.load.image('sack', 'assets/img/subgames/balloon/sack.png');

	this.load.audio('birdheroMusic', ['assets/audio/subgames/birdhero/bg.mp3', 'assets/audio/subgames/birdhero/bg.ogg']);
};

	

/* Phaser state function */
BalloonGame.prototype.create = function () {

	this.direction = 'right';
	var tempgroup;
	var background;
	var sky;
	var scale = 0.85;
	var airballoons;
	var cliff;
	var metalLoop;
	var chest;
	var liftoffButton;
	var eyes;
	var treasure;
	var balloonStack2;
	var balloonStock = 9;
	var airBalloonStock = 0;
	var catBush;
	var mapText;
	var treasures = 0;
	var map;
	var _this = this; // Subscriptions to not have access to 'this' object
	var stepSize = 9/this.amount;

	balloonStock = this.amount;

	var bgMusic = this.add.audio('birdheroMusic', 1, true);
	
	this.disable(false);

	var coords = {
		balloons: {
			x: 150, y: 500
		},
		agent: {
			start: { x: 250, y: 950 },
			stop: { x: 390, y: 500 },
			scale: 0.25
		},
		basketBalloons: {
			x: 830, y: 565
		},
		beetle: {
			start: { x: 790, y: 800 },
			stop: { x: 640, y: 450 },
			basketStop: { x: 785, y: 500 },
			scale: 0.65
		},
		cliff: {
			leftx: 660, rightx: 990
		},
		sack: {
			x:950, y:600
		}
	};

	// Add main game
	sky = this.add.sprite(0, 0, 'sky', null, this.gameGroup);
	this.cloud1 = this.add.sprite(-200, 25, 'cloud1', null, this.gameGroup);
	this.cloud2 = this.add.sprite(200, 200, 'cloud2', null, this.gameGroup);
	background = this.add.sprite(0, 0, 'background', null, this.gameGroup);

	
	catBush = game.add.sprite(175, 420, 'catbush', 0, this.gameGroup);
	catBush.animations.add('catBlink');
	catBush.inputEnabled = true;
	catBush.events.onInputDown.add(catBushPlay, this);

	function catBushPlay(){
		var tl = new TimelineMax();
		tl.addSound('catbushpurr');
		catBush.animations.play('catBlink', 8, false);
		catBush.events.onAnimationComplete.add(function(){
			catBush.loadTexture('catbush', 0);
		}, this);
	}


	// Adding the platforms on the cliff wall.
	for (var i = 0; i < this.amount; i++){

		if(i%2 === 0) {
			//Right
			cliff = this.add.sprite(coords.cliff.rightx, 350 - (55 * scale * (i) * stepSize), 'spritesheet', 2, this.gameGroup);
			cliff.scale.x = -scale;
			cliff.scale.y = scale;
		}else{
			//Left
			cliff = this.add.sprite(coords.cliff.leftx, 350 - (55 * scale * (i) * stepSize), 'spritesheet', 2, this.gameGroup);
			cliff.scale.x = scale;
			cliff.scale.y = scale;
		}
	}

	var sack = _this.add.sprite(coords.sack.x, coords.sack.y, 'sack', _this.gameGroup);
	sack.anchor.setTo(0.5, 0.5);
	sack.scale.set(0.8);

	treasure = _this.add.sprite(300, 300, 'treasures', 1, _this.gameGroup);
	treasure.anchor.setTo(0.5, 1);
	treasure.visible = false;
	treasure.scale.set(0.5);

	chest = _this.add.sprite(1200, 900, 'closedChest', _this.gameGroup);
	chest.anchor.setTo(0.5, 1);
	chest.visible = false;
	eyes = _this.add.sprite(1200, 900, 'eyes', 3, _this.gameGroup);

	// Setting up balloon related sprites and groups.
	tempgroup = this.add.group(this.gameGroup);

	airballoons = this.add.group(this.gameGroup);
	airballoons.x = 0;
	airballoons.y = 0;

	var beetle = this.add.sprite(coords.beetle.start.x, coords.beetle.start.y, 'spritesheet', 4, this.gameGroup);
	beetle.scale.set(coords.beetle.scale);
	airballoons.add(beetle);

	airballoons.basket = this.add.sprite(785, 510, 'spritesheet', 5, airballoons);
	airballoons.basket.scale.set(0.7);

	this.balloons = this.add.group(this.gameGroup);
	this.balloons.x = 0;
	this.balloons.y = 0;

	this.balloonStack1 = _this.add.sprite(0, 0, 'balloon6', null, _this.gameGroup);
	balloonStack2 = _this.add.sprite(0, 0, 'balloon6', null, _this.gameGroup);
	metalLoop = _this.add.sprite(0, 0, 'metalLoop', null, _this.gameGroup);

	airballoons.add(balloonStack2);

	this.balloonStack1.x = coords.balloons.x;
	this.balloonStack1.y = coords.balloons.y;

	this.balloonStack1.anchor.setTo(0.5, 1);

	metalLoop.x = coords.balloons.x-10;
	metalLoop.y = coords.balloons.y;
	metalLoop.scale.set(0.4);

	balloonStack2.x = coords.basketBalloons.x;
	balloonStack2.y = coords.basketBalloons.y;

	balloonStack2.anchor.setTo(0.5, 1);
	balloonStack2.kill();

	// Agent is added to the game in the superclass, so set up correct start point.
	this.agent.x = coords.agent.start.x;
	this.agent.y = coords.agent.start.y;
	this.agent.scale.set(coords.agent.scale);
	this.agent.visible = true;
	// Adding thought bubble that is used in the agent try mode.
	this.agent.thought = this.add.group(this.gameGroup);
	this.agent.thought.x = coords.agent.stop.x + 170;
	this.agent.thought.y = coords.agent.stop.y - 170;
	this.agent.thought.visible = false;

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

	var thoughtBubble = this.add.sprite(0, 0, 'thought', null, this.agent.thought);
	thoughtBubble.anchor.set(0.5);
	thoughtBubble.scale.x = -0.7;
	thoughtBubble.scale.y = 0.7;
	this.gameGroup.bringToTop(this.agent);
	map = game.add.sprite(coords.beetle.stop.x+70, coords.beetle.stop.y+60, 'map', null, _this.gameGroup);
	map.scale.setTo(0.6, 0.6);
	map.visible = false;

	//Kills the sprites not suppose to show up at the moment and revives those who are.
	balloonStockUpdate();
	airBalloonStockUpdate();

	liftoffButton = game.add.button(110, 680, 'wood', takeOff, this.hudgroup);
	liftoffButton.anchor.set(0.5, 0.5);
	liftoffButton.visible = false;
	var anchor = this.add.sprite(110, 680, 'anchor', null, this.hudGroup);
	anchor.anchor.set(0.5, 0.5);
	anchor.scale.set(0.5);
	anchor.visible = false;

	var yesnos = new ButtonPanel(2, GLOBAL.NUMBER_REPRESENTATION.yesno, {
		y: this.world.height-100, background: 'wood', onClick: pushYesno
	});
	yesnos.visible = false;
	this.hudGroup.add(yesnos);

	var pluspanel = new ButtonPanel(9, GLOBAL.NUMBER_REPRESENTATION.signedNumbers, {
		y: this.world.height-80, background: 'wood', onClick: pushPlus
	});
	pluspanel.visible = false;
	pluspanel.scale.setTo(0.65);
	this.hudGroup.add(pluspanel);

	var minuspanel = new ButtonPanel(9, GLOBAL.NUMBER_REPRESENTATION.signedNumbers, {
		y: this.world.height-150, background: 'wood', onClick: pushMinus, min: -9, max: -1
	});
	minuspanel.visible = false;
	minuspanel.scale.setTo(0.65);
	this.hudGroup.add(minuspanel);

	var buttonOptions = {
		background: 'wood',
		y: this.world.height-100
	};

	var plusminus = this.add.group(this.gameGroup);
	buttonOptions.onClick = function () { removeBalloon(); };
	buttonOptions.x = 400;
	plusminus.add(new TextButton('-', buttonOptions));
	buttonOptions.onClick = function () { addBalloon(); };
	buttonOptions.x = 500;
	plusminus.add(new TextButton('+', buttonOptions));
	plusminus.visible = false;
	this.hudGroup.add(plusminus);

	var foreGround = this.add.group(this.gameGroup);
	foreGround.add(chest);
	foreGround.add(treasure);

	var speech = this.add.audio('beetleintro1');
	speech.addMarker('yippi', 1.9, 1);

	function showYesnos () {
		yesnos.reset();
		fade(liftoffButton, false);
		fade(anchor, false);
		fade(yesnos, true);
		fade(plusminus, false);
		fade(pluspanel, false);
		fade(minuspanel, false);

		if (_this.agent.visible) { _this.agent.eyesFollowPointer(); }
	}

	function showLiftoff () {
		
		if((_this.method === GLOBAL.METHOD.incrementalSteps) && treasures) {
			fade(plusminus, true);
			fade(liftoffButton, true);
			fade(anchor, true);

		} else if ((_this.method === GLOBAL.METHOD.incrementalSteps) && !treasures) {
			fade(liftoffButton, true);
			fade(anchor, true);
		} else if (_this.method === GLOBAL.METHOD.addition) {
			fade(pluspanel, true);
		} else if (_this.method === GLOBAL.METHOD.additionSubtraction) {
			fade(pluspanel, true);
			fade(minuspanel, true);

		} else if (_this.method === GLOBAL.METHOD.count) {
			fade(liftoffButton, true);
			fade(anchor, true);
		}

		fade(yesnos, false);

		if (_this.agent.visible) { _this.agent.eyesFollowPointer(); }
	}

	function pushYesno (value) {
		//TODO add random sounds
		if (!value) {
			_this.agent.say('isitwrong').play();
			enableBalloons();
			_this.disable(false);
			showLiftoff(0, 0);
		}
		else { agentFloatBalloons(_this.agent.lastGuess); }

	}

	function pushPlus (value) {
		if((airBalloonStock + value) > _this.amount) {
			airBalloonStock = _this.amount;
		} else {
			airBalloonStock = airBalloonStock + value;
		}
		balloonStock = _this.amount-airBalloonStock;
		balloonStockUpdate();
		airBalloonStockUpdate();
		takeOff();
	}

	function pushMinus (value) {
		value = -value;
		if((airBalloonStock - value) < 0) {
			airBalloonStock = 0;
		} else {
			airBalloonStock = airBalloonStock - value;
		}
		balloonStock = _this.amount-airBalloonStock;
		balloonStockUpdate();
		airBalloonStockUpdate();
		takeOff();
	}

	function agentFloatBalloons(guess)
	{
		airBalloonStock = guess;
		balloonStock = _this.amount-guess;
		balloonStockUpdate();
		airBalloonStockUpdate();
		takeOff();
	}

	function addBalloon()
	{
		if(balloonStock > 0) {
			airBalloonStock++;
			balloonStock--;
			airBalloonStockUpdate();
			balloonStockUpdate();

			if(balloonStock === 0) {
				cleanUpBalloons(); //this makes sure that we delete any excess balloons that might have been created before we hide the stack.
			}
		}
	}

	function removeBalloon()
	{
		if(airBalloonStock > 0) {
			airBalloonStock--;
			balloonStock++;
			airBalloonStockUpdate();
			balloonStockUpdate();

			if(airBalloonStock === 0) {
				cleanUpAirBalloons(); //this makes sure that we delete any excess balloons that might have been created before we hide the stack.
			}
		}
	}

	//Creates one draggable balloon at the stack.
	function createBalloon()
	{
		if (_this.balloons.length < 1) {
			var balloon = _this.add.sprite(coords.balloons.x, coords.balloons.y, 'balloon'+balloonStock, null, _this.gameGroup);
			balloon.x = coords.balloons.x;
			balloon.y = coords.balloons.y;
			balloon.inputEnabled = true;
			balloon.input.enableDrag(false, true);
			balloon.events.onDragStart.add(release, _this);
			balloon.events.onDragStop.add(attachToBasket, _this);
			_this.balloons.add(balloon);
			balloon.anchor.setTo(0.5, 1);
		}
	}

	function createAirBalloon()
	{
		if (airballoons.length < 3) {
			var balloon = _this.add.sprite(coords.basketBalloons.x, coords.basketBalloons.y, 'balloon'+airBalloonStock, null, _this.gameGroup);
			balloon.inputEnabled = true;
			balloon.input.enableDrag(false, true);
			balloon.events.onDragStart.add(release, _this);
			balloon.events.onDragStop.add(attachToBasket, _this);
			airballoons.add(balloon);
		}
	}

	//release and atthchToBasket control the dragging and snapping of balloons.
	function release(balloon) {
		balloon.loadTexture('balloon1');
		if(airballoons.getIndex(balloon) === -1) {
			balloonStock -= 1;
			tempgroup.add(balloon);
			//_this.gameGroup.add(balloon);
			balloonStockUpdate();
		} else {
			airBalloonStock -=1;
			tempgroup.add(balloon);
			//balloons.add(balloon);
			airBalloonStockUpdate();
		}
	}



	function attachToBasket(balloon){
		
		var tl = new TimelineMax();
		if(checkOverlap(balloon, airballoons)) {
			balloon.angle = 0;
			tl.to(balloon, 1, {x: coords.basketBalloons.x, y: coords.basketBalloons.y});
			tl.eventCallback('onComplete', function() {
				airBalloonStock += 1;
				airballoons.add(balloon);
				airBalloonStockUpdate();
			});
			balloonStockUpdate();
		} else {
			tl.to(balloon, 1, {x: coords.balloons.x, y: coords.balloons.y});
			tl.eventCallback('onComplete', function() {
				balloonStock += 1;
				_this.balloons.add(balloon);
				balloonStockUpdate();
			});
			airBalloonStockUpdate();
		}
	}

	function copyTexture() {

		var amount = _this.balloons.length;
		
		for (var i = 0; i < amount; i++) {
			var g = _this.balloons.getAt(i);
			g.loadTexture('balloon'+balloonStock);
		}
	}

	function copyAirTexture() {
		
		var amount = airballoons.length;

		for (var i = 3; i < amount; i++) {
				airballoons.getAt(i).loadTexture('balloon'+airBalloonStock);
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
		
		if (amount <= 0) {
			//TODO: Add a voice saying you need to attach balloons to the basket.
			return;
		} else {
			var tl = new TimelineMax();
			tl.skippable();
			var result = _this.tryNumber(amount);

			if(this.amount === 9)
			{
				amount++; //This makes the basket move differently on the 9 mode.
			}
			_this.agent.eyesFollowObject(airballoons.basket);
			disableBalloons();
			liftoffButton.visible = false;
			anchor.visible = false;
			plusminus.visible = false;
			minuspanel.visible = false;
			pluspanel.visible = false;

			if (beetle.x !== coords.beetle.basketStop.x && beetle.y !== coords.beetle.basketStop.y) {
				tl.add( new TweenMax(beetle, 2, {x: coords.beetle.basketStop.x, y: coords.beetle.basketStop.y, ease:Power1.easeIn}));
			}
			tl.add( new TweenMax(airballoons, 2, {x: 0, y: -(55*(amount))*scale*stepSize, ease:Power1.easeInOut}));
			if (!result) {
				tl.eventCallback('onComplete', function(){
					openChest();
				});

				if(_this.method === GLOBAL.METHOD.incrementalSteps) {
					treasures++;
				}


			} else {
				if (result > 0) {
					tl.addSound('tryless');
				} else {
					tl.addSound('trymore');
				}
				//Popping balloons and Basket going back down.
				if((!treasures) || (_this.method !== GLOBAL.METHOD.incrementalSteps)) {
					popAndReturn(tl);
				}

				tl.eventCallback('onComplete', function(){
					if(_this.method === GLOBAL.METHOD.count) {
						enableBalloons();
					}
					_this.agent.eyesFollowPointer();
					_this.nextRound();
				});
			}
		}
	}

	function openChest() {
		var tl = new TimelineMax();
		tl.skippable();
		var watertl = new TimelineMax();
		tl.addSound('chestunlock');
		fade(eyes, false);
		fade(chest, true);
		tl.eventCallback('onComplete', function(){
			watertl.add(_this.addWater(chest.x, chest.y), '-=3');
			chest.loadTexture('openChest');
			playRandomPrize();
		});
	}

	function playRandomPrize() {
		treasure.x = chest.x;
		treasure.y = chest.y+10;
		var tl = new TimelineMax();
		tl.skippable();
		var tls = new TimelineMax();
		var tla = new TimelineMax();
		tl.add( new TweenMax(treasure, 1, {x: treasure.x, y: treasure.y-75, ease:Power1.easeOut}));
		tl.add( new TweenMax(treasure, 1, {x: treasure.x, y: chest.y+10, ease:Power1.easeIn}));
		fade(treasure, true);
		var pickAnswer = game.rnd.integerInRange(0, 5);
		treasure.loadTexture('treasures', pickAnswer);
		tl.addSound(speech, 'yippi');
		tl.add( new TweenMax(treasure, 2, {x: coords.sack.x, y: coords.sack.y+10, ease:Power4.easeIn}));
		tl.addCallback(function () {
			tls.addSound('sackjingle');
			tla.add( new TweenMax(sack, 0.2, {x: coords.sack.x, y: coords.sack.y+3, ease:Power1.easeOut}));
			tla.add( new TweenMax(sack, 0.2, {x: coords.sack.x, y: coords.sack.y, ease:Power1.easeIn}));
			tla.add( new TweenMax(sack, 0.2, {x: coords.sack.x, y: coords.sack.y+3, ease:Power1.easeOut}));
			tla.add( new TweenMax(sack, 0.2, {x: coords.sack.x, y: coords.sack.y, ease:Power1.easeIn}));
			tla.add( new TweenMax(sack, 0.2, {x: coords.sack.x, y: coords.sack.y+3, ease:Power1.easeOut}));
			tla.add( new TweenMax(sack, 0.2, {x: coords.sack.x, y: coords.sack.y, ease:Power1.easeIn}));
			tla.add( new TweenMax(sack, 0.2, {x: coords.sack.x, y: coords.sack.y+3, ease:Power1.easeOut}));
			tla.add( new TweenMax(sack, 0.2, {x: coords.sack.x, y: coords.sack.y, ease:Power1.easeIn}));
		});
		
		//Popping balloons and Basket going back down.
		if((!treasures) || (_this.method !== GLOBAL.METHOD.incrementalSteps)) {
			popAndReturn(tl);
		}
		tl.eventCallback('onComplete', function(){
			if(_this.method === GLOBAL.METHOD.count) {
				enableBalloons();
			}
			_this.agent.eyesFollowPointer();
			_this.nextRound();
		});
	}

	function popAndReturn(tl) {
		var tls = new TimelineMax(); //For the popping sound so it can better be synced with the animation.
		tl.add( new TweenMax(beetle, 0.5, {x: coords.beetle.basketStop.x, y: coords.beetle.basketStop.y-50, ease:Power4.easeIn}));
		tl.addCallback(function () {
			tls.addSound('pop');
			resetBalloons();
		});
		tl.to(beetle, 0.5, {x: coords.beetle.basketStop.x, y: coords.beetle.basketStop.y, ease:Power4.easeIn});
		tl.addCallback(function () {
			balloonStack2.kill();
		});
		tl.to(airballoons, 2, {x: 0, y: 0, ease:Bounce.easeOut});
	}

	function resetBalloons() {

		var amount = airBalloonStock;

		for (var i = 0; i < amount; i++){
			airBalloonStock -= 1;
			airBalloonStockUpdate();
			balloonStock += 1;
			balloonStockUpdate();
		}

		cleanUpAirBalloons();
	
		balloonStack2.revive();
		balloonStack2.loadTexture('brokenballoon');
	}

	function randomBalloons(correctAnswer) {

		if (_this.method === GLOBAL.METHOD.additionSubtraction) {
			var answerIsHigher = game.rnd.integerInRange(0, 1);
			if((correctAnswer === _this.amount) || answerIsHigher) {
				//if answerIsHigher = 1 put ballons below answer.
				airBalloonStock = game.rnd.integerInRange(0, correctAnswer-1);
			} else {
				airBalloonStock = game.rnd.integerInRange(correctAnswer+1, _this.amount);
			}
			
		} else if (_this.method === GLOBAL.METHOD.addition) {
			airBalloonStock = game.rnd.integerInRange(0, correctAnswer-1);
		} else {
			airBalloonStock = this.amount;
		}
		balloonStock = _this.amount - airBalloonStock;
		balloonStockUpdate();
		airBalloonStockUpdate();

	}

	//this makes sure that we delete any excess balloons that might have been created before we hide the stack.
	function cleanUpAirBalloons() {
		for (var i = 0; i < 9; i++) {
			deleteExcessSprite(airballoons.getAt(3));
		}
	}

	//this makes sure that we delete any excess balloons that might have been created before we hide the stack.
	function cleanUpBalloons() {
		for (var i = 0; i < 9; i++) {
			deleteExcessSprite(_this.balloons.getAt(0));
		}
	}

	function disableBalloons() {
		for (var i = 0; i < 9; i++){
			disableBalloon(_this.balloons.getAt(0+i));
			disableBalloon(airballoons.getAt(3+i));
		}
	}

	function enableBalloons() {
		for (var i = 0; i < 9; i++){
			enableBalloon(_this.balloons.getAt(0+i));
			enableBalloon(airballoons.getAt(3+i));
		}
	}

	function enableBalloon(sprite) {
		if(sprite !== -1) {
			sprite.inputEnabled = true;
		}
	}

	function disableBalloon(sprite) {
		if(sprite !== -1) {
			sprite.inputEnabled = false;
		}
	}

	function deleteExcessSprite(sprite) {
		if(sprite !== -1) {
			sprite.destroy();
		}
	}

	function renderChest (correctAnswer) {

		//Not using fade since that takes a long time and you can see the next solution.
		chest.visible = false;
		chest.loadTexture('closedChest');
		treasure.visible = false;

		if(correctAnswer % 2 === 1) {
				chest.x = coords.cliff.rightx-70;
				eyes.x = coords.cliff.rightx-95;
			} else {
				chest.x = coords.cliff.leftx+75;
				eyes.x = coords.cliff.leftx+50;
			}

		chest.y = 555 - (55 * scale * (correctAnswer-1) * stepSize + 55 * scale);
		eyes.y = 525 - (55 * scale * (correctAnswer-1) * stepSize + 55 * scale);
		chest.scale.x = 0.4;
		chest.scale.y = 0.4;
		eyes.scale.x = 0.3;
		eyes.scale.y = 0.3;
		fade(eyes, true);

		if(_this.representation !== GLOBAL.NUMBER_REPRESENTATION.none){
			if(mapText) {
				mapText.number = correctAnswer;
			} else {
				mapText = new NumberButton(correctAnswer, _this.representation, {
							x: 700, y: 670, size: 40
				});
				_this.gameGroup.add(mapText);
			}
			eyes.y = -100;
			eyes.x = -100;
		}
		if((_this.method === GLOBAL.METHOD.addition) || (_this.method === GLOBAL.METHOD.additionSubtraction)) {
			randomBalloons(correctAnswer);
		}
	}

	function agentGuess () {
		_this.agent.guessNumber(_this.currentNumber, 1, _this.amount);
		disableBalloons();


		var guess = _this.agent.lastGuess;

		return TweenMax.fromTo(_this.agent.thought.scale, 1.5,
			{ x: 0, y: 0 },
			{ x: 1, y: 1,
				ease: Elastic.easeOut,
				onStart: function () {
					_this.agent.thought.visible = true;
					if (_this.agent.thought.guess) { _this.agent.thought.guess.destroy(); }
					//TODO: Random hmm
					_this.agent.say('agenthmm').play();
				},
				onComplete: function () {
					if(_this.representation === GLOBAL.NUMBER_REPRESENTATION.none){
						_this.agent.thought.guess = new NumberButton(_this.agent.lastGuess, 1, {
							x: -50, y: -50, size: 100
						});
					}else{
						if ((_this.method === GLOBAL.METHOD.addition) || (_this.method === GLOBAL.METHOD.additionSubtraction)) {
								guess -= airBalloonStock;
								_this.agent.thought.guess = new NumberButton(guess, GLOBAL.NUMBER_REPRESENTATION.signedNumbers, {
									x: -50, y: -50, size: 100
								});
						} else {
							_this.agent.thought.guess = new NumberButton(guess, _this.representation, {
								x: -50, y: -50, size: 100
							});
						}
					}
					_this.agent.thought.add(_this.agent.thought.guess);
					// TODO: Agent should say something here based on how sure it is.
					_this.agent.say('question').play();
					showYesnos();
				}
			});
	}

	//Kills the sprites not suppose to show up at the moment and revives those who are.
	function balloonStockUpdate() {
		if (balloonStock === 0) {
			cleanUpBalloons();
			_this.balloonStack1.kill();
		} else {
			_this.balloonStack1.revive();
			_this.balloonStack1.loadTexture('balloon' + balloonStock);
			copyTexture();
			createBalloon();
		}
	}

	function airBalloonStockUpdate() {
		if (airBalloonStock === 0) {
			cleanUpAirBalloons();
			balloonStack2.kill();
		} else {
			balloonStack2.revive();
			balloonStack2.loadTexture('balloon' + airBalloonStock);
			copyAirTexture();
			createAirBalloon();
		}
	}


	this.modeIntro = function () {
		_this.disable(true);
		bgMusic.play();
		var tl = new TimelineMax();
		tl.skippable();
		tl.add( new TweenMax(beetle, 3, {x: coords.beetle.stop.x, y: coords.beetle.stop.y, ease:Power1.easeIn}));
		if(_this.representation !== GLOBAL.NUMBER_REPRESENTATION.none){
			tl.addCallback(function () {
				fade(map, true);
			});
			tl.addSound('beetleintro3', beetle);
			tl.add( new TweenMax(map, 2, {x: 670, y: 640, ease:Power1.easeIn}));
		}else{
			tl.addSound('beetleintro1', beetle);
			tl.addSound('beetleintro2', beetle);
		}
		tl.eventCallback('onComplete', function () {
			_this.disable(false);
			_this.nextRound();
		});
	};

	this.modePlayerDo = function (intro, tries) {
		if (tries > 0) {
			showLiftoff();
		} else { // if intro or first try	
			var tl = new TimelineMax();
			if (intro) {
				renderChest(_this.currentNumber);
			} else {
				tl.addSound('newtreasure', beetle);
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
				treasures = 0;
				enableBalloons();
				if(_this.method === GLOBAL.METHOD.incrementalSteps) {
					popAndReturn(tl);
				}
				_this.disable(true);
				tl.skippable();
				tl.add(_this.agent.moveTo.start());
				tl.addLabel('agentIntro');
				tl.addSound('agentintro', _this.agent);
				tl.add(_this.agent.wave(3, 1), 'agentIntro');
				tl.eventCallback('onComplete', function () {
					_this.sound.removeByKey('birdheroAgentShow');
					renderChest(_this.currentNumber);
					_this.disable(false);
				});

			} else {
				tl.addSound('newtreasure', beetle);
				renderChest(_this.currentNumber);
			}
			tl.addCallback(showLiftoff);
		}
	};

	this.modeAgentTry = function (intro, tries) {
		var tl = new TimelineMax();
		if (tries > 0) {
			tl.addSound('oops', _this.agent);
			tl.add(agentGuess());
		} else { // if intro or first try
			if (intro) {
				treasures = 0;
				if(_this.method === GLOBAL.METHOD.incrementalSteps) {
					popAndReturn(tl);
				}
				_this.disable(true);
				disableBalloons();
				tl.skippable();
				tl.add(_this.agent.moveTo.start()); // Agent should be here already.
				tl.addSound('agenttry', _this.agent);
				tl.eventCallback('onComplete', function () {
					renderChest(_this.currentNumber);
					_this.sound.removeByKey('agenttry');
					_this.disable(false);
				});
			} else {
				tl.addSound('newtreasure', beetle);
				renderChest(_this.currentNumber);
			}
		tl.add(agentGuess());
		}
	};

	this.modeOutro = function () {
		disableBalloons();
		balloonStock = 6;
		airBalloonStock = 0;
		_this.agent.fistPump()
			.addCallback(function () {
				balloonStockUpdate();
				airBalloonStockUpdate();
				_this.nextRound();
			});
	};

	// Make sure the call this when everything is set up.
	this.startGame();
};

BalloonGame.prototype.update = function () {
	if (this.balloonStack1.angle > 7 && this.direction === 'right') {
		this.direction = 'left';
	} else if (this.balloonStack1.angle < -7 && this.direction === 'left') {
		this.direction = 'right';
	}
	if (this.direction === 'right') {
		this.balloonStack1.angle += 0.3;
	} else {
		this.balloonStack1.angle -= 0.3;
	}
	this.balloons.forEach(BalloonGame.prototype.syncAngle, this, true);

	if (this.cloud1.x > 600) {
		this.cloud1.x = -this.cloud1.width;
	} else {
		this.cloud1.x += 0.3;
	}

	if (this.cloud2.x > 600) {
		this.cloud2.x = -this.cloud2.width;
	} else {
		this.cloud2.x += 0.5;
	}
};

BalloonGame.prototype.syncAngle = function(b) {
		b.angle = this.balloonStack1.angle;
};


BalloonGame.prototype.render = function () {
	//Shows information for debugging.
	//game.debug.spriteInfo(balloonStack1, 32, 100);
};





