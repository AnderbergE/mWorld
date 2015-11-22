var Subgame = require('../Subgame.js');
var LANG = require('../../language.js');
var Hedgehog = require('../../agent/Hedgehog.js');
var Troll = require('../../agent/Troll.js');
var Panda = require('../../agent/Panda.js');
var Mouse = require('../../agent/Mouse.js');
var GLOBAL = require('../../global.js');
var util = require('../../utils.js');

module.exports = PartyGame;

PartyGame.prototype = Object.create(Subgame.prototype);
PartyGame.prototype.constructor = PartyGame;
function PartyGame () {
	Subgame.call(this); // Call parent constructor.
}



PartyGame.prototype.init = function(options) {

	options = options || {};

	Subgame.prototype.init.call(this, options);

	this.difficulty = options.difficulty || 10;
	
};



PartyGame.prototype.preload = function () {

	this.load.atlasJSONHash(Hedgehog.prototype.id, 'img/agent/hedgehog/atlas.png', 'img/agent/hedgehog/atlas.json');
	this.load.audio(Hedgehog.prototype.id + 'Speech', LANG.SPEECH.hedgehog.speech);
	this.load.atlasJSONHash(Troll.prototype.id, 'img/agent/troll/atlas.png', 'img/agent/troll/atlas.json');
	this.load.audio(Troll.prototype.id + 'Speech', LANG.SPEECH.troll.speech);
	this.load.atlasJSONHash(Panda.prototype.id, 'img/agent/panda/atlas.png', 'img/agent/panda/atlas.json');
	this.load.audio(Panda.prototype.id + 'Speech', LANG.SPEECH.panda.speech);
	this.load.atlasJSONHash(Mouse.prototype.id, 'img/agent/mouse/atlas.png', 'img/agent/mouse/atlas.json');
	this.load.audio(Mouse.prototype.id + 'Speech', LANG.SPEECH.mouse.speech);
	this.load.atlasJSONHash('balloon', 'img/subgames/balloon/atlas.png', 'img/subgames/balloon/atlas.json');
	this.load.atlasJSONHash('bee', 'img/subgames/beeflight/atlas.png', 'img/subgames/beeflight/atlas.json');
	this.load.atlasJSONHash('birdhero', 'img/subgames/birdhero/atlas.png', 'img/subgames/birdhero/atlas.json');
	this.load.atlasJSONHash('lizard', 'img/subgames/lizardjungle/atlas.png', 'img/subgames/lizardjungle/atlas.json');
	this.load.atlasJSONHash('glade', 'img/partygames/glade/atlas.png', 'img/partygames/glade/atlas.json');
	this.load.audio('balloonSfx', ['audio/subgames/balloongame/sfx.m4a', 'audio/subgames/balloongame/sfx.ogg', 'audio/subgames/balloongame/sfx.mp3']); // sound sheet
};


