# Magical Garden
Magical Garden is a game for understanding numbers, aka number sense.<br>
The game is built with the game engine [Phaser](http://phaser.io/).
Animations are created using [GSAP/TweenMax](http://greensock.com/gsap).

## How to build:
* Clone/Fork this repository to your computer.
* Open the repository in a terminal.
* Run: 'npm install'. (This requires node, which you can get here: [Node](http://nodejs.org/))
* If you do not have [Gulp](http://gulpjs.com/) installed globally on your computer, run 'npm install --global gulp'
* Run: 'gulp'
* Play the game at http://localhost:9000/index.html

Gulp generates the build catalogue in your repository and also starts a local server.
As long as gulp is running the server will be active. If you make changes in the repository, the build will be updated; just hit update in your browser. Some coding standards are enforced using jshint, keep an eye on the terminal when making changes.

## Documentation
UPDATED: 2015-01-26

The code uses [Browserify](http://browserify.org/) to handle dependencies between files. It will bundle them together as one file. The script file is created with source maps, meaning that in browser debuggers there will be e 'source' folder that has the same folder structure as the folder 'src'.

```
You can always find much more documentation in the source code, check it out!

CORE FILES (./src/script):
backend.js -  All backend communication is executed in this file, just call the proper function.
game.js -     Sets up and boots the game. Adds 'game' to globals, but try not to use that one.
global.js -   Holds most globals in the game. Such as for events, states, subgames and font.
language.js - Holds language operations and default language.
logger.js -   Takes care of results logging, sends it via backend when relevant. Relies on events to work.
player.js -   Handles the player related data, such as agent type and water amount.
pubsub.js -   Event system, publication-subscription kind.
utils.js -    Common functions and object extensions.

SUBGAME/STATE FILES (folder states and states/subgames):
BootStates.js - First state (called from game.js), sets up common game objects and other game related assets.
SuperState.js - Super state, makes sure that audio files are decoded before starting and cleans the state when shutting down.
Subgame.js -    Super class for subgames, holds the core functions. See more documentation in the file.
NumberGame.js - Holds shared functions for games that has a single number as target. See more documentation in the file.
ChooseScenarioState.js - Used for easy access to the games and their properties. Should only be available to supervisors.
- The rest of the files are self-explanatory.
- First time procedure:  BootState -> EntryState -> AgentSetupState -> GardenState -> Subgame + [A subgame] -> (back to GardenState).
- Normal game procedure: BootState -> EntryState -> GardenState -> Subgame + [A subgame] -> (back to GardenState).

AGENTS (folder agent):
agent.js -     Super class for agents, holds shared agent functions, such as wave. Extends character.
character.js - Holds functions shared by characters, such as move or say.
- In the folder you find the different agents and their specific properties.

OBJECTS (folder objects):
Cover.js -    Cover the screen with an object. Great for trapping player inputs.
Menu.js -     The main menu of the game. This should be used in all states except the first.
Modal.js -    A modal for giving the user information, such as 'Connection lost'.
Slider.js -   A button that slides along an axis.
WaterCan.js - A water can that can be filled with water.
- In the folder representations you find the different representations that can be used. Can be used directly or via the buttons.

BUTTONS (folder objects/buttons):
ButtonPanel.js -   Sets up a panel full of buttons, has a lot of different options.
GeneralButton.js - Super class for all button objects. Has a lot of options, see more documentation in the file.
NumberButton.js -  A button with a number on it. Among other you can supply number and representation. Extends GeneralButton.
TextButton.js   -  A button with text on it. Extends GeneralButton.
SpriteButton.js -  A button with a sprite on it. Extends GeneralButton.
```


Creating a new subgame?<br>
Start by reading the documentation in: src/js/states/subgames/Subgame.js and src/js/states/subgames/NumberGame.js.<br>
Be inspired by BeeFlightGame.js.<br>
You need to add your subgame/state in game.js.<br>
(If you want easy access to the subgame, modify ChooseScenarioState.js).


## License
Source code is Copyright (c) 2014-2015 Lund University Cognitive Science department. See the LICENSE file for license rights and limitations (MIT).<br>
<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" /></a><br />Images and audio is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.
