class StickySlimeEntity {
    static TEXTURE = PIXI.Texture.from('assets/slime.png');
    static DAMAGE_AUDIO = new NSWA.Source('assets/slime-damage-loop.mp3', {loop: true, volume: 0.4});
    static ROLL_AUDIO = new NSWA.Source('assets/slime-roll.mp3', {loop: true, volume: 0.4});
    static JUMP_AUDIO = new NSWA.Source('assets/slime-jump.mp3', {loop: false, volume: 0.8});

    static maxHearts = 3;
    static remainingHearts = 3;

    sprite;
    controller;
    aabb;

    history;

    accurateHistory;

    name;
    hearts;
    invulnTicks;

    attachedEntityHash;
    attachedEntityOffsetVector;
    attachmentDamageTicks = 0;

    cannotAttachTicks = 0;

    networkedNormal  = new Vec2(0, 0);

    damageAudio;
    rollAudio;
    jumpAudio;

    previouslyJumping;

    constructor(username) {
        if (username === 'kujukuju') {
            username = 'bald';
        }

        this.sprite = new FramedSprite(StickySlimeEntity.TEXTURE, 23, 20, 10, 14);
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;
        this.sprite.addAnimation('charging', 0, 3);
        this.sprite.addAnimation('jumping', 3, 3);
        this.sprite.addAnimation('rolling', 6, 8);

        this.controller = new SlimeController();
        this.aabb = new AABB(-6, -6, 12, 12);

        this.history = new MovementHistory();
        this.accurateHistory = new MovementHistory();

        if (username === 'bald') {
            this.maxHearts = StickySlimeEntity.maxHearts;
            this.remainingHearts = StickySlimeEntity.remainingHearts;
        } else {
            this.maxHearts = 3;
            this.remainingHearts = 3;
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

        this.attachedEntityHash = null;
        this.attachedEntityOffsetVector = null;

        this.damageAudio = StickySlimeEntity.DAMAGE_AUDIO.create();
        this.damageAudio.setPannerOrientation(0, 0, -1);

        this.rollAudio = StickySlimeEntity.ROLL_AUDIO.create();
        this.rollAudio.setPannerOrientation(0, 0, -1);

        this.jumpAudio = StickySlimeEntity.JUMP_AUDIO.create();
        this.jumpAudio.setPannerOrientation(0, 0, -1);

        this.previouslyJumping = false;
    }

    update() {
        this.invulnTicks = Math.max(this.invulnTicks - 1, 0);

        if (Math.round(this.invulnTicks / 10) % 2 === 1) {
            this.sprite.filters = [WHITE_FILTER];
        } else {
            if (this.sprite.filters) {
                this.sprite.filters.length = 0;
            }
        }

        this.cannotAttachTicks = Math.max(this.cannotAttachTicks - 1, 0);
        if (this.attachedEntityOffsetVector) {
            this.cannotAttachTicks = 10;

            if (EntityInformation.getClientEntity() === this) {
                if (this.controller.jumped) {
                    this.detach(true);
                }
            }

            const attachedEntity = EntityInformation.getEntityFromHash(this.attachedEntityHash);
            if (attachedEntity) {
                if (attachedEntity === EntityInformation.getClientEntity()) {
                    if (attachedEntity.performedDetachMovement()) {
                        this.detach(true);
                    }
                }

                if (window.location.protocol.startsWith('file') && TwitchPackets._username === 'kujukuju') {
                    if (this.attachmentDamageTicks === 0) {
                        attachedEntity.setHealth(attachedEntity.getHealth() - 1);
                        this.attachmentDamageTicks = 100;
                    }
                }
            }
        }

        this.attachmentDamageTicks = Math.max(this.attachmentDamageTicks - 1, 0);

        const previousPosition = new Vec2(this.sprite.position.x, this.sprite.position.y);
        let averagedNormal;
        let charging = false;

        if (EntityInformation.getClientEntity() === this) {
            this.controller.applyAcceleration(Input.keys[Input.KEY_W] || Input.keys[Input.KEY_SPACE], Input.keys[Input.KEY_A], Input.keys[Input.KEY_S], Input.keys[Input.KEY_D], Camera.getMousePosition(), Input.mouseDownLeft, !!this.attachedEntityOffsetVector);

            if (this.controller.jumped) {
                this.detach(true);
            }

            if (this.attachedEntityOffsetVector) {
                const attachedEntity = EntityInformation.getEntityFromHash(this.attachedEntityHash);
                if (!attachedEntity) {
                    this.detach(true);
                } else {
                    const point = attachedEntity.getAttachmentPoint(this.attachedEntityOffsetVector);
                    this.controller.velocity.x = 0;
                    this.controller.velocity.y = 0;
                    this.controller.position.x = point.x;
                    this.controller.position.y = point.y;
                }

                this.controller.normals.length = 0;
            }
            
            if (!this.attachedEntityOffsetVector) {
                Physics.world.resolvePhysics(this.controller, this.aabb);
            }

            if (!this.attachedEntityOffsetVector) {
                potentiallyUnstuck(this.controller.position, this.aabb);
            }

            averagedNormal = this.controller.averagedNormal;
            charging = this.controller.chargeFrames > 0;

            this.sprite.position.x = Math.round(this.controller.position.x);
            this.sprite.position.y = Math.round(this.controller.position.y);

            this.accurateHistory.add(Date.now(), this.controller.position.x, this.controller.position.y, this.controller.velocity.x, this.controller.velocity.y);

            InterfaceManager.setAbilityCooldown(0, this.controller.chargeFrames / this.controller.maxChargeFrames);

            // if youre moon check whether or not youve succeeded in attaching to an enemy
            if (window.location.protocol.startsWith('file') && TwitchPackets._username === 'kujukuju') {
                if (!this.attachedEntityOffsetVector) {
                    const mouthAABB = new AABB(this.controller.position.x - 10, this.controller.position.y - 10, 20, 20);

                    const entities = EntityInformation.getPlebEntities();
                    for (let i = 0; i < entities.length; i++) {
                        if (entities[i].doesCollide(mouthAABB)) {
                            this.attachToEntity(entities[i]);
                        }
                    }
                }
            }

            this.damageAudio.setPannerPosition(this.controller.position.x * AudioManager.SCALE, this.controller.position.y * AudioManager.SCALE, 0);
            this.rollAudio.setPannerPosition(this.controller.position.x * AudioManager.SCALE, this.controller.position.y * AudioManager.SCALE, 0);
            this.jumpAudio.setPannerPosition(this.controller.position.x * AudioManager.SCALE, this.controller.position.y * AudioManager.SCALE, 0);
        } else {
            const position = this.history.get(Date.now() - 500);

            if (this.attachedEntityOffsetVector) {
                const attachedEntity = EntityInformation.getEntityFromHash(this.attachedEntityHash);
                if (!attachedEntity) {
                    this.detach(true);
                } else {
                    const point = attachedEntity.getAttachmentPoint(this.attachedEntityOffsetVector);
                    position.x = point.x;
                    position.y = point.y;
                }
            }

            this.sprite.position.x = position.x;
            this.sprite.position.y = position.y;

            this.hearts.update(this);
            this.hearts.position.x = this.sprite.position.x;
            this.hearts.position.y = this.sprite.position.y - 28;

            // if youre moon check whether or not youve succeeded in attaching to an enemy
            if (window.location.protocol.startsWith('file') && TwitchPackets._username === 'kujukuju') {
                if (!this.attachedEntityOffsetVector) {
                    const mouthAABB = new AABB(position.x - 10, position.y - 10, 20, 20);

                    const moonEntity = EntityInformation.getMoonEntity();
                    if (moonEntity && moonEntity.doesCollide(mouthAABB)) {
                        this.attachToEntity(moonEntity);
                    }
                }
            }

            averagedNormal = this.networkedNormal;

            this.damageAudio.setPannerPosition(this.sprite.position.x * AudioManager.SCALE, this.sprite.position.y * AudioManager.SCALE, 0);
            this.rollAudio.setPannerPosition(this.sprite.position.x * AudioManager.SCALE, this.sprite.position.y * AudioManager.SCALE, 0);
            this.jumpAudio.setPannerPosition(this.sprite.position.x * AudioManager.SCALE, this.sprite.position.y * AudioManager.SCALE, 0);
        }

        if (this.attachedEntityOffsetVector) {
            AudioManager.autoAdjustVolume(this.damageAudio);
        } else {
            if (this.damageAudio.isPlaying()) {
                this.damageAudio.stop();
            }
        }

        this.name.position.x = this.sprite.position.x;
        this.name.position.y = this.sprite.position.y - 18;

        let rolling = false;
        let rollSpeed = 0;
        if (charging) {
            this.sprite.stepAnimation('charging', 0.2, true);
            this.previouslyJumping = false;
        } else {
            const velocity = Vec2.copy(this.sprite.position).subtract(previousPosition);
            if (averagedNormal.x === 0 && averagedNormal.y === 0) {
                this.sprite.stepAnimation('jumping', 0.2, true);
                if (velocity.x < -0.01) {
                    this.sprite.scale.x = -Math.abs(this.sprite.scale.x);
                } else if (velocity.x > 0.01) {
                    this.sprite.scale.x = Math.abs(this.sprite.scale.x);
                }

                if (!this.previouslyJumping) {
                    this.jumpAudio.__lastTime = 0;
                    AudioManager.autoAdjustVolume(this.jumpAudio, EntityInformation.getClientEntity() === this);
                    this.jumpAudio.seek(0);
                }

                this.previouslyJumping = true;
            } else {
                rollSpeed = velocity.length();
                if (rollSpeed > 0.01) {
                    this.sprite.stepAnimation('rolling', rollSpeed / 6, true);
                } else {
                    this.sprite.stepAnimation('rolling', 0.0000001, true);
                }

                const direction = velocity.cross(averagedNormal);
                if (direction > 0) {
                    this.sprite.scale.x = -Math.abs(this.sprite.scale.x);
                } else if (direction < 0) {
                    this.sprite.scale.x = Math.abs(this.sprite.scale.x);
                }

                rolling = true;
                this.previouslyJumping = false;
            }
        }

        if (rolling && rollSpeed > 0.1) {
            AudioManager.autoAdjustVolume(this.rollAudio, EntityInformation.getClientEntity() === this);
        } else {
            if (this.rollAudio.isPlaying()) {
                this.rollAudio.stop();
            }
        }
    }

    sendPackets() {
        if (!TwitchPackets.canSendPacketImmediately()) {
            return;
        }

        const bytes = [];
        let index = 0;

        const [prevPosition, prevVelocity] = this.accurateHistory.getPositionAndVelocity(Date.now() - 250);

        index = Packets.writeValidatePacket(TwitchPackets._username, bytes, index);
        index = Packets.writeEntityPacket(PacketProcessor.ENTITY_TYPE_STICKY_SLIME, bytes, index);
        index = Packets.writePositionVelocityPacket(
            this.controller.position.x, this.controller.position.y, this.controller.velocity.x, this.controller.velocity.y,
            prevPosition.x, prevPosition.y, prevVelocity.x, prevVelocity.y,
            bytes, index);
        index = Packets.writeNetworkedNormalPacket(this.controller.averagedNormal, bytes, index);

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

        if (this.attachedEntityOffsetVector) {
            return false;
        }

        const offsetAABB = AABB.copy(this.aabb);
        offsetAABB.x += this.sprite.position.x;
        offsetAABB.y += this.sprite.position.y;

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

    attachToEntity(entity, offsetVector) {
        if (!entity || entity.attachedEntityOffsetVector) {
            return;
        }
        if (window.location.protocol.startsWith('file') && TwitchPackets._username === 'kujukuju') {
            if (this.cannotAttachTicks > 0) {
                return;
            }
            if (entity && entity.cannotAttachTicks) {
                return;
            }
            if (entity === EntityInformation.getClientEntity()) {
                if (entity.performedDetachMovement()) {
                    return;
                }
            }
        }

        const name = entity.__name;
        const hash = Hash.integerHash(name);

        // should only happen for not moons client
        if (!offsetVector) {
            offsetVector = entity.getAttachmentOffset(Vec2.copy(this.sprite.position));
        }

        if (window.location.protocol.startsWith('file') && TwitchPackets._username === 'kujukuju') {
            const bytes = [];
            Packets.writeAttachedSlimePacket(this.__name, entity.__name, offsetVector, bytes, 0);
            MoonPackets.addAdditionalPacketBytes(bytes);
        }

        this.attachedEntityHash = hash;
        this.attachedEntityOffsetVector = offsetVector;
    }

    detach(broadcast) {
        if (!this.attachedEntityOffsetVector) {
            return;
        }

        if (broadcast) {
            const bytes = [];
            Packets.writeDetachPacket(this.__name, bytes, 0);
            MoonPackets.addAdditionalPacketBytes(bytes);
        }

        this.attachedEntityHash = null;
        this.attachedEntityOffsetVector = null;
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

        DeadBodyManager.addDeadSlimeEntity(this.sprite.position);
        EntityInformation.addDeadEntity(this.__name);

        if (EntityInformation.getClientEntity() === this) {
            GameState.spawnCooldown = GameState.DEATH_COOLDOWN;
        } else {
            SoulPlantManager.receiveSoul(this.sprite.position, StickySlimeEntity);
        }

        this.destroy();
    }

    performedDetachMovement() {
        return this.controller.jumped;
    }

    destroy() {
        this.sprite.destroy();
        this.name.destroy();
        this.hearts.destroy();
        this.damageAudio.destroy();
        this.rollAudio.destroy();
        this.jumpAudio.destroy();

        EntityInformation.silentRemoveEntity(this);
    }
}