var PartyGame = require('./PartyGame.js');
var util = require('../../utils.js');

module.exports = PartyGiftGame;

PartyGiftGame.prototype = Object.create(PartyGame.prototype);
PartyGiftGame.prototype.constructor = PartyGiftGame;

function PartyGiftGame () {
	PartyGame.call(this); // Call parent constructor.
}

var pressedTile = 0;
var firstStep = true;
var maxSteps = 15;
var markSteps = [[2, 4], [2, 4], [2, 4], [2, 4], [2, 4], [3, 5], [4, 6], [5, 7], [6, 8], [7, 9], [7, 9]]; // Difficulty might be 10.
var giftFrames = ['gift1', 'gift2', 'gift3', 'gift4', 'gift5'];
var randomFrames = ['treasure8', 'treasure11'];

PartyGiftGame.prototype.pos = {
	helper1: { x: 350, y: 500 },
	helper2: { x: 620, y: 510 },
	birthday: { x: 400, y: 610 },
	troll: { x: 560, y: 635 },
	guest: { xs: [150, 250, 460, 700, 750], ys: [550, 450,  420, 440, 630] },
	gifts: { y: 710 },
	tiles: { x: 250, y: 530, alpha: 0.2 },
	map: { x: 65, y: 23, small: 0.05 }, // In relation to brithday.
	mapAgent: { x: 120, y: 640, scale: 0.06 },
	marks: { x: [220, 780], y: [170, 580], between: 200, previous: 300 },
};

// Tell the PartyGame to create guests with these scales (see createGuests).
PartyGiftGame.prototype.guestScales = [0.15, 0.3, 0.25, 0.1, 0.1];
// Tell the PartyGame to create the agent celebrating birthday.
PartyGiftGame.prototype.hasBirthday = true;

PartyGiftGame.prototype.init = function (options) {
	this.world.width *= 3; // Want to pan in x direction in this game.
	PartyGame.prototype.init.call(this, options);
};

PartyGiftGame.prototype.preload = function () {
	PartyGame.prototype.preload.call(this);
	this.load.atlasJSONHash('partyGift', 'img/partygames/giftGame/atlas.png', 'img/partygames/giftGame/atlas.json');
};