PartyGame.prototype.create = function () {

	this.sfx = util.createAudioSheet('balloonSfx', {
			sackJingle:  [0.0,   1.6],
			chestUnlock: [1.9,   1.0],
			pop:         [3.1,   0.3],
			catPurr:     [3.7,   2.8]
		});

	this.gladeIntro = this.add.group();

	this.bg = this.gladeIntro.create(0, 0, 'glade', 'background');

	this.treestump = this.gladeIntro.create(680, 520, 'glade', 'treestump');

	this.trees = this.gladeIntro.create(0, 0, 'glade', 'trees');

	this.banner = this.gladeIntro.create(346, 85, 'glade', 'banner');
	this.createBannerName();

	this.branches = this.gladeIntro.create(320, 80, 'glade', 'branches');

	this.mailbox = this.gladeIntro.create(800, 360, 'glade', 'mailbox');

	this.pgifts = this.add.group(this.gladeIntro); 
	this.pgifts.alpha = 0;

	this.pgift1 = this.pgifts.create(160, 650, 'glade', 'gift1');
	this.pgift2 = this.pgifts.create(240, 650, 'glade', 'gift3');
	this.pgift3 = this.pgifts.create(200, 660, 'glade', 'gift2');
	this.pgift4 = this.pgifts.create(260, 670, 'glade', 'gift5');
	this.pgift5 = this.pgifts.create(220, 670, 'glade', 'gift4');

	this.bear = this.gladeIntro.create(800, 420, 'glade', 'decor5');
	this.bear.alpha = 0;
	this.bear.scale.set(1.5);

	this.createGuests();

	
	if (this.agent instanceof Panda) {

		this.a1 = new Hedgehog (this.game);
	    this.gladeIntro.add(this.a1);
	    this.a1.scale.set(0.15);
	    this.a1.x = 370;
		this.a1.y = 540;

		this.a2 = new Mouse (this.game);
	    this.gladeIntro.add(this.a2);
	    this.a2.scale.set(0.15);
	    this.a2.x = 580;
		this.a2.y = 520;

		this.a3 = new Panda (this.game);
	    this.gladeIntro.add(this.a3);
	    this.a3.scale.set(0.17);
		this.a3.visible = false;
	}

	else if (this.agent instanceof Mouse) {

		this.a1 = new Panda (this.game);
	    this.gladeIntro.add(this.a1);
	    this.a1.scale.set(0.15);
	    this.a1.x = 370;
		this.a1.y = 540;

		this.a2 = new Hedgehog (this.game);
	    this.gladeIntro.add(this.a2);
	    this.a2.scale.set(0.15);
	    this.a2.x = 580;
		this.a2.y = 520;

		this.a3 = new Mouse (this.game);
	    this.gladeIntro.add(this.a3);
	    this.a3.scale.set(0.17);
		this.a3.visible = false;
	}

	else if (this.agent instanceof Hedgehog) {

		this.a1 = new Mouse (this.game);
	    this.gladeIntro.add(this.a1);
	    this.a1.scale.set(0.15);
	    this.a1.x = 370;
		this.a1.y = 540;

		this.a2 = new Panda (this.game);
	    this.gladeIntro.add(this.a2);
	    this.a2.scale.set(0.15);
	    this.a2.x = 580;
		this.a2.y = 520;

		this.a3 = new Hedgehog (this.game);
	    this.gladeIntro.add(this.a3);
	    this.a3.scale.set(0.17);
		this.a3.visible = false;
	}

	this.t2 = new Troll (this.game);
    this.gladeIntro.add(this.t2);
    this.t2.x = 480;
	this.t2.y = 650;
    this.t2.scale.set(0.12);
    this.t2.changeShape('stone');
    this.t2.visible = true;


};



PartyGame.prototype.createBannerName = function () {

	var name;

	if (this.agent instanceof Panda) {

		name = 'Panders!';
	}

	else if (this.agent instanceof Mouse) {

		name = 'Mille!';
	}

	else if (this.agent instanceof Hedgehog) {

		name = 'Igis!';
	}

	this.bannerName1 = new BannerText (this.game, 450, 118, 'Grattis', 25);
	this.bannerName1.angle = 2;

	this.bannerName2 = new BannerText (this.game, 570, 125, name, 25);
	this.bannerName2.angle = -6;

	this.gladeIntro.add(this.bannerName1);
	this.gladeIntro.add(this.bannerName2);
};



PartyGame.prototype.partyIntro = function () {

	var t = new TimelineMax();

	this.a1.visible = true;
	this.a2.visible = true;

	this.t2.visible = true;

	t.add(this.a1.wave(1, -1));
	t.addSound(this.a1.speech, this.a1, 'hi', 0);
	t.addSound(this.a1.speech, this.a1, 'niceYoureHere', '+=0.5');


	t.addLabel('a2', '+=1');
	t.addSound(this.a2.speech, this.a2, 'soonBirthday', 'a2');
	t.addSound(this.a2.speech, this.a2, 'wereHavingParty', '+=0.5');  

	t.add(this.t2.transform('stoneToTroll'), '+=1');
	t.addSound(this.sfx, null, 'pop', '-=1');

	t.addCallback(function () {
		
		this.a1.eyesFollowObject(this.t2);
		this.a2.eyesFollowObject(this.t2);
	}, null, null, this);

	t.addSound(this.t2.speech, this.t2, 'laugh');

	t.addSound(this.t2.speech, this.t2, 'iCanDo', '+=0.6');

	t.addCallback(function () {
		
		this.a1.eyesFollowObject(this.t2.emitter);
		this.a2.eyesFollowObject(this.t2.emitter);
	}, null, null, this);

	t.add(this.t2.swish(this.mailbox.x + 30, this.mailbox.y + 30));

	t.addLabel('gone');
	t.addSound(this.sfx, null, 'pop', 'gone');
	t.add(new TweenMax(this.mailbox, 0.05, {alpha:0}), 'gone');
	t.add(new TweenMax(this.bear, 0.05, {alpha:1}), 'gone+=0.04');
	t.to(this.t2.leftArm, 0.3, {rotation: -1.1, ease: Power4.easeIn});

	t.addCallback(function () {
		
		this.a1.eyesStopFollow();
		this.a2.eyesStopFollow();
	}, 'gone+=1', null, this);

	t.addSound(this.t2.speech, this.t2, 'oops', 'gone+=0.04');
	t.addSound(this.t2.speech, this.t2, 'iNeedHelp', '+=0.5');

	return t;


};



