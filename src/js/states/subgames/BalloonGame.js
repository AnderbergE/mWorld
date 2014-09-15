/* Balloon Game */
BalloonGame.prototype = Object.create(NumberGame.prototype);
BalloonGame.prototype.constructor = BalloonGame;
function BalloonGame () {
	NumberGame.call(this); // Call parent constructor.
}

BalloonGame.prototype.pos = {
	beetle: {
		start: { x: 790, y: 800 },
		stop: { x: 640, y: 500 },
		scale: 0.65
	},
	agent: {
		start: { x: 250, y: 950 },
		stop: { x: 390, y: 500 },
		scale: 0.25
	},
	balloons: { x: 150, y: 500 },
	bucket: { x: 780, y: 540 },
	bucketBalloons: { x: 815, y: 545 },
	cave: { left: 670, right: 860, y: 450, height: 420 },
	sack: { x: 950, y: 600 }
};

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

	this.load.atlasJSONHash('balloon', 'assets/img/subgames/balloon/atlas.png', 'assets/img/subgames/balloon/atlas.json');
	this.load.image('cloud1', 'assets/img/objects/cloud1.png');
	this.load.image('cloud2', 'assets/img/objects/cloud2.png');
};

/* Phaser state function */
BalloonGame.prototype.create = function () {
	var scale = 0.85;
	var chest;
	var liftoffButton; //The anchor button
	var eyes; //When no representation is set the eyes are instead shown in the approperiate cave.
	var treasure;
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

	var bgMusic = this.add.audio('birdheroMusic', 1, true);
	
	this.disable(false);

	// Add main game
	this.gameGroup.add(new Cover('#689cca'));
	this.cloud1 = this.gameGroup.create(-200, 25, 'cloud1');
	this.cloud2 = this.gameGroup.create(200, 200, 'cloud2');
	this.gameGroup.create(0, 0, 'balloon', 'bg');
	this.gameGroup.create(this.pos.balloons.x, this.pos.balloons.y, 'balloon', 'metalloop').anchor.set(0.5);

	// The interactable bush.
	// TODO: Create better synced graphics.
	var catBush = this.gameGroup.create(175, 420, 'balloon', 'catbush1');
	catBush.purr = this.add.audio('catbushpurr');
	catBush.animations.add('catBlink', ['catbush2', 'catbush3', 'catbush4', 'catbush5', 'catbush6', 'catbush7', 'catbush8', 'catbush9', 'catbush10', 'catbush1']);
	catBush.events.onAnimationComplete.add(function(){
		catBush.inputEnabled = true;
	}, this);

	catBush.inputEnabled = true;
	catBush.events.onInputDown.add(function () {
		catBush.inputEnabled = false;
		catBush.purr.play();
		catBush.animations.play('catBlink', 8, false);
	}, this);

	// Adding the platforms on the cliff wall.
	this.caves = [];
	var heightPerCave = this.pos.cave.height / this.amount;
	for (var i = 0; i < this.amount; i++) {
		this.caves.push(this.gameGroup.create(
			(i % 2 ? this.pos.cave.left : this.pos.cave.right),
			this.pos.cave.y - i * heightPerCave,
			'balloon', 'cave'
		));
	}

	eyes = this.gameGroup.create(1200, 900, 'balloon', 'eyes');

	// The stack to grab balloons from.
	this.balloonStack = new BalloonGameStack(this.pos.balloons.x, this.pos.balloons.y, this.amount);
	makeDraggable(this.balloonStack);
	this.gameGroup.add(this.balloonStack);
	this.direction = 0.3; // TODO: USE TWEEN For animating the wind in the balloons. 

	// The group where the bucket, beetle and right side balloons go into. Is animated on.
	this.actionGroup = this.add.group(this.gameGroup);
	this.actionGroup.x = 0;
	this.actionGroup.y = 0;

	var beetle = this.actionGroup.create(this.pos.beetle.start.x, this.pos.beetle.start.y, 'balloon', 'beetle');
	beetle.scale.set(this.pos.beetle.scale);

	this.actionGroup.bucket = this.actionGroup.create(this.pos.bucket.x, this.pos.bucket.y, 'balloon', 'bucket');
	this.bucketBalloons = new BalloonGameStack(this.pos.bucketBalloons.x, this.pos.bucketBalloons.y, 0);
	makeDraggable(this.bucketBalloons);
	this.actionGroup.add(this.bucketBalloons);

	var magnifyGroup = this.add.group(this.gameGroup);
	magnifyGroup.x = 530;
	magnifyGroup.y = 150;
	magnifyGroup.magnifyBubble = magnifyGroup.create(0, 0, 'balloon', 'magnify');
	magnifyGroup.magnifyBubble.anchor.setTo(0.5, 0.5);
	magnifyGroup.magnifyBalloons = magnifyGroup.create(-5, 10, 'balloon', 'b'+this.balloonStack.amount);
	magnifyGroup.magnifyBalloons.anchor.setTo(0.5, 0.5);
	magnifyGroup.magnifyBalloons.scale.set(0.6);
	magnifyGroup.visible = false;

	// The button to push when done with the balloons.
	liftoffButton = new SpriteButton ('balloon', 'anchor', { x: 850, y: 650, onClick: takeOff });
	liftoffButton.visible = false;
	this.gameGroup.add(liftoffButton);

	this.gameGroup.bringToTop(this.agent);

	map = this.gameGroup.create(this.pos.beetle.stop.x+70, this.pos.beetle.stop.y+60, 'balloon', 'map');
	map.visible = false;

	chest = this.gameGroup.create(1200, 900, 'balloon', 'chest_closed');
	chest.anchor.setTo(0.5, 1);
	chest.visible = false;

	treasure = this.gameGroup.create(300, 300, 'balloon', 'treasure1');
	treasure.anchor.setTo(0.5, 1);
	treasure.visible = false;

	this.sack = this.gameGroup.create(this.pos.sack.x, this.pos.sack.y, 'balloon', 'sack');
	this.sack.anchor.setTo(0.5, 0.5);


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

	function makeDraggable (stack) {
		stack.balloons.inputEnabled = true;
		stack.balloons.events.onInputDown.add(function () {
			if (this.amount > 0) {
				this.updateBalloons(this.amount - 1);

				var b = _this.gameGroup.create(0, 0, 'balloon', 'b1');
				b.anchor.set(0.5, 1);
				b.update = function () {
					this.x = game.input.activePointer.x;
					this.y = game.input.activePointer.y;
				};

				var f = function () {
					this.balloons.events.onInputUp.remove(f, this);
					b.update = function () {};
					stopDrag(b);
				};
				this.balloons.events.onInputUp.add(f, this);
			}
		}, stack);
	}

	// When you let go of a balloon.
	function stopDrag (balloon) {
		var t = new TimelineMax();
		// Check for ovelap with bucket balloons.
		if (Phaser.Rectangle.intersects(balloon.getBounds(), _this.actionGroup.getBounds())) {
			_this.bucketBalloons.pending = 1;
			t.to(balloon, 0.5, { x: _this.bucketBalloons.x, y: _this.bucketBalloons.y });
			t.addCallback(function () {
				_this.bucketBalloons.pending = 0;
				_this.bucketBalloons.updateBalloons(_this.bucketBalloons.amount + 1);
			});
		} else {
			t.to(balloon, 1, _this.pos.balloons);
			t.addCallback(function () {
				_this.balloonStack.updateBalloons(_this.balloonStack.amount + 1);
			});
		}
		t.addCallback(balloon.destroy, null, null, balloon);
	}


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
			pluspanel.setRange(1, _this.amount-_this.bucketBalloons.amount);
			pluspanel.amount = _this.amount-_this.bucketBalloons.amount;
			pluspanel.reset();
			fade(pluspanel, true);
		} else if (_this.method === GLOBAL.METHOD.additionSubtraction) {
			pluspanel.setRange(1-_this.bucketBalloons.amount, _this.amount-_this.bucketBalloons.amount);
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
				disableBalloons(false);
			}
			_this.disable(false);
			showLiftoff(0, 0);
		}
		else {
			_this.balloonStack.updateBalloons(_this.amount - _this.agent.lastGuess);
			_this.bucketBalloons.updateBalloons(_this.agent.lastGuess);
			takeOff();
		}
		_this.agent.thought.visible = false;
	}

	//What happens when you press one of the buttons in addition or addition/subtraction mode.
	function pushPlus (value) {
		if((_this.bucketBalloons.amount + value) > _this.amount) {
			_this.bucketBalloons.amount = _this.amount;
		} else if((_this.bucketBalloons.amount + value) < 0) {
			_this.bucketBalloons.amount = 0;
		} else {
			_this.bucketBalloons.amount = _this.bucketBalloons.amount + value;
		}
		_this.balloonStack.amount = _this.amount-_this.bucketBalloons.amount;
		_this.balloonStack.updateBalloons();
		_this.bucketBalloons.updateBalloons();
		takeOff();
	}

	//When pressing IncrimentalStep buttons.
	function updateBalloon(change)
	{
		if((change === 1) && (_this.balloonStack.amount > 0)) {
			_this.bucketBalloons.updateBalloons(_this.bucketBalloons.amount + 1);
			_this.balloonStack.updateBalloons(_this.balloonStack.amount - 1);
		} else if((change === 0) && (_this.bucketBalloons.amount > 1)) {
			_this.bucketBalloons.updateBalloons(_this.bucketBalloons.amount - 1);
			_this.balloonStack.updateBalloons(_this.balloonStack.amount + 1);
		}
		magnifyGroup.magnifyBalloons.loadTexture('balloonsheet', 'b' + _this.bucketBalloons.amount);
	}

	//When you press the anchor this happens.
	function takeOff() {

		var amount = _this.bucketBalloons.amount;
		
		if (amount <= 0) {
			//TODO: Add a voice saying you need to attach balloons to the bucket.
			return;
		} else {
			var tl = new TimelineMax();
			tl.skippable();
			var result = _this.tryNumber(amount);

			if(_this.amount === 9)
			{
				amount++; //This makes the bucket move differently on the 9 mode. Could take away this step if we implement the variable movement further down in a smarter way. ****
			}
			_this.agent.eyesFollowObject(_this.actionGroup.bucket);
			disableBalloons(true);
			liftoffButton.visible = false;
			plusminus.visible = false;
			pluspanel.visible = false;

			if (beetle.x !== _this.pos.bucket.x && beetle.y !== _this.pos.bucket.y) {
				tl.add( new TweenMax(beetle, 2, { x: _this.actionGroup.bucket.x, y: _this.actionGroup.bucket.y - 10, ease: Power1.easeIn }));
			}
			tl.add( new TweenMax(_this.actionGroup, 2, {x: 0, y: -(55*(amount))*scale*stepSize, ease:Power1.easeInOut})); //The above comment refers to here. ****
			if (!result) { //If we guessed correctly
				tl.eventCallback('onComplete', function(){
					openChest();
				});

				if(_this.method === GLOBAL.METHOD.incrementalSteps) {
					treasures++;
					if(_this.bucketBalloons.amount > 7) {
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
				} else if(_this.bucketBalloons.amount > 7) {
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
			chest.frameName = 'chest_open';
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
		treasure.frameName = 'treasure' + game.rnd.integerInRange(1, 6);
		tl.addSound(speech, beetle, 'yippi');
		tl.add( new TweenMax(treasure, 2, {x: _this.pos.sack.x, y: _this.pos.sack.y+10, ease:Power4.easeIn}));
		tl.addCallback(function () {
			tls.addSound('sackjingle');
			new TweenMax(_this.sack, 0.2, {y: _this.pos.sack.y+3, ease: Power1.easeInOut }).backForth(2);
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
		tl.to(beetle, 0.5, { y: '-=50', ease: Power4.easeIn });
		tl.addCallback(function () {
			tls.addSound('pop');
			resetBalloons();
		});
		tl.to(beetle, 0.5, { y: '+=50', ease: Power4.easeIn });
		// tl.addCallback(function () { _this.bucketBalloons.kill(); });
		tl.to(_this.actionGroup, 2, {x: 0, y: 0, ease:Bounce.easeOut});
	}

	//used by popAndReturn to take the balloons back. There used to be animations to it which is why it takes a few uneccesary steps. I let them be there in case we wanted to add them again later.
	function resetBalloons() {

		var amount = _this.bucketBalloons.amount;

		for (var i = 0; i < amount; i++){
			_this.bucketBalloons.amount--;
			_this.bucketBalloons.updateBalloons();
			_this.balloonStack.amount++;
			_this.balloonStack.updateBalloons();
		}

		_this.bucketBalloons.popBalloons();
	}

	//Sets a random amount of balloons onto the right stack. It will never be the same as the answer and on addition it will never be more than the answer.
	function randomBalloons (correctAnswer) {
		disableBalloons(true);
		if (_this.method === GLOBAL.METHOD.additionSubtraction) {
			var answerIsHigher = game.rnd.integerInRange(0, 1);
			if((correctAnswer === _this.amount) || answerIsHigher) {
				//if answerIsHigher = 1 put ballons below answer.
				_this.bucketBalloons.amount = game.rnd.integerInRange(0, correctAnswer-1);
			} else {
				_this.bucketBalloons.amount = game.rnd.integerInRange(correctAnswer+1, _this.amount-1);
			}
			
		} else if (_this.method === GLOBAL.METHOD.addition) {
			_this.bucketBalloons.amount = game.rnd.integerInRange(0, correctAnswer-1);
		} else {
			_this.bucketBalloons.amount = this.amount-1;
		}
		_this.bucketBalloons.updateBalloons();
		_this.balloonStack.updateBalloons(_this.amount - _this.bucketBalloons.amount);
	}

	// Makes it so we can't click the balloons.
	function disableBalloons (value) {
		_this.balloonStack.balloons.inputEnabled = !value;
		_this.bucketBalloons.balloons.inputEnabled = !value;
	}

	//This updates the map with a new value.
	function renderChest (correctAnswer) {

		var tl = new TimelineMax();
		tl.skippable();
		tl.add(fade(chest,false));
		chest.frameName = 'chest_closed';
		tl.add(fade(treasure,false));

		tl.addCallback(function () {
			if(correctAnswer % 2 === 1) {
				chest.x = _this.pos.cave.right-70;
				eyes.x = _this.pos.cave.right-95;
			} else {
				chest.x = _this.pos.cave.left+75;
				eyes.x = _this.pos.cave.left+50;
			}

			chest.y = 555 - (55 * scale * (correctAnswer-1) * stepSize + 55 * scale);
			eyes.y = 525 - (55 * scale * (correctAnswer-1) * stepSize + 55 * scale);
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
		disableBalloons(true);

		var guess = _this.agent.lastGuess;
		var balloonRepresentation = _this.gameGroup.create(-100, -100, 'balloon', 'b'+guess);
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
								guess -= _this.bucketBalloons.amount; //If you skip too fast this part is skipped over before airBalloonStock is set.
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

	this.modeIntro = function () {
		_this.disable(true);
		bgMusic.play();
		var tl = new TimelineMax();
		tl.skippable();
		tl.add( new TweenMax(beetle, 3, {x: _this.pos.beetle.stop.x, y: _this.pos.beetle.stop.y, ease:Power1.easeIn}));
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
			disableBalloons(false);
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
			disableBalloons(false);
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
					disableBalloons(false);
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
				disableBalloons(true);
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
		_this.disable(true);
		_this.balloonStack.amount = 6;
		_this.bucketBalloons.amount = 0;
		_this.agent.fistPump()
			.addCallback(function () {
				_this.balloonStack.updateBalloons();
				_this.bucketBalloons.updateBalloons();
				_this.nextRound();
			});
	};

	// Make sure the call this when everything is set up.
	this.startGame();
};

//Makes the left stack sway with the wind and the clouds move forward in the background.
BalloonGame.prototype.update = function () {
	/*
	if (this.balloonStack.balloons.angle > 7) {
		this.direction = -0.3;
	} else if (this.balloonStack.balloons.angle < -7) {
		this.direction = 0.3;
	}
	this.balloonStack.balloons.angle += this.direction;
	*/

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


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                              Balloon Stack                                */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
BalloonGameStack.prototype = Object.create(Phaser.Group.prototype);
BalloonGameStack.prototype.constructor = BalloonGameStack;

function BalloonGameStack (x, y, amount) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	this.x = x;
	this.y = y;

	this.amount = amount || 0;
	this.balloons = this.create(0, 0, 'balloon');
	this.balloons.anchor.set(0.5, 1);
	this.updateBalloons();
}

BalloonGameStack.prototype.updateBalloons = function (amount) {
	if (!isNaN(amount)) {
		this.amount = amount;
	}

	if (this.amount === 0) {
		this.visible = false;
	} else {
		this.balloons.frameName = 'b' + this.amount;
		this.visible = true;
	}
};

BalloonGameStack.prototype.popBalloons = function () {
	this.amount = 0;
	this.balloons.frameName = 'b1'; // TODO: Broken here
};