class Environment {
    static FOREGROUND = PIXI.Texture.from('assets/physics.png');
    static BACKGROUND = PIXI.Texture.from('assets/background.png');

    static foregroundSprite;
    static backgroundSprite;

    static PARALLAX_TEXTURES = [
        PIXI.Texture.from('assets/11.png'),
        PIXI.Texture.from('assets/10.png'),
        PIXI.Texture.from('assets/9.png'),
        PIXI.Texture.from('assets/8.png'),
        PIXI.Texture.from('assets/7.png'),
        PIXI.Texture.from('assets/6.png'),
        PIXI.Texture.from('assets/5.png'),
        PIXI.Texture.from('assets/4.png'),
        PIXI.Texture.from('assets/3.png'),
        PIXI.Texture.from('assets/2.png'),
        PIXI.Texture.from('assets/1.png'),
    ];

    static parallaxSprites = [];

    static initialize() {
        Environment.foregroundSprite = new PIXI.Sprite(Environment.FOREGROUND);
        Environment.backgroundSprite = new PIXI.Sprite(Environment.BACKGROUND);

        Renderer.foreground.addChild(Environment.foregroundSprite);
        Renderer.background.addChild(Environment.backgroundSprite);

        const aabb = new AABB(0, 0, Environment.FOREGROUND.width, Environment.FOREGROUND.height);

        for (let i = 0; i < Environment.PARALLAX_TEXTURES.length; i++) {
            const sprite = new ParallaxSprite(Environment.PARALLAX_TEXTURES[i], aabb);
            Environment.parallaxSprites.push(sprite);
            Renderer.parallax.addChild(sprite);
        }
    }

    static update() {
        for (let i = 0; i < Environment.parallaxSprites.length; i++) {
            Environment.parallaxSprites[i].update(Camera.aabb);
        }
    }
}