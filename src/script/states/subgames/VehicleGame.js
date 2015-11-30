var VehicleTractor = require('./VehicleTractor.js');
var VehicleCrane = require('./VehicleCrane.js');
var NumberGame = require('./NumberGame.js');
var GLOBAL = require('../../global.js');
var LANG = require('../../language.js');
var util = require('../../utils.js');

module.exports = VehicleGame;

/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                             Vehicle game
/* Methods:         All
/* Representations: All, except "none".
/* Range:           1--4, 1--9
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
VehicleGame.prototype = Object.create(NumberGame.prototype);
VehicleGame.prototype.constructor = VehicleGame;
function VehicleGame () {
	NumberGame.call(this); // Call parent constructor.
}

VehicleGame.prototype.pos = {
	agent: {
		start: { x: 1200, y: 380 },
		stop: { x: 700, y: 400 },
		scale: 0.3
	},
	crane: {
		start: { x: 10, y: 750 },
		drop: { x: 70, y: 750 },
		pickup: { x: -90, y: 750 },
	},
	trailer : {
		pos: { x: 380, y: 750 },
		firstMarker: { x: 425 , y: 650 },
		markerOffset: 65,
		height: 83,
		cargopos: { x: 420, y: 667 },
		cargoposoffset: 65,
	},
	tractor: {
		pos: { x: 730, y: 630 }
	},
	cargo: {
		height: 58,
		heapPos: { x: 220, y: 640 }
	}
};

VehicleGame.prototype.buttonColor = 0xface3d;

/* Phaser state function */
VehicleGame.prototype.preload = function () {
	this.load.audio('vehicleSpeech', LANG.SPEECH.vehicle.speech); // speech sheet
	this.load.audio('entryMusic', ['audio/music.m4a', 'audio/music.ogg', 'audio/music.mp3']);
	this.load.atlasJSONHash('vehicle', 'img/subgames/vehicle/atlas.png', 'img/subgames/vehicle/atlas.json');
};

/* Phaser state function */
VehicleGame.prototype.create = function () {
	// Setup additional game objects on top of NumberGame.init
	this.setupButtons({
		buttons: {
			x: 150,
			y: 25,
			size: this.world.width - 300
		},
		yesnos: {
			x: 150,
			y: 25,
			size: this.world.width - 300
		}
	});

	// Add music, sounds and speech
	this.speech = util.createAudioSheet('vehicleSpeech', LANG.SPEECH.vehicle.markers);
	this.add.music('entryMusic', 0.15, true).play();

	// Add background
	this.add.sprite(0, 0, 'vehicle', 'bg', this.gameGroup);
	var cloud1 = this.gameGroup.create(-1000, 10, 'objects', 'cloud2');
	var cloud2 = this.gameGroup.create(-1000, 150, 'objects', 'cloud1');
	TweenMax.fromTo(cloud1, 380, { x: -cloud1.width }, { x: this.world.width, repeat: -1 });
	TweenMax.fromTo(cloud2, 290, { x: -cloud2.width }, { x: this.world.width, repeat: -1 });

	this.agent.mirrorThought();
	this.agent.thought.x = -this.agent.thought.x - 150;
	this.agent.thought.y *= 1.9;
	this.agent.thought.toScale = 3;
	this.gameGroup.bringToTop(this.agent);

	this.tractor = new VehicleTractor(this.game, this.pos.tractor.pos.x, this.pos.tractor.pos.y);
	this.gameGroup.add(this.tractor);

	this.trailer = this.add.sprite(this.pos.trailer.pos.x, this.pos.trailer.pos.y, 'vehicle', 'trailer', this.gameGroup);
	this.trailer.anchor.set(0, 1);


	// Create the cargo heap.
	var cargoHeap = this.add.sprite(this.pos.cargo.heapPos.x, this.pos.cargo.heapPos.y, 'vehicle', 'cargobox', this.gameGroup);
	cargoHeap.y -= cargoHeap.height;
	this.add.sprite(cargoHeap.x - cargoHeap.width, cargoHeap.y, 'vehicle', 'cargobox', this.gameGroup);
	this.add.sprite(cargoHeap.x - cargoHeap.width / 2, cargoHeap.y - cargoHeap.height, 'vehicle', 'cargobox', this.gameGroup);


	this.crane = new VehicleCrane(this.game, this.pos.crane.start.x, this.pos.crane.start.y, this.amount);
	this.gameGroup.add(this.crane);
	if (this.method === GLOBAL.METHOD.additionSubtraction) {
		this.crane.addThought(40, -379, this.representation[0], false);
		this.crane.thought.toScale = 0.7;
	}


	// Create an array with the trailers load and initiate to zero. Create the positional markers for the cargo.
	this.trailerLoad = [this.amount];
	this.markers = [this.amount];

	var startPos = this.amount < 9 ? this.pos.trailer.firstMarker.x + this.pos.trailer.markerOffset : this.pos.trailer.firstMarker.x;
	var offset = this.amount < 9 ? this.pos.trailer.markerOffset * 2 : this.pos.trailer.markerOffset;

	for (var i = 0; i < this.amount; i++) {
		this.trailerLoad[i] = 0;

		var xPos = startPos + i * offset;

		var newMarker = this.add.sprite(xPos, this.pos.trailer.firstMarker.y, 'vehicle', 'cargomarker', this.gameGroup);
		newMarker.anchor.set(0.5, 0.5);
		this.markers[i] = newMarker;
	}
};

