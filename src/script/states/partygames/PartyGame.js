var Subgame = require('../Subgame.js');
var LANG = require('../../language.js');
var Hedgehog = require('../../agent/Hedgehog.js');
var Cover = require('../../objects/Cover.js');

module.exports = PartyGame;

PartyGame.prototype = Object.create(Subgame.prototype);
PartyGame.prototype.constructor = PartyGame;
function PartyGame () {
	Subgame.call(this); // Call parent constructor.
}

PartyGame.prototype.init = function(options) {

	options = options || {};

	if (!this.game.player.agent) {
		console.log('Setting agent to: ' + Hedgehog.prototype.id);
		this.game.player.agent = Hedgehog;
		this.load.audio('hedgehogSpeech', LANG.SPEECH.AGENT.speech);
		this.load.atlasJSONHash('hedgehog', 'img/agent/hedgehog/atlas.png', 'img/agent/hedgehog/atlas.json');
	}

	Subgame.prototype.init.call(this, options);

	this.difficulty = options.difficulty || 9;
	
};

PartyGame.prototype.pos = {
	tree: {
		x: 640, y: 15, center: 140,
		},

	tree2: {
		x: 240, y: 15, center: 140,
		}

	
};


PartyGame.prototype.preload = function () {
	this.load.audio('entryMusic', ['audio/music.m4a', 'audio/music.ogg', 'audio/music.mp3']);
	this.load.atlasJSONHash('balloon', 'img/subgames/balloon/atlas.png', 'img/subgames/balloon/atlas.json');
	this.load.atlasJSONHash(Hedgehog.prototype.id, 'img/agent/hedgehog/atlas.png', 'img/agent/hedgehog/atlas.json');
	this.load.atlasJSONHash('garden', 'img/garden/atlas.png', 'img/garden/atlas.json');
	this.load.audio(Hedgehog.prototype.id + 'Speech', LANG.SPEECH.hedgehog.speech);
	this.load.atlasJSONHash('birdhero', 'img/subgames/birdhero/atlas.png', 'img/subgames/birdhero/atlas.json');
};


PartyGame.prototype.create = function () {

	this.gladeIntro = this.add.group ();

	this.bg = this.gladeIntro.create(0, 0, 'garden', 'bg');

	this.bg.inputEnabled = true;

	this.anchor = this.gladeIntro.create(400, 400, 'balloon', 'anchor');

	this.anchor.inputEnabled = true;

    this.anchor.input.enableDrag(true);



    this.physics.startSystem(Phaser.Physics.ARCADE);



 	var disabler = new Cover(this.game, '#ffffff', 0);
	this.world.add(disabler);
	this.disable = function (value) {
		disabler.visible = value;
	};

	this.run = function () {
		this.disable(false);
		this.state.onUpdateCallback = function () {};
	};

	

	moveOnClick.call(this);


	this.crown = this.gladeIntro.create(this.pos.tree.x-60, this.pos.tree.y-25, 'birdhero', 'crown');
	this.tree = this.gladeIntro.create(this.pos.tree.x, this.pos.tree.y, 'birdhero', 'bole');
	this.tree.scale.set(0.5);
	this.crown.scale.set(0.5);

	this.crown2 = this.gladeIntro.create(this.pos.tree2.x-60, this.pos.tree2.y-25, 'birdhero', 'crown');
	this.tree2 = this.gladeIntro.create(this.pos.tree2.x, this.pos.tree2.y, 'birdhero', 'bole');
	this.tree2.scale.set(0.5);
	this.crown2.scale.set(0.5);

	

};


function moveOnClick() {

	this.bg.events.onInputDown.add(function () {
		var t = new TimelineMax();
	 	t.add(this.h.move({
	 		x:this.input.activePointer.x, 
	 		y:this.input.activePointer.y
	 	}, 2));
	 }, this); 
	

}





	   
function particleBurst() {
	var emitter = this.add.emitter(0, 0, 100);

    emitter.makeParticles('balloon', 'b1');
    emitter.gravity = 200;

    this.h.body.events.onInputDown.add(function () {
    	emitter.x = this.h.x; 
    	emitter.y = this.h.y; 
    	emitter.start(true, 2000, null, 30);
    }, this);

}




PartyGame.prototype.partyIntro = function (t) {


	this.h = new Hedgehog (this.game);
    this.gladeIntro.add(this.h);
    this.h.scale.set(0.2);
    this.h.x = 300;
	this.h.y = 300;

	t.add(this.h.fistPump(2, -1));
	t.addSound(this.h.speech, this.h, 'hello', 0);
	t.addSound(this.h.speech, this.h, 'funTogether');
	t.add(new TweenMax(this.gladeIntro, 2, {alpha:0, delay:1}));


 	particleBurst.call(this);


};

	










