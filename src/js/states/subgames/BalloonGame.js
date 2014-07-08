/* Balloon Game */
BalloonGame.prototype = Object.create(Subgame.prototype);
BalloonGame.prototype.constructor = BalloonGame;
function BalloonGame () {
	Subgame.call(this); // Call parent constructor.
}

/* Phaser state function */
BalloonGame.prototype.preload = function () {

	this.load.audio('birdheroAgentShow',      ['assets/audio/agent/panda/hello.mp3', 'assets/audio/agent/panda/hello.ogg']);
	this.load.audio('birdheroAgentTry',       ['assets/audio/agent/panda/i_try.mp3', 'assets/audio/agent/panda/i_try.ogg']);
	this.load.spritesheet('spritesheet', 'assets/img/subgames/balloon/skatterna-i-berget-objekt.png',170,349,6);
	this.load.image('eyes',      'assets/img/subgames/balloon/eyes.png');
	this.load.image('metalLoop',      'assets/img/subgames/balloon/metalloop.png');
	this.load.spritesheet('catbush',      'assets/img/subgames/balloon/catbush2.png',191,88,10);

	this.load.audio('birdheroAgentHmm',       LANG.SPEECH.AGENT.hmm);
	this.load.audio('birdheroAgentCorrected', LANG.SPEECH.AGENT.showMe);
	this.load.audio('birdheroAgentOops',      LANG.SPEECH.AGENT.tryAgain);

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

	this.load.image('sky',      'assets/img/subgames/balloon/sky.png');
	this.load.image('background',      'assets/img/subgames/balloon/background.png');
	this.load.image('balloon1',      'assets/img/subgames/balloon/b1.png');
	this.load.image('balloon2',      'assets/img/subgames/balloon/b2.png');
	this.load.image('balloon3',      'assets/img/subgames/balloon/b3.png');
	this.load.image('balloon4',      'assets/img/subgames/balloon/b4.png');
	this.load.image('balloon5',      'assets/img/subgames/balloon/b5.png');
	this.load.image('balloon6',      'assets/img/subgames/balloon/b6.png');
	this.load.image('balloon7',      'assets/img/subgames/balloon/b7.png');
	this.load.image('balloon8',      'assets/img/subgames/balloon/b8.png');
	this.load.image('balloon9',      'assets/img/subgames/balloon/b9.png');
	this.load.image('brokenballoon', 'assets/img/subgames/balloon/brokenballoon.png');
	this.load.image('cloud1',      'assets/img/subgames/balloon/cloud1.png');
	this.load.image('cloud2',      'assets/img/subgames/balloon/cloud2.png');
	this.load.image('map',      'assets/img/subgames/balloon/map.png');
	this.load.image('anchor',      'assets/img/subgames/balloon/anchor.png');

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
	var sky;
	var cloud1;
	var cloud2;
	var scale = 0.85;
	var airballoons;
	var cliff;
	var metalLoop;
	//var cave;
	var chest;
	var liftoffButton;
	//var resetButton;
	var balloons;
	var balloonStack1;
	var balloonStack2;
	var eyes;
	var balloonStock = 9;
	var airBalloonStock = 0;
	var direction = 'right';
	var catBush;
	var mapText;
	var treasures = 0;
	

/* Phaser state function */
BalloonGame.prototype.create = function () {
	var _this = this; // Subscriptions to not have access to 'this' object
	var stepSize = 9/this.amount;
	balloonStock = this.amount;
	var bgMusic = this.add.audio('birdheroMusic', 1, true);
	
	_this.disable(false);

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
			start: { x: 790, y: 1000 },
			stop: { x: 640, y: 450 },
			basketStop: { x: 785, y: 500 },
			scale: 0.65
		},
		cliff: {
			leftx: 660, rightx: 990
		}
	};

	// Add main game
	sky = this.add.sprite(0, 0, 'sky', null, this.gameGroup);
	cloud1 = this.add.sprite(-200, 25, 'cloud1', null, this.gameGroup);
	cloud2 = this.add.sprite(200, 200, 'cloud2', null, this.gameGroup);
	background = this.add.sprite(0, 0, 'background', null, this.gameGroup);

	
	catBush = game.add.sprite(175, 420, 'catbush', 0, this.gameGroup);
	catBush.animations.add('catBlink');
	catBush.inputEnabled = true;
	catBush.events.onInputDown.add(catBushPlay, this);
	//catBush.scale.set(0.5);

	function catBushPlay(){
		catBush.animations.play('catBlink', 8, false);
		//TODO: Add sound.
		catBush.events.onAnimationComplete.add(function(){
			catBush.loadTexture('catbush', 0);
		}, this);
	}


	// Adding the platforms on the cliff wall. -55*(amount)*scale*stepSize
	for (var i = 0; i < this.amount; i++){

		if(i%2 === 0)
		{
			//Right
			cliff = this.add.sprite(coords.cliff.rightx, 350 - (55 * scale * (i) * stepSize), 'spritesheet', 2, this.gameGroup);
			//console.log('RIGHT: x= ' + cliff.x + ' y= ' + cliff.y);
			cliff.scale.x = -scale;
			cliff.scale.y = scale;
		}else{
			//Left
			cliff = this.add.sprite(coords.cliff.leftx, 350 - (55 * scale * (i) * stepSize), 'spritesheet', 2, this.gameGroup);
			//console.log('LEFT: x= ' + cliff.x + ' y= ' + cliff.y);
			cliff.scale.x = scale;
			cliff.scale.y = scale;
		}
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
	//beetle.anchor.setTo(0, 0.5);
	airballoons.add(beetle);

	airballoons.basket = this.add.sprite(785, 510, 'spritesheet', 5, airballoons);
	airballoons.basket.scale.set(0.7);

	balloons = this.add.group(this.gameGroup);
	balloons.x = 0;
	balloons.y = 0;

	balloonStack1 = _this.add.sprite(0, 0, 'balloon6', null, _this.gameGroup);
	balloonStack2 = _this.add.sprite(0, 0, 'balloon6', null, _this.gameGroup);
	metalLoop = _this.add.sprite(0, 0, 'metalLoop', null, _this.gameGroup);

	airballoons.add(balloonStack2);

	balloonStack1.x = coords.balloons.x;
	balloonStack1.y = coords.balloons.y;

	balloonStack1.anchor.setTo(0.5, 1);

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
	var thoughtBubble = this.add.sprite(0, 0, 'thought', null, this.agent.thought);
	thoughtBubble.anchor.set(0.5);
	thoughtBubble.scale.x = -0.7;
	thoughtBubble.scale.y = 0.7;
	this.gameGroup.bringToTop(this.agent);


	//Kills the sprites not suppose to show up at the moment and revives those who are.
	balloonStockUpdate();
	airBalloonStockUpdate();

	//Creates one draggable balloon at the stack.
	//createBalloon();

	// x = game.world.centerX
	liftoffButton = game.add.button(110, 680, 'wood', takeOff, this);
	liftoffButton.anchor.set(0.5, 0.5);
	liftoffButton.visible = false;
	this.hudGroup.add(liftoffButton);
	var anchor = this.add.sprite(110, 680, 'anchor', null, this.hudGroup);
	anchor.anchor.set(0.5, 0.5);
	anchor.scale.set(0.5);
	anchor.visible = false;

	var yesnos = new ButtonPanel(2, GLOBAL.NUMBER_REPRESENTATION.yesno, {
		y: this.world.height-100, background: 'wood', onClick: pushYesno
	});
	yesnos.visible = false;
	this.hudGroup.add(yesnos);

	/*var plusminus = new ButtonPanel(2, GLOBAL.NUMBER_REPRESENTATION.plusminus, {
		y: this.world.height-100, background: 'wood', onClick: pushPlusminus, method: this.method
	});
	plusminus.visible = false;
	this.hudGroup.add(plusminus);*/


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

	function showYesnos () {
		yesnos.reset();
		fade(liftoffButton, false);
		fade(anchor, false);
		fade(yesnos, true);
		fade(plusminus, false);

		if (_this.agent.visible) { _this.agent.eyesFollowPointer(); }
	}

	function showLiftoff () {
		fade(liftoffButton, true);
		fade(anchor, true);
		fade(yesnos, false);
		console.log('GLOBAL.METHOD.incrementalSteps: ' + GLOBAL.METHOD.incrementalSteps + ' this.method ' + _this.method);
		if((parseInt(_this.method) === GLOBAL.METHOD.incrementalSteps) && treasures)
		{
			console.log('Theyre equal!');
			fade(plusminus, true);
		}

		if (_this.agent.visible) { _this.agent.eyesFollowPointer(); }
	}

	function pushYesno (value) {
		//TODO add random sounds
		if (!value) {
			say('isitwrong', _this.agent).play();
			_this.disable(false);
			showLiftoff(0, 0);
		}
		else { agentFloatBalloons(_this.agent.lastGuess); }
	}

	function agentFloatBalloons(guess)
	{
		airBalloonStock = guess;
		balloonStock = _this.amount-guess;
		balloonStockUpdate();
		balloonStack2.revive();
		balloonStack2.loadTexture('balloon'+airBalloonStock);
		takeOff();
	}

	/*function pushPlusminus (value) {
		if(value){
			addBalloon();
		} else {
			removeBalloon();
		}
	}*/

	function addBalloon()
	{
		if(balloonStock > 0)
		{
			airBalloonStock++;
			balloonStock--;
			airBalloonStockUpdate();
			balloonStockUpdate();

			if(balloonStock === 0)
			{
				deleteB();
			}
		}
		console.log('# balloonstock: ' + balloonStock);
		console.log('# airballoonstock: ' + airBalloonStock);
	}

	function removeBalloon()
	{
		if(airBalloonStock > 0)
		{
			airBalloonStock--;
			balloonStock++;
			airBalloonStockUpdate();
			balloonStockUpdate();

			if(airBalloonStock === 0)
			{
				deleteAirB();
			}
		}
		console.log('# balloonstock: ' + balloonStock);
		console.log('# airballoonstock: ' + airBalloonStock);
	}

	//Creates one draggable balloon at the stack.
	function createBalloon()
	{
		if (balloons.length < 1){
			var balloon = _this.add.sprite(coords.balloons.x, coords.balloons.y, 'balloon'+balloonStock, null, _this.gameGroup);
			balloon.x = coords.balloons.x;
			balloon.y = coords.balloons.y;
			balloon.inputEnabled = true;
			balloon.input.enableDrag(false, true);
			balloon.events.onDragStart.add(release, _this);
			balloon.events.onDragStop.add(attatchToBasket, _this);
			balloons.add(balloon);
			balloon.anchor.setTo(0.5, 1);
		}
	}

	function createAirBalloon()
	{
		if (airballoons.length < 3){
			var balloon = _this.add.sprite(coords.basketBalloons.x, coords.basketBalloons.y, 'balloon'+airBalloonStock, null, _this.gameGroup);
			balloon.inputEnabled = true;
			balloon.input.enableDrag(false, true);
			balloon.events.onDragStart.add(release, _this);
			balloon.events.onDragStop.add(attatchToBasket, _this);
			airballoons.add(balloon);
		}
	}

	//release and attatchToBasket control the dragging and snapping of balloons.
	function release(balloon) {
		balloon.loadTexture('balloon1');
		if(airballoons.getIndex(balloon) === -1)
		{
			balloonStock -= 1;
			_this.gameGroup.add(balloon);
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
			balloon.angle = 0;
			airBalloonStock += 1;
			airballoons.add(balloon);
			tl.to(balloon, 1, {x: coords.basketBalloons.x, y: coords.basketBalloons.y});
			tl.eventCallback('onComplete', function() {
				airBalloonStockUpdate();
				copyAirTexture();
			});
			balloonStockUpdate();
		}
		else
		{
			balloonStock += 1;
			balloons.add(balloon);
			tl.to(balloon, 1, {x: coords.balloons.x, y: coords.balloons.y});
			tl.eventCallback('onComplete', function() {
				balloonStockUpdate();
				copyTexture();
				//balloons.forEach(loadTexture, this, true, 'balloon'+balloonStock);
			});
			airBalloonStockUpdate();
		}
		console.log('# balloonstock: ' + balloonStock);
		console.log('# airballoonstock: ' + airBalloonStock);
	}

	function copyTexture() {

		var amount = balloons.length;

		for (var i = 0; i < amount; i++){
			var g = balloons.getAt(i);
			g.loadTexture('balloon'+balloonStock);
		}
	}

	function copyAirTexture() {

		var amount = airballoons.length;

		for (var i = 3; i < amount; i++){
				airballoons.getAt(i).loadTexture('balloon'+airBalloonStock);
		}
	}

	function checkOverlap(spriteA, spriteB)
	{
		var boundsA = spriteA.getBounds();
		var boundsB = spriteB.getBounds();
		return Phaser.Rectangle.intersects(boundsA, boundsB);
	}

	var speech = this.add.audio('beetleintro1');
	speech.addMarker('yippi', 1.9, 1);

	function takeOff() {

		var amount = airBalloonStock;
		
		
		//var result = _this.tryNumber(amount);

		var tl = new TimelineMax();
		tl.skippable();
		if (amount <= 0)
		{
			console.log('No balloons!');
			//TODO: Add a voice saying you need to attatch balloons to the basket.
		} else {

			var result = _this.tryNumber(amount);
			//Ugly solution until I figure it out
			if(this.amount === 9)
			{
				amount++;
			}
			_this.agent.eyesFollowObject(airballoons.basket);
			_this.disable(true);
			liftoffButton.visible = false;
			anchor.visible = false;
			plusminus.visible = false;

			if (beetle.x !== coords.beetle.basketStop.x && beetle.y !== coords.beetle.basketStop.y) {
				tl.add( new TweenMax(beetle, 2, {x: coords.beetle.basketStop.x, y: coords.beetle.basketStop.y, ease:Power1.easeIn}));
			}
			tl.add( new TweenMax(airballoons, 2, {x: 0, y: -(55*(amount))*scale*stepSize, ease:Power1.easeInOut}));
			if (!result)
			{
				tl.addCallback(function () {
					fade(eyes, false);
					fade(chest, true);
				});
				tl.addSound(speech, beetle, 'yippi');
				tl.add(_this.addWater(chest.x, chest.y), '-=3');
				treasures++;
			} else if (result > 0)
			{
				tl.addSound('tryless', beetle);
			} else {
				tl.addSound('trymore', beetle);
			}
			//Popping balloons and Basket going back down.
			if(((parseInt(_this.method) === GLOBAL.METHOD.incrementalSteps) && !treasures) || (parseInt(_this.method) === GLOBAL.METHOD.count))
			{
				popAndReturn(tl);
			}
			
			tl.eventCallback('onComplete', function(){
				_this.disable(false);
				_this.agent.eyesFollowPointer();
				_this.nextRound();
			});
		}
	}

	function popAndReturn(tl) {
		var tls = new TimelineMax(); //For the popping sound so it can better be synced with the animation.
		tl.add( new TweenMax(beetle, 0.5, {x: coords.beetle.basketStop.x, y: coords.beetle.basketStop.y-50, ease:Power4.easeIn}));
		tl.addCallback(function () {
			tls.addSound('pop', balloonStack2);
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

		deleteAirB();
	
		balloonStack2.revive();
		balloonStack2.loadTexture('brokenballoon');
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

	function deleteAirB() {
		for (var i = 0; i < 9; i++){
			deleteExcessSprite(airballoons.getAt(3));
		}
	}

	function deleteB() {
		for (var i = 0; i < 9; i++){
			deleteExcessSprite(balloons.getAt(0));
		}
	}

	function deleteExcessSprite(sprite) {
		//console.log(sprite);
		if(sprite !== -1)
		{
			sprite.destroy();
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

	function renderChest (correctAnswer) {

		chest.visible = false;

		if(correctAnswer % 2 === 1)
			{
				chest.x = coords.cliff.rightx-105;
				eyes.x = coords.cliff.rightx-95;
			}
		else
			{
				chest.x = coords.cliff.leftx+45;
				eyes.x = coords.cliff.leftx+50;
			}

			chest.y = 455 - (55 * scale * (correctAnswer-1) * stepSize + 55 * scale);
			eyes.y = 525 - (55 * scale * (correctAnswer-1) * stepSize + 55 * scale);
			console.log('eyes x: ' + eyes.x);
			console.log('y: ' + eyes.y);
			console.log('chest x: ' + chest.x);
			console.log('y: ' + chest.y);
			chest.scale.x = 0.4;
			chest.scale.y = 0.4;
			eyes.scale.x = 0.3;
			eyes.scale.y = 0.3;
			fade(eyes, true);

			console.log('render GLOBAL.NUMBER_REPRESENTATION.none: ' + GLOBAL.NUMBER_REPRESENTATION.none + ' this.representation: ' + _this.representation);
			if(parseInt(_this.representation) !== GLOBAL.NUMBER_REPRESENTATION.none){
				console.log('Theyre not equal');
				if(mapText)
				{
					mapText.destroy();
				}

				mapText = new NumberButton(correctAnswer, _this.representation, {
							x: 640, y: 670, size: 38
				});
				_this.gameGroup.add(mapText);
				eyes.y = -100;
				eyes.x = -100;
			}

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
					//TODO: Random hmm
					say('agenthmm', _this.agent).play();
				},
				onComplete: function () {
					if(parseInt(_this.representation) === GLOBAL.NUMBER_REPRESENTATION.none){
						_this.agent.thought.guess = new NumberButton(_this.agent.lastGuess, 1, {
							x: -50, y: -50, size: 100
						});
					}else{
						_this.agent.thought.guess = new NumberButton(_this.agent.lastGuess, _this.representation, {
							x: -50, y: -50, size: 100
						});
					}
					_this.agent.thought.add(_this.agent.thought.guess);
					// TODO: Agent should say something here based on how sure it is.
					say('question', _this.agent).play();
					showYesnos();
				}
			});
	}

	/*beetle.talk = TweenMax.to(beetle, 0.2, {
		y: '+=5', repeat: -1, yoyo: true, paused: true
	});*/

	this.modeIntro = function () {
		console.log('ModeIntro');
		_this.disable(true);
		bgMusic.play();
		var tl = new TimelineMax();
		tl.skippable();
		tl.add( new TweenMax(beetle, 3, {x: coords.beetle.stop.x, y: coords.beetle.stop.y, ease:Power1.easeIn}));
		console.log('intro GLOBAL.NUMBER_REPRESENTATION.none: ' + GLOBAL.NUMBER_REPRESENTATION.none + ' this.representation: ' + _this.representation);
		if(parseInt(_this.representation) !== GLOBAL.NUMBER_REPRESENTATION.none){
			console.log('Theyre not equal 1');
			var map = game.add.sprite(coords.beetle.start.x, coords.beetle.start.y, 'map', null, _this.gameGroup);
			map.scale.setTo(0.5, 0.5);
			tl.add( new TweenMax(map, 0.1, {x: coords.beetle.stop.x+70, y: coords.beetle.stop.y+60, ease:Power1.easeIn}));
			tl.addSound('beetleintro3', beetle);
			tl.add( new TweenMax(map, 2, {x: 620, y: 650, ease:Power1.easeIn}));
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
				console.log('modeplayerDoIntro');
				console.log('correct answer= ' + _this.currentNumber);
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
				popAndReturn(tl);
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
				popAndReturn(tl);
				_this.disable(true);
				tl.skippable();
				console.log('modeAgentTry Intro');
				console.log('correct answer= ' + _this.currentNumber);
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

	this.modeAgentDo = function (intro, tries) {
		if (tries > 0) {
			liftoffButton.visible = true;
			anchor.visible = true;
			plusminus.visible = true;
		} else { // if intro or first try
			console.log('modeAgentDo Intro');
			liftoffButton.visible = true;
			anchor.visible = true;
			plusminus.visible = true;
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
		if (balloonStock === 0)
		{
			balloonStack1.kill();
		} else {
			balloonStack1.revive();
			balloonStack1.loadTexture('balloon' + balloonStock);
			copyTexture();
			createBalloon();
		}
	}

	function airBalloonStockUpdate() {
		if (airBalloonStock === 0)
		{
			balloonStack2.kill();
		} else {
			balloonStack2.revive();
			balloonStack2.loadTexture('balloon' + airBalloonStock);
			copyAirTexture();
			createAirBalloon();
		}
	}

	// Make sure the call this when everything is set up.
	this.startGame();
};

BalloonGame.prototype.update = function () {
	if (balloonStack1.angle > 7 && direction === 'right'){
		direction = 'left';
	} else if (balloonStack1.angle < -7 && direction === 'left'){
		direction = 'right';
	}
	if (direction === 'right'){
		balloonStack1.angle += 0.3;
	} else {
		balloonStack1.angle -= 0.3;
	}
	balloons.forEach(syncAngle, this, true);

	function syncAngle(b){
		b.angle = balloonStack1.angle;
	}

	if (cloud1.x > 600){
		cloud1.x = -cloud1.width;
	}else{
		cloud1.x += 0.3;
	}

	if (cloud2.x > 600){
		cloud2.x = -cloud2.width;
	}else{
		cloud2.x += 0.5;
	}
};


BalloonGame.prototype.render = function () {
	//game.debug.spriteInfo(balloonStack1, 32, 100);
};





