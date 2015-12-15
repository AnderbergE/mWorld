var Subgame = require('../Subgame.js');
var backend = require('../../backend.js');
var GLOBAL = require('../../global.js');
var LANG = require('../../language.js');
var util = require('../../utils.js');
var Bee = require('../../characters/Bee.js');
var Bird = require('../../characters/Bird.js');
var Lizard = require('../../characters/Lizard.js');
var WoodLouse = require('../../characters/WoodLouse.js');
var Hedgehog = require('../../characters/agents/Hedgehog.js');
var Mouse = require('../../characters/agents/Mouse.js');
var Panda = require('../../characters/agents/Panda.js');
var Troll = require('../../characters/Troll.js');

module.exports = PartyGame;

/**
 * Superclass for party games.
 * NOTE: This inherits subgame, see that class for more info.
 * NOTE: Avoid creating new agents, use the birthday agent and helpers.
 *
 * SETUP THESE IN THE SUBCLASS:
 * guestScales: If you set this before calling PartyGame's create function, guests will be created in the corresponding scales (see createGuests).
 * hasBirthday: If you set this before calling PartyGame's create function, the birthday agent created (see createAgents).
 *
 * VARIABLES THE SUBCLASS CAN USE:
 * difficulty: The difficulty supplied to the game.
 * birthdayType: The class of the birthday agent.
 * helper1Type: The class of the first helper.
 * helper2Type: The class of the second helper.
 * birthday: The birthday agent object (see hasBirthday above).
 * helper1: The first helper object.
 * helper2: The second helper object.
 * troll: The troll (will be in troll state at start).
 * gladeIntro: The group that has the introductory glade, begin you game with this one.
 * guests: All the guests (see guestScales above).
 * sfx: Audio sheet with some sound effects.
 *
 * FUNCTIONS THE SUBCLASS CAN USE:
 * switchAgents: Use this to switch helpers. Call this before PartyGame.create!
 * afterGarlands: Add garlands to glade.
 * afterBalloons: Add balloons to glade.
 * afterGifts: Add gifts to glade.
 */
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

	// What agents to use. The agents are set up like this (do not change them):
	// Panda:       Mouse, Hedgehog.
	// Hedgehog:    Panda,    Mouse.
	// Mouse:    Hedgehog,    Panda.
	this.birthdayType = options.birthday !== undefined ? GLOBAL.AGENT[options.birthday] : this.game.player.agent;
	if (this.birthdayType === Panda) {
		this.helper1Type = Mouse;
		this.helper2Type = Hedgehog;
	} else if (this.birthdayType === Hedgehog) {
		this.helper1Type = Panda;
		this.helper2Type = Mouse;
	} else { // Mouse
		this.helper1Type = Hedgehog;
		this.helper2Type = Panda;
	}
};

PartyGame.prototype.switchAgents = function () {
	var temp = this.helper1Type;
	this.helper1Type = this.helper2Type;
	this.helper2Type = temp;
};

PartyGame.prototype.preload = function () {
	Hedgehog.load.call(this, true);
	Panda.load.call(this, true);
	Mouse.load.call(this, true);

	this.load.audio('party' + Panda.prototype.id, LANG.SPEECH.party.panda.speech);
	this.load.audio('party' + Hedgehog.prototype.id, LANG.SPEECH.party.hedgehog.speech);
	this.load.audio('party' + Mouse.prototype.id, LANG.SPEECH.party.mouse.speech);

	Troll.load.call(this);

	if (this.guestScales) {
		Bee.load.call(this);
		Bird.load.call(this);
		Lizard.load.call(this);
		WoodLouse.load.call(this);
	}

	this.load.atlasJSONHash('glade', 'img/partygames/glade/atlas.png', 'img/partygames/glade/atlas.json');
	this.load.audio('balloonSfx', ['audio/subgames/balloongame/sfx.m4a', 'audio/subgames/balloongame/sfx.ogg', 'audio/subgames/balloongame/sfx.mp3']);
};

PartyGame.prototype.create = function () {
	this.sfx = util.createAudioSheet('balloonSfx', {
		chestUnlock: [1.9,   1.0],
		pop:         [3.1,   0.3]
	});

	this.gladeIntro = this.add.group(this.gameGroup);

	// Create general background.
	this.gladeIntro.create(0, 0, 'glade', 'background');
	this.gladeIntro.create(680, 520, 'glade', 'treestump');
	this.gladeIntro.create(0, 0, 'glade', 'trees');

	if (this.guestScales) {
		this.createGuests();
	}

	this.createAgents();

	// Create banner for the birthday agent.
	// This might seem a bit complex, it is to adapt for different languages.
	var banner = this.gladeIntro.create(580, 130, 'glade', 'banner');
	banner.anchor.set(0.5);
	var bannerText = this.add.text(banner.x - 10, banner.y + 15, LANG.TEXT.congratulations, { font: '25pt ' + GLOBAL.FONT });
	bannerText.angle = 3;
	bannerText.anchor.set(1, 0.5);
	this.gladeIntro.add(bannerText);
	bannerText = this.add.text(banner.x + 10, banner.y + 15, LANG.TEXT[this.birthdayType.prototype.id + 'Name'] + '!', { font: '25pt ' + GLOBAL.FONT });
	bannerText.angle = -3;
	bannerText.anchor.set(0, 0.5);
	this.gladeIntro.add(bannerText);
	this.gladeIntro.create(banner.x, banner.y, 'glade', 'branches').anchor.set(0.5);
};

