class TeleporterRecall {
    static RECALL_TEXTURE = PIXI.Texture.from('assets/teleport-recall.png');
    static EFFECT_TEXTURE = PIXI.Texture.from('assets/teleport-effect.png');
    static COOLDOWN = 400;

    entity;
    recallLocation;

    recallSprite;
    effectSprite;

    cooldownTicks;

    recalled;

    constructor(entity, recallLocation) {
        this.entity = entity;

        this.recallLocation = recallLocation || Vec2.copy(entity.controller.position);

        this.recallSprite = new FramedSprite(TeleporterRecall.RECALL_TEXTURE, 16, 16, 3, 3);
        this.recallSprite.anchor.x = 0.5;
        this.recallSprite.anchor.y = 0.5;
        this.recallSprite.position.x = this.recallLocation.x;
        this.recallSprite.position.y = this.recallLocation.y - 15;
        this.effectSprite = new FramedSprite(TeleporterRecall.EFFECT_TEXTURE, 32, 45, 9, 9);
        this.effectSprite.anchor.x = 0.5;
        this.effectSprite.anchor.y = 0.9;
        this.effectSprite.alpha = 0.8;
        this.effectSprite.visible = false;

        this.recalled = false;

        Renderer.backgroundish.addChild(this.recallSprite);
        Renderer.foreground.addChild(this.effectSprite);

        // send the packet
        // if (window.location.protocol.startsWith('file') && TwitchPackets._username === 'kujukuju') {
        // }

        this.cooldownTicks = 0;
    }

    update() {
        if (this.recalled) {
            this.cooldownTicks++;

            this.recallSprite.visible = false;
            this.effectSprite.visible = true;
            this.effectSprite.position.x = this.entity.controller.position.x;
            this.effectSprite.position.y = this.entity.controller.position.y;
            this.effectSprite.stepAnimation(null, 0.2, false);

            return;
        }

        this.recallSprite.stepAnimation(0.2, true);
    }

    recall() {
        if (this.recalled) {
            return;
        }

        this.recalled = true;
        this.entity.controller.position.copy(this.recallLocation);
        if (this.entity.controller.velocity.y > 0) {
            this.entity.controller.velocity.y = 0;
        }
    }

    getCooldownPercentage() {
        return Math.min(this.cooldownTicks / TeleporterRecall.COOLDOWN, 1);
    }

    shouldDestroy() {
        return this.cooldownTicks >= TeleporterRecall.COOLDOWN;
    }

    destroy() {
        this.recallSprite.destroy();
        this.effectSprite.destroy();
    }
}
