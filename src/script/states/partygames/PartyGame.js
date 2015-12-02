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
	this.bannerName2 = this.add.text(570, 125, this.birthday.name + '!', { font: '25pt ' + GLOBAL.FONT });
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
	var guests = [Bee, Lizard, WoodLouse, Bird, Bird];
	var scales = [0.5, 0.4, 0.7, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2];
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
