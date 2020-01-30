const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const gameHeight = canvas.height - 70;
let game;
let playing = true;
let animation = true;
let sizeX = 35;
let sizeY = 35;
let gravity = 5;
let movement = 0;
let bird = {x: 100, y: 300};
let pipes = [];
let pipeWidth = 50;
let pipeMovement = 10;
let nFrames = 0;
let height;
let gap;
let score = 0;
let highscore = 0;
let flappy = new Image();
flappy.src = 'flappy2.png';
let pipe_down = new Image();
pipe_down.src = 'pipe_down.png';
let pipe_up = new Image();
pipe_up.src = 'pipe_up.png';
let background = new Image();
background.src = 'background.png'

function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawBackground() {
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height + 150);
}

function updatePipes() {
  pipes.forEach(pipe => {
    pipe.x -= pipeMovement;
  });
}

function createPipes() {
  if (everyFrames(30)) {
    let maxHeight = gameHeight - 250;
    let minHeight = gameHeight / 6;
    height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
    let maxGap = 200;
    let minGap = 150;
    gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);
    pipes.push({x: canvas.width, y: 0, height: height, up: true});
    pipes.push({x: canvas.width, y: height + gap, height: gameHeight - height - gap, up: false});
  }
}

function everyFrames(n) {
  return (nFrames % n) == 0;
}

function drawPipes() {
  pipes.forEach(pipe => {
    if (pipe.up) {
      ctx.drawImage(pipe_up, pipe.x, pipe.y, pipeWidth, pipe.height);
    }
    else {
      ctx.drawImage(pipe_down, pipe.x, pipe.y, pipeWidth, pipe.height);
    }
  });
}

function checkHitBorders() {
  return bird.y < 0 || bird.y + sizeY > gameHeight;
}

function checkHit(pipe) {
  let crash;
  const myUp = bird.y;
  const myBot = bird.y + sizeY;
  const myLeft = bird.x;
  const myRight = bird.x + sizeX;
  const pipeUp = pipe.y;
  const pipeBot = pipe.y + pipe.height;
  const pipeLeft = pipe.x;
  const pipeRight = pipe.x + pipeWidth;
  crash = true;
  if ((myUp > pipeBot) || (myBot < pipeUp) || (myLeft > pipeRight) || (myRight < pipeLeft)) {
    crash = false;
  }
  return crash;
}

function birdThroughPipe() {
  pipes.forEach(pipe => {
    if (bird.x === pipe.x + pipeWidth) {
      score += 1 / 2;
      if (highscore < score) {
        highscore = score;
      }
    }
  });
}

function checkHitForAllPipes() {
  for (let i = 0; i < pipes.length; i++) {
    if (checkHit(pipes[i])) {
        return true;
    }
  }
}

function handleBirdUpdate(e) {
  const upKey = 38;
  if (e.keyCode === upKey && playing) {
      movement = 20;
  }
}

function removeUpdate() {
  movement = 0;
}

function updateBird() {
  bird.y += gravity;
  bird.y -= movement;
}

function drawBird() {
  ctx.drawImage(flappy, bird.x, bird.y, sizeX, sizeY);
}

function drawScore() {
  ctx.font = "20px Arial";
  ctx.fillStyle = 'black';
  ctx.fillText(`Score: ${score}`, canvas.width - 120, 50);
}

function drawHighscore() {
  ctx.font = "15px Arial";
  ctx.fillStyle = 'black';
  ctx.fillText(`Highscore: ${highscore}`, canvas.width - 120, 20);
}

function restart() {
  movement = 0;
  bird = {x: 100, y: 300};
  pipes = [];
  nFrames = 0;
  height;
  gap;
  score = 0;
  playing = true;
  animation = true;
}

function drawRestartText() {
  ctx.font = "20px Arial";
  ctx.fillStyle = 'black';
  ctx.fillText("Press R to restart", canvas.width / 2 - 80, canvas.height / 2);
}

function handlePossibleRestart(e) {
  const kKey = 82;
  if(e.keyCode == kKey) {
    if (!animation) {
      restart();
      game = setInterval(runGame, 30);
    }
  }
}

function logicWhenBirdLives() {
  clear();
  drawBackground();
  createPipes();
  updatePipes();
  drawPipes();
  updateBird();
  drawBird();
  birdThroughPipe();
  drawScore();
  drawHighscore();
  nFrames += 1;
}

function logicWhenBirdHits() {
  clear();
  drawBackground();
  drawPipes();
  updateBird();
  drawBird();
  drawScore();
  drawHighscore();
}

// function runGame() {
//   if (checkHitBorders() || checkHitForAllPipes()) {
//     playing = false;
//   }
//   if (playing) {
//     clear();
//     drawBackground();
//     createPipes();
//     updatePipes();
//     drawPipes();
//     updateBird();
//     drawBird();
//     birdThroughPipe();
//     drawScore();
//     drawHighscore();
//     nFrames += 1;
//   } else {
//     drawRestartText();
//     clearInterval(game);
//   }

// }

function runGame() {
  if (checkHitBorders() || checkHitForAllPipes()) {
    playing = false;
  }
  if (playing) {
    logicWhenBirdLives();
  } else {
    logicWhenBirdHits();
    if (checkHitBorders()) {
      drawRestartText();
      clearInterval(game);
      animation = false;
    }
  }

}

function gameplay() {
  game = setInterval(runGame, 30);
}

gameplay();

window.addEventListener('keydown', handleBirdUpdate);
window.addEventListener('keyup', removeUpdate);
window.addEventListener('keydown', handlePossibleRestart);
