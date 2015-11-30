var Subgame = require('../Subgame.js');
var GLOBAL = require('../../global.js');
var LANG = require('../../language.js');
var util = require('../../utils.js');
var Hedgehog = require('../../agent/Hedgehog.js');
var Mouse = require('../../agent/Mouse.js');
var Panda = require('../../agent/Panda.js');
var Troll = require('../../agent/Troll.js');

module.exports = PartyGame;

PartyGame.prototype = Object.create(Subgame.prototype);
PartyGame.prototype.constructor = PartyGame;
function PartyGame () {
	Subgame.call(this); // Call parent constructor.
}

PartyGame.prototype.init = function(options) {
	options = options || {};
	options.mode = [
		GLOBAL.MODE.intro,
		GLOBAL.MODE.playerDo,
		GLOBAL.MODE.outro
	];
	options.roundsPerMode = options.roundsPerMode || 5;

	Subgame.prototype.init.call(this, options);

	this.difficulty = options.difficulty || 0;
	this.birthdayName = options.birthday;
};

PartyGame.prototype.preload = function () {
	this.load.atlasJSONHash(Troll.prototype.id, 'img/agent/troll/atlas.png', 'img/agent/troll/atlas.json');
	this.load.audio(Troll.prototype.id + 'Speech', LANG.SPEECH.troll.speech);
	this.load.atlasJSONHash(Panda.prototype.id, 'img/agent/panda/atlas.png', 'img/agent/panda/atlas.json');
	this.load.audio('party' + Panda.prototype.id, LANG.SPEECH.party.panda.speech);
	this.load.atlasJSONHash(Hedgehog.prototype.id, 'img/agent/hedgehog/atlas.png', 'img/agent/hedgehog/atlas.json');
	this.load.audio('party' + Hedgehog.prototype.id, LANG.SPEECH.party.hedgehog.speech);
	this.load.atlasJSONHash(Mouse.prototype.id, 'img/agent/mouse/atlas.png', 'img/agent/mouse/atlas.json');
	this.load.audio('party' + Mouse.prototype.id, LANG.SPEECH.party.mouse.speech);

	this.load.atlasJSONHash('balloon', 'img/subgames/balloon/atlas.png', 'img/subgames/balloon/atlas.json');
	this.load.atlasJSONHash('bee', 'img/subgames/beeflight/atlas.png', 'img/subgames/beeflight/atlas.json');
	this.load.atlasJSONHash('birdhero', 'img/subgames/birdhero/atlas.png', 'img/subgames/birdhero/atlas.json');
	this.load.atlasJSONHash('lizard', 'img/subgames/lizardjungle/atlas.png', 'img/subgames/lizardjungle/atlas.json');
	this.load.atlasJSONHash('glade', 'img/partygames/glade/atlas.png', 'img/partygames/glade/atlas.json');
	this.load.audio('balloonSfx', ['audio/subgames/balloongame/sfx.m4a', 'audio/subgames/balloongame/sfx.ogg', 'audio/subgames/balloongame/sfx.mp3']);
};

PartyGame.prototype.create = function () {
	this.sfx = util.createAudioSheet('balloonSfx', {
		sackJingle:  [0.0,   1.6],
		chestUnlock: [1.9,   1.0],
		pop:         [3.1,   0.3],
		catPurr:     [3.7,   2.8]
	});

	this.gladeIntro = this.add.group(this.gameGroup);

	// Create general background.
	this.gladeIntro.create(0, 0, 'glade', 'background');
	this.gladeIntro.create(680, 520, 'glade', 'treestump');
	this.gladeIntro.create(0, 0, 'glade', 'trees');

	this.mailbox = this.gladeIntro.create(800, 360, 'glade', 'mailbox');

	this.pgifts = this.add.group(this.gladeIntro);
	this.pgifts.visible = false;

	this.pgift1 = this.pgifts.create(160, 650, 'glade', 'gift1');
	this.pgift2 = this.pgifts.create(240, 650, 'glade', 'gift3');
	this.pgift3 = this.pgifts.create(200, 660, 'glade', 'gift2');
	this.pgift4 = this.pgifts.create(260, 670, 'glade', 'gift5');
	this.pgift5 = this.pgifts.create(220, 670, 'glade', 'gift4');

	this.bear = this.gladeIntro.create(800, 420, 'glade', 'decor5');
	this.bear.alpha = 0;
	this.bear.scale.set(1.5);

	this.createGuests();

	this.createAgents();

	// Create banner for the birthday agent.
	this.gladeIntro.create(346, 85, 'glade', 'banner');
	this.bannerName1 = this.add.text(450, 118, 'Grattis', { font: '25pt ' + GLOBAL.FONT });
	this.bannerName1.angle = 2;
	this.gladeIntro.add(this.bannerName1);
	this.bannerName2 = this.add.text(570, 125, this.birthday.agentName + '!', { font: '25pt ' + GLOBAL.FONT });
	this.bannerName2.angle = -6;
	this.gladeIntro.add(this.bannerName2);
	this.gladeIntro.create(320, 80, 'glade', 'branches');
};