PartyGame.prototype.invitationIntro = function () {

	var t = new TimelineMax();

	if (this.agent instanceof Panda) {

		t.addSound(this.a2.speech, this.a2, 'gottaInvite', '+=1');
		t.addSound(this.a2.speech, this.a2, 'makeCards');
	}

	else {

		t.addSound(this.a1.speech, this.a1, 'gottaInvite', '+=1');
		t.addSound(this.a1.speech, this.a1, 'makeCards');
	}

	t.add(new TweenMax(this.gladeIntro, 2, {alpha:0}), '+=3');

	return t;
};



PartyGame.prototype.garlandIntro = function () {

	var t = new TimelineMax();

	this.a1.visible = true;
	this.a2.visible = true;
	this.t2.visible = false;

	if (this.agent instanceof Hedgehog) {

		t.add(this.a1.wave(1, -1));

		t.addSound(this.a1.speech, this.a1, 'hi', 0);

		t.addSound(this.a1.speech, this.a1, 'niceComeBack', '+=0.5');
		t.addSound(this.a1.speech, this.a1, 'helpUsAgain', '+=0.5');

		t.addSound(this.a2.speech, this.a2, 'haveToGarlands', '+=1');
		t.addSound(this.a2.speech, this.a2, 'letsPutUp', '+=0.3');
	}

	else {

		t.add(this.a2.wave(1, -1));

		t.addSound(this.a2.speech, this.a2, 'hi', 0);

		t.addSound(this.a2.speech, this.a2, 'niceComeBack', '+=0.5');
		t.addSound(this.a2.speech, this.a2, 'helpUsAgain', '+=0.5');

		t.addSound(this.a1.speech, this.a1, 'haveToGarlands', '+=1');
		t.addSound(this.a1.speech, this.a1, 'letsPutUp', '+=0.3');
	}

	t.add(new TweenMax(this.gladeIntro, 2, {alpha:0}), '+=3');

	return t;
};



PartyGame.prototype.balloonIntro = function () {

	var t = new TimelineMax();

	this.a1.visible = true;
	this.a2.visible = true;
	this.t2.visible = false;

	if (this.agent instanceof Hedgehog) {

		t.add(this.a2.wave(2, -1));
		t.addSound(this.a2.speech, this.a2, 'hi', 0);

		t.addSound(this.a2.speech, this.a2, 'niceComeBack', '+=0.3');
		t.addSound(this.a2.speech, this.a2, 'helpUsAgain', '+=0.3');

		t.addSound(this.a1.speech, this.a1, 'haveToBalloons', '+=0.8');
		t.addSound(this.a1.speech, this.a1, 'makeBalloons', '+=0.2');
	}

	else {

		t.add(this.a1.wave(2, -1));
		t.addSound(this.a1.speech, this.a1, 'hi', 0);

		t.addSound(this.a1.speech, this.a1, 'niceComeBack', '+=0.3');
		t.addSound(this.a1.speech, this.a1, 'helpUsAgain', '+=0.3');

		t.addSound(this.a2.speech, this.a2, 'haveToBalloons', '+=0.8');
		t.addSound(this.a2.speech, this.a2, 'makeBalloons', '+=0.2');
	}

	t.add(new TweenMax(this.gladeIntro, 2, {alpha:0}), '+=3');

	return t;
};



PartyGame.prototype.giftIntro = function () {


	this.t2.visible = false;

	var t = new TimelineMax();

	t.add(this.a3.wave(2, -1));

	t.addSound(this.a3.speech, this.a3, 'hi', 0);
	t.addSound(this.a3.speech, this.a3, 'niceParty', '+=0.3');

	t.addSound(this.a2.speech, this.a2, 'haveGifts', '+=1');

	t.addSound(this.t2.speech, this.t2, 'laugh');

	t.addSound(this.a3.speech, this.a3, 'helpFindGifts', '+=0.5');

	t.add(new TweenMax(this.gladeIntro, 2, {alpha:0}), '+=3');

	return t;
};




PartyGame.prototype.afterInvitations = function () {

	this.t2.visible = false;

	var t = new TimelineMax();

	t.addCallback(function () {
		
		this.mailbox.destroy();
	}, null, null, this);

	return t;

};



