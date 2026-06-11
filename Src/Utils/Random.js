// Random.js — Utility functions for generating random integers and floating-point numbers.

// Returns a random integer between min and max, inclusive.
export const randInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Returns a random float between min and max (defaults to 0 and 1).
export const randFloat = (min = 0, max = 1) =>
  Math.random() * (max - min) + min;
