export default class Dimension{
    constructor(config){
        this.id = config.id;
        this.name = config.name;
        this.roomWeights = config.roomWeights;
        this.enemyPool = config.enemyPool;
        this.tileSetId = config.tileSetId; 
        this.miniBoss = config.miniBoss ?? null;
        this.finalBoss = config.finalBoss ?? null;
        //this.musicId
    }
}