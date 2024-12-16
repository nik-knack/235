"use strict";
const app = new PIXI.Application();

// aliases
let stage;
let assets;
let cat, heart, fish, brush;

let sceneWidth, sceneHeight;

// game variables
let startScene;
let gameScene;
let gameOverScene;

// ui assets
let buttons;

// custom font
let pixelifySans;

// add game bar elements
let hungerMeter = 50;
let hygieneMeter = 50;
let playMeter = 50;

const maxMeterValue = 50; // Maximum value for any meter
const meterDecrementRates = { hunger: 1, hygiene: 0.5, play: 0.8 }; // Rates of decrease per second

// visual bars
let hungerBar, hygieneBar, playBar;

// Load all assets
loadContent();

async function loadContent() {
    PIXI.Assets.addBundle("fonts", {
        PixelifySans: "media/fonts/PixelifySans-Regular.ttf",
    });
    PIXI.Assets.addBundle("buttons", {
        startButton: "media/button_scaled_6x.png",
        startButtonOver: "media/button_over_scaled_6x.png",
        startButtonDown: "media/button_down_scaled_6x.png",
        playButton: "media/play_button_scaled_4x.png",
        playButtonOver: "media/play_over_button_scaled_4x.png",
        playbuttonDown: "media/play_down_button_scaled_4x.png",
        cleanButton: "media/clean_button_scaled_4x.png",
        cleanButtonOver: "media/clean_over_button_scaled_4x.png",
        cleanButtonDown: "media/clean_down_button_scaled_4x.png",
        foodButton: "media/food_button_scaled_4x.png",
        foodButtonOver: "media/food_over_button_scaled_4x.png",
        foodButtonDown: "media/food_down_button_scaled_4x.png",
    })
    PIXI.Assets.addBundle("sprites", {
        cat: "media/cat_scaled_8x.png",
        heart: "media/heart_scaled_2x.png",
        fish: "media/fish_scaled_2x.png",
        brush: "media/brush_scaled_2x.png",
    });

    pixelifySans = await PIXI.Assets.loadBundle("fonts");
    buttons = await PIXI.Assets.loadBundle("buttons");
    assets = await PIXI.Assets.loadBundle("sprites", (progress) => {
        console.log(`progress=${(progress * 100).toFixed(2)}%`); // 0.4288 => 42.88%
    });

    setup();
}

async function setup() {
    await app.init({ width: 600, height: 600, background: '#f5f1e1' });

    document.body.appendChild(app.canvas);

    stage = app.stage;
    sceneWidth = app.renderer.width;
    sceneHeight = app.renderer.height;

    // Create the `start` scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);

    // Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

    // Create the `gameOver` scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

    // css style for custom cursor icons
    const defaultIcon = "url('/media/cursor_default_6x.png') 39 0, auto";
    const hoverIcon = "url('/media/cursor_hover_6x.png') 39 0, auto";
    const clickIcon = "url('/media/cursor_click_6x.png') 39 0, auto";

    // call createTextAndButtons function
    createTextAndButtons();

    // add custom cursor styles
    app.renderer.events.cursorStyles.default = defaultIcon;
    app.renderer.events.cursorStyles.hover = hoverIcon;
    app.renderer.events.cursorStyles.onclick = clickIcon;

    createMeters(); // Create meter bars
    startMeterDecrement(); // Start decrementing meters
    startGameLoop(); // Start game loop for game over check
}

