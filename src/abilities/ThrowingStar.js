class ThrowingStar {
    static TEXTURE = PIXI.Texture.from('assets/spike.png');
    static SPEED = 12;
    static COOLDOWN = 30;
    static DESPAWN_TICKS = 400;

    sprite;
    direction;
    stuck;
    despawnTicks;
    moon;
    speed;
    hit;

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
    }
}