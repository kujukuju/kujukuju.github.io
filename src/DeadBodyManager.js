class DeadBodyManager {
    static DEAD_MOON_TEXTURE = PIXI.Texture.from('assets/baldling-death.png');
    static DEAD_SLIME_TEXTURE = PIXI.Texture.from('assets/slime-death.png');
    static DEAD_WORM_TEXTURE = PIXI.Texture.from('assets/worm-death.png');
    static DEAD_WORM_TEXTURES = [
        new PIXI.Texture(DeadBodyManager.DEAD_WORM_TEXTURE, new PIXI.Rectangle(0, 0, 199, 32)),
        new PIXI.Texture(DeadBodyManager.DEAD_WORM_TEXTURE, new PIXI.Rectangle(0, 32, 199, 32)),
        new PIXI.Texture(DeadBodyManager.DEAD_WORM_TEXTURE, new PIXI.Rectangle(0, 64, 199, 32)),
        new PIXI.Texture(DeadBodyManager.DEAD_WORM_TEXTURE, new PIXI.Rectangle(0, 96, 199, 32)),
    ];
    static DEAD_BIRD_TEXTURE = PIXI.Texture.from('assets/bird-death.png');
    static DEAD_BOSS_TEXTURE = PIXI.Texture.from('assets/boss-death.png');
    static DEAD_BOSS_TEXTURES = [
        new PIXI.Texture(DeadBodyManager.DEAD_BOSS_TEXTURE, new PIXI.Rectangle(0, 0, 1024, 135)),
        new PIXI.Texture(DeadBodyManager.DEAD_BOSS_TEXTURE, new PIXI.Rectangle(0, 135, 1024, 135)),
        new PIXI.Texture(DeadBodyManager.DEAD_BOSS_TEXTURE, new PIXI.Rectangle(0, 170, 1024, 135)),
        new PIXI.Texture(DeadBodyManager.DEAD_BOSS_TEXTURE, new PIXI.Rectangle(0, 305, 1024, 135)),
    ];

    // time: sprite
    static bodies = {};

    static update() {
        // animate them
        const now = Date.now();
        for (const time in DeadBodyManager.bodies) {
            const realTime = Number.parseInt(time);
            if (now - realTime > 24000) {
                DeadBodyManager.bodies[time].destroy();
                delete DeadBodyManager.bodies[time];
                continue;
            }

            if (DeadBodyManager.bodies[time] instanceof FramedSprite) {
                DeadBodyManager.bodies[time].stepAnimation(null, 0.2, false);
            } else {
                const progress = Math.min((now - realTime) / 800, 1);
                const frame = Math.floor(progress * 3);

                if (DeadBodyManager.bodies[time].__type === 'worm') {
                    DeadBodyManager.bodies[time].texture = DeadBodyManager.DEAD_WORM_TEXTURES[frame];
                } else {
                    if (DeadBodyManager.bodies[time].__type === 'boss') {
                        DeadBodyManager.bodies[time].texture = DeadBodyManager.DEAD_BOSS_TEXTURES[frame];
                    } else {
                        // its cursed idk delete it
                        DeadBodyManager.bodies[time].destroy();
                        delete DeadBodyManager.bodies[time];
                    }
                }
            }
        }
    }

    static addDeadMoonEntity(position) {
        const sprite = new FramedSprite(DeadBodyManager.DEAD_MOON_TEXTURE, 45, 54, 5, 5);
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 51 / 54;
        sprite.position.x = position.x;
        sprite.position.y = position.y;
        Renderer.midground.addChild(sprite);

        const now = Date.now();
        if (DeadBodyManager.bodies[now]) {
            DeadBodyManager.bodies[now].destroy();
        }
        DeadBodyManager.bodies[now] = sprite;
    }

    static addDeadSlimeEntity(position) {
        const sprite = new FramedSprite(DeadBodyManager.DEAD_SLIME_TEXTURE, 23, 18, 5, 5);
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        sprite.position.x = position.x;
        sprite.position.y = position.y;
        Renderer.midground.addChild(sprite);

        const now = Date.now();
        if (DeadBodyManager.bodies[now]) {
            DeadBodyManager.bodies[now].destroy();
        }
        DeadBodyManager.bodies[now] = sprite;
    }

    static addDeadWormEntity(points) {
        const sprite = new PIXI.SimpleRope(DeadBodyManager.DEAD_WORM_TEXTURES[0], points);
        Renderer.midground.addChild(sprite);

        const now = Date.now();
        if (DeadBodyManager.bodies[now]) {
            DeadBodyManager.bodies[now].destroy();
        }
        sprite.__type = 'worm';
        DeadBodyManager.bodies[now] = sprite;
    }

    static addDeadBirdEntity(position) {
        const sprite = new FramedSprite(DeadBodyManager.DEAD_BIRD_TEXTURE, 37, 36, 4, 4);
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 1;
        sprite.position.x = position.x;
        sprite.position.y = position.y;
        Renderer.midground.addChild(sprite);

        const now = Date.now();
        if (DeadBodyManager.bodies[now]) {
            DeadBodyManager.bodies[now].destroy();
        }
        DeadBodyManager.bodies[now] = sprite;
    }

    static addDeadBossEntity(points) {
        const sprite = new PIXI.SimpleRope(DeadBodyManager.DEAD_BOSS_TEXTURES[0], points);
        Renderer.midground.addChild(sprite);

        const now = Date.now();
        if (DeadBodyManager.bodies[now]) {
            DeadBodyManager.bodies[now].destroy();
        }
        sprite.__type = 'boss';
        DeadBodyManager.bodies[now] = sprite;
    }
}
