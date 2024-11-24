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
    let gameOverText = new PIXI.Text("Gae Over!\n :-0", {
        fill: 0xffffff,
        fontSize: 64,
        stroke: 0xFF0000,
        strokeThickness: 6,
    });
    gameOverText.x = sceneWidth / 2 - gameOverText.width / 2;
    gameOverText.y = sceneHeight / 2 - 160;
    gameOverScene.addChild(gameOverText);

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
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
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