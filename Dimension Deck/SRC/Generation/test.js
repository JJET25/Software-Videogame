import { ROOM_WEIGHTS } from "../Utils/Constants.js";
import SeededRandom from "../Utils/SeededRandom.js";
import RoomTypeAssigner from "./RoomTypeAssigner.js";

const assigner = new RoomTypeAssigner(new SeededRandom(42));

// Prueba básica de distribución
const counts = { combat: 0, chest: 0, shrine: 0, glitch: 0 };
for (let i = 0; i < 20; i++) {
    const type = assigner._weightedRoll(ROOM_WEIGHTS);
    counts[type]++;
}
console.log(counts);
// Deberías ver ~700 combats, ~150 chests, ~100 shrines, ~50 glitches