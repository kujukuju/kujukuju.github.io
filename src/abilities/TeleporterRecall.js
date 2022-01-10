class TeleporterRecall {
    static RECALL_TEXTURE = PIXI.Texture.from('assets/teleport-recall.png');
    static EFFECT_TEXTURE = PIXI.Texture.from('assets/teleport-effect.png');
    static COOLDOWN = 400;

    static TELEPORT_AUDIO = new NSWA.Source('assets/teleport.mp3', {volume: 0.5});
    static RECALL_AUDIO = new NSWA.Source('assets/teleport-recall.mp3', {volume: 0.05, loop: true});

    entity;
    recallLocation;

    recallSprite;
    effectSprite;

    cooldownTicks;

    recalled;
s
    teleportAudio;
    recallAudio;

    constructor(entity, recallLocation) {
        this.entity = entity;

        this.recallLocation = recallLocation || Vec2.copy(entity.controller.position);

        this.recallSprite = new FramedSprite(TeleporterRecall.RECALL_TEXTURE, 50, 46, 2, 4);
        this.recallSprite.anchor.x = 0.5;
        this.recallSprite.anchor.y = 0.5;
        this.recallSprite.position.x = this.recallLocation.x;
        this.recallSprite.position.y = this.recallLocation.y - 15;
        this.effectSprite = new FramedSprite(TeleporterRecall.EFFECT_TEXTURE, 50, 46, 5, 13);
        this.effectSprite.anchor.x = 0.5;
        this.effectSprite.anchor.y = 1;
        this.effectSprite.visible = false;

        this.recalled = false;

        Renderer.backgroundish.addChild(this.recallSprite);
        Renderer.foreground.addChild(this.effectSprite);

        this.cooldownTicks = 0;
        
        this.recallAudio = TeleporterRecall.RECALL_AUDIO.create();
        this.recallAudio.setPannerOrientation(0, 0, -1);
        this.recallAudio.setPannerPosition(this.recallLocation.x * AudioManager.SCALE, this.recallLocation.y * AudioManager.SCALE, 0);
    }

    update() {
        if (this.recalled) {
            this.cooldownTicks++;

            this.recallSprite.visible = false;
            this.effectSprite.visible = true;
            this.effectSprite.position.x = this.entity.controller.position.x;
            this.effectSprite.position.y = this.entity.controller.position.y;
            this.effectSprite.stepAnimation(null, 0.3, false);

            this.recallAudio.stop();

            return;
        }

        this.recallSprite.stepAnimation(null, 0.2, true);
        AudioManager.autoAdjustVolume(this.recallAudio, false, 250);
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

        this.teleportAudio = TeleporterRecall.TELEPORT_AUDIO.create();
        this.teleportAudio.play();
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
        this.recallAudio.destroy();

        if (this.teleportAudio) {
            this.teleportAudio.destroy();
        }
    }
}
