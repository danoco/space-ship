const countText = document.querySelector(".count");
let counter = 0;
const gameOverScreen = document.querySelector(".lost");

const platforms = [];
const bullets = [];

let player;

let moveLeft = false;
let moveRight = false;

let elapsedTime = 0;
const platformInterval = 75;

const app = new PIXI.Application({ background: "#1099bb", resizeTo: window });
document.body.appendChild(app.view);

const platformContainer = new PIXI.Container();
app.stage.addChild(platformContainer);

function createPlatform(texture) {
  const platform = new PIXI.Sprite(texture);

  platform.width = 150;
  platform.height = 80;
  platform.x = Math.random() * (app.screen.width - platform.width);
  platform.y = -platform.height;

  platformContainer.addChild(platform);
  platforms.push(platform);
  return platform;
}

function createPlayer(texture) {
  player = new PIXI.Sprite(texture);
  player.width = 100;
  player.height = 200;
  player.anchor.set(0.5);
  player.x = app.screen.width / 2;
  player.y = app.screen.height - player.height / 2;
  app.stage.addChild(player);
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

function controls() {
  const leftButton = document.querySelector(".leftBtn");
  const rightButton = document.querySelector(".rightBtn");
  const fireButton = document.querySelector(".fireBtn");

  leftButton.addEventListener("touchstart", () => {
    moveLeft = true;
  });
  leftButton.addEventListener("touchend", () => {
    moveLeft = false;
  });
  rightButton.addEventListener("touchstart", () => {
    moveRight = true;
  });
  rightButton.addEventListener("touchend", () => {
    moveRight = false;
  });

  fireButton.addEventListener("touchstart", () => {
    const bullet = new Bullet();
    bullet.x = player.x - bullet.width / 2;
    bullet.y = player.y - player.height / 2;
    app.stage.addChild(bullet);
    bullets.push(bullet);
  });
}

class Bullet extends PIXI.Graphics {
  constructor() {
    super();
    this.beginFill(0xff0000);
    this.drawRect(0, 0, 10, 20);
    this.endFill();
    this.speed = 10;
  }

  move() {
    this.y -= this.speed;
  }
}

async function setup() {
  const playerTexture = await PIXI.Assets.load("./assets/ship.png");
  const platformTexture = await PIXI.Assets.load("./assets/enemy.png");

  createPlayer(playerTexture);

  controls();

  app.ticker.add((delta) => {
    elapsedTime += delta;

    if (elapsedTime >= platformInterval) {
      createPlatform(platformTexture);
      elapsedTime = 0;
    }

    platforms.forEach((platform) => {
      if (checkCollision(player, platform)) {
        gameOverScreen.style.display = "block";

        app.ticker.stop();
      }
    });

    platformContainer.children.forEach((platform) => {
      platform.y += 3;
    });

    if (moveLeft && player.x > player.width / 2) player.x -= 10;
    if (moveRight && player.x < app.screen.width - player.width / 2)
      player.x += 10;

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
  });
}

setup();