PartyGame.prototype.afterGarlands = function () {

	this.t2.visible = false;

	var t = new TimelineMax();

	t.addCallback(function () {
		
		this.garland = this.gladeIntro.create(430, 270, 'glade', 'garland');
	}, null, null, this);

	return t;

};



PartyGame.prototype.afterBalloons = function () {

	this.t2.visible = false;

	var t = new TimelineMax();

	t.addCallback(function () {
		
		this.balloons = this.gladeIntro.create(200, 249, 'glade', 'balloons');
	}, null, null, this);

	return t;

};



PartyGame.prototype.afterGifts = function () {

	var t = new TimelineMax();

	t.addCallback(function () {

		this.a1.visible = true;
		this.a2.visible = true;
		this.a3.visible = true;
		this.t2.changeShape('troll');

		this.a1.x = 350;
		this.a1.y = 500;

		this.a2.x = 620;
		this.a2.y = 510;

		this.a3.x = 400;
		this.a3.y = 610;

		this.t2.x = 560;
		this.t2.y = 635;

		for (var i = 0; i < this.guests.length; i++) {

			this.guests[i].visible = true;
		}
		
		this.guests[0].x = 150;
		this.guests[0].y = 550;

		this.guests[1].x = 250;
		this.guests[1].y = 450;

		this.guests[2].x = 460;
		this.guests[2].y = 420;

		this.guests[3].x = 700;
		this.guests[3].y = 440;

		this.guests[4].x = 750;
		this.guests[4].y = 630;

		if (!this.hat) {
		
			this.hat = this.gladeIntro.create(this.a3.x + 12, this.a3.y - 56, 'glade', 'Partyhat');
		}
		
		this.hat.scale.set(0.36);
		this.hat.anchor.set(0.5, 1);
	}, null, null, this);

	return t;
};



PartyGame.prototype.createGuests = function () {

	var guests = ['bee', 'lizard', 'beetle', 'bird', 'bird', 'bird', 'bird', 'bird', 'bird', 'bird', 'bird', 'bird'];
	Phaser.Utils.shuffle(guests);

	var tints = [0xff8888, 0x77ee77, 0x8888ff, 0xfaced0, 0xfedcba, 0x11abba, 0xabcdef, 0x333333, 0xed88ba];
	Phaser.Utils.shuffle(tints);

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

	


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                           Create text objects                            */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/



BannerText.prototype = Object.create(Phaser.Text.prototype);
BannerText.prototype.constructor = BannerText;

function BannerText (game, x, y, text, size, color) {
	size = size || 50;
	color = color || '#000000';

	Phaser.Text.call(this, game, x, y, text, {font: size + 'pt ' + GLOBAL.FONT, fill: color}); // Parent constructor.

	return this;
}



/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                             Create guest object                           */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/



Guest.prototype = Object.create(Phaser.Group.prototype);
Guest.prototype.constructor = Guest;
function Guest (game, x, y, guestName, tint, mood) {

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
		
	}

	else if (guestName === 'bird') {

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
	}

	else if (guestName === 'lizard') {

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
	}

	else if (guestName === 'beetle') {

		this.scale.set(0.31);
		this.beetle = this.create(0, 0, 'balloon', 'beetle');
		this.beetle.anchor.set(0.5);
	}

	this.mood = mood;

	this.setMood();
}


Guest.prototype.setMood = function (mood) {

	this.mood = mood;

	if (this.mood === 'neutral') {

		if (this.mouthNeutral) {

			this.mouthNeutral.visible = true;
			this.mouthSad.visible = false;
			this.mouthHappy.visible = false;
		}

		else if (this.mouthSad && this.mouthHappy) {

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

			this.flap = TweenMax.to(this.wings, 0.1, {
					frame: this.wings.frame+1, roundProps: 'frame', ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: false
				});
		}

		if (this.beetle) {

			this.hop = TweenMax.to(this.beetle, 0.2, {
					y:'-=15', ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: false
				});
		}

		if (this.rightLeg && this.leftLeg) {

			this.jump = new TimelineMax(); 
			this.jump.addLabel('jump');
			this.jump.to(this, 0.3, {y:'-=15', ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: false});
			this.jump.to(this.rightLeg, 0.3, {angle: -40, ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: false}, 'jump');
			this.jump.to(this.leftLeg, 0.3, {angle: 40, ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: false}, 'jump');
		}
	}

	else if (this.mood === 'sad') {

		if (this.mouthSad && this.mouthHappy) {

			this.mouthHappy.visible = false;
			this.mouthSad.visible = true;
		}
	}

};




