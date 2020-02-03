// get canvas
const canvas = document.getElementById('canvas');
// get context 2d
const ctx = canvas.getContext('2d');

// load sprite.png
const sprite = new Image();
sprite.src = 'image.png';

// we need to keep track of the number of frames
let frames = 0;

// to rotate the bird, the ctx.rotation requires radians. So we need to convert the degrees to radians
function toRadian(degree) {
  return degree * Math.PI / 180;
}

// draw clear canvas
function drawCanvas(){
  ctx.fillStyle = 'lightblue';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// track the current gamestate
const gameState = {
  current: 0,

  getReady: 0,
  playing: 1,
  gameOver: 2
}

function changeGameState(e) {
  switch (gameState.current) {
    case gameState.getReady:
      gameState.current = gameState.playing;
      break;
    case gameState.playing:
      bird.fly();
      break;
    case gameState.gameOver:
      // only if user clicks on start button will the game start
      if (e.offsetX > startButton.x && e.offsetX < startButton.x + startButton.w && e.offsetY > startButton.y && e.offsetY < startButton.y + startButton.h) {
        pipes.reset();
        score.reset();
        gameState.current = gameState.getReady;
      }
      break;
  }
}

// start button
const startButton = {
  x: 120,
  y: 275,
  w: 80,
  h: 30
}

// add click event listener to switch the gamestate and play the game
canvas.addEventListener('click', changeGameState);

// draw background
const background = {
  sX: 0,
  sY: 0,
  w: 275,
  h: 226,
  x: 0,
  y: canvas.height - 226,
  draw() {
    // draw background twice because the image does not fit the entire canvas
    ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
    ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
  }
}

// draw foreground
const foreground = {
  sX: 276,
  sY: 0,
  w: 224,
  h: 112,
  x: 0,
  y: canvas.height - 112,
  dx: 2,

  update() {

    // if the game is in playing mode than move the foreground
    if (gameState.current === gameState.playing) {

      // when its reaches half of the width, it resets so that the foreground doesn't leave the canvas
      this.x = (this.x - this.dx) % (this.w / 2);
    }
  },

  draw() {
    // draw foreground twice because the image does not fit the entire canvas
    ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
    ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
  }
}

// draw bird

const bird = {
  animation: [
    {sX: 276, sY: 112},
    {sX: 276, sY: 139},
    {sX: 276, sY: 164},
    {sX: 276, sY: 139}
  ],
  x: 70,
  y: 120,
  w: 34,
  h: 26,
  frame: 0,
  rotation: 0,
  gravity: 0.2,
  speed: 0,
  flight: 5,
  radius: 12,

  fly() {
    this.speed = -this.flight;
  },

  update() {
    let birdImg = this.animation[this.frame];

    // bird changes animation every 5 frames
    this.frame += frames % 10 === 0 ? 1 : 0;
    this.frame = this.frame % this.animation.length;

    if (gameState.current === gameState.getReady) {
      this.y = 120;
      this.rotation = 0;
      this.speed = 0;
    }
    else {

    // bird falls because of gravity and the more it falls the faster it falls
      this.speed += this.gravity;
      this.y += this.speed;

      // if the bird touches the ground it's game over
      if (this.y + this.h / 2 >= foreground.y) {

        // bird rests in the ground
        this.y = foreground.y - this.h / 2;
        // and no longer flaps its wings
        this.frame = 1;
        gameState.current = gameState.gameOver;
      }

      if (this.speed >= this.flight) {
        this.rotation = toRadian(90);
      }
      else {
        this.rotation = toRadian(-20);
      }
    }
  },

  draw() {
    let birdImg = this.animation[this.frame];

    // rotate the bird
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    // coordinates center in bird image rather than up-left corner
    ctx.drawImage(sprite, birdImg.sX, birdImg.sY, this.w, this.h, - this.w / 2, - this.h / 2, this.w, this.h);
    ctx.restore();
  }
}

// draw pipes
const pipes = {
  top: {
    sX: 553,
    sY: 0
  },
  bot: {
    sX: 502,
    sY: 0
  },
  w: 53,
  h: 400,
  gap: 120,
  dx: 2,
  total: [],
  max: -180,

  update() {

    // if the game is not in playing mode there is no pipe update
    if (gameState.current !== gameState.playing) return;

    // every 100 frames create a new pipe
    if (frames % 100 === 0) {
      this.total.push({
        x: canvas.width,
        y: this.max * (Math.random() + 1)
      });
    }

    // loop through the total array (holding all the pipe coordinates)
    for (let i = 0; i < this.total.length; i++) {
      let pipe = this.total[i];

      // update its x position, so the pipes move to the left
      pipe.x -= this.dx;

      // when the pipe gets out out the canvas remove it
      if (pipe.x  + this.w < 0) {

        // the first pipe getting out of the canvas will be the first element in the total array
        this.total.shift();
      }

      if (bird.x === pipe.x + this.w + 1) {

        // when the bird goes through the pipe the score increases
        score.value += 1;
        score.best = Math.max(score.best, score.value);
        localStorage.setItem('flappy_bird_best_score', score.best);
      }

      // check if bird collides with top pipe
      if (bird.x + bird.radius > pipe.x && bird.x - bird.radius < pipe.x + this.w && bird.y + bird.radius > pipe.y && bird.y - bird.radius < pipe.y + this.h) {
        gameState.current = gameState.gameOver;
      }

      // check if bird collides with bot pipe
      if (bird.x + bird.radius > pipe.x && bird.x - bird.radius < pipe.x + this.w && bird.y + bird.radius > pipe.y + this.h + this.gap && bird.y - bird.radius < pipe.y + this.h + this.gap + this.gap) {
        gameState.current = gameState.gameOver;
      }
    }
  },

  draw() {
    for (let i = 0; i < this.total.length; i++) {

      // draw the top pipe
      ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, this.total[i].x, this.total[i].y, this.w, this.h);

      // based on the top pipe position, draw the bot pipe
      ctx.drawImage(sprite, this.bot.sX, this.bot.sY, this.w, this.h, this.total[i].x, this.total[i].y + this.h + this.gap, this.w, this.h);
    }
  },

  reset() {
    this.total = [];
  }
}

