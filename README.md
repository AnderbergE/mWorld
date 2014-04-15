# Magical Garden
Magical Garden is a game for understanding numbers, aka number sense.
The game is built with the game engine [Phaser](http://phaser.io/).

## How to build:
* Clone this repository to your computer.
* Open the repository in a terminal.
* Run: grunt (If you do not have grunt, go here: [Grunt](http://gruntjs.com/))
* Play the game at http://localhost:9000/index.html

Grunt generates the build catalogue in your repository and also creates a local server.
As long as grunt is running the server will be active. If you make changes in the repository, the build will be updated; just hit update in your browser. Some coding standards are enforced using jshint, keep an eye on the terminal when making changes.

## More documentation
You can find more documentation in the source code.
If you plan on making a new minigame, check out src/js/states/Minigame.js