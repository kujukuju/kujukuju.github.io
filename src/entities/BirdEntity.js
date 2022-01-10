class BirdEntity {
    static TEXTURE = PIXI.Texture.from('assets/bird.png');
    static HELICOPTER_AUDIO = new NSWA.Source('assets/helicopter.mp3', {loop: true, volume: 0.6});
    static DROP_AUDIO = new NSWA.Source('assets/bird-drop.mp3', {loop: false, volume: 0.8});

    static maxHearts = 4;
    static remainingHearts = 4;

    sprite;
    controller;
    aabb;

    history;

    accurateHistory;

    name;
    hearts;
    invulnTicks;

    networkedSlamming;

    slammingRecovery;
    flyingFrames;

    sendSlamming;

    helicopterAudio;
    dropAudio;

    isRecovering = false;

    constructor(username) {
        if (username === 'kujukuju') {
            username = 'bald';
        }

        this.sprite = new FramedSprite(BirdEntity.TEXTURE, 37, 36, 10, 19);
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 1;
        this.sprite.addAnimation('flyingstart', 0, 4);
        this.sprite.addAnimation('flying', 4, 5);
        this.sprite.addAnimation('falling', 9, 3);
        this.sprite.addAnimation('recovery', 12, 7);

        this.controller = new BirdController();
        this.aabb = new AABB(-8, -20, 16, 20);

        this.history = new MovementHistory();
        this.accurateHistory = new MovementHistory();

        if (username === 'bald') {
            this.maxHearts = BirdEntity.maxHearts;
            this.remainingHearts = BirdEntity.remainingHearts;
        } else {
            this.maxHearts = 4;
            this.remainingHearts = 4;
        }

        Renderer.midground.addChild(this.sprite);

        this.name = new PIXI.Text(username, {fontFamily: 'Alagard', fontSize: 80, align: 'center', fill: 0xffffff});
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

        this.networkedSlamming = false;

        this.sendSlamming = false;

        this.helicopterAudio = BirdEntity.HELICOPTER_AUDIO.create();
        this.helicopterAudio.setPannerOrientation(0, 0, -1);

        this.dropAudio = BirdEntity.DROP_AUDIO.create();
        this.dropAudio.setPannerOrientation(0, 0, -1);
    }

    update() {
        this.invulnTicks = Math.max(this.invulnTicks - 1, 0);
        this.accurateHistory.storageLength = null;

        if (Math.round(this.invulnTicks / 10) % 2 === 1) {
            this.sprite.filters = [WHITE_FILTER];
        } else {
            if (this.sprite.filters) {
                this.sprite.filters.length = 0;
            }
        }

        let slamming = false;
        let onGround = false;
        let fakeVelocityX = 0;

        if (EntityInformation.getClientEntity() === this) {
            this.controller.applyAcceleration(Input.keys[Input.KEY_W] || Input.keys[Input.KEY_SPACE], Input.keys[Input.KEY_A], Input.keys[Input.KEY_S], Input.keys[Input.KEY_D], Input.mouseDownLeft);

            if (this.controller.jumped) {
                this.detach(true);
            }
            
            Physics.world.resolvePhysics(this.controller, this.aabb);

            potentiallyUnstuck(this.controller.position, this.aabb);

            onGround = this.controller.ground;

            this.sprite.position.x = Math.round(this.controller.position.x);
            this.sprite.position.y = Math.round(this.controller.position.y);

            this.accurateHistory.add(Date.now(), this.controller.position.x, this.controller.position.y, this.controller.velocity.x, this.controller.velocity.y);

            InterfaceManager.setAbilityCooldown(0, 1 - this.controller.slamCooldown / this.controller.maxSlamCooldown);

            slamming = this.controller.slamming;
            if (this.controller.slamming) {
                this.sendSlamming = true;
            }

            // if youre moon check whether or not youve succeeded in attaching to an enemy
            if (window.location.protocol.startsWith('file') && TwitchPackets._username === 'kujukuju') {
                if (this.controller.slamming && this.controller.velocity.y > 0.1) {
                    const mouthAABB = new AABB(this.controller.position.x - 8, this.controller.position.y - 20, 16, 20);

                    const entities = EntityInformation.getPlebEntities();
                    for (let i = 0; i < entities.length; i++) {
                        if (entities[i].doesCollide(mouthAABB)) {
                            entities[i].setHealth(entities[i].getHealth() - 1);
                        }
                    }
                }
            }

            fakeVelocityX = this.controller.velocity.x;

            this.helicopterAudio.setPannerPosition(this.controller.position.x * AudioManager.SCALE, this.controller.position.y * AudioManager.SCALE, 0);
            this.dropAudio.setPannerPosition(this.controller.position.x * AudioManager.SCALE, this.controller.position.y * AudioManager.SCALE, 0);
        } else {
            const position = this.history.get(Date.now() - 500);

            fakeVelocityX = position.x - this.sprite.position.x;
            const fakeVelocityY = position.y - this.sprite.position.y;
            this.sprite.position.x = position.x;
            this.sprite.position.y = position.y;

            this.hearts.update(this);
            this.hearts.position.x = this.sprite.position.x;
            this.hearts.position.y = this.sprite.position.y - 38;

            slamming = this.networkedSlamming && fakeVelocityY > 0.1;

            // if youre moon check whether or not youve succeeded in attaching to an enemy
            if (window.location.protocol.startsWith('file') && TwitchPackets._username === 'kujukuju') {
                // check if I damaged moon
                if (slamming) {
                    const mouthAABB = new AABB(this.sprite.position.x - 8, this.sprite.position.y - 20, 16, 20);

                    const moonEntity = EntityInformation.getMoonEntity();
                    if (moonEntity && moonEntity.doesCollide(mouthAABB)) {
                        moonEntity.setHealth(moonEntity.getHealth() - 1);
                    }
                }
            }

            this.helicopterAudio.setPannerPosition(this.sprite.position.x * AudioManager.SCALE, this.sprite.position.y * AudioManager.SCALE, 0);
            this.dropAudio.setPannerPosition(this.sprite.position.x * AudioManager.SCALE, this.sprite.position.y * AudioManager.SCALE, 0);
        }

        this.name.position.x = this.sprite.position.x;
        this.name.position.y = this.sprite.position.y - 28;

        let playingHelicopter = false;
        if (slamming) {
            this.sprite.stepAnimation('falling', 0.2, true);
            this.slammingRecovery = 20;
            this.flyingFrames = 0;

            this.isRecovering = false;
        } else if (this.slammingRecovery > 0) {
            const progress = 1 - (this.slammingRecovery / 20);
            this.sprite.gotoAnimation('recovery', progress * 7);

            if (!this.isRecovering) {
                this.dropAudio.__lastTime = 0;
                AudioManager.autoAdjustVolume(this.dropAudio, EntityInformation.getClientEntity() === this);
                this.dropAudio.seek(0);
            }

            this.isRecovering = true;

            this.slammingRecovery--;
            this.flyingFrames = 0;
        } else {
            AudioManager.autoAdjustVolume(this.helicopterAudio, EntityInformation.getClientEntity() === this);
            playingHelicopter = true;

            this.isRecovering = false;

            if (onGround) {
                this.sprite.stepAnimation('flyingstart', 0.1, true);

                this.flyingFrames = 0;
            } else if (this.flyingFrames < 40) {
                const progress = (this.flyingFrames / 20) % 1;
                this.sprite.gotoAnimation('flyingstart', progress * 4);

                this.flyingFrames++;
            } else {
                this.sprite.stepAnimation('flying', 0.2, true);
            }
        }

        if (!playingHelicopter && this.helicopterAudio.isPlaying()) {
            this.helicopterAudio.stop();
        }

        if (fakeVelocityX < -0.1) {
            this.sprite.scale.x = -Math.abs(this.sprite.scale.x);
        } else if (fakeVelocityX > 0.1) {
            this.sprite.scale.x = Math.abs(this.sprite.scale.x);
        }

        // const velocity = Vec2.copy(this.sprite.position).subtract(previousPosition);
        // if (averagedNormal.x === 0 && averagedNormal.y === 0) {
        //     this.sprite.stepAnimation('jumping', 0.2, true);
        //     if (velocity.x < -0.01) {
        //         this.sprite.scale.x = -Math.abs(this.sprite.scale.x);
        //     } else if (velocity.x > 0.01) {
        //         this.sprite.scale.x = Math.abs(this.sprite.scale.x);
        //     }
        // } else {
        //     const speed = velocity.length();
        //     if (speed > 0.01) {
        //         this.sprite.stepAnimation('rolling', velocity.length() / 6, true);
        //     } else {
        //         this.sprite.stepAnimation('rolling', 0.0000001, true);
        //     }

        //     const direction = velocity.cross(averagedNormal);
        //     if (direction > 0) {
        //         this.sprite.scale.x = -Math.abs(this.sprite.scale.x);
        //     } else if (direction < 0) {
        //         this.sprite.scale.x = Math.abs(this.sprite.scale.x);
        //     }
        // }
    }

    sendPackets() {
        if (!TwitchPackets.canSendPacketImmediately()) {
            return;
        }

        const bytes = [];
        let index = 0;

        const [prevPosition, prevVelocity] = this.accurateHistory.getPositionAndVelocity(Date.now() - 250);

        index = Packets.writeValidatePacket(TwitchPackets._username, bytes, index);
        index = Packets.writeEntityPacket(PacketProcessor.ENTITY_TYPE_BIRD, bytes, index);
        index = Packets.writePositionVelocityPacket(
            this.controller.position.x, this.controller.position.y, this.controller.velocity.x, this.controller.velocity.y,
            prevPosition.x, prevPosition.y, prevVelocity.x, prevVelocity.y,
            bytes, index);
        index = Packets.writeSlamPacket(this.sendSlamming, bytes, index);

        this.sendSlamming = false;

        MoonPackets.send(bytes);
    }

    setNetworkedNormal(normal) {
        this.networkedNormal = normal;
    }

    addHistory(positionX, positionY, velocityX, velocityY) {
        this.history.add(Date.now(), positionX, positionY, velocityX, velocityY);
    }

    doesCollide(aabb) {
        if (this.invulnTicks > 0) {
            return false;
        }

        if (this.controller && this.controller.slamming || this.networkedSlamming) {
            return false;
        }

        const offsetAABB = AABB.copy(this.aabb);
        offsetAABB.x += this.sprite.position.x;
        offsetAABB.y += this.sprite.position.y;

        offsetAABB.x -= 4;
        offsetAABB.width += 8;
        offsetAABB.y -= 8;
        offsetAABB.height += 8;

        if (offsetAABB.intersects(aabb)) {
            this.invulnTicks = 20;
            
            return true;
        }

        return false;
    }

    getHealth() {
        return this.remainingHearts;
    }

    getAttachmentOffset(point) {
        return Vec2.set(point.x - this.sprite.position.x, point.y - this.sprite.position.y).normalize();
    }

    getAttachmentPoint(offsetVector) {
        return new Vec2(this.sprite.position.x + offsetVector.x * 20, this.sprite.position.y + offsetVector.y * 20);
    }

    setNetworkedSlamming(slamming) {
        this.networkedSlamming = slamming;
    }

    setHealth(health) {
        const damaging = health < this.remainingHearts;
        if (damaging) {
            if (this === EntityInformation.getClientEntity()) {
                Camera.shake();
            }

            AudioManager.playHitNoise(this.sprite.position.x, this.sprite.position.y);
        }

        this.remainingHearts = health;
        if (this.remainingHearts <= 0) {
            this.remainingHearts = 0;

            // kill entity
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
        return Vec2.copy(this.sprite.position);
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

        DeadBodyManager.addDeadBirdEntity(this.sprite.position);
        EntityInformation.addDeadEntity(this.__name);

        if (EntityInformation.getClientEntity() === this) {
            GameState.spawnCooldown = GameState.DEATH_COOLDOWN;
        } else {
            SoulPlantManager.receiveSoul(this.sprite.position, BirdEntity);
        }

        this.destroy();
    }

    performedDetachMovement() {
        return this.controller.slamming;
    }

    destroy() {
        this.sprite.destroy();
        this.name.destroy();
        this.hearts.destroy();
        this.helicopterAudio.destroy();
        this.dropAudio.destroy();

        EntityInformation.silentRemoveEntity(this);
    }
}