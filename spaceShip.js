let countText = document.querySelector('.count');
let counter = 0;
const gameOverScreen = document.querySelector('.lost');

const platforms = [];
const bullets = [];

let player;

let elapsedTime = 0;
const platformInterval = 100;

const app = new PIXI.Application({ width: 480, height: 640 });
document.body.appendChild(app.view);

const platformContainer = new PIXI.Container();
app.stage.addChild(platformContainer);

function createPlatform(texture) {
  const platform = new PIXI.Sprite(texture);

  platform.width = 80;
  platform.height = 40;
  platform.x = Math.random() * (app.screen.width - platform.width);
  platform.y = -platform.height;

  platformContainer.addChild(platform);
  platforms.push(platform);
  return platform;
}

function checkCollision(rect1, rect2) {
  const rect1Bounds = rect1.getBounds();
  const rect2Bounds = rect2.getBounds();

  return (
    rect1Bounds.x < rect2Bounds.x + rect2Bounds.width &&
    rect1Bounds.x + rect1Bounds.width > rect2Bounds.x &&
    rect1Bounds.y < rect2Bounds.y + rect2Bounds.height &&
    rect1Bounds.y + rect1Bounds.height > rect2Bounds.y
  );
}

class Bullet extends PIXI.Graphics {
  constructor() {
    super();
    this.beginFill(0xff0000);
    this.drawRect(0, 0, 5, 10);
    this.endFill();
    this.speed = 5;
  }

  move() {
    this.y -= this.speed;
  }
}

async function setup() {
  const playerTexture = await PIXI.Assets.load('./assets/ship.png');
  const platformTexture = await PIXI.Assets.load('./assets/enemy.png');

  player = new PIXI.Sprite(playerTexture);
  player.width = 50;
  player.height = 100;
  player.anchor.set(0.5);
  player.x = app.screen.width / 2;
  player.y = app.screen.height - player.height / 2;
  app.stage.addChild(player);

  let moveLeft = false;
  let moveRight = false;

  window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') moveLeft = true;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') moveRight = true;
    if (e.code === 'Space') {
      const bullet = new Bullet();
      bullet.x = player.x - bullet.width / 2;
      bullet.y = player.y - player.height / 2;
      app.stage.addChild(bullet);
      bullets.push(bullet);
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') moveLeft = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') moveRight = false;
  });

  app.ticker.add((delta) => {
    platforms.forEach((platform) => {
      if (checkCollision(player, platform)) {
        gameOverScreen.style.display = 'block';

        app.ticker.stop();
      }
    });

    if (moveLeft && player.x > player.width / 2) player.x -= 5;
    if (moveRight && player.x < app.screen.width - player.width / 2)
      player.x += 5;

    platformContainer.children.forEach((platform) => {
      platform.y += 1;
    });

    bullets.forEach((bullet) => {
      bullet.move();

      platforms.forEach((platform) => {
        if (checkCollision(bullet, platform)) {
          platformContainer.removeChild(platform);
          platforms.splice(platforms.indexOf(platform), 1);
          app.stage.removeChild(bullet);
          bullets.splice(bullets.indexOf(bullet), 1);
          counter += 1;
          countText.textContent = counter;
        }
      });
      if (bullet.y < 0) {
        app.stage.removeChild(bullet);
        bullets.splice(bullets.indexOf(bullet), 1);
      }
    });

    elapsedTime += delta;

    if (elapsedTime >= platformInterval) {
      createPlatform(platformTexture);
      elapsedTime = 0;
    }
  });
}

setup();
