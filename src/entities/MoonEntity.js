class MoonEntity {
    static TEXTURE = PIXI.Texture.from('assets/baldling.png');

    // these go down or up because your health in each form is persistent
    static maxHearts = 3;
    static remainingHearts = 3;

    sprite;
    controller;
    aabb;

    history;

    abilities;

    throwingStarCooldown;

    lastDownE;
    deltaDownE;

    accurateHistory;

    maxHearts;
    remainingHearts;

    name;
    hearts;

    calculatedVelocityX;
    invulnTicks;

    constructor(username) {
        if (username === 'kujukuju') {
            username = 'bald';
        }

        this.sprite = new FramedSprite(MoonEntity.TEXTURE, 32, 38, 10, 39);
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 1;

        this.sprite.addAnimation('idle', 0, 1);
        this.sprite.addAnimation('run', 1, 24);
        this.sprite.addAnimation('jump', 25, 8);
        this.sprite.addAnimation('fall', 33, 6);

        this.controller = new GroundController();
        this.controller.accel *= 0.75;
        this.controller.friction *= 0.75;
        this.controller.terminalFriction *= 0.75;
        this.controller.speed *= 0.75;
        this.controller.groundNormalSlope = 0.65;

        this.aabb = new AABB(-7, -30, 14, 30);

        this.history = new MovementHistory();
        this.accurateHistory = new MovementHistory();

        this.abilities = [];

        this.throwingStarCooldown = 0;

        this.lastDownE = false;
        this.deltaDownE = false;

        this.calculatedVelocityX = 0;

        if (username === 'bald') {
            this.maxHearts = MoonEntity.maxHearts;
            this.remainingHearts = MoonEntity.remainingHearts;
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

        if (EntityInformation.getClientEntity() === this) {
            this.controller.applyAcceleration(Input.keys[Input.KEY_W] || Input.keys[Input.KEY_SPACE], Input.keys[Input.KEY_A], Input.keys[Input.KEY_S], Input.keys[Input.KEY_D]);
            Physics.world.resolvePhysics(this.controller, this.aabb);

            potentiallyUnstuck(this.controller.position, this.aabb);

            if (this.controller.jumping) {
                this.sprite.stepAnimation('jump', 0.4, false);
            } else if (this.controller.falling) {
                this.sprite.stepAnimation('fall', 0.4, false);
            } else if (Math.abs(this.controller.velocity.x) > 0.1) {
                this.sprite.stepAnimation('run', Math.abs(this.controller.velocity.x) * 0.15);
            } else {
                this.sprite.stepAnimation('idle', 0.4);
            }

            if (this.controller.velocity.x < -0.1) {
                this.sprite.scale.x = -Math.abs(this.sprite.scale.x);
            } else if (this.controller.velocity.x > 0.1) {
                this.sprite.scale.x = Math.abs(this.sprite.scale.x);
            }

            this.sprite.position.x = Math.round(this.controller.position.x);
            this.sprite.position.y = Math.round(this.controller.position.y);

            let grappleAbility = null;
            let recallAbility = null;
            for (let i = 0; i < this.abilities.length; i++) {
                if (this.abilities[i] instanceof SimpleGrapple) {
                    grappleAbility = this.abilities[i];
                } else if (this.abilities[i] instanceof TeleporterRecall) {
                    recallAbility = this.abilities[i];
                }
            }

            if (!grappleAbility) {
                const hitPoint = SimpleGrapple.getGrapplePoint(SimpleGrapple.getStartPoint(this).round(), Camera.getMousePosition());
                if (hitPoint) {
                    Renderer.midcanvas.drawCircle(Math.round(hitPoint.x), Math.round(hitPoint.y), 4, 0xffffff, 1);
                }
            }

            if (Input.mouseDownRight) {
                if (!grappleAbility) {
                    this.abilities.push(new SimpleGrapple(this, Camera.getMousePosition()));
                }
            } else {
                if (grappleAbility) {
                    grappleAbility.disable();
                }
            }

            this.deltaDownE = Input.keys[Input.KEY_E] && !this.lastDownE;
            this.lastDownE = Input.keys[Input.KEY_E];

            if (this.deltaDownE) {
                if (!recallAbility) {
                    this.abilities.push(new TeleporterRecall(this));
                } else {
                    if (recallAbility) {
                        recallAbility.recall();
                    }
                }
            }

            if (this.throwingStarCooldown === 0) {
                if (Input.mouseDownLeft) {
                    const direction = Vec2.copy(Camera.getMousePosition()).subtract(Vec2.copy(this.controller.position).add(Vec2.set(0, -20)));
                    this.abilities.push(new ThrowingStar(Vec2.copy(this.controller.position).add(Vec2.set(0, -20)), direction));
                    this.throwingStarCooldown = ThrowingStar.COOLDOWN;
                }
            } else {
                this.throwingStarCooldown -= 1;
            }

            InterfaceManager.setAbilityCooldown(0, 1 - Math.max(this.throwingStarCooldown / ThrowingStar.COOLDOWN, 0));
            if (grappleAbility) {
                InterfaceManager.setAbilityCooldown(1, grappleAbility.getCooldownPercentage());
            } else {
                InterfaceManager.setAbilityCooldown(1, 1);
            }
            if (recallAbility) {
                InterfaceManager.setAbilityCooldown(2, recallAbility.getCooldownPercentage());
            } else {
                InterfaceManager.setAbilityCooldown(2, 1);
            }

            this.accurateHistory.add(Date.now(), this.controller.position.x, this.controller.position.y, this.controller.velocity.x, this.controller.velocity.y);
        } else {
            const position = this.history.get(Date.now() - 500);

            this.calculatedVelocityX = position.x - this.sprite.position.x;
            // this.calculatedVelocityX;

            this.sprite.position.x = position.x;
            this.sprite.position.y = position.y;

            this.hearts.update(this);
            this.hearts.position.x = this.sprite.position.x;
            this.hearts.position.y = this.sprite.position.y - 50;

            // only moon can play as this character so we dont care about syncing animations
            if (Math.abs(this.calculatedVelocityX) > 0.1) {
                this.sprite.stepAnimation('run', Math.abs(this.calculatedVelocityX) * 0.1);
            } else {
                this.sprite.stepAnimation('idle', 0.4);
            }

            if (this.calculatedVelocityX < -0.1) {
                this.sprite.scale.x = Math.abs(this.sprite.scale.x);
            } else if (this.calculatedVelocityX > 0.1) {
                this.sprite.scale.x = -Math.abs(this.sprite.scale.x);
            }
        }

        this.updateAbilities();

        this.name.position.x = this.sprite.position.x;
        this.name.position.y = this.sprite.position.y - 40;
    }

    updateAbilities() {
        for (let i = 0; i < this.abilities.length; i++) {
            if (this.abilities[i].shouldDestroy()) {
                this.abilities[i].destroy();
                this.abilities.splice(i, 1);
                i--;
            } else {
                this.abilities[i].update();
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
        index = Packets.writeEntityPacket(PacketProcessor.ENTITY_TYPE_MOON, bytes, index);
        index = Packets.writePositionVelocityPacket(
            this.controller.position.x, this.controller.position.y, this.controller.velocity.x, this.controller.velocity.y,
            prevPosition.x, prevPosition.y, prevVelocity.x, prevVelocity.y,
            bytes, index);

        MoonPackets.send(bytes);
    }

    addHistory(positionX, positionY, velocityX, velocityY, prevPositionX, prevPositionY, prevVelocityX, prevVelocityY) {
        this.history.add(Date.now() - 250, prevPositionX, prevPositionY, prevVelocityX, prevVelocityY);
        this.history.add(Date.now(), positionX, positionY, velocityX, velocityY);
    }

    doesCollide(aabb) {
        if (this.invulnTicks > 0) {
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
            const bytes = [];
            Packets.writeKillEntityPacket(this.__name, bytes, 0);
            MoonPackets.addAdditionalPacketBytes(bytes);
        }

        DeadBodyManager.addDeadMoonEntity(this.sprite.position);
        EntityInformation.addDeadEntity(this.__name);

        if (EntityInformation.getClientEntity() === this) {
            GameState.spawnCooldown = GameState.DEATH_COOLDOWN;
        }

        this.destroy();
    }

    performedDetachMovement() {
        let grappleAbility = null;
        let recallAbility = null;
        for (let i = 0; i < this.abilities.length; i++) {
            if (this.abilities[i] instanceof SimpleGrapple) {
                grappleAbility = this.abilities[i];
            } else if (this.abilities[i] instanceof TeleporterRecall) {
                recallAbility = this.abilities[i];
            }
        }

        if (grappleAbility && !grappleAbility.disabled && !grappleAbility.hovering) {
            return true;
        }

        if (recallAbility && recallAbility.cooldownTicks <= 1 && recallAbility.recalled) {
            return true;
        }

        return false;
    }

    destroy() {
        this.sprite.destroy();
        this.name.destroy();
        this.hearts.destroy();
        for (let i = 0; i < this.abilities.length; i++) {
            this.abilities[i].destroy();
        }
        this.abilities.length = 0;

        EntityInformation.silentRemoveEntity(this);
    }
}