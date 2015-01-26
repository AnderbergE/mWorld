var Character = require('./Character.js');
var GLOBAL = require('../global.js');
var LANG = require('../language.js');
var EventSystem = require('../pubsub.js');
var utils = require('../utils.js');
var WaterCan = require('../objects/WaterCan.js');

module.exports = Agent;

Agent.prototype = Object.create(Character.prototype);
Agent.prototype.constructor = Agent;

/*
 * The super class for agent objects.
 * (See Panda for sub classing template)
 *
 * In a subclass, set up the following:
 * <SubAgent>.prototype.id = string, for reference in LANG files.
 * <SubAgent>.prototype.agentName = string, name of the agent.
 * this.coords
 *
 * The subagent's sprite atlas and audio should be loaded in the boot state.
 * The sprite atlas should be named the same as the id of the subagent.
 * It should at least have the following: arm, leg, body, eye,
 *                                        mouth0 (neutral), mouth1 (open), mouth2 (happy), mouth3 (sad)
 *
 * @param {Object} game - A reference to the Phaser game.
 * @return {Object} Itself
 */
function Agent (game) {
	Character.call(this, game); // Parent constructor.

	this.coords = this.coords || {};
	this.coords.anim = {
		arm: {
			origin: -0.8,
			wave: { from: -0.1, to: 0.2, durUp: 0.3, dur: 0.2 },
			pump: { angle: 0.5, move: 50, durUp: 0.5, dur: 0.25 },
			water: { angle: 0, back: -2, canAngle: -0.5, durBack: 0.2, durUp: 0.5, durCan: 0.5 }
		}
	};

	this.leftArm = this.game.add.group(this);
	this.leftArm.x = this.coords.arm.left.x;
	this.leftArm.y = this.coords.arm.left.y;
	this.leftArm.rotation = this.coords.anim.arm.origin;
	this.leftArm.create(0, 0, this.id, 'arm').anchor.set(1, 0.5);

	this.rightArm = this.game.add.group(this);
	this.rightArm.x = this.coords.arm.right.x;
	this.rightArm.y = this.coords.arm.right.y;
	this.rightArm.rotation = -this.coords.anim.arm.origin;
	var rightarm = this.rightArm.create(0, 0, this.id, 'arm');
	rightarm.anchor.set(1, 0.5);
	rightarm.scale.x = -1;

	this.leftLeg = this.game.add.group(this);
	this.leftLeg.x = this.coords.leg.left.x;
	this.leftLeg.y = this.coords.leg.left.y;
	this.leftLeg.create(0, 0, this.id, 'leg').anchor.set(0.5, 0);

	this.rightLeg = this.game.add.group(this);
	this.rightLeg.x = this.coords.leg.right.x;
	this.rightLeg.y = this.coords.leg.right.y;
	var rightleg = this.rightLeg.create(0, 0, this.id, 'leg');
	rightleg.anchor.set(0.5, 0);
	rightleg.scale.x = -1;

	this.body = this.create(0, 0, this.id, 'body');
	this.body.anchor.set(0.5);

	this.leftEye = this.create(this.coords.eye.left.x, this.coords.eye.left.y, this.id, 'eye');
	this.leftEye.anchor.set(0.5);

	this.rightEye = this.create(this.coords.eye.right.x, this.coords.eye.right.y, this.id, 'eye');
	this.rightEye.anchor.set(0.5);

	this.mouth = this.create(this.coords.mouth.x, this.coords.mouth.y, this.id, 'mouth0');
	this.mouth.anchor.set(0.5, 0);


	/* Character animations */
	var mouthNeutral = this.mouth.frame;
	this.talk = TweenMax.fromTo(this.mouth, 0.2, { frame: mouthNeutral }, {
		frame: mouthNeutral + 1, roundProps: 'frame', ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: true
	});
	this.walk = new TimelineMax({ repeat: -1, paused: true })
		.to(this.leftLeg, 0.12, { y: '-=50' , ease: Power1.easeInOut, yoyo: true, repeat: 1 }, 0)
		.to(this.rightLeg, 0.12, { y: '-=50' , ease: Power1.easeInOut, yoyo: true, repeat: 1 }, 0.24);

	/* Create the speech audio sheet. */
	this.speech = utils.createAudioSheet(this.id + 'Speech', LANG.SPEECH[this.id].markers);

	/* Save the progress of the player for AI purposes */
	var _this = this;
	var currentMode = null;
	this.playerCorrect = 0;
	this.playerWrong = 0;
	this.playerGuesses = [];
	this.lastGuess = null;

	EventSystem.subscribe(GLOBAL.EVENT.subgameStarted, function () {
		_this.playerCorrect = 0;
		_this.playerWrong = 0;
		_this.playerGuesses = [];
	});

	EventSystem.subscribe(GLOBAL.EVENT.modeChange, function (mode) {
		currentMode = mode;
	});

	EventSystem.subscribe(GLOBAL.EVENT.tryNumber, function (guess, correct) {
		if (currentMode === GLOBAL.MODE.playerDo ||
			currentMode === GLOBAL.MODE.playerShow) {
			_this.playerGuesses.push([guess, correct]);
			if (guess === correct) {
				_this.playerCorrect++;
			} else {
				_this.playerWrong++;
			}
		}
	});

	return this;
}

