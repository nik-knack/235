class Button {
    constructor(textureNormal, textureOver, textureDown, x, y, width=null, height=null, onClick=null){
        // Create button sprite from the normal
        this.button = PIXI.Sprite.from(textureNormal);
        
        // Set position to middle of button texture
        this.button.x = x - this.button.width / 2;
        this.button.y = y - this.button.height / 2;

        // Use provided width and height or fallback on sprite's natural size
        if (width && height){
            this.button.width = width;
            this.button.height = height;
        }

        // Store the textures for different states
        this.textureNormal = textureNormal;
        this.textureOver = textureOver;
        this.textureDown = textureDown;

        // Enable interactivity
        this.button.interactive = true;
        this.button.buttonMode = true;

        // If onClick function is provided, use it
        if (onClick && typeof onClick === 'function'){
            this.onClick = onClick;
        } else {
            this.onClick = () => {}; // Default function is none
        }

        // Event listeners for button interactions
        this.button
            .on("pointerup", this.onPointerUp.bind(this))
            .on("pointerover", this.onPointerOver.bind(this))
            .on("pointerdown", this.onPointerDown.bind(this))
            .on("pointerout", this.onPointerOut.bind(this))

        // Button is returned for adding to stage
        this.sprite = this.button;
    }

    // Button click handler
    onPointerUp() {
        // Execute the provided onClick function if available
        this.onClick();
        // Reset the texture to normal after clicking
        this.button.texture = PIXI.Texture.from(this.textureNormal);
    }

    // Button hover (mouse over) handler
    onPointerOver() {
        this.button.texture = PIXI.Texture.from(this.textureOver);
    }

    // Button click (mouse down) handler
    onPointerDown() {
        this.button.texture = PIXI.Texture.from(this.textureDown);
    }

    // Button mouse out handler
    onPointerOut() {
        this.button.texture = PIXI.Texture.from(this.textureNormal);
    }
}