class Hearts extends PIXI.Container {
    static TEXTURE = PIXI.Texture.from('assets/heart.png');
    static SPACING = 4;
    static FADE_DURATION = 10;
    static TOTAL_DURATION = 60;

    hearts;
    spacing;

    alwaysShow;
    changedRemainingTicks;

    lastHealth;

    constructor() {
        super();

        this.hearts = [];
        this.spacing = Hearts.SPACING;

        this.alwaysShow = false;
        this.changedRemainingTicks = 0;

        this.lastHealth = 0;
    }

    update(entity) {
        const health = entity ? entity.remainingHearts : 0;
        if (health !== this.lastHealth) {
            this.lastHealth = health;
            this.changedRemainingTicks = Hearts.TOTAL_DURATION;
        }

        const progress = Math.min(this.changedRemainingTicks / Hearts.FADE_DURATION, 1);
        const opacity = this.alwaysShow ? 1 : easeInOut(progress);
        this.alpha = opacity;

        this.changedRemainingTicks = Math.max(this.changedRemainingTicks - 1, 0);

        if (entity && opacity > 0) {
            while (this.hearts.length < entity.maxHearts) {
                const heart = new FramedSprite(Hearts.TEXTURE, 11, 10, 2, 2);
                heart.anchor.y = 1;

                this.hearts.push(heart);
                this.addChild(heart);
            }

            for (let i = 0; i < this.hearts.length; i++) {
                this.hearts[i].visible = false;
            }

            const visibleCount = entity.maxHearts;
            const width = visibleCount * 11 + (visibleCount - 1) * this.spacing;

            const left = Math.round(-width / 2);
            for (let i = 0; i < visibleCount; i++) {
                this.hearts[i].visible = true;
                this.hearts[i].position.x = left + i * 11 + i * this.spacing;
                this.hearts[i].position.y = 0;
            }

            for (let i = 0; i < this.hearts.length; i++) {
                if (i < entity.remainingHearts) {
                    this.hearts[i].gotoAnimation(null, 0);
                } else {
                    this.hearts[i].gotoAnimation(null, 1);
                }
            }
        } else {
            for (let i = 0; i < this.hearts.length; i++) {
                this.hearts[i].visible = false;
            }
        }
    }

    destroy() {
        for (let i = 0; i < this.hearts.length; i++) {
            this.hearts[i].destroy();
        }

        super.destroy();
    }
}