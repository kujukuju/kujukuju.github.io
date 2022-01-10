class FloatingSoul extends PixelScan.FramedSprite {
    static TEXTURE = PIXI.Texture.from('assets/soul.png');

    static FRAME_COUNT = 40;

    startPosition;
    velocity;
    frames;

    finished;

    EntityClass;

    constructor(position, EntityClass) {
        super(FloatingSoul.TEXTURE, 16, 16, 4, 4);

        this.EntityClass = EntityClass;

        this.startPosition = Vec2.copy(position);
        this.position.x = position.x;
        this.position.y = position.y;
        this.velocity = Vec2.fromAngle(Math.random() * Math.PI * 2);

        this.anchor.x = 0.5;
        this.anchor.y = 0.5;

        this.alpha = 0.8;

        this.frames = 0;

        this.finished = false;
    }

    update() {
        const entity = EntityInformation.getMoonEntity();
        if (!entity) {
            this.finished = true;
            return;
        }

        this.stepAnimation(null, 0.2);

        this.frames++;
        const progress = Math.max(Math.min(this.frames / FloatingSoul.FRAME_COUNT, 1), 0);

        const desiredPosition = Vec2.copy(entity.getPosition());
        const position = new Vec2();
        Utilities.hermite(progress, [this.startPosition, desiredPosition], [this.velocity, new Vec2(0, 0)], position);

        if (desiredPosition.distance(position) < 10) {
            this.finished = true;
        }

        this.position.x = position.x;
        this.position.y = position.y;
    }

    shouldDestroy() {
        return this.finished;
    }

    destroy() {
        super.destroy();

        const entity = EntityInformation.getMoonEntity();
        if (entity) {
            if (entity instanceof MoonEntity) {
                SoulPlantManager.holdingCountMoon += 1;
            }
            if (entity instanceof StickySlimeEntity) {
                SoulPlantManager.holdingCountSlime += 1;
                SoulPlantManager.holdingCountMoon += 1;
            }
            if (entity instanceof WormEntity) {
                SoulPlantManager.holdingCountWorm += 1;
                SoulPlantManager.holdingCountMoon += 1;
            }
            if (entity instanceof BirdEntity) {
                SoulPlantManager.holdingCountBird += 1;
                SoulPlantManager.holdingCountMoon += 1;
            }
            if (entity instanceof BossEntity) {
                SoulPlantManager.holdingCountBoss += 1;
                SoulPlantManager.holdingCountMoon += 1;
            }
        }

        if (window.location.protocol.startsWith('file') && TwitchPackets._username === 'kujukuju') {
            if (entity instanceof MoonEntity) {
                SoulPlantManager.convertMoon(this.EntityClass);
            }
        }
    }
}