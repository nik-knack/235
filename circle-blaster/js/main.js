// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
const app = new PIXI.Application();

// aliases
let stage;
let assets;

let sceneWidth, sceneHeight;

// game variables
let startScene;
let gameScene, ship, scoreLabel, lifeLabel, shootSound, hitSound, fireballSound;
let gameOverScene;
let gameFinalScore;

let circles = [];
let bullets = [];
let aliens = [];
let explosions = [];
let explosionTextures;
let score = 0;
let life = 100;
let levelNum = 1;
let paused = true;

// Load all assets
loadImages();

async function loadImages() {
    // https://pixijs.com/8.x/guides/components/assets#loading-multiple-assets
    PIXI.Assets.addBundle("sprites", {
        spaceship: "images/spaceship.png",
        explosions: "images/explosions.png",
        move: "images/move.png",
    });

    // The second argument is a callback function that is called whenever the loader makes progress.
    assets = await PIXI.Assets.loadBundle("sprites", (progress) => {
        console.log(`progress=${(progress * 100).toFixed(2)}%`); // 0.4288 => 42.88%
    });

    setup();
}

async function setup() {
    await app.init({ width: 600, height: 600 });

    document.body.appendChild(app.canvas);

    stage = app.stage;
    sceneWidth = app.renderer.width;
    sceneHeight = app.renderer.height;

    // #1 - Create the `start` scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);

    // #2 - Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

    // #3 - Create the `gameOver` scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

    // #4 - Create labels for all 3 scenes
    createLabelsAndButtons();

    // #5 - Create ship
    ship = new Ship(assets.spaceship);
    gameScene.addChild(ship);

    // #6 - Load Sounds
    shootSound = new Howl({
        src: ["sounds/shoot.wav"],
    });

    hitSound = new Howl({
        src: ["sounds/hit.mp3"],
    });

    fireballSound = new Howl({
        src: ["sounds/fireball.mp3"],
    });

    // #7 - Load sprite sheet

    // #8 - Start update loop
    app.ticker.add(gameLoop);
    explosionTextures = loadSpriteSheet();

    // #9 - Start listening for click events on the canvas

    // Now our `startScene` is visible
    // Clicking the button calls startGame()

}
function createLabelsAndButtons() {
    let buttonStyle = {
        fill: 0xff0000,
        fontSize: 48,
        fontFamily: "Futura",
    };

    // 1 set up startScene
    // 1A make top start label
    let startLabel1 = new PIXI.Text("Circle Blast!", {
        fill: 0xffffff,
        fontSize: 96,
        fontFamily: "Futura",
        stroke: 0xff0000,
        strokeThickness: 6,
    });
    startLabel1.x = 50;
    startLabel1.y = 120;
    startScene.addChild(startLabel1);
    
    // 1B make middle start label
    let startLabel2 = new PIXI.Text("R U worthy..?", {
        fill: 0xffffff,
        fontSize: 32,
        fontFamily: "Futura",
        fontStyle: "italic",
        stroke: 0xff0000,
        strokeThickness: 6,
    });
    startLabel2.x = 185;
    startLabel2.y = 300;
    startScene.addChild(startLabel2);
    
    // 1C make start game button
    let startButton = new PIXI.Text("Enter, if you dare!", buttonStyle);
    startButton.x = sceneWidth / 2 - startButton.width / 2;
    startButton.y = sceneHeight - 100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame); //startGame is a function reference
    startButton.on("pointerover", (e) => (e.target.alpha = 0.7)); // concise arrow function with no brackets
    startButton.on("pointerout", (e) => (e.currentTarget.alpha = 1.0)); // ditto
    startScene.addChild(startButton);

    // 2 set up gameScene
    let textStyle = {
        fill: 0xffffff,
        fontSize: 18,
        fontFamily: "Futura",
        stroke: 0xff0000,
        strokeThickness: 4,
    }

    // 2A make score label
    scoreLabel = new PIXI.Text("", textStyle);
    scoreLabel.x = 5;
    scoreLabel.y = 5;
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);

    // 2B make life label
    lifeLabel = new PIXI.Text("", textStyle);
    lifeLabel.x = 5;
    lifeLabel.y= 26;
    gameScene.addChild(lifeLabel);
    decreaseLifeBy(0);

    // 3 set up gameOverScene
    // 3A make game over text
    let gameOverText = new PIXI.Text("Game Over!\n :-0", {
        fill: 0xffffff,
        fontSize: 64,
        stroke: 0xFF0000,
        strokeThickness: 6,
    });
    gameOverText.x = sceneWidth / 2 - gameOverText.width / 2;
    gameOverText.y = sceneHeight / 2 - 160;
    gameOverScene.addChild(gameOverText);

    gameFinalScore = new PIXI.Text("", {
        fill: 0xffffff,
        fontSize: 40,
        stroke: 0xff0000,
        strokeThickness: 5,
    });
    gameFinalScore.x = sceneWidth / 2 - 175;
    gameFinalScore.y = sceneHeight / 2;
    gameOverScene.addChild(gameFinalScore);

    // 3B make "play again?" button
    let playAgainButton = new PIXI.Text("Play Again?", buttonStyle);
    playAgainButton.x = sceneWidth / 2 - playAgainButton.width / 2;
    playAgainButton.y = sceneHeight - 100;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup", startGame); // startGame is a function reference
    playAgainButton.on("pointerover", (e) => (e.target.alpha = 0.7)); // concise arrow function with no brackets
    playAgainButton.on("pointerout", (e) => (e.currentTarget.alpha = 1.0)); // ditto
    gameOverScene.addChild(playAgainButton);
}

