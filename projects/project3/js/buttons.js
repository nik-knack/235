class Button extends PIXI.Sprite {
    constructor(textureNormal, textureOver, textureDown, x, y, width = null, height = null, onClick = null) {
        // Call the PIXI.Sprite constructor with the normal texture
        super(PIXI.Texture.from(textureNormal));
        
        // If width and height are not provided, use the texture's actual size
        if (!width || !height) {
            // Use the width and height of the texture if not provided explicitly
            width = this.width;
            height = this.height;
        }

        // Set the width and height of the button
        this.width = width;
        this.height = height;

        // Set position to the center of the button's image
        this.x = x - this.width / 2;
        this.y = y - this.height / 2;

        // Store the textures for different states
        this.textureNormal = PIXI.Texture.from(textureNormal);
        this.textureOver = PIXI.Texture.from(textureOver);
        this.textureDown = PIXI.Texture.from(textureDown);

        // Enable interactivity
        this.interactive = true;
        this.buttonMode = true;

        // If onClick function is provided, use it
        this.onClick = onClick && typeof onClick === 'function' ? onClick : () => {};

        // Event listeners for button interactions
        this.on("pointerup", this.onPointerUp.bind(this))
            .on("pointerover", this.onPointerOver.bind(this))
            .on("pointerdown", this.onPointerDown.bind(this))
            .on("pointerout", this.onPointerOut.bind(this));
    }

    onPointerDown() {
        this.texture = this.textureDown;
    }

    onPointerUp() {
        this.texture = this.textureNormal;
        this.onClick(); // Call the provided onClick function
    }

    onPointerOver() {
        this.texture = this.textureOver;
    }

    onPointerOut() {
        this.texture = this.textureNormal;
    }
}
