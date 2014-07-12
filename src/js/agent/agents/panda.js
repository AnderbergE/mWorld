/* The panda agent */
Panda.prototype = Object.create(Agent.prototype);
Panda.prototype.constructor = Panda;

Panda.prototype.id = 'panda'; // Reference for LANG files and asset files
Panda.prototype.agentName = LANG.TEXT.pandaName;

function Panda () {
	this.coords = {
		arm: {
			left: { x: -150, y: -20 },
			right: { x: 150, y: -20 }
		},
		leg: {
			left: { x: -130, y: 320 },
			right: { x: 130, y: 320 }
		},
		eye: {
			left: { x: -65, y: -238 },
			right: { x: 65, y: -238 },
			depth: 20,
			maxMove: 9
		},
		mouth: {
			x: 0, y: -142
		}
	};

	Agent.call(this); // Call parent constructor.

	return this;
}