// draw Get Ready Image
const getReady = {
  sX: 0,
  sY: 228,
  w: 173,
  h: 152,
  x: canvas.width / 2 - 173 / 2,
  y: 60,

  draw() {
    if (gameState.current === gameState.getReady) {
      ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
    }
  }
}

// draw game over Image
const gameOver = {
  sX: 175,
  sY: 228,
  w: 225,
  h: 202,
  x: canvas.width / 2 - 225 / 2,
  y: 100,

  draw() {
    if (gameState.current === gameState.gameOver) {
      ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
    }
  }
}

// draw score
const score = {
  value: 0,
  best: parseInt(localStorage.getItem('flappy_bird_best_score')) || 0,

  draw() {
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';

    if (gameState.current === gameState.playing) {
      ctx.font = '50px Permanent Marker';
      ctx.lineWidth = 3;
      ctx.fillText(this.value, canvas.width / 2 - 10, 60);
      ctx.strokeText(this.value, canvas.width / 2 - 10, 60);
    }
    else if (gameState.current === gameState.gameOver) {
      ctx.font = '25px Permanent Marker';
      ctx.lineWidth = 2;

      // for the score
      ctx.fillText(this.value, 225, 195);
      ctx.strokeText(this.value, 225, 195);

      // for the best score
      ctx.fillText(this.best, 225, 240);
      ctx.strokeText(this.best, 225, 240);
    }
  },

  reset() {
    this.value = 0;
  }
}

// draw medals
const medals = {
  type : [
    {sX: 450, sY: 120}, // no medal
    {sX: 310, sY: 110}, // platina medal
    {sX: 358, sY: 110}, // silver medal
    {sX: 310, sY: 158}, // gold medal
    {sX: 358, sY: 158} // bronze medal
  ],
  w: 48,
  h: 48,
  x: 70,
  y: 185,
  current: 0,

  draw() {
    if (gameState.current === gameState.gameOver) {

      // select the medal
      let medal = this.type[this.current];

      if (score.value > 15) {
        this.current = 1; // platina medal
      }
      else if (score.value > 10) {
        this.current = 3; // gold medal
      }
      else if (score.value > 5) {
        this.current = 2; // silver medal
      }
      else if (score.value > 2) {
        this.current = 4; // bronze medal
      }
      else {
        this.current = 0; // no medal
      }

      // draw the the selected medal
      ctx.drawImage(sprite, medal.sX, medal.sY, this.w, this.h, this.x, this.y, this.w, this.h);
    }
  }
}

function update() {
  bird.update();
  foreground.update();
  pipes.update();
}

function draw() {
  drawCanvas();
  background.draw();
  pipes.draw();
  foreground.draw();
  bird.draw();
  getReady.draw();
  gameOver.draw();
  score.draw();
  medals.draw();
}

function loop() {
  update();
  draw();
  frames++;

  requestAnimationFrame(loop);
}

loop();
