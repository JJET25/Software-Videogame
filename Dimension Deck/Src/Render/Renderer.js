class Renderer{
    constructor(canvas){
        this.canvas = canvas
        this.ctx = canvas.getContext("2d");
    }

    // Methods
    clear(){ this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height) }
    
    draw(entity){
        this.ctx.fillStyle = "SkyBlue";
        this.ctx.fillRect(entity.position.x, entity.position.y, entity.width, entity.height);
    }

    render(game){
        this.clear();
        this.draw(game.player);
    }
}