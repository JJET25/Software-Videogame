export default class GameLoop{
    constructor(game){
        this.game = game;
        this.lastTime = 0;
    }

    // Methods
    start(){ requestAnimationFrame(this.loop.bind(this)); }

    loop(time){
        const deltaTime = (time - this.lastTime) / 1000;
        this.lastTime = time;

        this.game.update(deltaTime);
        this.game.render();

        requestAnimationFrame(this.loop.bind(this));
    }
}