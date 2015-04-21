module.exports = AStar;

AStar.heuristics = {
	manhattan: function(x1, y1, x2, y2) {
		return  Math.abs(x1 - x2) + Math.abs(y1 - y2);
	}
};

// Inspired by: https://github.com/bgrins/javascript-astar
// Inspired by: https://github.com/prettymuchbryce/easystarjs
function AStar (grid) {	
	this.grid = grid;
	this.cost = 10;
}

AStar.prototype._scoreFunction = function (node) {
	return node.f;
};

AStar.prototype.pathTo = function (node) {
	var curr = node;
	var path = [];
	while(curr.parent) {
		path.push(curr);
		curr = curr.parent;
	}
	path.push(curr);
	path = path.reverse();

	// Compress path
	for (var i = 1; i < path.length - 1;) {
		if (path[i].x - path[i - 1].x < 0 &&
			path[i + 1].x - path[i].x < 0 ||
			path[i].x - path[i - 1].x > 0 &&
			path[i + 1].x - path[i].x > 0 ||
			path[i].y - path[i - 1].y < 0 &&
			path[i + 1].y - path[i].y < 0 ||
			path[i].y - path[i - 1].y > 0 &&
			path[i + 1].y - path[i].y > 0) {
			path.splice(i, 1);
		} else {
			i++;
		}
	}

	return path;
};

AStar.prototype.getNode = function (x, y, parent) {
	var index = x + '_' + y;
	var n = this._nodes[index];
	if (n) {
		return n;
	} else if (y >= 0 && y < this.grid.length && x >= 0 && x < this.grid[y].length) {
		n = new Node(x, y, this.cost, parent, this.heuristic(x, y, this.endX, this.endY));
		this._nodes[index] = n;
		return n;
	}

	return null;
};

AStar.prototype.getNeighbors = function (node) {
	var ret = [];
	var n;

	// West
	n = this.getNode(node.x - 1, node.y, node);
	if (n) {
		ret.push(n);
	}

	// East
	n = this.getNode(node.x + 1, node.y, node);
	if (n) {
		ret.push(n);
	}

	// North
	n = this.getNode(node.x, node.y - 1, node);
	if (n) {
		ret.push(n);
	}

	// South
	n = this.getNode(node.x, node.y + 1, node);
	if (n) {
		ret.push(n);
	}

	return ret;
};


AStar.prototype.find = function(startX, startY, endX, endY, options) {
	options = options || {};

	// Set values for this search.
	this._nodes = {};
	this.endX = endX;
	this.endY = endY;
	this.heuristic = options.heuristic || AStar.heuristics.manhattan;

	var path = [];

	var start = this.getNode(startX, startY);

	if (!start) {
		return path;
	}

	// Start pathfinding
	var open = new BinaryHeap(this._scoreFunction);
	open.push(start);

	var current, neighbors, neighbor, i, g;
	while (open.size() > 0) {
		current = open.pop();

		if (current.x === endX && current.y === endY) {
			return this.pathTo(current);
		}

		current.closed = true;

		neighbors = this.getNeighbors(current);

		for (i = 0; i < neighbors.length; i++) {
			neighbor = neighbors[i];

			if (neighbor.closed) {
				continue;
			}

			if (neighbor.visited) {
				g = current.g + neighbor.cost;
				if (g < neighbor.g) {
					neighbor.setParent(current);
				}
				open.rescoreElement(neighbor);
			} else {
				neighbor.visited = true;
				open.push(neighbor);
			}
		}
	}

	return [];
};

function Node (x, y, cost, parent, h) {
	this.x = x;
	this.y = y;
	this.cost = cost;
	this.g = cost; // Getting here from start node, aka cost so far.
	this.h = h; // Getting to the end node
	this.setParent(parent);
}

Node.prototype.setParent = function (parent) {
	this.parent = parent;
	if (parent) {
		this.g += parent.g;
	}
	this.f = this.g + this.h; // Current cost.
};

// Inspired by http://eloquentjavascript.net/1st_edition/appendix2.html
function BinaryHeap (scoreFunction){
	this.content = [];
	this.scoreFunction = scoreFunction;
}

BinaryHeap.prototype.push = function (element) {
	// Add the new element to the end of the array.
	this.content.push(element);

	// Allow it to sink down.
	this.sinkDown(this.content.length - 1);
};

BinaryHeap.prototype.pop = function () {
	// Store the first element so we can return it later.
	var result = this.content[0];
	// Get the element at the end of the array.
	var end = this.content.pop();
	// If there are any elements left, put the end element at the
	// start, and let it bubble up.
	if (this.content.length > 0) {
		this.content[0] = end;
		this.bubbleUp(0);
	}
	return result;
};

BinaryHeap.prototype.remove = function (node) {
	var i = this.content.indexOf(node);

	// When it is found, the process seen in 'pop' is repeated
	// to fill up the hole.
	var end = this.content.pop();

	if (i !== this.content.length - 1) {
		this.content[i] = end;

		if (this.scoreFunction(end) < this.scoreFunction(node)) {
			this.sinkDown(i);
		} else {
			this.bubbleUp(i);
		}
	}
};

BinaryHeap.prototype.size = function () {
	return this.content.length;
};

BinaryHeap.prototype.rescoreElement = function (node) {
	this.sinkDown(this.content.indexOf(node));
};

BinaryHeap.prototype.sinkDown = function (n) {
	// Fetch the element that has to be sunk.
	var element = this.content[n];

	// When at 0, an element can not sink any further.
	while (n > 0) {

		// Compute the parent element's index, and fetch it.
		var parentN = ((n + 1) >> 1) - 1,
		parent = this.content[parentN];
		// Swap the elements if the parent is greater.
		if (this.scoreFunction(element) < this.scoreFunction(parent)) {
			this.content[parentN] = element;
			this.content[n] = parent;
			// Update 'n' to continue at the new position.
			n = parentN;
		} else {
			// Found a parent that is less, no need to sink any further.
			break;
		}
	}
};

BinaryHeap.prototype.bubbleUp = function (n) {
	// Look up the target element and its score.
	var length = this.content.length,
	element = this.content[n],
	elemScore = this.scoreFunction(element);

	while (true) {
		// Compute the indices of the child elements.
		var child2N = (n + 1) << 1,
		child1N = child2N - 1;
		// This is used to store the new position of the element, if any.
		var swap = null,
		child1Score;
		// If the first child exists (is inside the array)...
		if (child1N < length) {
			// Look it up and compute its score.
			var child1 = this.content[child1N];
			child1Score = this.scoreFunction(child1);

			// If the score is less than our element's, we need to swap.
			if (child1Score < elemScore) {
				swap = child1N;
			}
		}

		// Do the same checks for the other child.
		if (child2N < length) {
			var child2 = this.content[child2N],
			child2Score = this.scoreFunction(child2);
			if (child2Score < (swap === null ? elemScore : child1Score)) {
				swap = child2N;
			}
		}

		// If the element needs to be moved, swap it, and continue.
		if (swap !== null) {
			this.content[n] = this.content[swap];
			this.content[swap] = element;
			n = swap;
		} else {
			// Otherwise, we are done.
			break;
		}
	}
};