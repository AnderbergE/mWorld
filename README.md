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

## Known Issues
* The speech and sound effects do not work on any IE version tested.
* Phaser/PIXI/Firefox has a bug with positioning of text. It is set too high.

## Documentation
UPDATED: 2014-09-05

Creating a new subgame?
Start by reading the documentation in: src/js/states/Subgame.js and src/js/states/NumberGame.js.
Be inspired by BirdheroGame.js.
You need to add your subgame/state in game.js.
(If you want easy access to the subgame, modify DebugState.js).

```
You can always find much more documentation in the source code, check it out!

CORE FILES:
_global.js -   Holds most globals in the game. Such as for events, states, subgames and font. Creates global: 'GLOBAL'.
_language.js - Holds language operations and default language. Creates global: 'LANG'.
_pubsub -      Event system, publication-subscription kind. Creates global: 'EventSystem'.
game.js -      Sets up and boots the game. Creates globals: 'game', 'player'.
backend.js -   All backend communication is executed in this file, just call the proper function. Creates global: 'Backend'.
player.js -    Handles the player related data, such as agent type and water amount.
logger.js -    Takes care of results logging, sends it via backend when relevant. Relies on events to work.
utils.js -     Common objects, functions and object extensions.

SUBGAME/STATE FILES (folder states):
Subgame.js -    Super class for subgames, holds the core functions. See more documentation in the file.
NumberGame.js - Holds shared functions for games that has a single number as target. See more documentation in the file.
ChooseScenarioState.js - Used for easy access to the games and their properties. Should only be available to supervisors.
- The rest of the files are self-explanatory.
- First time procedure:  EntryState -> AgentSetupState -> GardenState -> Subgame + [A subgame] -> (back to GardenState).
- Normal game procedure: EntryState -> GardenState -> Subgame + [A subgame] -> (back to GardenState).

AGENTS (folder agent):
character.js - Holds functions shared by characters, such as move or say.
agent.js -     Super class for agents, holds shared agent functions, such as wave. Extends character.
- In the folder agents you find the different agents and their specific properties.

OBJECTS (folder objects):
ButtonPanel.js - Sets up a panel full of buttons, has a lot of different options.
Cover.js -       Cover the screen with an object. Great for trapping player inputs.
Menu.js -        The main menu of the game. This should be used in all states except the first.
Modal.js -       A modal for giving the user information, such as 'Connection lost'.
Slider.js -      A button that slides along an axis.
WaterCan.js -    A water can that can be filled with water.
- In the folder representations you find the different representations that can be used. Can be used directly or via the buttons.

BUTTONS (folder objects/buttons):
GeneralButton.js - Super class for all button objects. Has a lot of options, see more documentation in the file.
NumberButton.js -  A button with a number on it. Among other you can supply number and representation. Extends GeneralButton.
TextButton.js   -  A button with text on it. Extends GeneralButton.
SpriteButton.js -  A button with a sprite on it. Extends GeneralButton.
```