PartyGame.prototype.createAgents = function () {
	this.helper1 = new (this.helper1Type)(this.game);
	this.helper1.x = this.pos.helper1 ? this.pos.helper1.x : 0;
	this.helper1.y = this.pos.helper1 ? this.pos.helper1.y : 0;
	this.helper1.scale.set(0.15);
	this.helper1.speech = util.createAudioSheet('party' + this.helper1.id, LANG.SPEECH.party[this.helper1.id].markers);
	this.gladeIntro.add(this.helper1);

	this.helper2 = new (this.helper2Type)(this.game);
	this.helper2.x = this.pos.helper2 ? this.pos.helper2.x : 0;
	this.helper2.y = this.pos.helper2 ? this.pos.helper2.y : 0;
	this.helper2.scale.set(0.15);
	this.helper2.speech = util.createAudioSheet('party' + this.helper2.id, LANG.SPEECH.party[this.helper2.id].markers);
	this.gladeIntro.add(this.helper2);

	if (this.hasBirthday) {
		// Use the current agent if that is who we are celebrating.
		if (this.agent instanceof this.birthdayType) {
			this.birthday = this.agent;
		} else {
			this.birthday = new (this.birthdayType)(this.game);
		}

		this.birthday.x = this.pos.birthday ? this.pos.birthday.x : 0;
		this.birthday.y = this.pos.birthday ? this.pos.birthday.y : 0;
		this.birthday.scale.set(0.17);
		this.gladeIntro.add(this.birthday);
		this.birthday.speech = util.createAudioSheet('party' + this.birthday.id, LANG.SPEECH.party[this.birthday.id].markers);
	}

	this.troll = new Troll (this.game);
	this.troll.x = this.pos.troll ? this.pos.troll.x : 0;
	this.troll.y = this.pos.troll ? this.pos.troll.y : 0;
	this.troll.scale.set(0.12);
	this.troll.visible = false;
	this.gladeIntro.add(this.troll);
};

PartyGame.prototype.createGuests = function () {
	var guests = [Bee, Lizard, WoodLouse, Bird, Bird];
	var scales = this.guestScales;
	var tints = [0xff8888, 0x77ee77, 0x8888ff, 0xfaced0, 0xfedcba, 0x11abba, 0xabcdef, 0x333333, 0xed88ba];
	this.rnd.shuffle(tints);

	this.guests = [];
	for (var i = 0; i < 5; i++) {
		var index = this.rnd.integerInRange(0, guests.length - 1);
		var guest = new (guests.splice(index, 1)[0])(this.game, 0, 0);
		guest.scale.set(scales.splice(index, 1)[0]);
		guest.visible = false;
		if (guest instanceof Bird) {
			guest.tint = tints.splice(0, 1)[0];
		}

		this.guests.push(guest);
		this.gladeIntro.add(guest);
	}
};

PartyGame.prototype.afterGarlands = function () {
	this.gladeIntro.create(430, 270, 'glade', 'garland');
};

PartyGame.prototype.afterBalloons = function () {
	this.gladeIntro.create(200, 249, 'glade', 'balloons');
};

PartyGame.prototype.afterGifts = function () {
	this.gladeIntro.create(160, 650, 'glade', 'gift1');
	this.gladeIntro.create(240, 650, 'glade', 'gift3');
	this.gladeIntro.create(200, 660, 'glade', 'gift2');
	this.gladeIntro.create(260, 670, 'glade', 'gift5');
	this.gladeIntro.create(220, 670, 'glade', 'gift4');

	for (var i = 0; i < this.guests.length; i++) {
		this.guests[i].setHappy();
	}
};

PartyGame.prototype.nextRound = function () {
	if (this.currentMode === GLOBAL.MODE.playerDo) {
		this._counter.value++;
	}
	Subgame.prototype.nextRound.call(this);
};

/** End the game. */
PartyGame.prototype.endGame = function () {
	backend.putParty({ done: true });
	// TODO: This should not be necessary with better logging.
	this.game.time.events.add(Phaser.Timer.SECOND * 1, Subgame.prototype.endGame, this);
};