PartyGame.prototype.createAgents = function () {
	var name = this.birthdayName;

	if (typeof name === 'number' && !(this.agent instanceof GLOBAL.AGENT[name])) {
		this.birthday = new GLOBAL.AGENT[name](this.game);
	} else {
		this.birthday = this.agent;
	}

	// Create agents. The agents are set up like this (do not change this):
	// Panda:       Mouse, Hedgehog.
	// Hedgehog:    Panda,    Mouse.
	// Mouse:    Hedgehog,    Panda.
	if (this.birthday instanceof Panda) {
		this.helper1 = new Mouse (this.game);
		this.helper2 = new Hedgehog (this.game);
	} else if (this.birthday instanceof Hedgehog) {
		this.helper1 = new Panda (this.game);
		this.helper2 = new Mouse (this.game);
	} else { // instanceof Mouse
		this.helper1 = new Hedgehog (this.game);
		this.helper2 = new Panda (this.game);
	}

	this.helper1.scale.set(0.15);
	this.helper1.x = 370;
	this.helper1.y = 540;
	this.helper1.speech = util.createAudioSheet('party' + this.helper1.id, LANG.SPEECH.party[this.helper1.id].markers);
	this.gladeIntro.add(this.helper1);

	this.helper2.scale.set(0.15);
	this.helper2.x = 580;
	this.helper2.y = 520;
	this.helper2.speech = util.createAudioSheet('party' + this.helper2.id, LANG.SPEECH.party[this.helper2.id].markers);
	this.gladeIntro.add(this.helper2);

	this.birthday.scale.set(0.17);
	this.birthday.visible = false;
	this.gladeIntro.add(this.birthday);
	this.birthday.speech = util.createAudioSheet('party' + this.birthday.id, LANG.SPEECH.party[this.birthday.id].markers);

	// Create troll.
	this.troll = new Troll (this.game);
	this.troll.x = 480;
	this.troll.y = 650;
	this.troll.scale.set(0.12);
	this.troll.visible = false;
	this.gladeIntro.add(this.troll);
};

PartyGame.prototype.changeAgents = function () {
	var temp = this.helper1;
	this.helper1 = this.helper2;
	this.helper2 = temp;
};

PartyGame.prototype.afterInvitations = function () {
	this.mailbox.destroy();
};

PartyGame.prototype.afterGarlands = function () {
	var t = new TimelineMax();
	t.addCallback(this.gladeIntro.create, null, [430, 270, 'glade', 'garland'], this.gladeIntro);
	return t;
};

PartyGame.prototype.afterBalloons = function () {
	var t = new TimelineMax();
	t.addCallback(this.gladeIntro.create, null, [200, 249, 'glade', 'balloons'], this.gladeIntro);
	return t;
};

PartyGame.prototype.createGuests = function () {
	var guests = ['bee', 'lizard', 'beetle', 'bird', 'bird', 'bird', 'bird', 'bird', 'bird', 'bird', 'bird', 'bird'];
	this.rnd.shuffle(guests);

	var tints = [0xff8888, 0x77ee77, 0x8888ff, 0xfaced0, 0xfedcba, 0x11abba, 0xabcdef, 0x333333, 0xed88ba];
	this.rnd.shuffle(tints);

	this.guests = [];
	for (var i = 0; i < 5; i++) {
		this.guests.push(new Guest(this.game, 0, 0, guests[i], tints[i]));
		this.guests[i].setMood('neutral');
		this.guests[i].visible = false;
		this.gladeIntro.add(this.guests[i]);

		if (guests[i] === 'bird') {
			tints.splice(0, 1);
		}
		guests.splice(0, 1);
	}
};