function createTextAndButtons() {
    let title = new PIXI.Text("Shelter Cat", {
        fill: 0xF40A84,
        fontSize: 85,
        fontFamily: "Pixelify Sans",
    });
    title.x = sceneWidth / 2 - title.width / 2;
    title.y = 120;
    startScene.addChild(title);

    // Create start button with button class
    let startButton = new Button(
        "media/button_scaled_6x.png",       // Normal texture
        "media/button_over_scaled_6x.png", // Hover texture
        "media/button_down_scaled_6x.png", // Down texture
        sceneWidth/2,                               // x position
        400,                               // y position
        null,                               // Width
        null,                               // Height
        startGame, // OnClick callback
    );
    startScene.addChild(startButton);
    
    let textStyle = {
        fill: 0x150377,
        fontSize: 24,
        fontFamily: "Pixelify Sans",
    };

    let hungerText = new PIXI.Text("Hunger", textStyle);
    hungerText.x = 10;
    hungerText.y = 10;
    gameScene.addChild(hungerText);

    let hygieneText = new PIXI.Text("Hygiene", textStyle);
    hygieneText.x = 10;
    hygieneText.y = 40;
    gameScene.addChild(hygieneText);

    let playText = new PIXI.Text("Play", textStyle);
    playText.x = 10;
    playText.y = 70;
    gameScene.addChild(playText);

    const heartImage = PIXI.Sprite.from(assets.heart);
    heartImage.x = 120;
    heartImage.y = 10;
    gameScene.addChild(heartImage);

    const fishImage = PIXI.Sprite.from(assets.fish);
    fishImage.x = 120;
    fishImage.y = 40;
    gameScene.addChild(fishImage);

    const brushImage = PIXI.Sprite.from(assets.brush);
    brushImage.x = 120;
    brushImage.y = 70;
    gameScene.addChild(brushImage);

    const catImage = PIXI.Sprite.from(assets.cat);
    catImage.x = sceneWidth / 2 - catImage.width / 2;
    catImage.y = sceneHeight / 2 - catImage.height / 2;
    gameScene.addChild(catImage);

    let hungerButton = new Button(
        "media/food_button_scaled_4x.png",       // Normal texture
        "media/food_over_button_scaled_4x.png", // Hover texture
        "media/food_down_button_scaled_4x.png", // Down texture
        (sceneWidth/4)*1,                               // x position
        sceneWidth/2 + 200,                               // y position
        null,                               // Width
        null,                               // Height
        () => {
            hungerMeter = Math.min(maxMeterValue, hungerMeter + 30); // Increase hunger meter
            updateMeters();
            console.log("Hunger replenished!");
        }, // OnClick callback
    );
    gameScene.addChild(hungerButton);

    let hygieneButton = new Button(
        "media/clean_button_scaled_4x.png",       // Normal texture
        "media/clean_over_button_scaled_4x.png", // Hover texture
        "media/clean_down_button_scaled_4x.png", // Down texture
        (sceneWidth/4)*2,                               // x position
        sceneWidth/2 + 200,                               // y position
        null,                               // Width
        null,                               // Height
        () => {
            hygieneMeter = Math.min(maxMeterValue, hygieneMeter + 20); // Increase hygiene meter
            updateMeters();
            console.log("Hygiene replenished!");
        }, // OnClick callback
    );
    gameScene.addChild(hygieneButton);

    let playButton = new Button(
        "media/play_button_scaled_4x.png",       // Normal texture
        "media/play_over_button_scaled_4x.png", // Hover texture
        "media/play_down_button_scaled_4x.png", // Down texture
        (sceneWidth/4)*3,                               // x position
        sceneWidth/2 + 200,                               // y position
        null,                               // Width
        null,                               // Height
        () => {
            playMeter = Math.min(maxMeterValue, playMeter + 25); // Increase play meter
            updateMeters();
            console.log("Play replenished!");
        }, // OnClick callback
    );
    gameScene.addChild(playButton);

    let gameOver = new PIXI.Text("Game Over :(", {
        fill: 0xF40A84,
        fontSize: 85,
        fontFamily: "Pixelify Sans",
    });
    gameOver.x = sceneWidth / 2 - gameOver.width / 2;
    gameOver.y = 120;
    gameOverScene.addChild(gameOver);

    let playAgainButton = new Button(
        "media/button_scaled_6x.png",       // Normal texture
        "media/button_over_scaled_6x.png", // Hover texture
        "media/button_down_scaled_6x.png", // Down texture
        sceneWidth/2,                               // x position
        400,                               // y position
        null,                               // Width
        null,                               // Height
        startGame, // OnClick callback
    );
    gameOverScene.addChild(playAgainButton);
}

function startGame() {
    console.log("startGame Called");

    // Reset meter values
    hungerMeter = maxMeterValue;
    hygieneMeter = maxMeterValue;
    playMeter = maxMeterValue;

    // Update meters visually
    updateMeters();

    // Show game scene and hide others
    startScene.visible = false;
    gameScene.visible = true;
    gameOverScene.visible = false;
}

function createMeters() {
    const barWidth = 200;
    const barHeight = 20;
    const xOffset = 180;
    const yStart = 10;
    const barSpacing = 40;

    // Hunger Bar
    hungerBar = new PIXI.Graphics();
    hungerBar.beginFill(0xff0000); // Red color for hunger
    hungerBar.drawRect(xOffset, yStart, barWidth, barHeight);
    hungerBar.endFill();
    gameScene.addChild(hungerBar);

    // Hygiene Bar
    hygieneBar = new PIXI.Graphics();
    hygieneBar.beginFill(0x00ff00); // Green color for hygiene
    hygieneBar.drawRect(xOffset, yStart + barSpacing, barWidth, barHeight);
    hygieneBar.endFill();
    gameScene.addChild(hygieneBar);

    // Play Bar
    playBar = new PIXI.Graphics();
    playBar.beginFill(0x0000ff); // Blue color for play
    playBar.drawRect(xOffset, yStart + barSpacing * 2, barWidth, barHeight);
    playBar.endFill();
    gameScene.addChild(playBar);
}

function updateMeters() {
    // Update hunger bar
    hungerBar.scale.x = Math.max(0, hungerMeter / maxMeterValue);

    // Update hygiene bar
    hygieneBar.scale.x = Math.max(0, hygieneMeter / maxMeterValue);

    // Update play bar
    playBar.scale.x = Math.max(0, playMeter / maxMeterValue);
}


function startMeterDecrement() {
    setInterval(() => {
        hungerMeter = Math.max(0, hungerMeter - meterDecrementRates.hunger);
        hygieneMeter = Math.max(0, hygieneMeter - meterDecrementRates.hygiene);
        playMeter = Math.max(0, playMeter - meterDecrementRates.play);

        updateMeters(); // Redraw bars with new values
    }, 1000); // Decrement every second
}

function checkGameOver() {
    if (hungerMeter === 0 || hygieneMeter === 0 || playMeter === 0) {
        console.log("Game Over!");
        gameScene.visible = false;
        gameOverScene.visible = true;
    }
}

function startGame() {
    console.log("Starting game...");
    hungerMeter = hygieneMeter = playMeter = maxMeterValue; // Reset all meters
    updateMeters(); // Refresh visual bars
    startScene.visible = false;
    gameScene.visible = true;
    gameOverScene.visible = false;
}

function startGameLoop() {
    app.ticker.add(checkGameOver); // Continuously check for game over
}



