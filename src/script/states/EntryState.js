var SuperState = require('./SuperState.js');
var GLOBAL = require('../global.js');
var LANG = require('../language.js');
var util = require('../utils.js');
var Cover = require('../objects/Cover.js');

module.exports = EntryState;

EntryState.prototype = Object.create(SuperState.prototype);
EntryState.prototype.constructor = EntryState;

/**
 * The first state of the game, where you start the game or do settings.
 */
function EntryState () {}

/* Phaser state function */
EntryState.prototype.preload = function () {
	this.load.audio('entryMusic', ['audio/music.m4a', 'audio/music.ogg', 'audio/music.mp3']);
};

/* Entry state assets are loaded in the boot section */

/* Phaser state function */
EntryState.prototype.create = function () {
	// Add music
	this.add.music('entryMusic', 0.7, true).play();

	// Add background
	this.add.image(0, 0, 'entryBg');

	// Add headlines
	var title = this.add.text(this.world.centerX, this.world.centerY/2, LANG.TEXT.title, {
		font: '50pt ' +  GLOBAL.FONT,
		fill: '#ffff00',
		stroke: '#000000',
		strokeThickness: 5
	});
	title.anchor.set(0.5);

	if (GLOBAL.demo) {
		// Make sure that the player understand that the demo is a bit different.
		var demoBg = new Cover(this.game, '#ffffff', 0.8);
		demoBg.height = 180;
		this.world.add(demoBg);

		this.add.text(this.world.centerX, 25, LANG.TEXT.demoEntry, {
			font: '15pt ' +  GLOBAL.FONT,
			align: 'center',
			wordWrap: true,
			wordWrapWidth: this.game.world.width - 20
		}).anchor.set(0.5, 0);

		title.y += 50;
		var demoTitle = this.add.text(this.world.centerX, this.world.centerY/2 + 75, LANG.TEXT.demo, {
			font: '50pt ' +  GLOBAL.FONT,
			fill: '#ff0000',
			stroke: '#000000',
			strokeThickness: 5
		});
		demoTitle.anchor.set(0.5);
		demoTitle.angle = -20;
	}

	var start = this.add.text(this.world.centerX, this.world.centerY, LANG.TEXT.continuePlaying, {
		font: '50pt ' +  GLOBAL.FONT,
		fill: '#dd00dd'
	});
	start.anchor.set(0.5);
	start.inputEnabled = true;

	var changeAgent = this.add.text(this.world.centerX, this.world.centerY*1.4, '', {
		font: '35pt ' +  GLOBAL.FONT,
		fill: '#000000'
	});
	changeAgent.anchor.set(0.5);
	changeAgent.inputEnabled = true;

	if (this.game.player.agent) {
		// Player has played before, we go to garden directly and show the agent change option.
		start.events.onInputDown.add(function () { this.state.start(GLOBAL.STATE.garden); }, this);

		changeAgent.text = LANG.TEXT.changeAgent;
		changeAgent.events.onInputDown.add(function () { this.state.start(GLOBAL.STATE.agentSetup); }, this);

	} else {
		// Player has not played before, go to setup.
		start.text = LANG.TEXT.start;
		start.events.onInputDown.add(function () { this.state.start(GLOBAL.STATE.agentSetup); }, this);
	}


	/* Log out player. */
	var log = this.add.text(20, this.world.height, LANG.TEXT.logOut + '\n' + this.game.player.name, {
		font: '25pt ' +  GLOBAL.FONT,
		fill: '#000000'
	});
	log.anchor.set(0, 1);
	log.inputEnabled = true;
	log.events.onInputDown.add(function () { window.location = window.location.origin; });


	/* Credits related objects: */
	var credits = this.add.text(this.world.width - 20, this.world.height, LANG.TEXT.credits, {
		font: '25pt ' +  GLOBAL.FONT,
		fill: '#000000'
	});
	credits.anchor.set(1);
	credits.inputEnabled = true;
	credits.events.onInputDown.add(function () {
		util.fade(credits, false, 0.3);
		util.fade(start, false, 0.3);
		util.fade(changeAgent, false, 0.3);
		util.fade(allCredits, true);
		rolling.restart();
		cover.visible = true;
		TweenMax.to(cover, 0.5, { alpha: 0.7 });
	}, this);

	var cover = new Cover(this.game, '#000000', 0);
	cover.visible = false;
	cover.inputEnabled = true;
	cover.events.onInputDown.add(function () {
		util.fade(credits, true);
		util.fade(start, true);
		util.fade(changeAgent, true);
		util.fade(allCredits, false, 0.3);
		rolling.pause();
		TweenMax.to(cover, 0.3, { alpha: 0, onComplete: function () { cover.visible = false; } });
	}, this);
	this.world.add(cover);

	var allCredits = this.add.text(this.world.centerX, this.world.height,
		LANG.TEXT.creditsMade + '\n\n\n' +
		LANG.TEXT.creditsDeveloped + ':\nErik Anderberg\t \tAgneta Gulz\nMagnus Haake\t \tLayla Husain\n\n' +
		LANG.TEXT.creditsProgramming + ':\nErik Anderberg\t \tMarcus Malmberg\nCarolina Ekström\t \tLars Persson\nHenrik Söllvander\n\n' +
		LANG.TEXT.creditsGraphics + ':\nSebastian Gulz Haake\nMagnus Haake\t \tErik Anderberg\n\n' +
		LANG.TEXT.creditsVoices + ':\n' + LANG.TEXT.pandaName + '\t-\t' + LANG.TEXT.creditsVoicePanda + '\n' +
			LANG.TEXT.hedgehogName + '\t-\t' + LANG.TEXT.creditsVoiceHedgehog + '\n' +
			LANG.TEXT.mouseName + '\t-\t' + LANG.TEXT.creditsVoiceMouse + '\n' +
			LANG.TEXT.woodlouseName + '\t-\t' + LANG.TEXT.creditsVoiceWoodlouse + '\n' +
			LANG.TEXT.lizardName + '\t-\t' + LANG.TEXT.creditsVoiceLizard + '\n' +
			LANG.TEXT.beeName + '\t-\t' + LANG.TEXT.creditsVoiceBumblebee + '\n' +
			LANG.TEXT.birdName + '\t-\t' + LANG.TEXT.creditsVoiceBird + '\n' +
			LANG.TEXT.tractorName + '\t-\t' + LANG.TEXT.creditsVoiceTractor + '\n' +
			LANG.TEXT.craneName + '\t-\t' + LANG.TEXT.creditsVoiceCrane + '\n' +
			LANG.TEXT.trollName + '\t-\t' + LANG.TEXT.creditsVoiceTroll + '\n\n' +
		LANG.TEXT.creditsMusic + ':\nTorbjörn Gulz\n\n' +
		LANG.TEXT.creditsSfx + ':\nAnton Axelsson\nhttp://soundbible.com\nhttp://freesfx.co.uk\n\n' +
		LANG.TEXT.creditsThanks + ':\nSanne Bengtsson\t \tMaja Håkansson\nLisa Lindberg\t \tBjörn Norrliden\nBrunnsparksskolan', {
		font: '15pt ' +  GLOBAL.FONT,
		fill: '#ffffff',
		align: 'center'
	});
	allCredits.anchor.set(0.5, 0);
	allCredits.visible = false;
	var rolling = TweenMax.fromTo(allCredits, 30,
		{ y: this.world.height },
		{ y: -allCredits.height, ease: Power0.easeInOut, repeat: -1, paused: true });
};
