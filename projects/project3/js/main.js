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
        playButton: "media/clean_button_scaled_4x.png",
        playButtonOver: "media/clean_over_button_scaled_4x.png",
        playbuttonDown: "media/clean_down_button_scaled_4x.png",
        cleanButton: "media/clean_button_scaled_4x.png",
        cleanButtonOver: "media/clean_over_button_scaled_4x.png",
        cleanButtonDown: "media/clean_down_button_scaled_4x.png",
        foodButton: "media/clean_button_scaled_4x.png",
        foodButtonOver: "media/clean_over_button_scaled_4x.png",
        foodButtonDown: "media/clean_down_button_scaled_4x.png",
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
}

function createTextAndButtons() {
    let buttonStyle = {
        fill: 0xf40a84,
        fontSize: 48,
        fontFamily: "Pixelify Sans",
    };

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
    
    // Add the button to start scene
    startScene.addChild(startButton);
    
    let textStyle = {
        fill: 0x150377,
        fontSize: 24,
        fontFamily: "Pixelify Sans",
    };

    let playText = new PIXI.Text("Play", textStyle);
    playText.x = 10;
    playText.y = 10;
    gameScene.addChild(playText);

    let hungerText = new PIXI.Text("Hunger", textStyle);
    hungerText.x = 10;
    hungerText.y = 40;
    gameScene.addChild(hungerText);

    let hygieneText = new PIXI.Text("Hygiene", textStyle);
    hygieneText.x = 10;
    hygieneText.y = 70;
    gameScene.addChild(hygieneText);

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

    let button1 = new Button(
        "media/clean_button_scaled_4x.png",       // Normal texture
        "media/clean_over_button_scaled_4x.png", // Hover texture
        "media/clean_down_button_scaled_4x.png", // Down texture
        (sceneWidth/4)*1,                               // x position
        sceneWidth/2 + 200,                               // y position
        null,                               // Width
        null,                               // Height
        () => {console.log("Food button clicked!");}, // OnClick callback
    );
    gameScene.addChild(button1);

    let button2 = new Button(
        "media/clean_button_scaled_4x.png",       // Normal texture
        "media/clean_over_button_scaled_4x.png", // Hover texture
        "media/clean_down_button_scaled_4x.png", // Down texture
        (sceneWidth/4)*2,                               // x position
        sceneWidth/2 + 200,                               // y position
        null,                               // Width
        null,                               // Height
        () => {console.log("Clean button clicked!");}, // OnClick callback
    );
    gameScene.addChild(button2);

    let button3 = new Button(
        "media/clean_button_scaled_4x.png",       // Normal texture
        "media/clean_over_button_scaled_4x.png", // Hover texture
        "media/clean_down_button_scaled_4x.png", // Down texture
        (sceneWidth/4)*3,                               // x position
        sceneWidth/2 + 200,                               // y position
        null,                               // Width
        null,                               // Height
        () => {console.log("Play button clicked!");}, // OnClick callback
    );
    gameScene.addChild(button3);

    // let button1 = PIXI.Sprite.from(buttons.cleanButton);
    // button2.x = (sceneWidth / 4)*2 - (button2.width/3)*2;
    // button2.y = sceneHeight / 2 + 3*button2.height;
    // button2.interactive = true;
    // button2.buttonMode = true;
    // button2
    //     .on("pointerup", onButtonUp)
    //     .on("pointerover", onButtonOver)
    //     .on("pointerdown", onButtonDown)
    //     .on("pointerout", onButtonOut);
    // gameScene.addChild(button2);


    // let button3 = PIXI.Sprite.from(buttons.cleanButton);
    // button3.x = (sceneWidth / 4)*3 - (button3.width/3)*3;
    // button3.y = sceneHeight / 2 + 3*button3.height;
    // button3.interactive = true;
    // button3.buttonMode = true;
    // button3
    //     .on("pointerup", onButtonUp)
    //     .on("pointerover", onButtonOver)
    //     .on("pointerdown", onButtonDown)
    //     .on("pointerout", onButtonOut);
    // gameScene.addChild(button3);
}

function startGame() {
    console.log("startGame Called");
    startScene.visible = false;
    gameScene.visible = true;
    gameOverScene.visible = false;
}