/**
 * @property {number} tint - The tint of the agent.
 */
Object.defineProperty(Agent.prototype, 'tint', {
	get: function() {
		return this.body.tint;
	},
	set: function(value) {
		this.body.tint = value;
		this.leftArm.children[0].tint = value;
		this.rightArm.children[0].tint = value;
		this.leftLeg.children[0].tint = value;
		this.rightLeg.children[0].tint = value;
	}
});

/**
 * @property {number} percentWrong - The minimum chance of an agent picking wrong number.
 */
Agent.prototype.percentWrong = 0.3;

/**
 * Have the agent guess a number.
 * NOTE: This can be overwritten by other AI.
 * Variables that are available:
 *     this.playerGuesses [[guess, correct], ...].
 *     this.playerCorrect Number of correct guesses by the player.
 *     this.playerWrong   Number of incorrect guesses by the player.
 * @param {number} correct - The correct number.
 * @param {number} min - Minimum value to guess.
 * @param {number} max - Maximum value to guess.
 * @returns {number} The agent's guess.
 */
Agent.prototype.guessing = function (correct, min, max) {
	var perc = 1;
	if (this.playerWrong > 0) {
		perc = Math.random();
	}

	// Guessing correct is relative to how many wrongs you have made.
	// There is also always a small chance for the agent to be wrong.
	var guess;
	if (perc >= (this.playerWrong / this.playerGuesses.length) && Math.random() > this.percentWrong) {
		guess = correct;
	} else {
		do {
			guess = this.game.rnd.integerInRange(min, max);
		} while (guess === correct && (min < correct || correct < max));
	}

	return guess;
};

/**
 * Have the agent guess a number
 * Publishes agentGuess event.
 * @param {number} correct - The correct number.
 * @param {number} min - Minimum value to guess.
 * @param {number} max - Maximum value to guess.
 * @returns {number} The agent's guess (also available in this.lastGuess).
 */
Agent.prototype.guessNumber = function (correct, min, max) {
	this.lastGuess = this.guessing(correct, min, max);
	EventSystem.publish(GLOBAL.EVENT.agentGuess, [this.lastGuess, correct]);
	return this.lastGuess;
};


/**
 * Set the agent to neutral state.
 */
Agent.prototype.setNeutral = function () {
	this.mouth.frameName = 'mouth0';
};

/**
 * Set the agent to happy state.
 */
Agent.prototype.setHappy = function () {
	this.mouth.frameName = 'mouth2';
};

/**
 * Set the agent to sad state.
 */
Agent.prototype.setSad = function () {
	this.mouth.frameName = 'mouth3';
};

/**
 * Add a thought bubble to the agent. Must be called to use the "think" function.
 * @param {number} representation - The representation of the guess.
 * @param {boolean} right - If the thought bubble should be to the right instead of left (default false).
 */
