/* Balloon Game */
BalloonGame.prototype = Object.create(NumberGame.prototype);
BalloonGame.prototype.constructor = BalloonGame;
function BalloonGame () {
	NumberGame.call(this); // Call parent constructor.
}

/* Phaser state function */
BalloonGame.prototype.preload = function () {
	this.load.audio('balloonSpeech', LANG.SPEECH.balloongame.speech); // audio sprite sheet
	this.load.audio('birdheroAgentShow', LANG.SPEECH.AGENT.birdheroShow);
	this.load.audio('birdheroAgentTry', LANG.SPEECH.AGENT.birdheroTry);
	this.load.audio('birdheroAgentHmm', LANG.SPEECH.AGENT.hmm);
	this.load.audio('birdheroAgentCorrected', LANG.SPEECH.AGENT.showMe);
	this.load.audio('birdheroAgentOops', LANG.SPEECH.AGENT.tryAgain);

	this.load.audio('birdheroMusic', ['assets/audio/subgames/birdhero/bg.ogg', 'assets/audio/subgames/birdhero/bg.mp3']);
	this.load.audio('pop',           ['assets/audio/subgames/balloongame/pop.ogg', 'assets/audio/subgames/balloongame/pop.mp3']);
	this.load.audio('catbushpurr',   ['assets/audio/subgames/balloongame/catbushpurr.ogg', 'assets/audio/subgames/balloongame/catbushpurr.mp3']);
	this.load.audio('chestunlock',   ['assets/audio/subgames/balloongame/chestunlock.ogg', 'assets/audio/subgames/balloongame/chestunlock.mp3']);
	this.load.audio('sackjingle',    ['assets/audio/subgames/balloongame/belljingle.ogg', 'assets/audio/subgames/balloongame/belljingle.mp3']);

	this.load.spritesheet('spritesheet', 'assets/img/subgames/balloon/skatterna-i-berget-objekt.png',170,349,6);
	this.load.spritesheet('catbush', 'assets/img/subgames/balloon/catbush2.png',191,88,10);
	this.load.spritesheet('treasures', 'assets/img/subgames/balloon/treasures.png', 75, 110, 6);
	this.load.spritesheet('anchor', 'assets/img/subgames/balloon/anchoratlas.png', 120,110,3);
	this.load.atlasJSONHash('balloonsheet', 'assets/img/subgames/balloon/balloonsheet.png', 'assets/img/subgames/balloon/balloonsheet.json');

	this.load.image('sky', 'assets/img/subgames/balloon/sky.png');
	this.load.image('background', 'assets/img/subgames/balloon/background.png');
	this.load.image('brokenballoon', 'assets/img/subgames/balloon/brokenballoon.png');
	this.load.image('cloud1', 'assets/img/subgames/balloon/cloud1.png');
	this.load.image('cloud2', 'assets/img/subgames/balloon/cloud2.png');
	this.load.image('map', 'assets/img/subgames/balloon/map.png');
	this.load.image('closedChest', 'assets/img/subgames/balloon/chest.png');
	this.load.image('openChest', 'assets/img/subgames/balloon/chest_open.png');
	this.load.image('sack', 'assets/img/subgames/balloon/sack.png');
	this.load.image('groundedAnchor', 'assets/img/subgames/balloon/groundedanchor.png');
	this.load.image('eyes', 'assets/img/subgames/balloon/eyes.png');
	this.load.image('metalLoop', 'assets/img/subgames/balloon/metalloop.png');
	this.load.image('magnify', 'assets/img/subgames/balloon/magnify.png');
};

	

