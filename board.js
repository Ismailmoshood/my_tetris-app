class Board {
  constructor(ctx, ctxNext, ctxHold) {
    this.ctx = ctx;
    this.ctxNext = ctxNext;
    this.ctxHold = ctxHold;
    this.init();
    this.inits(this.ctxNext);
    this.inits(this.ctxHold);
  }

  init() {
    // Calculate size of canvas from constants.
    this.ctx.canvas.width = COLS * BLOCK_SIZE;
    this.ctx.canvas.height = ROWS * BLOCK_SIZE;

    // Scale so we don't need to give size on every draw.
    this.ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
  }
  inits(ctx) {
    // Calculate size of canvas from constants.
    ctx.canvas.width = 4 * BLOCK_SIZE;
    ctx.canvas.height = 4 * BLOCK_SIZE;

    // Scale so we don't need to give size on every draw.
    ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
  }
  clearHoldBox() {
    const { width, height } = this.ctxHold.canvas;
    this.ctxHold.clearRect(0, 0, width, height);
    this.ctxHold.piece = false;
  }
 
  reset() {
    this.grid = this.getEmptyBoard();
    this.piece = new Piece(this.ctx);
    this.getNewPiece();
    // this.getHoldPiece();
    this.piece.x = this.typeId === 3 ? 4 : 3;
    this.piece.y = this.typeId === 0 ? -1 : 0;
    this.clearHoldBox();
  }
  getNewPiece() {
    this.next = new Piece(this.ctxNext);
    this.ctxNext.clearRect(
      0,
      0,
      this.ctxNext.canvas.width,
      this.ctxNext.canvas.height
    );
    this.next.draw();
  }
  draw(j) {
    this.piece.draw(j);
    this.drawBoard();
  }
  // Get matrix filled with zeros.
  getEmptyBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  }
  valid(p) {
    return p.shape.every((row, dy) => {
      return row.every((value, dx) => {
        let x = p.x + dx;
        let y = p.y + dy;
        return (
          value === 0 || (this.insideWalls(x, y) && this.notOccupied(x, y))
        );
      });
    });
  }
  insideWalls(x, y) {
    return x >= 0 && x < COLS && y <= ROWS;
    
  }

  notOccupied(x, y) {
    return this.grid[y] && this.grid[y][x] === 0;
  }
  rotate(p, direction) {
    // Clone with JSON for immutability.
    let piece = JSON.parse(JSON.stringify(p));
    // Transpose matrix
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < y; x++) {
        [piece.shape[x][y], piece.shape[y][x]] = [
          piece.shape[y][x],
          piece.shape[x][y],
        ];
      }
    }
    // Reverse the order of the columns.
    if (direction === "clockwise") {
      piece.shape.forEach((row) => row.reverse());
      // rotate.play();
    } else if (direction === "ante_clockwise") {
      piece.shape.reverse();
      // rotate.play();
    }
    return piece;
  }

  drop() {
    let p = moves[KEY.DOWN](this.piece);
    if (this.valid(p)) {
      this.piece.move(p);
    } else {
      this.freeze();
      this.clearLines();
      if (this.piece.y === 0) {
        // Game over
        // gameover.play();
        return false;
      }
      // fall.play();
      this.piece = this.next;
      this.piece.ctx = this.ctx;
      this.piece.y = this.typeId === 0 ? -1 : 0;
      this.piece.x = this.typeId === 3 ? 4 : 3;
      this.getNewPiece();
    }
    return true;
  }
  freeze() {
    this.piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.grid[y + this.piece.y][x + this.piece.x] = value;
        }
      });
    });
  }
  drawBoard() {
    this.grid.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.ctx.fillStyle = "purple";
          this.ctx.fillRect(x, y, 1, 1);
        }
      });
    });
  }
  clearLines() {
    let lines = 0;

    this.grid.forEach((line, y) => {
      if (line.every((value) => value > 0)) {
        lines++;
        this.grid.splice(y, 1);
        this.grid.unshift(Array(COLS).fill(0));
      }
    });

    if (lines > 0) {
      // Calculate points from cleared lines and level.

      account.score += this.getLinesClearedPoints(lines);
      account.lines += lines;

      // If we have reached the lines for next level
      if (account.lines >= LEVEL_LINES) {
        // Goto next level
        account.level++;

        // Remove lines so we start working for the next level
        account.lines -= LEVEL_LINES;

        // Increase speed of game
        time.level = LEVEL[account.level];
      }
    }
  }
  getEmptyGrid() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  }
  getLinesClearedPoints(lines, level) {
    const lineClearPoints =
      lines === 1
        ? POINTS.SINGLE
        : lines === 2
        ? POINTS.DOUBLE
        : lines === 3
        ? POINTS.TRIPLE
        : lines === 4
        ? POINTS.TETRIS
        : 0;

    return (account.level + 1) * lineClearPoints;
  }
  swapPieces() {
    if (!this.ctxHold.piece) {
      // move currentPiece to hold and move nextPiece to board
      this.ctxHold.piece = this.piece;
      this.piece = this.next;
      this.getNewPiece();
    } else {
      // swap current piece with ctxHold.piece
      let temp = this.piece;
      this.piece = this.ctxHold.piece;
      this.ctxHold.piece = temp;
    }
    this.ctxHold.piece.ctx = this.ctxHold;
    this.piece.ctx = this.ctx;
    this.piece.y = this.typeId === 0 ? -1 : 0;
    this.piece.x = this.typeId === 3 ? 4 : 3;
    this.hold = this.ctxHold.piece;
    const { width, height } = this.ctxHold.canvas;
    this.ctxHold.clearRect(0, 0, width, height);
    this.ctxHold.piece.x = 0;
    this.ctxHold.piece.y = 0;
    this.ctxHold.piece.draw();
  }

  swap() {
    // only swap once.
    if (this.piece.swapped) {
      return;
    }
    this.swapPieces();
    this.piece.swapped = true;
    return this.piece;
  }
}
