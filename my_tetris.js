//declare constants

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const LEVEL_LINES = 10;
const KEY = {
  ESC: 27,
  SPACE: 32,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  P: 80,
  ZEE: 90,
  G: 71,
  C: 67,
};
Object.freeze(KEY);

const COLORS = ["cyan", "blue", "orange", "yellow", "green", "purple", "red"];
Object.freeze(COLORS);

const SHAPES = [
  [
    [0, 0, 0, 0],
    [2, 2, 2, 2],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  [
    [2, 0, 0],
    [2, 2, 2],
    [0, 0, 0],
  ],
  [
    [0, 0, 2],
    [2, 2, 2],
    [0, 0, 0],
  ],
  [
    [2, 2],
    [2, 2],
  ],
  [
    [0, 2, 2],
    [2, 2, 0],
    [0, 0, 0],
  ],
  [
    [0, 2, 0],
    [2, 2, 2],
    [0, 0, 0],
  ],
  [
    [2, 2, 0],
    [0, 2, 2],
    [0, 0, 0],
  ],
];
Object.freeze(SHAPES);

const POINTS = {
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800,
  SOFT_DROP: 1,
  HARD_DROP: 2,
};
Object.freeze(POINTS);

const LEVEL = {
  0: 800,
  1: 720,
  2: 630,
  3: 550,
  4: 470,
  5: 380,
  6: 300,
  7: 220,
  8: 130,
  9: 100,
  10: 80
};
Object.freeze(LEVEL);

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const canvasNext = document.getElementById("next");
const ctxNext = canvasNext.getContext("2d");
const canvasHold = document.getElementById("hold");
const ctxHold = canvasHold.getContext("2d");

let accountValues = {
  score: 0,
  level: 0,
  lines: 0,
};
function updateAccount(key, value) {
  let element = document.getElementById(key);
  if (element) {
    element.textContent = value;
  }
}

let account = new Proxy(accountValues, {
  set: (target, key, value) => {
    target[key] = value;
    updateAccount(key, value);
    return true;
  },
});

let requestId;
let ghostflag = true;
const moves = {
  [KEY.SPACE]: (p) => ({ ...p, y: p.y + 1 }),
  [KEY.LEFT]: (p) => ({ ...p, x: p.x - 1 }),
  [KEY.RIGHT]: (p) => ({ ...p, x: p.x + 1 }),
  [KEY.DOWN]: (p) => ({ ...p, y: p.y + 1 }),
  [KEY.UP]: (p) => board.rotate(p, "clockwise"),
  [KEY.ZEE]: (p) => board.rotate(p, "ante_clockwise"),
  [KEY.C]: (p) => board.swap(),
};
const ghost = {
  [1]: (p, j) => ({ ...p, y: j }),
};

let board = new Board(ctx, ctxNext, ctxHold);
addEventListener();

function play() {
  resetGame();
  time.start = performance.now();
  // If we have an old game running a game then cancel the old
  if (requestId) {
    cancelAnimationFrame(requestId);
  }

  animate();
}
function addEventListener() {
  document.addEventListener("keydown", (event) => {
    if (event.keyCode === KEY.P) {
      pause();
    }
    if (event.keyCode === KEY.G) {
      switchGhost();
    }
    if (event.keyCode === KEY.ESC) {
      gameOver();
    } else if (moves[event.keyCode]) {
      event.preventDefault();
      // Get new state
      let p = moves[event.keyCode](board.piece);
      if (event.keyCode === KEY.SPACE) {
        // Hard drop
        while (board.valid(p)) {
          account.score += POINTS.HARD_DROP;
          board.piece.move(p);
          p = moves[KEY.DOWN](board.piece);
        }
      } else if (board.valid(p)) {
        board.piece.move(p);
        if (event.keyCode === KEY.DOWN) {
          account.score += POINTS.SOFT_DROP;
        }
      }
    }
  });
}
function resetGame() {
  account.score = 0;
  account.lines = 0;
  account.level = 0;
  board.reset();
  time = { start: 0, elapsed: 0, level: LEVEL[account.level] };
}

function animate(now = 0) {
  // Update elapsed time.
  time.elapsed = now - time.start;

  // If elapsed time has passed time for current level
  if (time.elapsed > time.level) {
    // Restart counting from now
    time.start = now;
    if (!board.drop()) {
      gameOver();
      return;
    }
  }

  // Clear board before drawing new state.
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  board.draw(getGhostPos());
  requestId = requestAnimationFrame(animate);
}
function gameOver() {
  cancelAnimationFrame(requestId);
  ctx.fillStyle = "black";
  ctx.fillRect(1, 3, 8, 1.2);
  ctx.font = "1px Arial";
  ctx.fillStyle = "red";
  ctx.fillText("GAME OVER", 1.8, 4);
}
function switchGhost() {
  if (ghostflag === true) {
    ghostflag = false;
  } else {
    ghostflag = true;
  }
}
function pause() {
  if (!requestId) {
    animate();
    return;
  }

  cancelAnimationFrame(requestId);
  requestId = null;

  ctx.fillStyle = "black";
  ctx.fillRect(1, 3, 8, 1.2);
  ctx.font = "1px Arial";
  ctx.fillStyle = "yellow";
  ctx.fillText("PAUSED", 3, 4);
}
function getGhostPos() {
  if (ghostflag === true) {
    for (var j = 20; j > 0; j--) {
      let p = ghost[1](board.piece, j);
      if (board.valid(p)) {
        return j;
      }
    }
  } else {
    return 0;
  }
}