PartyGame.prototype.nextRound = function () {
	if (this.currentMode === GLOBAL.MODE.playerDo) {
		this._counter.value++;
	}
	Subgame.prototype.nextRound.call(this);
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                             Create guest object                           */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
Guest.prototype = Object.create(Phaser.Group.prototype);
Guest.prototype.constructor = Guest;
function Guest (game, x, y, guestName, tint, mood) {
	// TODO: Use the ones that exist.
	Phaser.Group.call(this, game, null); // Parent constructor.

	this.x = x;
	this.y = y;
	this.name = guestName;

	if (guestName === 'bee') {
		this.scale.set(0.2);
		this.body = this.create(0, 0, 'bee', 'body');
		this.body.anchor.set(0.5);
		this.mouthHappy = this.create(50, 35, 'bee', 'mouth_happy');
		this.mouthHappy.anchor.set(0.5);
		this.mouthHappy.visible = false;
		this.mouthSad = this.create(50, 35, 'bee', 'mouth_sad');
		this.mouthSad.anchor.set(0.5);
		this.mouthSad.visible = false;
		this.wings = this.create(-25, -43, 'bee', 'wings1');
		this.wings.anchor.set(0.5);
	} else if (guestName === 'bird') {
		this.scale.set(0.12);
		this.rightLeg = this.game.add.sprite(50, 160, 'birdhero', 'leg', this);
		this.body = this.game.add.sprite(0, 0, 'birdhero', 'body', this);
		this.body.anchor.set(0.5);
		this.leftLeg = this.game.add.sprite(0, 175, 'birdhero', 'leg', this);
		this.wing = this.game.add.sprite(75, -20, 'birdhero', 'wing', this);
		this.wing.anchor.set(1, 0);
		this.game.add.sprite(110, -160, 'birdhero', 'eyes', this);
		this.game.add.sprite(118, -145, 'birdhero', 'pupils', this);
		this.mouthHappy = this.game.add.sprite(190, -70, 'birdhero', 'beak1', this);
		this.mouthHappy.anchor.set(0.5);
		this.mouthHappy.visible = false;
		this.mouthSad = this.game.add.sprite(190, -70, 'birdhero', 'beak0', this);
		this.mouthSad.anchor.set(0.5);
		this.mouthSad.visible = false;
		this.body.tint = tint;
		this.wing.tint = tint;
	} else if (guestName === 'lizard') {
		this.scale.set(0.28);
		this.x = 360;
		this.body = game.add.sprite(0, 0, 'lizard', 'body', this);
		this.head = game.add.group(this);
		this.head.x = 60;
		this.head.y = 60;
		this.mouthNeutral = game.add.sprite(20, 23, 'lizard', 'jaw', this.head);
		this.mouthNeutral.anchor.set(1, 0.4);
		this.mouthNeutral.angle = -9;
		this.mouthNeutral.visible = false;
		this.mouthHappy = game.add.sprite(20, 23, 'lizard', 'jaw', this.head);
		this.mouthHappy.anchor.set(1, 0.4);
		this.mouthHappy.angle = -18;
		this.mouthHappy.visible = false;
		this.mouthSad = game.add.sprite(20, 23, 'lizard', 'jaw', this.head);
		this.mouthSad.anchor.set(1, 0.4);
		this.mouthSad.angle = -3;
		this.mouthSad.visible = false;
		this.forehead = game.add.sprite(125, 35, 'lizard', 'head', this.head);
		this.forehead.anchor.set(1, 1);
		this.mouthNeutral.tint = 0xaf9ee3;
		this.mouthHappy.tint = 0xaf9ee3;
		this.mouthSad.tint = 0xaf9ee3;
		this.forehead.tint = 0xaf9ee3;
		this.body.tint = 0xaf9ee3;
	} else if (guestName === 'beetle') {
		this.scale.set(0.31);
		this.beetle = this.create(0, 0, 'balloon', 'beetle');
		this.beetle.anchor.set(0.5);
	}

	this.setMood(mood);
}


Guest.prototype.setMood = function (mood) {
	this.mood = mood;

	if (this.mood === 'neutral') {
		if (this.mouthNeutral) {
			this.mouthNeutral.visible = true;
			this.mouthSad.visible = false;
			this.mouthHappy.visible = false;
		} else if (this.mouthSad && this.mouthHappy) {
			this.mouthSad.visible = false;
			this.mouthHappy.visible = true;
		}
	}

	else if (this.mood === 'happy') {
		if (this.mouthSad && this.mouthHappy) {
			this.mouthSad.visible = false;
			this.mouthHappy.visible = true;

			if (this.mouthNeutral) {
				this.mouthNeutral.visible = false;
			}
		}

		if (this.wings) {
			this.flap = TweenMax.to(this.wings, 0.1, { frame: this.wings.frame+1, roundProps: 'frame', ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: false });
		}

		if (this.beetle) {
			this.hop = TweenMax.to(this.beetle, 0.2, { y:'-=15', ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: false });
		}

		if (this.rightLeg && this.leftLeg) {
			this.jump = new TimelineMax();
			this.jump.addLabel('jump');
			this.jump.to(this, 0.3, { y:'-=15', ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: false }, 'jump');
			this.jump.to(this.rightLeg, 0.3, { angle: -40, ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: false }, 'jump');
			this.jump.to(this.leftLeg, 0.3, { angle: 40, ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: false }, 'jump');
		}

	} else if (this.mood === 'sad') {
		if (this.mouthSad && this.mouthHappy) {
			this.mouthHappy.visible = false;
			this.mouthSad.visible = true;
		}
	}
};