function startGame() {
    console.log("startGmae called");
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    app.view.onclick = fireBullet;
    levelNum = 1;
    score = 0;
    life = 100;
    increaseScoreBy(0);
    decreaseLifeBy(0);
    ship.x = 300;
    ship.y = 550;
    loadLevel();
    // Unpause the game which allows the gameLoop and events to be active
    setTimeout(() => {
        paused = false;
    }, 50);
}

function increaseScoreBy(value) {
    score += value;
    scoreLabel.text = `Score: ${score}`;
}

function decreaseLifeBy(value){
    life -= value;
    life = parseInt(life); //convert to integer
    lifeLabel.text = `Life: ${life}%`;
}

function gameLoop(){
    if (paused) return; // keep this commented out for now
  
    // #1 - Calculate "delta time"
    let dt = 1 / app.ticker.FPS;
    if (dt > 1 / 12) dt = 1 / 12;
  
    // #2 - Move Ship
    let mousePosition = app.renderer.events.pointer.global;
    // ship.position = mousePosition;

    let amt = 10 * dt; // at 60 fps would move about 10% of distance per update
    // lerp (linear interpolate) the x & y values with lerp()
    let newX = lerp(ship.x, mousePosition.x, amt);
    let newY = lerp(ship.y, mousePosition.y, amt);

    // keep the ship on the screen with clamp()
    let w2 = ship.width / 2;
    let h2 = ship.height / 2;
    ship.x = clamp(newX, 0 + w2, sceneWidth - w2);
    ship.y = clamp(newY, 0 + h2, sceneHeight - h2);
  
    // #3 - Move Circles
    for (let c of circles) {
        c.move(dt);
        if (c.x <= c.radius || c.x >= sceneWidth - c.radius) {
            c.reflectX();
            c.move(dt);
        }
        if (c.y <= c.radius || c.y >= sceneHeight - c.radius) {
            c.reflectY();
            c.move(dt);
        }

    }
  
    // #4 - Move Bullets
    for (let b of bullets){
        b.move(dt);
    }
  
    // #5 - Check for Collisions
    for (let c of circles){
        // #5A circles and bullts
        for (let b of bullets){
            if(rectsIntersect(c, b)) {
                fireballSound.play();
                createExplosion(c.x, c.y, 64, 64);
                gameScene.removeChild(c);
                c.isAlive = false;
                gameScene.removeChild(b);
                b.isAlive = false;
                increaseScoreBy(1);
                break;
            }
        }

        // #5B circles and ships
        if (c.isAlive && rectsIntersect(c, ship)) {
            hitSound.play();
            gameScene.removeChild(c);
            c.isAlive = false;
            decreaseLifeBy(20);
        }
    }
  
    // #6 - Now do some clean up
    // #6A cleanup bullets
    bullets = bullets.filter((b) => b.isAlive);
  
    // #6B cleanup circles
    circles = circles.filter((c) => c.isAlive);

    // #6C get rid of explosions
    explosions = explosions.filter((e) => e.playing);

    // #7 - Is game over?
    if (life <= 0) {
        end();
        return; // return to skip to #8
    }
  
    // #8 - Load next level
    if (circles.length == 0){
        levelNum++;
        loadLevel();
    }
}

function createCircles(numCircles = 10) {
    for (let i = 0; i < numCircles; i++) {
        let c  = new Circle(10, 0xffff00);
        c.x = Math.random() * (sceneWidth - 50) + 25;
        c.y = Math.random() * (sceneHeight - 400) + 25;
        circles.push(c);
        gameScene.addChild(c);
    }
}

function loadLevel() {
    createCircles(levelNum * 5);
}

function end() {
    paused = true;

    // clear out level
    circles.forEach((c) => gameScene.removeChild(c)); // concise arrow function with no brackets and no return
    circles = [];

    bullets.forEach((b) => gameScene.removeChild(b));
    bullets = [];

    explosions.forEach((e) => gameScene.removeChild(e));
    explosions = [];

    app.view.onclick = null; // disable the onclick event // we'll get this later

    gameFinalScore.text = `Your Final Score: ${score}`;

    gameOverScene.visible = true;
    gameScene.visible = false;
}

function fireBullet() {
    if(paused) return;

    if(score >= 5) {
        let b1 = new Bullets(0xffffff, ship.x-15, ship.y)
        let b2 = new Bullets(0xffffff, ship.x+15, ship.y)
        bullets.push(b1);
        bullets.push(b2);
        gameScene.addChild(b1);
        gameScene.addChild(b2);
    }

    let b = new Bullets(0xffffff, ship.x, ship.y);
    bullets.push(b);
    gameScene.addChild(b);
    shootSound.play();
}

function loadSpriteSheet() {
    let spriteSheet = PIXI.Texture.from("images/explosions.png");
    let width = 64;
    let height = 64;
    let numFrames = 16;
    let textures = [];
    for (let i = 0; i < numFrames; i++){
        let frame = new PIXI.Texture({
            source: spriteSheet,
            frame: new PIXI.Rectangle(i * width, 64, width, height),
        });
        textures.push(frame);
    }
    return textures;
}

function createExplosion(x, y, frameWidth, frameHeight) {
    let w2 = frameWidth / 2;
    let h2 = frameHeight / 2;
    let expl = new PIXI.AnimatedSprite(explosionTextures);
    expl.x = x - w2; // center of the explosion
    expl.y = y - h2;
    expl.animatedSpeed = 1 / 7;
    expl.loop = false;
    expl.onComplete = () => gameScene.removeChild(expl);
    explosions.push(expl);
    gameScene.addChild(expl);
    expl.play();
}