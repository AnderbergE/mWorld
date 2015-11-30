var PartyGame = require('./PartyGame.js');
var GLOBAL = require('../../global.js');

module.exports = PartyGiftGame;

PartyGiftGame.prototype = Object.create(PartyGame.prototype);
PartyGiftGame.prototype.constructor = PartyGiftGame;

function PartyGiftGame () {
	PartyGame.call(this); // Call parent constructor.
}

PartyGiftGame.prototype.preload = function () {
	PartyGame.prototype.preload.call(this);
	this.load.atlasJSONHash('partyGift', 'img/partygames/giftGame/atlas.png', 'img/partygames/giftGame/atlas.json');
};

PartyGiftGame.prototype.create = function () {
	PartyGame.prototype.create.call(this);
	this.afterInvitations();
	this.afterGarlands();
	this.afterBalloons();

	this.birthday.x = 400;
	this.birthday.y = 610;
	this.birthday.visible = true;
	this.helper1.x = 350;
	this.helper1.y = 500;
	this.helper2.x = 620;
	this.helper2.y = 510;
	this.troll.x = 560;
	this.troll.y = 635;
	this.troll.visible = true;
	this.troll.changeShape('troll');

	var xs = [150, 250, 460, 700, 750];
	var ys = [550, 450,  420, 440, 630];
	for (var i = 0; i < this.guests.length; i++) {
		this.guests[i].visible = true;
		this.guests[i].x = xs[i];
		this.guests[i].y = ys[i];
	}

	this.hat = this.gladeIntro.create(this.birthday.x + 12, this.birthday.y - 56, 'glade', 'Partyhat');
	this.hat.scale.set(0.36);
	this.hat.anchor.set(0.5, 1);

	this.emitter = this.add.emitter(0, 0, 150);
	this.emitter.gravity = 0;
	this.emitter.setAlpha(1, 0, 3000);
	this.emitter.makeParticles(this.troll.id, 'star');

	this.createBg();
	this.createTrees();
	this.createGiftModels();

	this.createMap();
	this.createMapMarks();
	this.createMapAgent();

	this.finishedRounds = 0;

	this.pressedTile = -1;

	this.gladeIntro.parent.bringToTop(this.gladeIntro);
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                        Change difficulty functions                        */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
//Change level of difficulty, amount
PartyGiftGame.prototype.getAmount = function (min, max) {
	return this.game.rnd.between(min, max);
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                                Set up round                               */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
PartyGiftGame.prototype.generateRound = function () {
	var amount;

	if (this.difficulty <= 1) {
		amount = this.getAmount(2, 4);
	} else if (this.difficulty <= 2) {
		amount = this.getAmount(2, 4);
	} else if (this.difficulty <= 3) {
		amount = this.getAmount(2, 4);
	} else if (this.difficulty <= 4) {
		amount = this.getAmount(2, 4);
	} else if (this.difficulty <= 5) {
		amount = this.getAmount(2, 4);
	} else if (this.difficulty <= 6) {
		amount = this.getAmount(3, 5);
	} else if (this.difficulty <= 7) {
		amount = this.getAmount(4, 6);
	} else if (this.difficulty <= 8) {
		amount = this.getAmount(5, 7);
	} else if (this.difficulty <= 9) {
		amount = this.getAmount(6, 8);
	} else if (this.difficulty <= 10) {
		amount = this.getAmount(7, 9);
	}

	this.correctAmount = amount;
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                          Create round functions                           */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
PartyGiftGame.prototype.createBg = function () {
	var i, bg;

	this.bgGroup = this.add.group(this.gameGroup);
	this.bgGroup.x = 0;
	this.bgGroup.y = 0;

	for (i = 0; i < 10; i++) {
		bg = this.bgGroup.create(0, 0, 'partyGift', 'background');
	}

	for (i = 1; i < this.bgGroup.length; i++) {
		bg = this.bgGroup.children[i];
		bg.x = this.bgGroup.children[i - 1].x + 1023;
	}
};

PartyGiftGame.prototype.createTiles = function () {
	this.tileGroup = this.add.group(this.gameGroup);
	this.tileGroup.x = 0;
	this.tileGroup.y = 0;

	this.tiles = [];
	this.tiles.push(new Tile(this.game, 250, 530));
	this.tileGroup.add(this.tiles[0]);
	this.tiles[0].tile.events.onInputDown.add(this.pressTile, this);

	for (var i = 1; i < this.correctAmount * 2; i++) {
		this.tiles.push(new Tile(this.game, this.tiles[i - 1].x + 130, 530));
		this.tileGroup.add(this.tiles[i]);
		this.tiles[i].tile.events.onInputDown.add(this.pressTile, this);
	}
};

PartyGiftGame.prototype.createGlass = function () {
	this.glass = this.gameGroup.create(this.tiles[0].x, 660, 'partyGift', 'glass');
	this.glass.scale.set(0.8);
	this.glass.alpha = 0;
	this.glass.anchor.set(0.5, 1);
	this.glass.inputEnabled = true;
};

PartyGiftGame.prototype.createGiftModels = function () {
	this.giftGroup = this.add.group(this.gameGroup);
	this.giftGroup.x = 400;
	this.giftGroup.y = 710;

	this.gifts = ['gift1', 'gift2', 'gift3', 'gift4', 'gift5'];

	var giftM;
	for (var i = 0; i < 5; i++) {
		giftM = this.giftGroup.create(0, 0, 'partyGift', this.gifts[i]);
		giftM.anchor.set(0.5);
		giftM.alpha = 0;
	}

	for (i = 1; i < this.giftGroup.length; i++) {
		giftM = this.giftGroup.children[i];
		giftM.x = this.giftGroup.children[i - 1].x + 72;
	}
};

PartyGiftGame.prototype.createTrees = function () {
	this.tree = this.gameGroup.create(60, 230, 'partyGift', 'tree1');
	this.tree.anchor.set(0.5);
	this.tree.scale.set(0.8);
	this.tree2 = this.gameGroup.create(900, 210, 'partyGift', 'tree2');
	this.tree2.anchor.set(0.5);
	this.tree2.scale.set(0.8);
	this.tree3 = this.gameGroup.create(1600, 210, 'partyGift', 'tree2');
	this.tree3.anchor.set(0.5);
	this.tree3.scale.set(0.8);
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                              Round functions                              */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
PartyGiftGame.prototype.pressTile = function (origin) {
	this.pressedTile = this.tiles.indexOf(origin.parent);

	var between = this.tiles[this.pressedTile].position.distance(this.birthday.position);
	var dist = Math.abs(between / 130);

	var t = new TimelineMax();
	if (this.glass.alpha === 0.3 || this.glass.alpha === 1) {

		t.addCallback(this.disable, null, [true], this);
		t.add(new TweenMax(this.glass, 0.2, {alpha:0.3}));

		if ((origin.parent.x + this.gameGroup.x) < 200) {
			if (this.pressedTile !== 0) {
				t.addLabel('appear');
				t.to(this.gameGroup, 1, {x: '+=' + 300, ease: Power0.easeNone}, 'appear');
				t.to(this.giftGroup, 1, {x: '-=' + 300, ease: Power0.easeNone}, 'appear');
				t.add(this.birthday.move({ x: origin.parent.x, ease: Power0.easeNone}, dist), 'appear');
				t.to(this.glass, dist, {x: origin.parent.x, ease: Power0.easeNone}, 'appear');
				t.to(this.mapGroup, dist, {x: origin.parent.x + 65, ease: Power0.easeNone}, 'appear');
			} else {
				t.addLabel('appear');
				t.add(this.birthday.move({ x: origin.parent.x, ease: Power0.easeNone}, dist), 'appear');
				t.to(this.glass, dist, {x: origin.parent.x, ease: Power0.easeNone}, 'appear');
				t.to(this.mapGroup, dist, {x: origin.parent.x + 65, ease: Power0.easeNone}, 'appear');
			}

		} else if ((origin.parent.x + this.gameGroup.x) < 800) {
			if (this.pressedTile !== 0 && this.pressedTile !== this.tiles.length - 1) {
				t.addLabel('appear');
				t.add(this.birthday.move({ x: origin.parent.x, ease: Power0.easeNone}, dist), 'appear');
				t.to(this.glass, dist, {x: origin.parent.x, ease: Power0.easeNone}, 'appear');
				t.to(this.mapGroup, dist, {x: origin.parent.x + 65, ease: Power0.easeNone}, 'appear');
				if (dist > 4) {
					t.add(new TweenMax(this.tiles[this.pressedTile - 2].tile, 1, {alpha:0.2}), 'appear');
					t.add(new TweenMax(this.tiles[this.pressedTile - 3].tile, 1, {alpha:0.2}), 'appear');
					t.add(new TweenMax(this.tiles[this.pressedTile - 4].tile, 1, {alpha:0.2}), 'appear');
				} else if (dist > 3) {
					t.add(new TweenMax(this.tiles[this.pressedTile - 2].tile, 1, {alpha:0.2}), 'appear');
					t.add(new TweenMax(this.tiles[this.pressedTile - 3].tile, 1, {alpha:0.2}), 'appear');
				}
				t.add(new TweenMax(this.tiles[this.pressedTile - 1].tile, 1, {alpha:0.2}), 'appear');
				t.add(new TweenMax(this.tiles[this.pressedTile].tile, 1, {alpha:0.2}), 'appear');
				t.add(new TweenMax(this.tiles[this.pressedTile + 1].tile, 1, {alpha:0.2}), 'appear');

			} else {
				t.addLabel('appear');
				t.add(this.birthday.move({ x: origin.parent.x, ease: Power0.easeNone}, dist), 'appear');
				t.to(this.glass, dist, {x: origin.parent.x, ease: Power0.easeNone}, 'appear');
				t.to(this.mapGroup, dist, {x: origin.parent.x + 65, ease: Power0.easeNone}, 'appear');

				t.add(new TweenMax(this.tiles[this.pressedTile].tile, 1, {alpha:0.2}), 'appear');
			}
		} else if ((origin.parent.x + this.gameGroup.x) > 800) {
			if (this.pressedTile !== this.tiles.length - 1) {
				t.addLabel('appear');
				t.to(this.gameGroup, 1, {x: '-=' + 300, ease: Power0.easeNone}, 'appear');
				t.to(this.giftGroup, 1, {x: '+=' + 300, ease: Power0.easeNone}, 'appear');
				t.add(this.birthday.move({ x: origin.parent.x, ease: Power0.easeNone}, dist), 'appear');
				t.to(this.glass, dist, {x: origin.parent.x, ease: Power0.easeNone}, 'appear');
				t.to(this.mapGroup, dist, {x: origin.parent.x + 65, ease: Power0.easeNone}, 'appear');
				if (dist > 3) {
					t.add(new TweenMax(this.tiles[this.pressedTile - 2].tile, 1, {alpha:0.2}), 'appear');
					t.add(new TweenMax(this.tiles[this.pressedTile - 3].tile, 1, {alpha:0.2}), 'appear');
					t.add(new TweenMax(this.tiles[this.pressedTile - 4].tile, 1, {alpha:0.2}), 'appear');
				}
				t.add(new TweenMax(this.tiles[this.pressedTile - 1].tile, 1, {alpha:0.2}), 'appear');
				t.add(new TweenMax(this.tiles[this.pressedTile].tile, 1, {alpha:0.2}), 'appear');
				t.add(new TweenMax(this.tiles[this.pressedTile + 1].tile, 1, {alpha:0.2}), 'appear');
			} else {
				t.addLabel('appear');
				t.add(this.birthday.move({ x: origin.parent.x, ease: Power0.easeNone}, dist), 'appear');
				t.to(this.glass, dist, {x: origin.parent.x, ease: Power0.easeNone}, 'appear');
				t.to(this.mapGroup, dist, {x: origin.parent.x + 65, ease: Power0.easeNone}, 'appear');
				t.add(new TweenMax(this.tiles[this.pressedTile].tile, 1, {alpha:0.2}), 'appear');
			}
		}

		t.addCallback(this.disable, null, [false], this);

		t.add(new TweenMax(this.glass, 0.5, {alpha:1}));

		t.addCallback(function () {
			this.glass.events.onInputDown.add(this.trollStart, this);
		}, null, null, this);
	}
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                           Create map functions                            */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
PartyGiftGame.prototype.createMap = function () {
	this.mapGroup = this.add.group(this.gameGroup);
	this.mapGroup.x = -100;
	this.mapGroup.y = -100;
	this.mapGroup.scale.set(0.05);

	this.map = this.mapGroup.create(-50, -50, 'partyGift', 'map');
	this.map.scale.set(1.1);

	this.map.inputEnabled = true;
	this.map.events.onInputDown.add(this.mapAgain, this);
};

PartyGiftGame.prototype.createMapAgent = function () {
	if (this.birthday === this.agent) {
		this.map.a = this.game.player.createAgent();
	} else {
		this.map.a = new GLOBAL.AGENT[this.birthdayName](this.game);
	}

	this.map.a.scale.set(0.06);
	this.map.a.x = 120;
	this.map.a.y = 640;
	this.map.a.alpha = 0;
	this.mapGroup.add(this.map.a);
};

PartyGiftGame.prototype.createMapMarks = function () {
	this.markGroup = this.add.group(this.mapGroup);
	this.markGroup.x = 0;
	this.markGroup.y = 0;

	for (var i = 0; i < 5; i++) {
		var mark = this.markGroup.create(0, 0, 'partyGift', 'mark');
		mark.alpha = 0;
		mark.anchor.set(0.5);
	}

	var offset = 300;
	for (i = 0; i < 5; i++) {
		var marks = this.markGroup.children[i];
		marks.x = this.game.rnd.between(340, 900);
		marks.y = this.game.rnd.between(220, 600);

		for (var j = 0; j < i; j++) {
			if (marks.position.distance(this.markGroup.children[j].position) < offset) {
				offset -= 2;
				i--;
				break;
			}
		}

		if (j === i) {
			offset = 300;
		}
	}
};

PartyGiftGame.prototype.createMapDots = function () {
	this.dotGroup = this.add.group(this.mapGroup);
	this.dotGroup.x = 0;
	this.dotGroup.y = 0;

	this.dotDistanceX = this.markGroup.children[this.finishedRounds].x - this.map.a.x;
	this.dotDistanceY = this.markGroup.children[this.finishedRounds].y - this.map.a.y;

	for (var i = 0; i < this.correctAmount; i++) {
		var dot = this.dotGroup.create(0, 0, 'partyGift', 'dot');
		dot.alpha = 0;
		dot.scale.set(0.4);
		dot.anchor.set(0.5);
		dot.x = this.map.a.x + (this.dotDistanceX / this.correctAmount);
		dot.y = this.map.a.y + (this.dotDistanceY / this.correctAmount);
	}

	for (i = 1; i < this.dotGroup.length; i++) {
		var dots = this.dotGroup.children[i];
		dots.x = this.dotGroup.children[i - 1].x + (this.dotDistanceX / this.correctAmount);
		dots.y = this.dotGroup.children[i - 1].y + (this.dotDistanceY / this.correctAmount);
	}
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                               Map functions                               */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
PartyGiftGame.prototype.mapAgain = function () {

	var i;

	var t = new TimelineMax();
	if (this.mapGroup.scale.x < 0.051 && this.glass.alpha > 0.29) {

		t.addCallback(this.disable, null, [true], this);

		this.gameGroup.bringToTop(this.mapGroup);

		if (this.pressedTile === -1) {
			this.map.a.x = 120;
			this.map.a.y = 650;

		} else if (this.pressedTile === 0) {
			this.markGroup.x = 0;
			this.markGroup.y = 0;
			this.dotGroup.x = 0;
			this.dotGroup.y = 0;

			for (i = 0; i < this.markGroup.length; i++) {
				this.markGroup.children[i].visible = true;
			}

			for (i = 0; i < this.dotGroup.length; i++) {
				this.dotGroup.children[i].visible = true;
			}

			if (this.finishedRounds > 0) {
				this.map.a.x = this.markGroup.children[this.finishedRounds - 1].x;
				this.map.a.y = this.markGroup.children[this.finishedRounds - 1].y;
			} else {
				this.map.a.x = 120;
				this.map.a.y = 650;
			}

		} else if (this.pressedTile <= this.correctAmount) {
			this.markGroup.x = 0;
			this.markGroup.y = 0;
			this.dotGroup.x = 0;
			this.dotGroup.y = 0;

			for (i = 0; i < this.markGroup.length; i++) {
				this.markGroup.children[i].visible = true;
			}

			for (i = 0; i < this.dotGroup.length; i++) {
				this.dotGroup.children[i].visible = true;
			}

			this.map.a.x = this.dotGroup.children[this.pressedTile - 1].x;
			this.map.a.y = this.dotGroup.children[this.pressedTile - 1].y;

		} else if (this.pressedTile > this.correctAmount) {
			var diff = this.pressedTile - this.correctAmount;

			for (i = 0; i < this.markGroup.length; i++) {
				this.markGroup.children[i].visible = false;
			}

			this.markGroup.x -= this.dotDistanceX;
			this.markGroup.y -= this.dotDistanceY;
			this.markGroup.children[this.finishedRounds].visible = true;

			for (i = 0; i < this.dotGroup.length; i++) {
				this.dotGroup.children[i].visible = false;
			}
			this.dotGroup.x -= this.dotDistanceX / this.correctAmount;
			this.dotGroup.y -= this.dotDistanceY / this.correctAmount;

			for (i = 0; i < diff; i++) {
				this.dotGroup.children[i].visible = true;
			}

			this.map.a.x = this.dotGroup.children[diff - 1].x;
			this.map.a.y = this.dotGroup.children[diff - 1].y;
		}

		t.addLabel('scale');

		t.add(new TweenMax(this.mapGroup.scale, 2, {x: 1, y: 1, ease: Power1.easeIn}), 'scale');
		t.to(this.mapGroup, 2, {x: - this.gameGroup.x, y:0, ease: Power1.easeIn}, 'scale');

		if (this.pressedTile < this.correctAmount) {
			t.addSound(this.birthday.speech, this.birthday, 'moreSteps', '+=0.5');
		} else if (this.pressedTile > this.correctAmount) {
			t.addSound(this.birthday.speech, this.birthday, 'tooManySteps', '+=0.5');
		}

		t.addCallback(this.disable, '+=0.5', [false], this);

		if (this.thing) {
			t.addCallback(this.thing.destroy, null, null, this.thing);
		}

		t.addCallback(this.mapDown, '+=5', null, this);

	} else {
		t.addCallback(this.mapDown, null, null, this);
	}
};

PartyGiftGame.prototype.mapDown = function () {
	var t = new TimelineMax();
	if (this.mapGroup.scale.x === 1) {
		t.addCallback(this.disable, null, [true], this);

		t.addLabel('scaleDown');
		t.add(new TweenMax(this.mapGroup.scale, 2, {x: 0.05, y: 0.05, ease: Power1.easeIn}), 'scaleDown');
		t.to(this.mapGroup, 2, {x: this.birthday.x + 68, y: this.birthday.y + 23, ease: Power1.easeIn}, 'scaleDown');

		t.addCallback(function () {
			this.gameGroup.bringToTop(this.birthday);
			this.gameGroup.bringToTop(this.mapGroup);
		}, null, null, this);

		t.addCallback(this.disable, null, [false], this);
	}
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                             Troll functions                               */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
PartyGiftGame.prototype.trollStart = function () {
	this.birthday.eyesFollowObject(this.glass);
	this.disable(true);

	var t = new TimelineMax();
	t.addSound(this.birthday.speech, this.birthday, 'isItHere');
	t.add(this.troll.appear('top', this.glass.x + this.gameGroup.x, this.glass.y - 36, this.gameGroup.x));

	if (this.pressedTile < this.correctAmount) {
		t.addCallback(this.findRandom, null, null, this);
	} else if (this.pressedTile > this.correctAmount) {
		t.addCallback(this.findRandom, null, null, this);
	} else if (this.pressedTile === this.correctAmount) {
		t.addCallback(this.findGift, null, null, this);
	}
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                             Search functions                               */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
PartyGiftGame.prototype.findRandom = function () {
	var things = ['treasure8', 'treasure11'];

	var name = this.game.rnd.pick(things);
	this.thing = this.gameGroup.create(this.glass.x + 10, this.glass.y - 36, 'partyGift', name);
	this.thing.scale.set(0.1);
	this.thing.anchor.set(0.5);
	this.thing.alpha = 0;

	var t = new TimelineMax();
	t.addLabel('find');
	t.addSound(this.sfx, null, 'pop');
	t.add(new TweenMax(this.thing, 0.1, {alpha:1}), 'find');
	t.add(new TweenMax(this.thing.scale, 1, {x: 1.1, y: 1.1, ease: Power1.easeIn}));
	t.addSound(this.troll.speech, this.troll, 'oops' + this.rnd.integerInRange(1, 2));
	t.addCallback(function () {
		this.birthday.eyesStopFollow();
	}, null, null, this);
	t.addSound(this.birthday.speech, this.birthday, 'lookMap', '+=0.3');
	t.addCallback(this.mapAgain, '+=0.6', null, this);
};

PartyGiftGame.prototype.findGift = function () {
	this.finishedRounds = this.finishedRounds + 1;

	var gift = this.gameGroup.create(this.glass.x + 10, this.glass.y - 36, 'partyGift', this.gifts[this.finishedRounds - 1]);
	gift.scale.set(0.1);
	gift.anchor.set(0.5);
	gift.alpha = 0;

	var t = new TimelineMax();
	t.addLabel('find');
	t.addSound(this.sfx, null, 'chestUnlock');
	t.add(new TweenMax(gift, 0.1, {alpha:1}), 'find');
	t.add(new TweenMax(gift.scale, 1, {x: 1, y: 1, ease: Power1.easeIn}));
	t.addSound(this.birthday.speech, this.birthday, 'yesGift');

	t.addCallback(function () {
		this.birthday.eyesStopFollow();
	}, null, null, this);

	if (this.finishedRounds === 1) {
		t.to(gift, 1, {x: this.giftGroup.children[0].world.x - this.gameGroup.x, y: this.giftGroup.children[0].world.y, ease: Power1.easeIn});
		t.add(new TweenMax(this.giftGroup.children[0], 0.8, {alpha:1}));
	} else if (this.finishedRounds === 2) {
		t.to(gift, 1, {x: this.giftGroup.children[1].world.x - this.gameGroup.x, y: this.giftGroup.children[1].world.y, ease: Power1.easeIn});
		t.add(new TweenMax(this.giftGroup.children[1], 0.8, {alpha:1}));
	} else if (this.finishedRounds === 3) {
		t.to(gift, 1, {x: this.giftGroup.children[2].world.x - this.gameGroup.x, y: this.giftGroup.children[2].world.y, ease: Power1.easeIn});
		t.add(new TweenMax(this.giftGroup.children[2], 0.8, {alpha:1}));
	} else if (this.finishedRounds === 4) {
		t.to(gift, 1, {x: this.giftGroup.children[3].world.x - this.gameGroup.x, y: this.giftGroup.children[3].world.y, ease: Power1.easeIn});
		t.add(new TweenMax(this.giftGroup.children[3], 0.8, {alpha:1}));
	} else if (this.finishedRounds === 5) {
		t.to(gift, 1, {x: this.giftGroup.children[4].world.x - this.gameGroup.x, y: this.giftGroup.children[4].world.y, ease: Power1.easeIn});
		t.add(new TweenMax(this.giftGroup.children[4], 0.8, {alpha:1}));
	}

	t.addCallback(gift.destroy, null, null, gift);
	t.addCallback(this.destroyRound, null, null, this);
	t.addCallback(this.nextRound, '+=1.5', null, this);
};

PartyGiftGame.prototype.destroyRound = function () {
	var t = new TimelineMax();
	t.addLabel('fadeOut');
	t.add(new TweenMax(this.tileGroup, 1, {alpha:0}), 'fadeOut');
	t.add(new TweenMax(this.glass, 1, {alpha:0}), 'fadeOut');

	t.addCallback(this.tileGroup.destroy, null, null, this.tileGroup);
	t.addCallback(this.glass.destroy, null, null, this.glass);
	t.addCallback(this.dotGroup.destroy, null, null, this.dotGroup);

	t.addCallback(function () {
		this.pressedTile = 0;
	}, null, null, this);
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                 Overshadowing Subgame mode functions                      */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
PartyGiftGame.prototype.modeIntro = function () {
	var t = new TimelineMax();
	t.add(this.birthday.wave(2, -1));
	t.addSound(this.birthday.speech, this.birthday, 'hi', 0);
	t.addSound(this.birthday.speech, this.birthday, 'niceParty', '+=0.3');
	t.addSound(this.helper1.speech, this.helper1, 'haveGifts', '+=1');
	t.addSound(this.troll.speech, this.troll, 'laugh');
	t.addSound(this.birthday.speech, this.birthday, 'helpFindGifts', '+=0.5');
	t.add(new TweenMax(this.gladeIntro, 2, { alpha: 0 }), '+=3');

	t.addCallback(function () {
		this.birthday.scale.set(0.2);
		this.birthday.x = -500;
		this.birthday.y = 450;
		this.gameGroup.add(this.birthday);

		this.mapGroup.x = this.birthday.x + 65;
		this.mapGroup.y = this.birthday.y + 23;
		this.gameGroup.bringToTop(this.mapGroup);

		this.troll.visible = false;
		this.troll.scale.set(0.22);
		this.gameGroup.add(this.troll);
	}, null, null, this);

	t.addLabel('appear');
	t.add(this.birthday.move({ x: 250, ease: Power0.easeNone }, 2), 'appear');
	t.to(this.mapGroup, 2, { x: 250 + 65, ease: Power0.easeNone }, 'appear');
	t.addSound(this.birthday.speech, this.birthday, 'shouldBeHere');
	t.addSound(this.birthday.speech, this.birthday, 'lookMap', '+=0.5');
	t.addCallback(this.nextRound, null, null, this);
};

PartyGiftGame.prototype.modePlayerDo = function () {
	var t = new TimelineMax();

	var i;
	if (this.finishedRounds < 5) {

		this.generateRound();
		this.createTiles();
		this.createGlass();

		if (this.finishedRounds > 0) {
			t.addSound(this.birthday.speech, this.birthday, 'nextGift');

			this.markGroup.children[this.finishedRounds - 1].frameName = this.gifts[this.finishedRounds - 1];
			this.map.a.x = this.markGroup.children[this.finishedRounds - 1].x;
			this.map.a.y = this.markGroup.children[this.finishedRounds - 1].y;
		}

		this.createMapDots();

		t.addCallback(function () {
			this.markGroup.x = 0;
			this.markGroup.y = 0;
			this.dotGroup.x = 0;
			this.dotGroup.y = 0;

			for (i = 0; i < this.markGroup.length; i++) {
				this.markGroup.children[i].visible = true;
			}

			for (i = 0; i < this.dotGroup.length; i++) {
				this.dotGroup.children[i].visible = true;
			}
		}, null, null, this);

		t.addLabel('scale', '+=2');

		t.add(new TweenMax(this.mapGroup.scale, 2, {x: 1, y: 1, ease: Power1.easeIn}), 'scale');
		t.to(this.mapGroup, 2, {x: - this.gameGroup.x, y:0, ease: Power1.easeIn}, 'scale');

		t.addCallback(function () {
			this.gameGroup.bringToTop(this.mapGroup);
		}, null, null, this);

		if (this.finishedRounds === 0) {
			t.add(new TweenMax(this.map.a, 1, {alpha:1}), '+=0.3');

			for (i = 0; i < this.markGroup.length; i++) {
				t.add(new TweenMax(this.markGroup.children[i], 0.6, {alpha:1}));
			}

			t.addLabel('fade', '+=0.5');
			t.addSound(this.birthday.speech, this.birthday, 'giftAtCross', 'fade');
			for (i = 0; i < this.markGroup.length; i++) {
				t.add(new TweenMax(this.markGroup.children[i], 1, {alpha:0.2}), 'fade');
			}
		}

		t.add(new TweenMax(this.markGroup.children[this.finishedRounds], 1, {alpha:1}));

		for (i = 0; i < this.dotGroup.length; i++) {
			t.add(new TweenMax(this.dotGroup.children[i], 0.3, {alpha:1}));
		}

		t.addSound(this.birthday.speech, this.birthday, 'howManySteps', '+=0.3');
		t.addSound(this.birthday.speech, this.birthday, 'rememberSteps');
		t.addCallback(this.disable, '+=0.5', [false], this);

		t.addCallback(function () {
			this.gameGroup.x = 0;
			this.mapGroup.x = 0;
			this.giftGroup.x = 400;
			this.birthday.x = 250;
			this.birthday.y = 450;
		}, null, null, this);

		t.addCallback(this.mapDown,'+=5', null, this);

		if (this.finishedRounds === 0) {
			t.addLabel('gifts');
			for (i = 0; i < this.giftGroup.length; i++) {
				t.add(new TweenMax(this.giftGroup.children[i], 0.5, {alpha:0.3}), 'gifts');
			}
		}

		t.add(new TweenMax(this.tiles[0].tile, 0.5, {alpha:0.2}));
		t.add(new TweenMax(this.tiles[1].tile, 0.5, {alpha:0.2}));

		if (this.finishedRounds < 2) {
			t.addSound(this.birthday.speech, this.birthday, 'pushButton');
		}

		t.add(new TweenMax(this.glass, 1, {alpha:0.3}));

		if (this.finishedRounds < 2) {
			t.addSound(this.birthday.speech, this.birthday, 'pushGlass', '+=1.1');
		}

		t.addCallback(this.disable, null, [false], this);

	} else if (this.finishedRounds === 5) {
		t.addCallback(this.modeOutro, null, null, this);
	}
};

PartyGiftGame.prototype.modeOutro = function () {
	var t = new TimelineMax();
	t.addSound(this.birthday.speech, this.birthday, 'wasAll');
	t.add(this.birthday.move({ x:-500, ease: Power0.easeNone}, 5));
	t.add(this.troll.water(300 - this.gameGroup.x, this));

	t.addCallback(function () {
		this.gladeIntro.parent.bringToTop(this.gladeIntro);
		this.pgifts.visible = true;

		this.birthday.x = 400;
		this.birthday.y = 610;
		this.birthday.scale.set(0.17);
		this.gladeIntro.add(this.birthday);
		this.gladeIntro.bringToTop(this.hat);
	}, null, null, this);
	t.add(new TweenMax(this.gladeIntro, 2, { alpha:1 }));

	t.addSound(this.birthday.speech, this.birthday, 'openGifts', '+=0.2');
	t.addSound(this.birthday.speech, this.birthday, 'thanksForParty', '+=0.5');
	t.addCallback(this.endGame, '+=3', null, this);
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                           Create tile object                              */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
Tile.prototype = Object.create(Phaser.Group.prototype);
Tile.prototype.constructor = Tile;
function Tile (game, x, y) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	this.x = x;
	this.y = y;

	var tl = this.game.add.bitmapData(120, 120);
	tl.ctx.beginPath();
	tl.ctx.roundRect(0, 0, tl.width, tl.height, 10).fill();
	tl.ctx.fillStyle = '#ffffff';
	tl.ctx.fill();

	this.tile = this.game.add.sprite(0, 0, tl);
	this.add(this.tile);
	this.tile.anchor.set(0.5);
	this.tile.inputEnabled = true;
	this.tile.alpha = 0;
}
