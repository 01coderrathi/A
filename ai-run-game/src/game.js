const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;

let players = [];
let blocks = [];
let interval = null;

const NUMBER_OF_BLOCKS = 100;

const getNextBlock = ({ player }) => {
  for (const block of blocks) {
    if (block.x < player.x) continue;
    return block;
  }
};

const isColliding = (rect1, rect2) => {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
};

function updatePlayer({ player, block }) {
  if (player.isDead) {
    player.x -= 5;
    return;
  }

  const dist = Math.min(100, Math.abs(player.x - block.x)) / 100;
  const output = player.brain.activate([dist]);
  if (player.canJump && output[0] > 0.5) {
    player.canJump = false;
    player.vy = -15;
  }

  if (isColliding(player, block)) {
    player.brain.score--;
    player.isDead = true;
  }

  player.y += player.vy;
  player.vy += 0.9;

  if (player.y >= ctx.canvas.height / 2) {
    player.y = ctx.canvas.height / 2;
    player.vy = 0;
    player.canJump = true;
  }
}

function updateBlock({ block }) {
  block.x -= 5;
}

function drawPlayer({ player }) {
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawBlock({ block }) {
  ctx.fillRect(block.x, block.y, block.width, block.height);
}

const update = ({ resolve, reject }) => {
  for (const player of players) {
    const block = getNextBlock({ player });
    if (!block) {
      clearInterval(interval);
      resolve();
    }
    updatePlayer({ player, block });
  }

  for (const block of blocks) {
    updateBlock({ block });
  }

  if (players.every(player => player.isDead)) {
    clearInterval(interval);
    reject();
  }
};

const draw = ({ neat }) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (const player of players) {
    drawPlayer({ player });
  }

  for (const block of blocks) {
    drawBlock({ block });
  }

  ctx.font = '30px Arial';
  ctx.fillText(`generation ${neat.generation + 1}`, 10, 30);
};

/*
This game function is responsible for creating, drawing, and updating the game until at least one
player makes it to the end.  When it found a winning player, it will invoke the onEnd callback
and pass the winning player object.  This player object should be used for getting the associated "brain".
*/
export default ({ neat }) => {
  return new Promise((resolve, reject) => {
    players = [];
    blocks = [];

    for (let i = 0; i < NUMBER_OF_BLOCKS; i++) {
      blocks.push({
        x: ctx.canvas.width + 100 + parseInt(Math.random() * 200) + i * 300,
        y: ctx.canvas.height / 2 - 50,
        height: 70,
        width: 20
      });
    }

    for (const genome of neat.population) {
      genome.score = 0;
      players.push({
        brain: genome,
        x: ctx.canvas.width / 2,
        y: ctx.canvas.height / 2,
        vy: 0,
        canJump: true,
        width: 20,
        height: 20,
        isDead: false
      });
    }

    interval = setInterval(() => {
      update({ resolve, reject });
      draw({ neat });
    }, 10);
  });
};