Agent.prototype.addThought = function (representation, right) {
	Character.prototype.addThought.call(this, right ? 550 : -550, -475, representation, right);
	this.thought.toScale = 2;
};

/**
 * Animation: Think about the guessed number!
 * NOTE: The addThought must have been called before this function.
 * @param {boolean} sielnt - If the agent should be silent while thinking (optional).
 * @returns {Object} The animation timeline.
 */
Agent.prototype.think = function (silent) {
	if (typeof this.thought === 'undefined' || this.thought === null) {
		return;
	}

	var t = Character.prototype.think.call(this);
	t.addCallback(function () { this.thought.guess.number = this.lastGuess; }, 0, null, this);
	if (!silent) {
		t.addSound(this.speech, this, 'hmm', 0);

		// TODO: Sound should be based on confidence
		t.addSound(this.speech, this, this.game.rnd.pick(['isThisRight', 'itItThisOne', 'hasToBeThis']));
	}
	return t;
};

/**
 * Animation: Pump it up yeah!
 * @param {number} duration - Duration in seconds (default 3).
 * @param {number} arm - -1 = left arm, 0 = both, 1 = right arm (default 0).
 * @returns {Object} The animation timeline.
 */
Agent.prototype.fistPump = function (duration, arm) {
	duration = duration || 3;
	arm = arm || 0;

	var origin = this.coords.anim.arm.origin;
	var pump = this.coords.anim.arm.pump;
	var upDown = duration / 4;
	if (upDown > pump.durUp) { upDown = pump.durUp; }
	var times = TweenMax.prototype.calcYoyo(duration - upDown * 2, pump.dur);

	var t = new TimelineMax();
	if (arm <= 0) {
		t.add(new TweenMax(this.leftArm, upDown, { rotation: pump.angle, ease: Power1.easeIn }), 0);
		t.add(new TweenMax(this.leftArm, pump.dur, { x: '+=' + pump.move, y: '+=' + pump.move, ease: Power1.easeIn, repeat: times, yoyo: true }), 0);
		t.add(new TweenMax(this.leftArm, upDown, { rotation: origin, ease: Power1.easeOut }), pump.dur * times);
	}
	if (arm >= 0) {
		t.add(new TweenMax(this.rightArm, upDown, { rotation: -pump.angle, ease: Power1.easeIn }), 0);
		t.add(new TweenMax(this.rightArm, pump.dur, { x: '-=' + pump.move, y: '+=' + pump.move, ease: Power1.easeIn, repeat: times, yoyo: true }), 0);
		t.add(new TweenMax(this.rightArm, upDown, { rotation: -origin, ease: Power1.easeOut }), pump.dur * times);
	}
	return t;
};

/**
 * Animation: Put you hand up in the air and wave it around like you care.
 * @param {number} duration - Duration in seconds (default 3).
 * @param {number} arm - -1 = left arm, 0 = both, 1 = right arm (default 0).
 * @returns {Object} The animation timeline.
 */
Agent.prototype.wave = function (duration, arm) {
	duration = duration || 3;
	arm = arm || 0;

	var origin = this.coords.anim.arm.origin;
	var wave = this.coords.anim.arm.wave;
	var upDown = duration / 4;
	if (upDown > wave.durUp) { upDown = wave.durUp; }
	var times = parseInt((duration - upDown * 2) / wave.dur);
	times += (times % 2 === 0) ? 1 : 0; // Even numbers do not loop back to origin.

	var t = new TimelineMax();
	if (arm <= 0) {
		t.add(new TweenMax(this.leftArm, upDown, { rotation: wave.from, ease: Power1.easeIn }), 0);
		t.add(new TweenMax(this.leftArm, wave.dur, { rotation: wave.to, ease: Power0.easeOut, repeat: times, yoyo: true }), upDown);
		t.add(new TweenMax(this.leftArm, upDown, { rotation: origin, ease: Power1.easeOut }), wave.dur * times + upDown);
	}
	if (arm >= 0) {
		t.add(new TweenMax(this.rightArm, upDown, { rotation: -wave.from, ease: Power1.easeIn }), 0);
		t.add(new TweenMax(this.rightArm, wave.dur, { rotation: -wave.to, ease: Power0.easeOut, repeat: times, yoyo: true }), upDown);
		t.add(new TweenMax(this.rightArm, upDown, { rotation: -origin, ease: Power1.easeOut }), wave.dur * times + upDown);
	}
	return t;
};

