import RoomGraph from "./RoomGraph.js";
import RoomNode from "./RoomNode.js"

const graph = new RoomGraph();
const a = new RoomNode("A", 0);
const b = new RoomNode("B", 1);
const c = new RoomNode("C", 1);

graph.addNode(a); graph.addNode(b); graph.addNode(c);
graph.addEdge("A", "B");
graph.addEdge("A", "C");
graph.setStart("A");
graph.setBoss("C");

console.log(graph.getAllNodes());          // ← ¿qué ves?
console.log(graph.isFullyConnected());    // ← ¿true o false?
console.log(graph.allPathsReachBoss());   // ← ¿termina o se cuelga?