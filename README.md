# Dimension Deck

A roguelite card battler played in the browser. You fight through procedurally generated rooms across two dimensions, collecting cards that you activate in real time during combat. Each run is different.

## Gameplay

Move your character with WASD. Aim with the mouse. Click to activate the selected card. Press 1 through 5 to switch between your active card slots. Use Space to dash.

Cards come in two types. Active cards are manually triggered on click and have a cooldown. Automatic cards fire on their own when specific events happen, such as landing a hit, killing an enemy, taking damage, or dashing.

Cards also come in four rarities: common, rare, epic, and legendary. Rarer cards have stronger effects but longer cooldowns.

The starting deck is Quick Strike, Heal Pulse, and Wood Shield.

## Project Structure
Dimension Deck/
  SRC/          game logic (JavaScript modules)
  frontend/     HTML pages, CSS, and non-game JavaScript
  backend/      REST API (TypeScript, Express, MySQL)
  Assets/       sprites and images
  index.html    landing page

## Requirements

- Node.js 18 or higher

## Node.js installation

Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash

in lieu of restarting the shell
\. "$HOME/.nvm/nvm.sh"

Download and install Node.js:
nvm install 24

Verify the Node.js version:
node -v # Should print "v24.16.0".

Verify npm version:
npm -v # Should print "11.13.0".


## Running the game
cd Dimension Deck
npm start