PartyGiftGame.prototype.create = function () {
	PartyGame.prototype.create.call(this);
	this.afterGarlands();
	this.afterBalloons();

	this.birthday.create(this.birthday.coords.hat.x + 40, this.birthday.coords.hat.y, 'glade', 'Partyhat').anchor.set(0.5, 1);
	this.birthday.visible = true;
	this.troll.visible = true;

	this.camera.setBoundsToWorld();
	this.camera.follow(this.birthday);

	pressedTile = 0;
	firstStep = true;

	// Graphics for this game.
	this.add.tileSprite(0, 0, this.world.width, this.world.height, 'partyGift', 'background', this.gameGroup);
	var tree = this.gameGroup.create(60, 230, 'partyGift', 'tree1');
	tree.anchor.set(0.5);
	tree.scale.set(0.8);
	tree = this.gameGroup.create(this.camera.width - 100, 210, 'partyGift', 'tree2');
	tree.anchor.set(0.5);
	tree.scale.set(0.8);
	tree = this.gameGroup.create(this.camera.width * 2, 210, 'partyGift', 'tree2');
	tree.anchor.set(0.5);
	tree.scale.set(0.8);

	for (var i = 0; i < this.guests.length; i++) {
		this.guests[i].visible = true;
		this.guests[i].x = this.pos.guest.xs[i];
		this.guests[i].y = this.pos.guest.ys[i];
	}

	// The gift "progress"-bar
	this.giftGroup = this.add.group(this.gameGroup);
	this.giftGroup.fixedToCamera = true;

	var amount = this._counter.max;
	var start = this.camera.width / 4;
	var space = (this.camera.width / 2) / (amount > 1 ? amount - 1 : 1);
	for (i = 0; i < amount; i++) {
		var gift = this.giftGroup.create(start + i * space, this.pos.gifts.y, 'partyGift', giftFrames[i]);
		gift.alpha = 0.3;
		gift.visible = false;
		gift.anchor.set(0.5);
	}

	// Tiles to walk on.
	this.tileGroup = this.add.group(this.gameGroup);
	this.tileGroup.x = this.pos.tiles.x;
	this.tileGroup.y = this.pos.tiles.y;

	var bmd = this.add.bitmapData(120, 120);
	bmd.ctx.fillStyle = '#ffffff';
	bmd.ctx.roundRect(0, 0, bmd.width, bmd.height, 10).fill();
	for (i = 0; i < maxSteps; i++) {
		var tile = this.tileGroup.create(i * 130, 0, bmd);
		tile.alpha = 0;
		tile.anchor.set(0.5);
		tile.inputEnabled = true;
		tile.events.onInputDown.add(this.clickTile, this);
	}
	this.tileGroup.children[0].alpha = this.pos.tiles.alpha;

	// Magnifying glass for when the player wants to check for gift.
	this.glass = this.gameGroup.create(this.pos.tiles.x, 660, 'partyGift', 'glass');
	this.glass.visible = false;
	this.glass.anchor.set(0.5, 1);
	this.glass.scale.set(0.8);
	this.glass.inputEnabled = true;
	this.glass.events.onInputDown.add(this.clickGlass, this);

	// Map
	this.map = this.add.group(this.gameGroup);
	this.map.scale.set(this.pos.map.small);

	var mapSprite = this.map.create(-50, -50, 'partyGift', 'map');
	mapSprite.scale.set(1.1);
	mapSprite.inputEnabled = true;
	mapSprite.events.onInputDown.add(this.showMap, this);

	// Gift marks
	this.markGroup = this.add.group(this.map);
	for (i = 0; i < this._counter.max; i++) { // Counter is the number of rounds.
		var mark = this.markGroup.create(this.rnd.between.apply(this.rnd, this.pos.marks.x), this.rnd.between.apply(this.rnd, this.pos.marks.y), 'partyGift', 'mark');
		mark.visible = false;
		mark.anchor.set(0.5);
		mark.scale.set(0);

		var between = this.pos.marks.between;
		for (var j = 0; j < i; j++) {
			if (mark.position.distance(this.markGroup.children[i - 1]) < this.pos.marks.previous ||
				mark.position.distance(this.markGroup.children[j]) < between) {
				mark.x = this.rnd.between.apply(this.rnd, this.pos.marks.x);
				mark.y = this.rnd.between.apply(this.rnd, this.pos.marks.y);
				between -= 5;
				j = -1;
			}
		}
	}

	if (this.birthday === this.agent) {
		this.map.agent = this.game.player.createAgent();
	} else {
		this.map.agent = new (this.birthdayType)(this.game);
	}
	this.map.agent.x = this.pos.mapAgent.x;
	this.map.agent.y = this.pos.mapAgent.y;
	this.map.agent.scale.set(this.pos.mapAgent.scale);
	this.map.add(this.map.agent);

	// Dots for the map.
	this.dotGroup = this.add.group(this.map);
	for (i = 0; i < this.tileGroup.length; i++) {
		var dot = this.dotGroup.create(0, 0, 'partyGift', this.birthday.id + '_track');
		dot.anchor.set(0.5);
		dot.scale.set(0.6, i % 2 ? 0.6 : -0.6);
	}

	this.gladeIntro.parent.bringToTop(this.gladeIntro);
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                                Set up round                               */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
PartyGiftGame.prototype.newRound = function () {
	this.correctAmount = this.rnd.between.apply(this.rnd, markSteps[this.difficulty | 0]);

	this.updateDots(this.correctAmount);

	pressedTile = 0;
};

PartyGiftGame.prototype.updateDots = function (amount) {
	var mark = this.markGroup.children[this._counter.value];
	var xChange = (mark.x - this.map.agent.x) / amount;
	var yChange = (mark.y - this.map.agent.y) / amount;
	var angle = this.math.angleBetweenPoints(this.map.agent, mark);

	var i, dot;
	for (i = 0; i <= amount; i++) {
		dot = this.dotGroup.children[i];
		dot.x = this.map.agent.x + xChange * i;
		dot.y = this.map.agent.y + yChange * i;
		dot.rotation = angle;
		dot.tint = 0x000000;
		dot.visible = false;
	}

	var left = this.dotGroup.length - amount;
	xChange = ((xChange > 0 ? this.map.children[0].width - 100 : 0) - mark.x) / left;
	yChange = ((yChange > 0 ? this.map.children[0].height - 100 : 0) - mark.y) / left;
	angle = this.math.angleBetween(mark.x + xChange, mark.y + yChange, mark.x, mark.y);
	for (i = amount + 1; i < this.dotGroup.length; i++) {
		dot = this.dotGroup.children[i];
		dot.x = mark.x + xChange * (i - amount);
		dot.y = mark.y + yChange * (i - amount);
		dot.rotation = angle;
		dot.tint = 0x990000;
		dot.visible = false;
	}
};

PartyGiftGame.prototype.mapUp = function () {
	var t = new TimelineMax();
	t.to(this.map, 1.5, { x: this.camera.x, y: 0, ease: Power1.easeIn }, 0);
	t.to(this.map.scale, 1.5, { x: 1, y: 1, ease: Power1.easeIn }, 0);
	return t;
};

PartyGiftGame.prototype.mapDown = function () {
	var t = new TimelineMax();
	t.to(this.map, 1.5, { x: this.birthday.x + this.pos.map.x, y: this.birthday.y + this.pos.map.y, ease: Power1.easeIn }, 0);
	t.to(this.map.scale, 1.5, { x: this.pos.map.small, y: this.pos.map.small, ease: Power1.easeIn }, 0);
	return t;
};

PartyGiftGame.prototype.showDots = function () {
	var tooFar = pressedTile + 1 > this.correctAmount;
	var t = new TimelineMax();
	for (var i = 0; i < this.dotGroup.length; i++) {
		if (i <= pressedTile) {
			if (tooFar && i + 1 > this.correctAmount) {
				if (i < pressedTile) { // When we have gone too far, don't the current dot.
					t.add(util.fade(this.dotGroup.children[i], true, 0.5, 1));
				}
			} else {
				t.add(util.fade(this.dotGroup.children[i], true, 0.5, 0.2));
			}
		} else if (i <= this.correctAmount) {
			t.add(util.fade(this.dotGroup.children[i], true, 0.5, 1));
		} else {
			this.dotGroup.children[i].visible = false;
		}
	}
	return t;
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                              Round functions                              */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
PartyGiftGame.prototype.showMap = function () {
	var t = new TimelineMax();
	t.addCallback(this.disable, null, [true], this);
	t.addCallback(this.birthday.eyesFollowObject, null, [this.map], this.birthday);

	if (this.map.scale.x !== 1) {
		t.add(this.mapUp());
		t.add(this.showDots());
		if (pressedTile !== this.correctAmount) {
			t.addSound(this.birthday.speech, this.birthday, pressedTile < this.correctAmount ? 'moreSteps' : 'tooManySteps');
		}
	} else {
		t.add(this.mapDown());
	}

	t.addCallback(this.disable, null, [false], this);
};

PartyGiftGame.prototype.clickTile = function (tile) {
	var from = pressedTile;
	pressedTile = this.tileGroup.getChildIndex(tile);
	var diff = pressedTile - from;
	if (!diff) {
		return;
	}

	this.disable(true);
	this.birthday.eyesFollowObject(tile);

	this.map.agent.x = this.dotGroup.children[pressedTile].x;
	this.map.agent.y = this.dotGroup.children[pressedTile].y;

	var t = new TimelineMax();
	var tileDur = 1;
	var moveDur = Math.abs(diff) * tileDur;
	t.add(this.birthday.move({ x: tile.world.x, ease: Power1.easeInOut }, moveDur), 0);
	t.to(this.glass, moveDur, { x: tile.world.x, ease: Power1.easeInOut }, 0);
	t.to(this.map, moveDur, { x: tile.world.x + this.pos.map.x, ease: Power1.easeInOut }, 0);

	if (firstStep) {
		firstStep = false;
		t.add(util.fade(this.glass, true, 0.5));
		t.addSound(this.birthday.speech, this.birthday, 'pushGlass');
	}

	t.addCallback(this.disable, null, [false], this);

	// Fade in tiles.
	for (var i = 1; i <= diff; i++) {
		var til = this.tileGroup.children[from + i];
		if (til.alpha !== this.pos.tiles.alpha) {
			t.add(util.fade(til, true, tileDur, this.pos.tiles.alpha), tileDur * i);
		}
	}
};

PartyGiftGame.prototype.clickGlass = function () {
	this.disable(true);
	this.birthday.eyesFollowObject(this.glass);

	var round = this._counter.value;
	var name, sfx;
	if (pressedTile === this.correctAmount) {
		name = giftFrames[round];
		sfx = 'chestUnlock';
	} else {
		name = this.game.rnd.pick(randomFrames);
		sfx = 'pop';
	}

	var gift = this.gameGroup.create(this.glass.x + 10, this.glass.y - 36, 'partyGift', name);
	gift.scale.set(0.1);
	gift.anchor.set(0.5);
	gift.alpha = 0;

	var t = new TimelineMax();
	t.addSound(this.birthday.speech, this.birthday, 'isItHere');
	t.add(this.troll.appear(this.glass.x, this.glass.y - 36, 'top'), '+=0.3');

	t.addLabel('find', '-=0.5');
	t.addSound(this.sfx, null, sfx, 'find');
	t.to(gift, 0.5, { alpha: 1 }, 'find');
	t.to(gift.scale, 1, { x: 1, y: 1, ease: Power1.easeIn }, 'find');
	t.addCallback(this.birthday.eyesStopFollow, null, null, this.birthday);

	if (pressedTile === this.correctAmount) {
		t.addLabel('yes');
		t.add(this.birthday.fistPump(3, -1), 'yes');
		t.addSound(this.birthday.speech, this.birthday, 'yesGift', 'yes');

		var toGift = this.giftGroup.children[round];
		t.to(gift, 1, { x: toGift.world.x, y: toGift.world.y });
		t.to(toGift, 0.5, { alpha: 1 });

		this.markGroup.children[round].frameName = giftFrames[round];
		t.addCallback(this.nextRound, '+=1.5', null, this);

	} else {
		t.addSound(this.troll.speech, this.troll, 'oops' + this.rnd.integerInRange(1, 2));
		t.addSound(this.birthday.speech, this.birthday, 'lookMap', '+=0.3');
		t.addCallback(this.showMap, null, null, this);
	}

	t.addCallback(gift.destroy, null, null, gift);
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                 Overshadowing Subgame mode functions                      */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
PartyGiftGame.prototype.modeIntro = function () {
	var t = new TimelineMax();
	t.skippable();

	t.add(this.birthday.wave(2, -1));
	t.addSound(this.birthday.speech, this.birthday, 'hi', 0);
	t.addSound(this.birthday.speech, this.birthday, 'niceParty');
	t.addSound(this.helper1.speech, this.helper1, 'haveGifts', '+=0.7');
	t.addSound(this.troll.speech, this.troll, 'laugh');
	t.addSound(this.birthday.speech, this.birthday, 'helpFindGifts', '+=0.5');
	t.add(util.fade(this.gladeIntro, false, 2));

	t.addCallback(function () {
		this.birthday.scale.set(0.2);
		this.birthday.x = -this.birthday.width;
		this.birthday.y = 450;
		this.gameGroup.add(this.birthday);

		this.map.x = this.birthday.x + this.pos.map.x;
		this.map.y = this.birthday.y + this.pos.map.y;
		this.gameGroup.bringToTop(this.map);

		this.troll.visible = false;
		this.troll.scale.set(0.22);
		this.gameGroup.add(this.troll);
	}, null, null, this);

	t.addLabel('appear');
	t.add(this.birthday.move({ x: this.pos.tiles.x, ease: Power1.easeIn }, 2), 'appear');
	t.to(this.map, 2, { x: this.pos.tiles.x + this.pos.map.x, ease: Power1.easeIn }, 'appear');

	t.addSound(this.birthday.speech, this.birthday, 'shouldBeHere');
	for (var i = 0; i < this.giftGroup.length; i++) {
		t.add(util.popin(this.giftGroup.children[i], true, 0.3));
	}

	t.addCallback(this.nextRound, null, null, this);
};

PartyGiftGame.prototype.modePlayerDo = function (intro) {
	var t = new TimelineMax();
	t.addSound(this.birthday.speech, this.birthday, intro ? 'lookMap' : 'nextGift');

	// mapUp will update the agent's map position. Which is then used in new round.
	t.add(this.mapUp());

	this.newRound();

	// Cheat move all the things back to the beginning.
	t.addCallback(function () {
		this.birthday.x = this.pos.tiles.x;
		this.glass.x = this.pos.tiles.x;
		this.map.x = 0;

		this.tileGroup.children[1].alpha = this.pos.tiles.alpha / 2;
		for (var i = 2; i < this.tileGroup.length; i++) {
			this.tileGroup.children[i].alpha = 0;
		}
	}, null, null, this);

	if (intro) {
		for (var i = 0; i < this.markGroup.length; i++) {
			t.add(util.popin(this.markGroup.children[i], true, 0.5));
		}

		t.addLabel('fade', '+=1');
		t.addSound(this.birthday.speech, this.birthday, 'giftAtCross', 'fade');
		for (i = 1; i < this.markGroup.length; i++) {
			t.add(util.fade(this.markGroup.children[i], true, 1, 0.2), 'fade');
		}

		t.addSound(this.birthday.speech, this.birthday, 'howManySteps', '+=0.5');
		t.add(this.showDots());
		t.addSound(this.birthday.speech, this.birthday, 'rememberSteps');

		t.add(this.mapDown(), '+=5');

		t.addLabel('pusher');
		t.add(util.fade(this.tileGroup.children[0], true, 0.3, this.pos.tiles.alpha)); // Light up first tile always.
		t.add(util.fade(this.tileGroup.children[1], true, 0.3, this.pos.tiles.alpha / 2)); // "Helper" tile.
		t.addSound(this.birthday.speech, this.birthday, 'pushButton', 'pusher');

		t.addCallback(this.disable, null, [false], this);

	} else {
		t.add(util.fade(this.markGroup.children[this._counter.value], true, 1));

		t.addLabel('dots');
		t.add(this.showDots(), 'dots');
		t.addSound(this.birthday.speech, this.birthday, Math.random() < 0.5 ? 'howManySteps' : 'rememberSteps', 'dots');

		// Let the player push if it wants to, otherwise scale down map after 5 seconds.
		t.addCallback(this.disable, null, [false], this);
		t.addCallback(function () {
			if (this.map.scale.x === 1) {
				this.mapDown();
			}
		}, '+=5', null, this);
	}
};

PartyGiftGame.prototype.modeOutro = function () {
	var t = new TimelineMax();
	t.addSound(this.birthday.speech, this.birthday, 'wasAll');
	t.addLabel('moveOut');
	t.to(this.map, 0.5, { x: '+=20', repeat: 3, yoyo: true }, 'moveOut');
	t.to(this.map, 2, { y: '+=50' }, 'moveOut');
	t.add(this.birthday.move({ x: -500 }, 5), 'moveOut');
	t.add(this.troll.water(300, this));

	t.addCallback(function () {
		this.afterGifts();
		this.gladeIntro.parent.bringToTop(this.gladeIntro);

		this.birthday.x = this.pos.birthday.x;
		this.birthday.y = this.pos.birthday.y;
		this.birthday.scale.set(0.17);
		this.gladeIntro.add(this.birthday);

		this.troll.x = this.pos.troll.x;
		this.troll.y = this.pos.troll.y;
		this.troll.scale.set(0.12);
		this.gladeIntro.add(this.troll);
	}, null, null, this);

	t.add(util.fade(this.gladeIntro, true, 2));

	t.addSound(this.birthday.speech, this.birthday, 'openGifts', '+=0.2');
	t.addSound(this.birthday.speech, this.birthday, 'thanksForParty', '+=0.5');

	t.addCallback(this.nextRound, null, null, this); // Ending game.
};