VehicleGame.prototype.createNewCargo = function (xPos, yPos) {
	var cargo = this.game.add.sprite(xPos, yPos, 'vehicle', 'cargobox', this.gameGroup);
	cargo.visible = false;
	cargo.anchor.set(0.5, 1);
	cargo.scale.set(this.crane.cargo.scale.x, this.crane.cargo.scale.y);
	return cargo;
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                           Instruction functions                           */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
VehicleGame.prototype.instructionCount = function () {
	var t = new TimelineMax();
	t.addSound(this.speech, this.crane, 'showTheWay');
	t.addSound(this.speech, this.crane, 'decideHowFar', '+=0.8');
	t.add(this.pointAtTrailer(this.currentNumber));
	t.addLabel('useButtons');
	t.addLabel('flashButtons', '+=0.5');
	t.addSound(this.speech, this.crane, 'pushNumber', 'useButtons');
	t.add(util.fade(this.buttons, true), 'useButtons');
	t.addCallback(this.buttons.highlight, 'flashButtons', [1], this.buttons);
	return t;
};

VehicleGame.prototype.instructionSteps = VehicleGame.prototype.instructionCount;

VehicleGame.prototype.instructionAdd = function () {
	var t = new TimelineMax();
	t.addSound(this.speech, this.crane, 'wrongPlace');
	t.addSound(this.speech, this.crane, 'notFarEnough', '+=0.8');
	t.addSound(this.speech, this.crane, 'howMuchMore');
	t.addLabel('useButtons', '+=0.3');
	t.addLabel('flashButtons', '+=0.8');
	t.addSound(this.speech, this.crane, 'pushNumber', 'useButtons');
	t.add(util.fade(this.buttons, true), 'useButtons');
	t.addCallback(this.buttons.highlight, 'flashButtons', [1], this.buttons);
	return t;
};

VehicleGame.prototype.instructionSubtract = function () {
	var t = new TimelineMax();
	t.addSound(this.speech, this.crane, 'goneTooFar');
	t.addSound(this.speech, this.crane, 'mustGoBack');
	t.addLabel('useButtons', '+=0.3');
	t.addLabel('flashButtons', '+=0.8');
	t.addSound(this.speech, this.crane, 'pushNumber', 'useButtons');
	t.add(util.fade(this.buttons, true), 'useButtons');
	t.addCallback(this.buttons.highlight, 'flashButtons', [1], this.buttons);
	return t;
};

VehicleGame.prototype.instructionAddSubtract = function () {
	var t = new TimelineMax();
	t.addLabel('useButtons');
	t.addLabel('flashButtons', '+=0.5');
	t.addSound(this.speech, this.crane, 'useButtons', 'useButtons');
	t.add(util.fade(this.buttons, true), 'useButtons');
	t.addCallback(this.buttons.highlight, 'flashButtons', [1], this.buttons);
	return t;
};

VehicleGame.prototype.pointAtTrailer = function (number) {
	var startY = this.pos.trailer.cargopos.y;
	var startX = this.amount < 9 ? this.pos.trailer.cargopos.x + this.pos.trailer.cargoposoffset : this.pos.trailer.cargopos.x;
	var arrow = this.gameGroup.create(startX, startY - 200, 'objects', 'arrow');
	arrow.tint = 0xf0f000;
	arrow.anchor.set(0, 0.5);
	arrow.rotation = -Math.PI/2;
	arrow.visible = false;

	var t = new TimelineMax();
	t.addCallback(function () { arrow.visible = true; });
	t.addCallback(function () {}, '+=0.5');
	for (var i = 0; i < number; i++) {
		var adjustedPos = this.amount < 9 ? i * 2 : i;
		var xPos = startX + (this.pos.trailer.cargoposoffset * adjustedPos);

		if (i !== 0) {
			t.add(new TweenMax(arrow, 0.75, { x: xPos, y: startY - 200 }), '+=0.3');
		}
		t.add(new TweenMax(arrow, 1, { y: startY - 20 }));
	}
	t.addCallback(function () { arrow.destroy(); }, '+=0.5');

	return t;
};

/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                           Start round functions                           */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
VehicleGame.prototype.newCargo = function (silent) {
	var t = new TimelineMax();

	// If the randomly selected number is marking a full position. Assign the next free position.
	if (this.trailerLoad[this.currentNumber - 1] > 2) {
		this.currentNumber = this.getNewNumber();
	}

	t.addCallback(this.markCargoPosition, null, [this.currentNumber - 1], this);
	t.add(this.pickUpCargo());

	this.doStartFunction(t, silent);

	return t;
};

VehicleGame.prototype.getNewNumber = function () {
	for (var i = 1; i < this.amount; i++) {
		// Add the count to the current position and adjust for the maximum range.
		var nextNumber = (this.currentNumber + i) % (this.amount + 1);

		// Check if the new position is available and in the acceptable range.
		if (this.trailerLoad[nextNumber - 1] < 3 && nextNumber >= this._numberMin && nextNumber <= this._numberMax) {
			return nextNumber;
		}
	}

	// Should not happen but just in case...
	return this.currentNumber;
};

VehicleGame.prototype.markCargoPosition = function (pos) {
	// Mark the selected position with an animated marker.
	var animatedHeight = this.markers[pos].height * 1.4;
	var animatedWidth = this.markers[pos].width * 1.2;

	if (this.markerAnimation) {
		this.markerAnimation.pause(0);
	}

	this.markerAnimation = TweenMax.to(this.markers[pos], 0.5, {
		height: animatedHeight, width: animatedWidth, ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: false
	});
};

VehicleGame.prototype.pickUpCargo = function () {
	// Move the crane to pick up a new cargo box from the heap.
	var t = new TimelineMax();

	t.add(this.crane.moveCrane(this.pos.crane.pickup.x));
	if (this.crane.trolleyPos !== (this.pos.cargo.heapPos.x - this.pos.crane.pickup.x)) {
		t.add(this.crane.moveTrolley(this.pos.cargo.heapPos.x - this.pos.crane.pickup.x));
	}
	t.add(this.crane.moveHook(this.pos.cargo.heapPos.y - this.crane.adjustedCargonetHeight));
	t.addCallback(function () { this.crane.cargonet.visible = true; }, null, null, this);
	t.addCallback(function () { this.crane.cargo.visible = true; }, null, null, this);

	t.addLabel('hook');
	t.add(this.crane.moveHook(this.crane.pos.hookTravelPos), 'hook+=0.5');

	t.addLabel('moveCrane');
	t.add(this.crane.moveCrane(this.pos.crane.drop.x), 'moveCrane');

	return t;
};

VehicleGame.prototype.startStop = function () {
	// Do nothing
};

VehicleGame.prototype.startBelow = function (t, silent) {
	t.add(this.runNumber(this.rnd.integerInRange(1, this.currentNumber - 1), true));
	if (!silent) {
		t.addSound(this.speech, this.crane, this.rnd.pick(['notFarEnough', 'howMuchMore']));
	}
	t.add(this.crane.moveHook(this.crane.pos.hookTravelPos));
};

VehicleGame.prototype.startAbove = function (t, silent) {
	t.add(this.runNumber(this.rnd.integerInRange(this.currentNumber + 1, this.amount), true));
	if (!silent) {
		t.addSound(this.speech, this.crane, this.rnd.pick(['goneTooFar', 'mustGoBack']));
	}
	t.add(this.crane.moveHook(this.crane.pos.hookTravelPos));
};

VehicleGame.prototype.startThink = function (t) {
	var addTo = this.rnd.integerInRange(1, this.amount);
	t.addCallback(function () {
		this.addToNumber = addTo;
		this.crane.thought.guess.number = this.addToNumber;
	}, null, null, this);
	t.addSound(this.speech, this.crane, 'thinkItIs');
	t.addLabel('number', '+=0.3');
	t.add(this.crane.think());
	t.addSound(this.speech, this.crane, 'number' + addTo, 'number');
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                    Number chosen and return functions                     */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
VehicleGame.prototype.runNumber = function (number, simulate) {
	var isFirstTry = this._currentTries > 0 ? false : true;
	var sum = number + this.addToNumber;
	var result = simulate ? sum - this.currentNumber : this.tryNumber(number, this.addToNumber);

	this.disable(true);

	var t = new TimelineMax();
	if (GLOBAL.debug) { t.skippable(); }

	if (!simulate) {
		if (number !== 0) {
			var moving = Math.abs(number);
			t.addSound(this.speech, this.crane, 'moveHook');
			if (this.method === GLOBAL.METHOD.additionSubtraction && isFirstTry) {
				// First guess in Add&Sub game mode, add the numbers before moving the hook
				// instead of just calling direction and distance as with the add or sub game modes.
				t.addSound(this.speech, this.crane, 'number' + this.addToNumber);
				t.addSound(this.speech, this.crane, number > 0 ? 'plus' : 'minus');
				t.addSound(this.speech, this.crane, 'number' + Math.abs(number));
				t.addSound(this.speech, this.crane, 'step');
			}
			else if (this.isRelative) {
				t.addSound(this.speech, this.crane, 'number' + moving);
				t.addSound(this.speech, this.crane, 'step');
				t.addSound(this.speech, this.crane, number > 0 ? 'forward' : 'backward');
			} else {
				t.addSound(this.speech, this.crane, 'to');
				t.addSound(this.speech, this.crane, 'order' + moving);
				t.addSound(this.speech, this.crane, 'marking');
			}
			t.addCallback(function () {}, '+=0.5'); // Pause until next sound.
		}
	}

	t.add(this.moveTrolleyToMarker(sum, false));

	// Correct :)
	if (!result) {
		t.add(this.placeCargo(sum - 1));
		t.addCallback(function () {
			this.hideButtons();
			this.markerAnimation.pause(0);
			this.agent.setHappy();
		}, null, null, this);

		t.add(this.crane.moveTrolley(this.pos.trailer.pos.x - this.pos.crane.drop.x));
		this.atValue = 0;

	// Incorrect :(
	} else {
		// Start to lower the hook a little before returning it.
		var cargoBoxHeight = this.amount < 9 ? this.pos.cargo.height : this.pos.cargo.height * 0.66;
		var distance = this.trailerLoad[sum - 1] < 3 ? cargoBoxHeight : (cargoBoxHeight / 3);
		t.add(this.crane.moveHook(this.crane.pos.hookTravelPos + distance));

		t.addCallback(this.agent.setSad, null, null, this.agent);
		this.doReturnFunction(t, sum, result, simulate);
	}

	t.addCallback(this.agent.setNeutral, null, null, this.agent);
	t.addCallback(this.updateRelative, null, null, this);
	return t;
};

VehicleGame.prototype.moveTrolleyToMarker = function (target, noNumberCallout) {
	var t = new TimelineMax();

	if (this.crane.trolleyPos < 450 - this.crane.y) {
		t.addLabel('hookUp');
		t.add(this.crane.moveHook(450 - this.crane.y), 'hookUp');
	}

	if (noNumberCallout) {
		// Move the trolley and its cargo.
		t.addLabel('moveTrolley');
		t.add(this.crane.moveTrolley(this.markers[target - 1].x - this.pos.crane.drop.x), 'moveTrolley');

		// this.atValue = target;
	} else {
		var dir = target < this.atValue ? -1 : 1;
		var i = this.atValue;
		while (i !== target) {
			// Next position to visit.
			i += dir;

			// Move the trolley and its cargo and call out the number.
			t.addLabel('moveTrolley' + i);
			t.add(this.crane.moveTrolley(this.markers[i - 1].x - this.pos.crane.drop.x), 'moveTrolley' + i);
			t.addSound(this.speech, this.crane, 'number' + i, 'moveTrolley' + i + '+=0.4');
		}
	}

	t.addCallback(function () {}, '+=0.5'); // Pause until next sound.

	return t;
};

VehicleGame.prototype.placeCargo = function (pos) {
	var t = new TimelineMax();

	// Lower the hook and cargo to drop it off.
	t.addLabel('lowerHook');
	var cargoPosY = this.pos.trailer.pos.y - this.trailer.height - ((this.trailerLoad[pos] % 3) * this.crane.cargo.height);
	t.add(this.crane.moveHook(cargoPosY - this.crane.adjustedCargonetHeight), 'lowerHook+=0.5');

	// Release the cargo by hiding the cargo net and the moving cargo box.
	t.addCallback(function () { this.crane.cargonet.visible = false; }, 'lowerHook+=1.7', null, this);
	t.addCallback(function () { this.crane.cargo.visible = false; }, 'lowerHook+=1.7', null, this);

	// Create a new cargo box at the location and make it visible.
	var cargo = this.createNewCargo(this.markers[pos].x, cargoPosY);
	t.addCallback(function () { cargo.visible = true; }, 'lowerHook+=1.7', null, this);

	// Return the hook to travel height.
	t.add(this.crane.moveHook(this.crane.pos.hookTravelPos), 'lowerHook+=2');

	// Register that the position holds a new cargo box.
	this.trailerLoad[pos] += 1;

	return t;
};

VehicleGame.prototype.returnToStart = function (t) {
	var moveTrolley = new TimelineMax();
	t.addSound(this.speech, this.crane, 'notRight');

	t.add(this.crane.moveHook(this.crane.pos.hookTravelPos));
	moveTrolley.addLabel('moveTrolley');
	moveTrolley.add(this.crane.moveTrolley(this.pos.trailer.pos.x - this.pos.crane.drop.x), 'moveTrolley');
	t.add(moveTrolley);
};

VehicleGame.prototype.returnNone = function (t, number, notUsed, silent) {
	this.atValue = number;
	if (!silent) {
		t.addSound(this.speech, this.crane, 'notRight');
	}
	t.add(this.crane.moveHook(this.crane.pos.hookTravelPos));
};

VehicleGame.prototype.returnToPreviousIfHigher = function (t, number, diff, silent) {
	if (diff > 0) {
		t.addSound(this.speech, this.crane, 'tooFar');
		t.addSound(this.speech, this.crane, 'wasBefore');
		t.add(this.crane.moveHook(this.crane.pos.hookTravelPos));
		t.add(this.moveTrolleyToMarker(this.atValue, true));
	} else {
		this.returnNone(t, number, diff, silent);
	}
};

VehicleGame.prototype.returnToPreviousIfLower = function (t, number, diff, silent) {
	if (diff < 0) {
		t.addSound(this.speech, this.crane, 'tooNear');
		t.addSound(this.speech, this.crane, 'wasBefore');
		t.add(this.crane.moveHook(this.crane.pos.hookTravelPos));
		t.add(this.moveTrolleyToMarker(this.atValue, true));
	} else {
		this.returnNone(t, number, diff, silent);
	}
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                 Overshadowing Subgame mode functions                      */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
VehicleGame.prototype.modeIntro = function () {
	var t = new TimelineMax().skippable();
	t.add(this.tractor.lookAtCrane());
	t.add(this.crane.lookAtTractor());
	t.addSound(this.speech, this.tractor, 'helloHerman');
	t.addSound(this.speech, this.crane, 'helloHedvig');
	t.addSound(this.speech, this.tractor, 'canYouHelpMe');
	t.addSound(this.speech, this.crane, 'sure');
	t.add(this.crane.lookAtUser());
	t.add(this.tractor.lookAtUser());
	t.addCallback(this.nextRound, null, null, this);
};

VehicleGame.prototype.modePlayerDo = function (intro, tries) {
	if (tries > 0) {
		this.showNumbers();
	} else { // if intro or first try
		var t = new TimelineMax();
		if (intro) {
			t.skippable();

			if (this.instructions) {
				t.add(this.newCargo(true));
				t.addCallback(this.updateButtons, null, null, this);
				t.add(this.doInstructions());
			} else {
				t.add(this.newCargo());
			}
		} else {
			t.add(this.tractor.lookAtCrane());
			t.add(this.crane.lookAtTractor());
			t.addSound(this.speech, this.tractor, this.rnd.pick(['more1', 'more2', 'more3']));
			t.addSound(this.speech, this.crane, this.rnd.pick(['yes1', 'yes2', 'yes3', 'yes4']));
			t.add(this.crane.lookAtUser());
			t.add(this.tractor.lookAtUser());
			t.add(this.newCargo());
		}
		t.addCallback(this.showNumbers, null, null, this);
	}
};

VehicleGame.prototype.modePlayerShow = function (intro, tries) {
	if (tries > 0) {
		this.showNumbers();
	} else { // if intro or first try
		var t = new TimelineMax();
		if (intro) {
			t.skippable();
			t.add(this.agent.moveTo.start());
			t.addLabel('agentIntro', '+=0.5');
			t.add(this.agent.wave(3, 1), 'agentIntro');
			t.addSound(this.agent.speech, this.agent, 'vehicleIntro1', 'agentIntro');
			t.add(this.tractor.lookAtAgent(), 'agentIntro');
			t.add(this.crane.lookAtTractor(), 'agentIntro');
			t.addSound(this.speech, this.tractor, 'agentHelp', '+=0.2');
			t.addSound(this.speech, this.crane, 'gettingHelp', '+=0.2');
			t.addSound(this.agent.speech, this.agent, 'vehicleIntro2', '+=0.2');
			t.addSound(this.speech, this.crane, 'youHelpLater', '+=0.2');
			t.add(this.crane.lookAtUser());
			t.add(this.tractor.lookAtUser());
		}
		t.add(this.newCargo());
		t.addCallback(this.showNumbers, null, null, this);
	}
};

VehicleGame.prototype.modeAgentTry = function (intro, tries) {
	var t = new TimelineMax();
	if (tries > 0) {
		t.addSound(this.agent.speech, this.agent, 'tryAgain');
	} else { // if intro or first try
		if (intro) {
			t.skippable();
			t.add(this.agent.moveTo.start()); // Agent should be here already.
			t.addSound(this.agent.speech, this.agent, 'myTurn' + this.rnd.integerInRange(1, 2));
		}
		t.add(this.newCargo());
	}

	t.add(this.agentGuess(), '+=0.3');
	if (intro && this.instructionsAgent) {
		t.add(this.instructionYesNo(), '+=0.5');
	}
	t.addCallback(this.showYesnos, null, null, this);
};

VehicleGame.prototype.modeOutro = function () {
	this.agent.thought.visible = false;

	var t = new TimelineMax().skippable();
	t.addLabel('water1', '+=1.0');
	t.addLabel('water2', '+=2.5');
	t.addLabel('water3', '+=4');
	t.addSound(this.speech, this.tractor, 'thatsAll', 0);
	t.addCallback(this.agent.setHappy, 'water1', null, this.agent);
	t.add(this.agent.fistPump(), 'water1');

	t.add(this.addWater(this.tractor.x + 50, this.tractor.y - 45), 'water1');
	t.add(this.addWater(this.crane.x + 184, this.crane.y - 270), 'water2');
	t.add(this.addWater(this.agent.x, this.agent.y + 70), 'water3');

	t.addCallback(this.nextRound, null, null, this);
};