/* Phaser state function */
BalloonGame.prototype.create = function () {

	var tempgroup; //Temporary group for balloons in transit.
	var background;
	var sky;
	var scale = 0.85;
	var airballoons; //The group where the bucket, beetle and right side balloons go into. Is animated on.
	var cliff;
	var metalLoop;
	var chest;
	var liftoffButton; //The anchor button
	var eyes; //When no representation is set the eyes are instead shown in the approperiate cave.
	var treasure;
	var balloonStack2; //The sprite for the balloons on the right side.
	var balloonStock = 9; //The amount of balloons on the left side.
	var airBalloonStock = 0; //The amount of balloons on the right side.
	var catBush; //The interactable bush.
	var mapText; //The representation on the map.
	var treasures = 0; //Only used on incrimentalSteps to make sure you always start by dragging balloons until you get it right once.
	var map;
	var _this = this; // Subscriptions to not have access to 'this' object
	var stepSize = 9/this.amount; //For moving the bucket upwards.
	var speech = this.add.audio('balloonSpeech');
	var markers = LANG.SPEECH.balloongame.markers;
	for (var marker in markers) {
		speech.addMarker(marker, markers[marker][0], markers[marker][1]);
	}

	this.direction = 'right'; //For animating the wind in the balloons.
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
	liftoffButton = game.add.button(850, 650, 'anchor', takeOff, this.hudgroup, 0, 1, 2);
	liftoffButton.visible = false;

	
	catBush = game.add.sprite(175, 420, 'catbush', 0, this.gameGroup);
	catBush.animations.add('catBlink');
	catBush.inputEnabled = true;
	catBush.events.onInputDown.add(catBushPlay, this);

	function catBushPlay(){
		var tl = new TimelineMax();
		catBush.inputEnabled = false;
		tl.addSound('catbushpurr');
		catBush.animations.play('catBlink', 8, false);
		catBush.events.onAnimationComplete.add(function(){
			catBush.loadTexture('catbush', 0);
			catBush.inputEnabled = true;
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

	var magnifyGroup = this.add.group(this.gameGroup);
	magnifyGroup.x = 530;
	magnifyGroup.y = 150;
	magnifyGroup.magnifyBubble = this.add.sprite(0, 0, 'magnify', null, magnifyGroup);
	magnifyGroup.magnifyBubble.anchor.setTo(0.5, 0.5);
	magnifyGroup.magnifyBalloons = this.add.sprite(-5, 10, 'balloonsheet', 'b'+balloonStock, magnifyGroup);
	magnifyGroup.magnifyBalloons.anchor.setTo(0.5, 0.5);
	magnifyGroup.magnifyBalloons.scale.set(0.6);
	magnifyGroup.visible = false;

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

	this.balloonStack1 = _this.add.sprite(0, 0, 'balloonsheet', 'b6', _this.gameGroup);
	balloonStack2 = _this.add.sprite(0, 0, 'balloonsheet', 'b6', _this.gameGroup);
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
	map.scale.setTo(0.8, 0.8);
	map.visible = false;

	//Kills the sprites not suppose to show up at the moment and revives those who are.
	balloonStockUpdate();
	airBalloonStockUpdate();

	//The buttons used when the agent guesses
	var yesnos = new ButtonPanel(2, GLOBAL.NUMBER_REPRESENTATION.yesno, {
		x: 0, y: this.world.height-100, onClick: pushYesno
	});
	yesnos.visible = false;
	this.hudGroup.add(yesnos);

	//The panel used for addition and SubtractionAddition
	var pluspanel = new ButtonPanel(this.amount, GLOBAL.NUMBER_REPRESENTATION.signedNumbers, {
		y: this.world.height-80, onClick: pushPlus,
	});
	pluspanel.visible = false;
	pluspanel.scale.setTo(0.65);
	this.hudGroup.add(pluspanel);

	var buttonOptions = {
		y: this.world.height-100,
		doNotAdapt: true
	};

	//The buttons used for incrimental steps
	var plusminus = this.add.group(this.gameGroup);
	buttonOptions.onClick = function () { updateBalloon(0); };
	buttonOptions.x = 300;
	plusminus.add(new TextButton('-', buttonOptions));
	buttonOptions.onClick = function () { updateBalloon(1); };
	buttonOptions.x = 400;
	plusminus.add(new TextButton('+', buttonOptions));
	plusminus.visible = false;
	this.hudGroup.add(plusminus);

	var foreGround = this.add.group(this.gameGroup);
	foreGround.add(chest);
	foreGround.add(treasure);

	//Makes the yes no buttons appear and the rest disappear.
	function showYesnos () {
		yesnos.inputEnabled = true;
		yesnos.reset();
		fade(liftoffButton, false);
		fade(yesnos, true);
		fade(plusminus, false);
		fade(pluspanel, false);
		if (_this.agent.visible) { _this.agent.eyesFollowPointer(); }
	}

	//Makes the anchor no buttons appear and the rest disappear. Differs from mode to mode what happens.
	function showLiftoff () {
		
		if((_this.method === GLOBAL.METHOD.incrementalSteps) && treasures) {
			fade(plusminus, true);
			fade(liftoffButton, true);
		} else if ((_this.method === GLOBAL.METHOD.incrementalSteps) && !treasures) {
			fade(liftoffButton, true);
		} else if (_this.method === GLOBAL.METHOD.addition) {
			pluspanel.setRange(1, _this.amount-airBalloonStock);
			pluspanel.amount = _this.amount-airBalloonStock;
			pluspanel.reset();
			fade(pluspanel, true);
		} else if (_this.method === GLOBAL.METHOD.additionSubtraction) {
			pluspanel.setRange(1-airBalloonStock, _this.amount-airBalloonStock);
			pluspanel.amount = _this.amount-1;
			pluspanel.reset();
			fade(pluspanel, true);
		} else if (_this.method === GLOBAL.METHOD.count) {
			fade(liftoffButton, true);
		}

		fade(yesnos, false);

		if (_this.agent.visible) { _this.agent.eyesFollowPointer(); }
	}

	//What happens when you push the yes or no button.
	function pushYesno (value) {
		//TODO add random sounds
		yesnos.inputEnabled = false;
		if (!value) {
			_this.agent.say(speech).play('isitwrong');
			if(_this.method === GLOBAL.METHOD.count || _this.method === GLOBAL.METHOD.incrementalSteps) {
				enableBalloons();
			}
			_this.disable(false);
			showLiftoff(0, 0);
		}
		else { agentFloatBalloons(_this.agent.lastGuess); }
		_this.agent.thought.visible = false;
	}

	//What happens when you press one of the buttons in addition or addition/subtraction mode.
	function pushPlus (value) {
		if((airBalloonStock + value) > _this.amount) {
			airBalloonStock = _this.amount;
		} else if((airBalloonStock + value) < 0) {
			airBalloonStock = 0;
		} else {
			airBalloonStock = airBalloonStock + value;
		}
		balloonStock = _this.amount-airBalloonStock;
		balloonStockUpdate();
		airBalloonStockUpdate();
		takeOff();
	}

	//The agents guess triggers this.
	function agentFloatBalloons(guess)
	{
		airBalloonStock = guess;
		balloonStock = _this.amount-guess;
		balloonStockUpdate();
		airBalloonStockUpdate();
		takeOff();
	}

	//When pressing IncrimentalStep buttons.
	function updateBalloon(change)
	{
		if((change === 1) && (balloonStock > 0)) {
			airBalloonStock++;
			balloonStock--;
			airBalloonStockUpdate();
			balloonStockUpdate();
		} else if((change === 0) && (airBalloonStock > 1)) {
			airBalloonStock--;
			balloonStock++;
			airBalloonStockUpdate();
			balloonStockUpdate();
		}
		if(balloonStock === 0) {
			cleanUpBalloons(); //this makes sure that we delete any excess balloons that might have been created before we hide the stack.
		}
		if(airBalloonStock === 0) {
			cleanUpAirBalloons(); //this makes sure that we delete any excess balloons that might have been created before we hide the stack.
		}
		magnifyGroup.magnifyBalloons.loadTexture('balloonsheet', 'b' + airBalloonStock);
	}

	//Creates one draggable balloon at the left balloon stack.
	function createBalloon()
	{
		if (_this.balloons.length < 1) {
			var balloon = _this.add.sprite(coords.balloons.x, coords.balloons.y, 'balloonsheet', 'b'+balloonStock, _this.gameGroup);
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

	//Creates one draggable balloon at the right balloon stack.
	function createAirBalloon()
	{
		if (airballoons.length < 3) {
			var balloon = _this.add.sprite(coords.basketBalloons.x, coords.basketBalloons.y, 'balloonsheet', 'b'+airBalloonStock, _this.gameGroup);
			balloon.inputEnabled = true;
			balloon.input.enableDrag(false, true);
			balloon.events.onDragStart.add(release, _this);
			balloon.events.onDragStop.add(attachToBasket, _this);
			airballoons.add(balloon);
		}
	}

	//When you press down on a balloon.
	function release(balloon) {
		balloon.loadTexture('balloonsheet', 'b1');
		if(airballoons.getIndex(balloon) === -1) {
			balloonStock -= 1;
			tempgroup.add(balloon);
			balloonStockUpdate();
		} else {
			airBalloonStock -=1;
			tempgroup.add(balloon);
			airBalloonStockUpdate();
		}
	}


	//When you let go of a balloon.
	function attachToBasket(balloon){
		
		var tl = new TimelineMax();
		if(checkOverlap(balloon, airballoons)) {
			balloon.angle = 0;
			tl.to(balloon, 0.5, {x: coords.basketBalloons.x, y: coords.basketBalloons.y});
			balloon.inputEnabled = false;
			liftoffButton.inputEnabled = false;
			airBalloonStock += 1;
			tl.eventCallback('onComplete', function() {
				balloon.inputEnabled = true;
				liftoffButton.inputEnabled = true;
				airballoons.add(balloon);
				airBalloonStockUpdate();
			});
			balloonStockUpdate();
		} else {
			tl.to(balloon, 1, {x: coords.balloons.x, y: coords.balloons.y});
			balloon.inputEnabled = false;
			liftoffButton.inputEnabled = false;
			balloonStock += 1;
			tl.eventCallback('onComplete', function() {
				balloon.inputEnabled = true;
				liftoffButton.inputEnabled = true;
				_this.balloons.add(balloon);
				balloonStockUpdate();
			});
			airBalloonStockUpdate();
		}
	}

	//In case several balloons are on the same stack this one makes sure they all have the same texture and therefore hiding them.
	function copyTexture() {

		var amount = _this.balloons.length;
		
		for (var i = 0; i < amount; i++) {
			var g = _this.balloons.getAt(i);
			g.loadTexture('balloonsheet', 'b'+balloonStock);
		}
	}

	//Same as above but for the right stack.
	function copyAirTexture() {
		
		var amount = airballoons.length;

		for (var i = 3; i < amount; i++) {
				airballoons.getAt(i).loadTexture('balloonsheet', 'b'+airBalloonStock);
		}
	}

	function checkOverlap(spriteA, spriteB)
	{
		var boundsA = spriteA.getBounds();
		var boundsB = spriteB.getBounds();
		return Phaser.Rectangle.intersects(boundsA, boundsB);
	}

	//When you press the anchor this happens.
	function takeOff() {

		var amount = airBalloonStock;
		liftoffButton.setFrames(0,1,2,1);
		
		if (amount <= 0) {
			//TODO: Add a voice saying you need to attach balloons to the basket.
			return;
		} else {
			var tl = new TimelineMax();
			tl.skippable();
			var result = _this.tryNumber(amount);

			if(_this.amount === 9)
			{
				amount++; //This makes the basket move differently on the 9 mode. Could take away this step if we implement the variable movement further down in a smarter way. ****
			}
			_this.agent.eyesFollowObject(airballoons.basket);
			disableBalloons();
			liftoffButton.visible = false;
			plusminus.visible = false;
			pluspanel.visible = false;

			if (beetle.x !== coords.beetle.basketStop.x && beetle.y !== coords.beetle.basketStop.y) {
				tl.add( new TweenMax(beetle, 2, {x: coords.beetle.basketStop.x, y: coords.beetle.basketStop.y, ease:Power1.easeIn}));
			}
			tl.add( new TweenMax(airballoons, 2, {x: 0, y: -(55*(amount))*scale*stepSize, ease:Power1.easeInOut})); //The above comment refers to here. ****
			if (!result) { //If we guessed correctly
				tl.eventCallback('onComplete', function(){
					openChest();
				});

				if(_this.method === GLOBAL.METHOD.incrementalSteps) {
					treasures++;
					if(airBalloonStock > 7) {
						fade(magnifyGroup, true);
					} else {
						fade(magnifyGroup, false);
					}
				}


			} else { //If we guessed wrong
				if (result > 0) {
					tl.addSound(speech, beetle, 'tryless');
				} else {
					tl.addSound(speech, beetle, 'trymore');
				}
				//Popping balloons and Basket going back down.
				if((!treasures) || (_this.method !== GLOBAL.METHOD.incrementalSteps)) {
					popAndReturn(tl);
				} else if(airBalloonStock > 7) {
					fade(magnifyGroup, true);
				} else {
					fade(magnifyGroup, false);
				}

				tl.eventCallback('onComplete', function(){
					_this.agent.eyesFollowPointer();
					_this.nextRound();
				});
			}
		}
	}

	//The animation and sound of the chest opening.
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

	//The prize popping out. TODO: Make the different treasures have different amounts of probability to appear.
	function playRandomPrize() {
		treasure.x = chest.x;
		treasure.y = chest.y+10;
		var tl = new TimelineMax();
		tl.skippable();
		var tls = new TimelineMax();
		tl.add( new TweenMax(treasure, 1, {x: treasure.x, y: treasure.y-75, ease:Power1.easeOut}));
		tl.add( new TweenMax(treasure, 1, {x: treasure.x, y: chest.y+10, ease:Power1.easeIn}));
		fade(treasure, true);
		var pickAnswer = game.rnd.integerInRange(0, 5);
		treasure.loadTexture('treasures', pickAnswer);
		tl.addSound(speech, beetle, 'yippi');
		tl.add( new TweenMax(treasure, 2, {x: coords.sack.x, y: coords.sack.y+10, ease:Power4.easeIn}));
		tl.addCallback(function () {
			tls.addSound('sackjingle');
			new TweenMax(sack, 0.2, {y: coords.sack.y+3, ease: Power1.easeInOut }).backForth(2);
		});
		
		//Popping balloons and Basket going back down.
		if((!treasures) || (_this.method !== GLOBAL.METHOD.incrementalSteps)) {
			popAndReturn(tl);
		}
		tl.eventCallback('onComplete', function(){
			_this.agent.eyesFollowPointer();
			_this.nextRound();
		});
	}

	//Makes the beetle jump up and pop the balloons, causing them all to fall down to the ground.
	function popAndReturn(tl) {
		fade(magnifyGroup, false);
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

	//used by popAndReturn to take the balloons back. There used to be animations to it which is why it takes a few uneccesary steps. I let them be there in case we wanted to add them again later.
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

	//Sets a random amount of balloons onto the right stack. It will never be the same as the answer and on addition it will never be more than the answer.
	function randomBalloons(correctAnswer) {
		disableBalloons();
		if (_this.method === GLOBAL.METHOD.additionSubtraction) {
			var answerIsHigher = game.rnd.integerInRange(0, 1);
			if((correctAnswer === _this.amount) || answerIsHigher) {
				//if answerIsHigher = 1 put ballons below answer.
				airBalloonStock = game.rnd.integerInRange(0, correctAnswer-1);
			} else {
				airBalloonStock = game.rnd.integerInRange(correctAnswer+1, _this.amount-1);
			}
			
		} else if (_this.method === GLOBAL.METHOD.addition) {
			airBalloonStock = game.rnd.integerInRange(0, correctAnswer-1);
		} else {
			airBalloonStock = this.amount-1;
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

	//Makes it so we can't click the balloons.
	function disableBalloons() {
		for (var i = 0; i < 9; i++){
			disableBalloon(_this.balloons.getAt(0+i));
			disableBalloon(airballoons.getAt(3+i));
		}
	}

	//Makes it so we can click the balloons againa fter using the above function.
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

	//Deletes a sprite. It's used because there used to be a problem where extra sprites were created. This is for safety.
	function deleteExcessSprite(sprite) {
		if(sprite !== -1) {
			sprite.destroy();
		}
	}

	//This updates the map with a new value.
	function renderChest (correctAnswer) {

		var tl = new TimelineMax();
		tl.skippable();
		tl.add(fade(chest,false));
		chest.loadTexture('closedChest');
		tl.add(fade(treasure,false));

		tl.addCallback(function () {
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

			if(parseInt(_this.representation) !== GLOBAL.NUMBER_REPRESENTATION.none){
				if(mapText) {
					mapText.number = correctAnswer;
				} else {
					mapText = new NumberButton(correctAnswer, _this.representation, {
								x: 680, y: 650, size: 70, min: 1, max: _this.amount, background: null, disabled: true
					});
					_this.gameGroup.add(mapText);
				}
				eyes.y = -100;
				eyes.x = -100;
			}
		});
	}

	//This happens when it's the agent's turn to guess.
	function agentGuess () {
		_this.agent.guessNumber(_this.currentNumber, 1, _this.amount);
		disableBalloons();


		var guess = _this.agent.lastGuess;
		var balloonRepresentation = _this.add.sprite(-100, -100, 'balloonsheet', 'b'+guess, _this.gameGroup);
			balloonRepresentation.scale.set(0.4);
			balloonRepresentation.anchor.setTo(0.5, 0.5);

		return TweenMax.fromTo(_this.agent.thought.scale, 1.5,
			{ x: 0, y: 0 },
			{ x: 1, y: 1,
				ease: Elastic.easeOut,
				onStart: function () {
					_this.agent.thought.visible = true;
					if (_this.agent.thought.guess) { _this.agent.thought.guess.destroy(); }
					//TODO: Random hmm
					_this.agent.say(speech).play('agenthmm1');
				},
				onComplete: function () {
					if(_this.representation === GLOBAL.NUMBER_REPRESENTATION.none) {
						_this.agent.thought.guess = balloonRepresentation;
						balloonRepresentation.x = 10;
						balloonRepresentation.y = 0;
					} else {
						if ((_this.method === GLOBAL.METHOD.addition) || (_this.method === GLOBAL.METHOD.additionSubtraction)) {
								guess -= airBalloonStock; //If you skip too fast this part is skipped over before airBalloonStock is set.
								_this.agent.thought.guess = new NumberButton(guess, GLOBAL.NUMBER_REPRESENTATION.signedNumbers, {
									x: -20, y: -25, size: 70, background: null, disable: true
								});
						} else {
							_this.agent.thought.guess = balloonRepresentation;
							balloonRepresentation.x = 10;
							balloonRepresentation.x = 0;
						}
					}
					_this.agent.thought.add(_this.agent.thought.guess);
					// TODO: Agent should say something here based on how sure it is.
					_this.agent.say(speech).play('agentquestion1');
					showYesnos();
				}
			});
	}

	//Kills the sprites not suppose to show up at the moment and revives those who are.
	function balloonStockUpdate() {
		if (balloonStock < 1) {
			cleanUpBalloons();
			_this.balloonStack1.kill();
		} else {
			_this.balloonStack1.revive();
			_this.balloonStack1.loadTexture('balloonsheet', 'b' + balloonStock);
			copyTexture();
			createBalloon();
		}
	}

	function airBalloonStockUpdate() {
		if (airBalloonStock < 1) {
			cleanUpAirBalloons();
			balloonStack2.kill();
		} else {
			balloonStack2.revive();
			balloonStack2.loadTexture('balloonsheet', 'b' + airBalloonStock);
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
		if(parseInt(_this.representation) !== GLOBAL.NUMBER_REPRESENTATION.none){
			tl.addCallback(function () {
				fade(map, true);
			});
			tl.addSound(speech, beetle, 'beetleintro3');
			tl.add( new TweenMax(map, 2, {x: 650, y: 620, ease:Power1.easeIn}));
		}else{
			tl.addSound(speech, beetle, 'beetleintro1');
			tl.addSound(speech, beetle, 'beetleintro2');
		}
		tl.eventCallback('onComplete', function () {
			liftoffButton.visible = true;
			_this.disable(false);
			_this.nextRound();
		});
	};

	this.modePlayerDo = function (intro, tries) {
		var tl = new TimelineMax();
		if(_this.method === GLOBAL.METHOD.count || ((_this.method === GLOBAL.METHOD.incrementalSteps) && (treasures === 0))) {
			enableBalloons();
		}
		if (tries > 0) {
			if((_this.method === GLOBAL.METHOD.addition) || (_this.method === GLOBAL.METHOD.additionSubtraction)) {
				randomBalloons(_this.currentNumber);
			}
			showLiftoff();
		} else { // if intro or first try	
			if (intro) {
				renderChest(_this.currentNumber);
			} else {
				tl.addSound(speech, beetle, 'newtreasure');
				renderChest(_this.currentNumber);
			}
			if((_this.method === GLOBAL.METHOD.addition) || (_this.method === GLOBAL.METHOD.additionSubtraction)) {
				randomBalloons(_this.currentNumber);
			}
			tl.addCallback(function () {
				showLiftoff();
			});
		}
	};

	this.modePlayerShow = function (intro, tries) {
		if(_this.method === GLOBAL.METHOD.count || ((_this.method === GLOBAL.METHOD.incrementalSteps) && (treasures === 0))) {
			enableBalloons();
		}
		if (tries > 0) {
			if((_this.method === GLOBAL.METHOD.addition) || (_this.method === GLOBAL.METHOD.additionSubtraction)) {
				randomBalloons(_this.currentNumber);
			}
			showLiftoff();
		} else { // if intro or first try
			var tl = new TimelineMax();
			if (intro) {
				treasures = 0;
				if(_this.method === GLOBAL.METHOD.incrementalSteps) {
					popAndReturn(tl);
					enableBalloons();
				}
				renderChest(_this.currentNumber);
				_this.disable(true);
				tl.skippable();
				tl.add(_this.agent.moveTo.start());
				tl.addLabel('agentIntro');
				tl.addSound(speech, _this.agent, 'agentintro');
				tl.add(_this.agent.wave(3, 1), 'agentIntro');
				tl.eventCallback('onComplete', function () {
					_this.sound.removeByKey('birdheroAgentShow');
					_this.disable(false);
				});

			} else {
				tl.addSound(speech, beetle, 'newtreasure');
				renderChest(_this.currentNumber);
			}
			if((_this.method === GLOBAL.METHOD.addition) || (_this.method === GLOBAL.METHOD.additionSubtraction)) {
				randomBalloons(_this.currentNumber);
			}
			tl.addCallback(function () {
				showLiftoff();
			});
		}
	};

	this.modeAgentTry = function (intro, tries) {
		if((_this.method === GLOBAL.METHOD.addition) || (_this.method === GLOBAL.METHOD.additionSubtraction)) {
			randomBalloons(_this.currentNumber);
		}
		var tl = new TimelineMax();
		if (tries > 0) {
			tl.addSound(speech, _this.agent, 'oops');
			tl.add(agentGuess());
		} else { // if intro or first try
			if (intro) {
				treasures = 0;
				if(_this.method === GLOBAL.METHOD.incrementalSteps) {
					popAndReturn(tl);
				}
				renderChest(_this.currentNumber);
				_this.disable(true);
				disableBalloons();
				tl.skippable();
				tl.add(_this.agent.moveTo.start()); // Agent should be here already.
				tl.addSound(speech, _this.agent, 'agenttry');
				tl.eventCallback('onComplete', function () {
					_this.sound.removeByKey('agenttry');
					_this.disable(false);
				});
			} else {
				tl.addSound(speech, beetle, 'newtreasure');
				renderChest(_this.currentNumber);
			}
			tl.addCallback(function () {
				tl.add(agentGuess());
			});
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

//Makes the left stack sway with the wind and the clouds move forward in the background.
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