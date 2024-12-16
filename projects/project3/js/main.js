"use strict";


const app = new PIXI.Application();

// Game variables and settings
let stage;
let assets;
let cat, heart, fish, brush;

let sceneWidth, sceneHeight;

let startScene;
let gameScene;
let gameOverScene;

let hungerMeter = 50;
let hygieneMeter = 50;
let playMeter = 50;

const maxMeterValue = 50; // Maximum value for any meter
const meterDecrementRates = { hunger: 1.5, hygiene: 0.5, play: 1.0 }; // Rates of decrease per second

// UI Elements
let hungerBar, hygieneBar, playBar;
let pixelifySans;
let buttons;

// Load all assets
loadContent();

// Load game assets and setup scenes
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
        console.log(`Loading: ${Math.round(progress * 100)}%`); // 0.4288 => 42.88%
    });

    setup();
}


// Initialize game scenes and settings
async function setup() {
    await app.init({ width: 600, height: 600, background: '#f5f1e1' });

    document.body.appendChild(app.canvas);

    stage = app.stage;
    sceneWidth = app.renderer.width;
    sceneHeight = app.renderer.height;

    // Create scenes
    createScenes();

    // Create UI elements
    createTextAndButtons();

    // Set up custom cursor styles
    setupCursorStyles();

    // Create meters bars and start meter decrement
    createMeters(); 
    startMeterDecrement(); 

    // Starts the game loop for game over check
    startGameLoop(); 
}

// Create scenes for start, game, and game over
function createScenes() {
    startScene = new PIXI.Container();
    stage.addChild(startScene);

    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);
}

// Set up custom cursor styles for game interaction
function setupCursorStyles() {
    const defaultIcon = "url('/media/cursor_default_6x.png') 39 0, auto";
    const hoverIcon = "url('/media/cursor_hover_6x.png') 39 0, auto";
    const clickIcon = "url('/media/cursor_click_6x.png') 39 0, auto";

    app.renderer.events.cursorStyles.default = defaultIcon;
    app.renderer.events.cursorStyles.hover = hoverIcon;
    app.renderer.events.cursorStyles.onclick = clickIcon;
}

// Create UI elements 
function createTextAndButtons() {
    // Title text
    let title = new PIXI.Text("Shelter Cat", {
        fill: 0xF40A84,
        fontSize: 85,
        fontFamily: "Pixelify Sans",
    });
    title.x = sceneWidth / 2 - title.width / 2;
    title.y = 120;
    startScene.addChild(title);

    // Start button
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
            hungerMeter = Math.min(maxMeterValue, hungerMeter + 15); // Increase hunger meter
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
            hygieneMeter = Math.min(maxMeterValue, hygieneMeter + 5); // Increase hygiene meter
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
            playMeter = Math.min(maxMeterValue, playMeter + 10); // Increase play meter
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

// Create meter bars for hunger, hygiene, and play
function createMeters() {
    const barWidth = 200;
    const barHeight = 20;
    const xOffset = 110;
    const yStart = 10;
    const barSpacing = 40;

    // Hunger Bar
    hungerBar = new PIXI.Graphics();
    hungerBar.beginFill(0xF40A84); 
    hungerBar.drawRect(xOffset, yStart, barWidth, barHeight);
    hungerBar.endFill();
    gameScene.addChild(hungerBar);

    // Hygiene Bar
    hygieneBar = new PIXI.Graphics();
    hygieneBar.beginFill(0x150377); 
    hygieneBar.drawRect(xOffset, yStart + barSpacing, barWidth, barHeight);
    hygieneBar.endFill();
    gameScene.addChild(hygieneBar);

    // Play Bar
    playBar = new PIXI.Graphics();
    playBar.beginFill(0xFE998B); 
    playBar.drawRect(xOffset, yStart + barSpacing * 2, barWidth, barHeight);
    playBar.endFill();
    gameScene.addChild(playBar);
}

// Update the visual appearance of all meters
function updateMeters() {
    const barWidth = 200; // Total bar width

    // Update hunger bar
    hungerBar.clear();
    hungerBar.beginFill(0xF40A84); 
    hungerBar.drawRect(110, 10, (hungerMeter / maxMeterValue) * barWidth, 20);
    hungerBar.endFill();

    // Update hygiene bar
    hygieneBar.clear();
    hygieneBar.beginFill(0x150377); 
    hygieneBar.drawRect(110, 45, (hygieneMeter / maxMeterValue) * barWidth, 20);
    hygieneBar.endFill();

    // Update play bar
    playBar.clear();
    playBar.beginFill(0xFE998B);
    playBar.drawRect(110, 80, (playMeter / maxMeterValue) * barWidth, 20);
    playBar.endFill();
}

// Start the process of meter decrement every second
function startMeterDecrement() {
    setInterval(() => {
        hungerMeter = Math.max(0, hungerMeter - meterDecrementRates.hunger);
        hygieneMeter = Math.max(0, hygieneMeter - meterDecrementRates.hygiene);
        playMeter = Math.max(0, playMeter - meterDecrementRates.play);

        updateMeters(); // Redraw bars with new values
    }, 1000); // Decrement every second
}


// Check for game over (when any meter reaches 0)
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

// Start the game loop to check for game over condition
function startGameLoop() {
    app.ticker.add(checkGameOver); // Continuously check for game over
}



