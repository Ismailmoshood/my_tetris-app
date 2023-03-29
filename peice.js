class Piece {  
   constructor(ctx) {
    this.ctx = ctx;
    this.init();
   }
   selectRandom(num) {
    return Math.floor(Math.random() * num);
  }
   init() { 
    this.x = 0;
    this.y = 0;
    this.typeId = this.selectRandom(SHAPES.length);
    this.color = COLORS[this.typeId];
    this.shape = SHAPES[this.typeId];
  }

    move(p) {
        this.x = p.x;
        this.y = p.y;
      this.shape = p.shape;
    }
     draw(j = 0) {
      this.shape.forEach((line, y) => {
        line.forEach((content, x) => {
          if (content > 0) {
            this.ctx.fillStyle = this.color;
            this.ctx.fillRect(this.x + x, this.y + y, 1, 1);
            if(j > 0){
              this.ctx.fillStyle = 'ghostwhite';
              this.ctx.fillRect(this.x + x, y + j, 1, 1);
            }
          }
        });
      });
    }
 }

 