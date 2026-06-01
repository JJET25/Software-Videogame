export const randInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const randFloat = (min = 0, max = 1) =>
  Math.random() * (max - min) + min;
