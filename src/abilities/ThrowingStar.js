class ThrowingStar {
    static TEXTURE = PIXI.Texture.from('assets/spike.png');
    static SPEED = 12;
    static COOLDOWN = 30;
    static DESPAWN_TICKS = 400;

    static AUDIO = new NSWA.Source('assets/throwing-star.mp3', {volume: 0.45});
    static HIT_WALL_AUDIO = new NSWA.Source('assets/hit-wall.mp3', {volume: 0.5});

    sprite;
    direction;
    stuck;
    despawnTicks;
    moon;
    speed;
    hit;

    audio;
    hitWallAudio;

    constructor(position, direction) {
        this.moon = window.location.protocol.startsWith('file') && TwitchPackets._username === 'kujukuju';

        this.sprite = new PIXI.Sprite(ThrowingStar.TEXTURE);
        this.sprite.anchor.x = 0.75;
        this.sprite.anchor.y = 0.5;
        this.sprite.position.x = position.x;
        this.sprite.position.y = position.y;

        this.direction = direction;
        this.direction.normalize();

        this.stuck = false;
        this.despawnTicks = 0;

        this.speed = ThrowingStar.SPEED;
        this.hit = false;

        // send packet
        if (this.moon) {
            const bytes = [];
            Packets.writeThrowingStarPacket(position, direction, bytes, 0);
            MoonPackets.addAdditionalPacketBytes(bytes);
        }

        Renderer.midground.addChild(this.sprite);

        this.audio = ThrowingStar.AUDIO.create();
        this.audio.setPannerOrientation(0, 0, -1);
        this.audio.setPannerPosition(position.x * AudioManager.SCALE, position.y * AudioManager.SCALE, 0);
        this.audio.play();
    }

    update() {
        if (this.stuck) {
            this.despawnTicks++;
            return;
        }

        this.direction.y += 0.03;
        this.direction.normalize();

        const previousPositionX = Math.round(this.sprite.position.x);
        const previousPositionY = Math.round(this.sprite.position.y);

        this.sprite.position.x += this.direction.x * this.speed;
        this.sprite.position.y += this.direction.y * ThrowingStar.SPEED;
        this.sprite.rotation = Math.atan2(this.direction.y * ThrowingStar.SPEED, this.direction.x * this.speed);

        this.speed = Math.max(this.speed - 0.2, 6);

        const positionX = Math.round(this.sprite.position.x);
        const positionY = Math.round(this.sprite.position.y);
        for (let x = -4; x <= 4; x++) {
            if (Physics.world.getPixel(positionX + x, positionY)) {
                this.stuck = true;

                this.hitWallAudio = ThrowingStar.HIT_WALL_AUDIO.create();
                this.hitWallAudio.setPannerOrientation(0, 0, -1);
                this.hitWallAudio.setPannerPosition(positionX * AudioManager.SCALE, positionY * AudioManager.SCALE, 0);
                AudioManager.autoAdjustVolume(this.hitWallAudio);

                const pixel = Physics.world.scanLineEmpty(new Vec2(positionX, positionY), new Vec2(previousPositionX, previousPositionY));
                if (pixel) {
                    this.sprite.position.x = pixel.x;
                    this.sprite.position.y = pixel.y;
                }

                break;
            }
        }

        // check for collisions
        if (this.moon) {
            const aabb = new AABB(this.sprite.position.x, this.sprite.position.y, 1, 1);

            const entities = EntityInformation.getPlebEntities();
            for (let i = 0; i < entities.length; i++) {
                const entity = entities[i];
                if (entity.doesCollide(aabb)) {
                    entity.setHealth(entity.getHealth() - 1);
                    this.hit = true;
                }
            }
        }
    }

    shouldDestroy() {
        return this.hit || this.despawnTicks >= ThrowingStar.DESPAWN_TICKS;
    }

    destroy() {
        this.sprite.destroy();
        this.audio.destroy();
        if (this.hitWallAudio) {
            this.hitWallAudio.destroy();
        }
    }
}