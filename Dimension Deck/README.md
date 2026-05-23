# Dimension Deck

A roguelite card battler played in the browser. You fight through procedurally generated rooms across two dimensions, collecting cards that you activate in real time during combat. Each run is different.

## Gameplay

Move your character with WASD. Aim with the mouse. Click to activate the selected card. Press 1 through 5 to switch between your active card slots. Use Space to dash.

Cards come in two types. Active cards are manually triggered on click and have a cooldown. Automatic cards fire on their own when specific events happen, such as landing a hit, killing an enemy, taking damage, or dashing.

Cards also come in four rarities: common, rare, epic, and legendary. Rarer cards have stronger effects but longer cooldowns.

Your starting deck is Quick Strike, Heal Pulse, and Wood Shield.

## Project Structure

```
Dimension Deck/
  SRC/          game logic (JavaScript modules)
  frontend/     HTML pages, CSS, and non-game JavaScript
  backend/      REST API (TypeScript, Express, MySQL)
  Assets/       sprites and images
  index.html    landing page
```

## Requirements

- Node.js 18 or higher

## Running the game

The game is a static site. You need to serve the files from the `Dimension Deck` folder using an HTTP server.

```
npm start
```

## Notes

- The backend is not required to play. The game runs fully offline with hardcoded card values.
- The `testing` branch connects the frontend to the backend API for cards. The `main` branch uses hardcoded cards only.
- Live reload is supported if you use VS Code with the Live Server extension, pointing the server root at the `Dimension Deck` folder.
