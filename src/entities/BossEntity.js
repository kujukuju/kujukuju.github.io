class BossEntity {
    static TEXTURE = PIXI.Texture.from('assets/giant-worm.png');
    static AUDIO = new NSWA.Source('assets/big-worm.mp3', {loop: true, volume: 0.6});

    static maxHearts = 20;
    static remainingHearts = 20;

    sprite;
    controller;

    history;
    accurateHistory;

    points;

    maxSegmentLength;

    name;
    hearts;
    invulnTicks;

    audio;

    constructor(username) {
        if (username === 'kujukuju') {
            username = 'bald';
        }

        this.maxSegmentLength = BossEntity.TEXTURE.width / 40;
        this.points = [];
        for (let i = 0; i <= 40; i++) {
            this.points.push(new PIXI.Point(0, 0));
        }

        this.sprite = new PIXI.SimpleRope(BossEntity.TEXTURE, this.points);

        this.controller = new BossController();

        this.accurateHistory = new MovementHistory();
        this.accurateHistory.storageLength = BossEntity.TEXTURE.width;
        this.history = new MovementHistory();

        if (username === 'bald') {
            this.maxHearts = BossEntity.maxHearts;
            this.remainingHearts = BossEntity.remainingHearts;
        } else {
            this.maxHearts = 20;
            this.remainingHearts = 20;
        }

        Renderer.midground.addChild(this.sprite);

        this.name = new PIXI.Text(username, {fontFamily: 'Alagard', fontSize: 160, align: 'center', fill: 0xffffff});
        this.name.anchor.x = 0.5;
        this.name.anchor.y = 1;
        this.name.scale.x = 0.1;
        this.name.scale.y = 0.1;
        Renderer.names.addChild(this.name);

        this.hearts = new Hearts();
        this.hearts.scale.x = 2 / 3;
        this.hearts.scale.y = 2 / 3;
        this.hearts.spacing = 1;
        Renderer.names.addChild(this.hearts);

        this.invulnTicks = 120;

        this.audio = BossEntity.AUDIO.create();
        this.audio.setPannerOrientation(0, 0, -1);
    }

    update() {
        this.invulnTicks = Math.max(this.invulnTicks - 1, 0);
        this.accurateHistory.storageLength = BossEntity.TEXTURE.width;

        if (Math.round(this.invulnTicks / 10) % 2 === 1) {
            this.sprite.filters = [WHITE_FILTER];
        } else {
            if (this.sprite.filters) {
                this.sprite.filters.length = 0;
            }
        }
        
        if (EntityInformation.getClientEntity() === this) {
            this.controller.applyAcceleration(Camera.getMousePosition(), Input.mouseDownLeft, this.points);

            this.accurateHistory.add(Date.now(), this.controller.position.x, this.controller.position.y, 0, 0); // this.controller.velocity.x, this.controller.velocity.y);

            const requiredDistances = [];
            for (let i = 0; i <= 40; i++) {
                const distance = BossEntity.TEXTURE.width - i * this.maxSegmentLength;
                requiredDistances.push(distance);
            }

            const distancePoints = this.accurateHistory.getDistances(requiredDistances);
            // for (let i = distancePoints.length - 1; i >= 0; i--) {
            for (let i = 0; i < distancePoints.length; i++) {
                // TODO should definitely not call this 20 times right?
                const position = distancePoints[i];
                this.points[i].x = position.x;
                this.points[i].y = position.y;
            }

            this.name.position.x = this.controller.position.x;
            this.name.position.y = this.controller.position.y - 48;

            InterfaceManager.setAbilityCooldown(0, this.controller.availableDashCharge / this.controller.maxDashCharge);

            if (window.location.protocol.startsWith('file') && TwitchPackets._username === 'kujukuju') {
                const mouthAABB = new AABB(this.controller.position.x - 50, this.controller.position.y - 50, 100, 100);

                const entities = EntityInformation.getPlebEntities();
                for (let i = 0; i < entities.length; i++) {
                    if (entities[i].doesCollide(mouthAABB)) {
                        entities[i].setHealth(entities[i].getHealth() - 1);
                    }
                }
            }

            this.audio.setPannerPosition(this.controller.position.x * AudioManager.SCALE, this.controller.position.y * AudioManager.SCALE, 0);
        } else {
            const position = this.history.get(Date.now() - 500, 500);
            // const [position, velocity] = this.history.getPositionAndVelocity(Date.now() - 500);
            this.accurateHistory.add(Date.now(), position.x, position.y, 0, 0); // velocity.x, velocity.y);

            const requiredDistances = [];
            for (let i = 0; i <= 40; i++) {
                const distance = BossEntity.TEXTURE.width - i * this.maxSegmentLength;
                requiredDistances.push(distance);
            }

            const distancePoints = this.accurateHistory.getDistances(requiredDistances);
            // for (let i = distancePoints.length - 1; i >= 0; i--) {
            for (let i = 0; i < distancePoints.length; i++) {
                // TODO should definitely not call this 20 times right?
                const position = distancePoints[i];
                this.points[i].x = position.x;
                this.points[i].y = position.y;
            }

            this.name.position.x = position.x;
            this.name.position.y = position.y - 48;

            this.hearts.update(this);
            this.hearts.position.x = position.x;
            this.hearts.position.y = position.y - 58;

            if (window.location.protocol.startsWith('file') && TwitchPackets._username === 'kujukuju') {
                const mouthAABB = new AABB(position.x - 50, position.y - 50, 100, 100);

                const moonEntity = EntityInformation.getMoonEntity();
                if (moonEntity && moonEntity.doesCollide(mouthAABB)) {
                    moonEntity.setHealth(moonEntity.getHealth() - 1);
                }
            }

            this.audio.setPannerPosition(position.x * AudioManager.SCALE, position.y * AudioManager.SCALE, 0);
        }

        AudioManager.autoAdjustVolume(this.audio, EntityInformation.getClientEntity() === this);
    }

    sendPackets() {
        if (!TwitchPackets.canSendPacketImmediately()) {
            return;
        }

        const bytes = [];
        let index = 0;

        const [prevPosition, prevVelocity] = this.accurateHistory.getPositionAndVelocity(Date.now() - 250);

        index = Packets.writeValidatePacket(TwitchPackets._username, bytes, index);
        index = Packets.writeEntityPacket(PacketProcessor.ENTITY_TYPE_BOSS, bytes, index);
        index = Packets.writePositionVelocityPacket(
            this.controller.position.x, this.controller.position.y, this.controller.velocity.x, this.controller.velocity.y,
            prevPosition.x, prevPosition.y, prevVelocity.x, prevVelocity.y,
            bytes, index);

        MoonPackets.send(bytes);
    }

    addHistory(positionX, positionY, velocityX, velocityY) {
        this.history.add(Date.now(), positionX, positionY, velocityX, velocityY);
    }

    doesCollide(aabb) {
        if (this.invulnTicks > 0) {
            return false;
        }

        const defaultRadius = 10;

        // diagonal isnt needed, this isnt accurate either way
        const additionalRadius = Math.max(aabb.width / 2, aabb.height / 2);
        const radius = defaultRadius + additionalRadius;

        const point = new Vec2(aabb.x + aabb.width / 2, aabb.y + aabb.height / 2);
        for (let i = 0; i < this.points.length - 1; i++) {
            const currentPoint = this.points[i];
            const nextPoint = this.points[i + 1];

            const line = [currentPoint, nextPoint];

            if (distanceToLineSegment(line, point) <= radius) {
                this.invulnTicks = 20;

                return true;
            }
        }

        return false;
    }

    getHealth() {
        return this.remainingHearts;
    }

    getAttachmentOffset(point) {
        const attachmentOffset = new Vec2(0, 0);

        let leastDistance = 100000000;
        for (let i = 0; i < this.points.length - 1; i++) {
            const currentPoint = this.points[i];
            const nextPoint = this.points[i + 1];

            const line = [currentPoint, nextPoint];

            const distance = distanceToLineSegment(line, point);
            if (distance < leastDistance) {
                leastDistance = distance;
                attachmentOffset.x = i;
                if (point.y < currentPoint.y) {
                    attachmentOffset.y = -60;
                } else {
                    attachmentOffset.y = 60;
                }
            }
        }

        return attachmentOffset;
    }

    getAttachmentPoint(offsetVector) {
        if (this.points.length === 0) {
            return new Vec2(0, 0);
        }

        if (this.points.length === 1) {
            new Vec2(this.points[0].x, this.points[0].y);
        }

        if (!this.points[offsetVector.x]) {
            return new Vec2(this.points[this.points.length - 1].x, this.points[this.points.length - 1].y);
        }

        const point = Vec2.copy(this.points[offsetVector.x]);
        let nextVector = new Vec2();
        if (this.points[offsetVector.x + 1]) {
            nextVector.copy(point).subtract(this.points[offsetVector.x + 1]);
            nextVector.normalize();
            nextVector.orthogonal();
            nextVector.mul(offsetVector.y);

            point.add(nextVector);
        } else if (this.points[offsetVector.x - 1]) {
            nextVector.copy(this.points[offsetVector.x - 1]).subtract(point);
            nextVector.normalize();
            nextVector.orthogonal();
            nextVector.mul(offsetVector.y);

            point.add(nextVector);
        }

        return point;
    }

    setHealth(health) {
        const damaging = health < this.remainingHearts;
        if (damaging) {
            if (this === EntityInformation.getClientEntity()) {
                Camera.shake();
            }

            const position = this.getPosition();
            AudioManager.playHitNoise(position.x, position.y);
        }

        this.remainingHearts = health;
        if (this.remainingHearts <= 0) {
            this.remainingHearts = 0;

            // kill entity
            // entities will need to send an I respawned packet, I guess
            
            if (window.location.protocol.startsWith('file') && TwitchPackets._username === 'kujukuju') {
                this.kill();
            }
        }

        // apply effect, if this is moon inform them theyve received damage if its lower
        if (window.location.protocol.startsWith('file') && TwitchPackets._username === 'kujukuju') {
            const bytes = [];
            Packets.writeSetHealthPacket(this.__name, health, bytes, 0);
            MoonPackets.addAdditionalPacketBytes(bytes);
        }
    }

    getPosition() {
        return this.points[this.points.length - 1] || new Vec2(0, 0);
    }

    kill() {
        if (window.location.protocol.startsWith('file') && TwitchPackets._username === 'kujukuju') {
            if (EntityInformation.getMoonEntity() === this) {
                // if this is moon, then pop back into moon form
                SoulPlantManager.convertMoon(MoonEntity);
                return;
            }

            const bytes = [];
            Packets.writeKillEntityPacket(this.__name, bytes, 0);
            MoonPackets.addAdditionalPacketBytes(bytes);
        }

        DeadBodyManager.addDeadBossEntity(this.points);
        EntityInformation.addDeadEntity(this.__name);

        if (EntityInformation.getClientEntity() === this) {
            GameState.spawnCooldown = GameState.DEATH_COOLDOWN;
        } else {
            SoulPlantManager.receiveSoul(this.points[this.points.length - 1], BossEntity);
        }

        this.destroy();
    }

    performedDetachMovement() {
        return this.controller.dashing;
    }

    destroy() {
        this.sprite.destroy();
        this.name.destroy();
        this.hearts.destroy();
        this.audio.destroy();

        EntityInformation.silentRemoveEntity(this);
    }
}