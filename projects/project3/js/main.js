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

// loading custom font
window.WebFontConfig = {
    google: {
        families: ['Pixelify Sans'],
    },
};

// web-font loader script
(function () {
    const wf = document.createElement('script');
    wf.src = `${document.location.protocol === 'https:' ? 'https' : 'http'
        }://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js`;
    wf.type = 'text/javascript';
    wf.async = 'true';
    const s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
})();

// Load all assets
loadImages();



async function loadImages() {
    PIXI.Assets.addBundle("sprites", {
        cat: "media/cat_scaled_8.png",
        heart: "media/heart_scaled_2x.png",
        fish: "media/fish_scaled_2x.png",
        brush: "media/brush_scaled_2x.png",
    });

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

    // call createTextAndButtons function
    createTextAndButtons();
}

function createTextAndButtons() {
    let buttonStyle = {
        fill: 0xf40a84,
        fontSize: 48,
        fontFamily: "Pixelify Sans",
    };

    let startButton = new PIXI.Text("Start", buttonStyle);
    startButton.x = sceneWidth / 2 - startButton.width / 2;
    startButton.y = sceneHeight - 100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame);
    startButton.on("pointerover", (e) => (e.target.alpha = 0.7));
    startButton.on("pointerout", (e) => (e.currentTarget.alpha = 1.0));
    startScene.addChild(startButton);

    let title = new PIXI.Text("Shelter Cat", {
        fill: 0x150377,
        fontSize: 65,
        fontFamily: "Pixelify Sans",
    });
    title.x = sceneWidth / 2 - title.width / 2;
    title.y = 120;
    startScene.addChild(title);

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
}

function startGame() {
    console.log("startGame Called");
    startScene.visible = false;
    gameScene.visible = true;
    gameOverScene.visible = false;
}