/**
 * Animation: Water with a water can.
 * @param {number} duration - Duration in seconds (default 3).
 * @param {number} arm - 1 < left arm, otherwise right arm (default 0).
 * @returns {Object} The animation timeline.
 */
Agent.prototype.water = function (duration, arm) {
	duration = duration || 3;
	arm = arm || 0;
	var obj, dir;
	if (arm < 1) {
		obj = this.leftArm;
		dir = 1;
	} else {
		obj = this.rightArm;
		dir = -1;
	}

	var w  = new WaterCan(this.game, -obj.children[0].width + dir * 60, -100);
	w.scale.set(-dir * 3, 3);
	w.rotation = 0;
	w.visible = false;
	obj.add(w);

	var t = new TimelineMax();
	var water = this.coords.anim.arm.water;
	t.add(new TweenMax(obj, water.durBack, { rotation: dir * water.back, ease: Power1.easeIn }));
	t.addCallback(function () { w.visible = true; });
	t.add(new TweenMax(obj, water.durUp, { rotation: dir * water.angle, ease: Power1.easeOut }));
	t.add(new TweenMax(w, water.durCan, { rotation: dir * water.canAngle }));
	t.addCallback(this.eyesFollowObject, null, [w.can], this);
	t.addLabel('watering');
	t.add(w.pour(duration));
	t.addCallback(this.eyesStopFollow, null, null, this);
	t.add(new TweenMax(obj, water.durUp, { rotation: dir * water.back, ease: Power1.easeIn }));
	t.addCallback(function () { w.destroy(); });
	t.add(new TweenMax(obj, water.durBack, { rotation: dir * this.coords.anim.arm.origin, ease: Power1.easeOut }));
	return t;
};

/**
 * Have an eye follow a target.
 * @param {Object} eye - The eye to follow with.
 * @param {Object} targ - The target to follow.
 * @private
 */
Agent.prototype._eyeFollow = function (eye, targ) {
	var origin = { x: eye.x, y: eye.y };
	var depth = this.coords.eye.depth;
	var maxMove = this.coords.eye.maxMove;
	var agent = this;

	/* Update functions trigger on every game loop */
	eye.update = function () {
		if (!agent.visible) { return; }

		var o = this.world;
		var a = this.game.physics.arcade.angleBetween(o, targ.world ? targ.world : targ);
		var d = this.game.physics.arcade.distanceBetween(o, targ.world ? targ.world : targ) / depth;
		if (d > maxMove) { d = maxMove; }
		this.x = Math.cos(a) * d + origin.x;
		this.y = Math.sin(a) * d + origin.y;
	};
};

/**
 * Make the agent's eyes follow an object.
 * @param {Object} targ - The target to follow
 */
Agent.prototype.eyesFollowObject = function (targ) {
	this.eyesStopFollow();

	this._eyeFollow(this.leftEye, targ);
	this._eyeFollow(this.rightEye, targ);
};

/**
 * Make the agent's eyes follow the input pointer.
 */
Agent.prototype.eyesFollowPointer = function () {
	this.eyesFollowObject(this.game.input.activePointer);
};

/**
 * Stop the eyes following pointer or object.
 */
Agent.prototype.eyesStopFollow = function () {
	this.leftEye.x = this.coords.eye.left.x;
	this.leftEye.y = this.coords.eye.left.y;
	this.rightEye.x = this.coords.eye.right.x;
	this.rightEye.y = this.coords.eye.right.y;

	this.leftEye.update = function () {};
	this.rightEye.update = function () {};
};