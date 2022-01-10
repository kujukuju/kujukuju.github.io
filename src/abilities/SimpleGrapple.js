class SimpleGrapple {
    static MAX_LENGTH = 160;
    static DURATION_TICKS = 60;
    static COOLDOWN_TICKS = 25;
    static FORCE = 6;
    static FRICTION = 0.6;

    static AUDIO = new NSWA.Source('assets/grapple.mp3', {volume: 0.7});

    entity;
    grapplePoint;
    ticks;
    cooldownTicks;
    disabled;
    hovering;

    audio;

    constructor(entity, aimPoint) {
        this.entity = entity;
        this.grapplePoint = SimpleGrapple.getGrapplePoint(SimpleGrapple.getStartPoint(entity), aimPoint);
        this.ticks = 0;
        this.cooldownTicks = 0;
        this.disabled = false;
        this.hovering = false;

        this.audio = SimpleGrapple.AUDIO.create();
        this.audio.setPannerOrientation(0, 0, -1);
        this.audio.setPannerPosition(aimPoint.x * AudioManager.SCALE, aimPoint.y * AudioManager.SCALE, 0);
        this.audio.play();
    }

    static getGrapplePoint(start, end) {
        const aimAngle = Math.atan2(end.y - start.y, end.x - start.x);
        return Physics.world.scanLine(start, Vec2.fromAngle(aimAngle).mul(SimpleGrapple.MAX_LENGTH).add(start));
    }

    static getStartPoint(entity) {
        return Vec2.copy(entity.controller.position).add(new Vec2(0, -20));
    }

    update() {
        if (!this.grapplePoint) {
            return;
        }

        if (this.disabled) {
            this.cooldownTicks++;
            return;
        }

        const direction = Vec2.copy(this.grapplePoint).subtract(this.entity.controller.position);
        const grappleLength = direction.length();
        if (grappleLength < 40) {
            this.hovering = true;
        }
        direction.normalize();

        if (this.hovering) {
            let grappleBodySpeed = Vec2.copy(this.entity.controller.velocity).projectOnto(direction).length() / 100;
            grappleBodySpeed *= -Math.sign(this.entity.controller.velocity.dot(direction));

            let desiredForce = 40 - grappleLength;
            desiredForce /= 25;

            const totalForce = Vec2.copy(direction).mul(grappleBodySpeed);
            totalForce.add(Vec2.copy(direction).mul(-desiredForce));

            if (totalForce.dot(direction) < 0) {
                totalForce.set(0, 0);
            }

            this.entity.controller.applyForce(totalForce);
        } else {
            let grappleBodySpeed = Vec2.copy(this.entity.controller.velocity).projectOnto(direction).length() * SimpleGrapple.FRICTION;
            if (this.entity.controller.velocity.dot(direction) <= 0) {
                grappleBodySpeed = 0;
            }

            const force = Math.max(SimpleGrapple.FORCE - grappleBodySpeed * grappleBodySpeed, 0);

            // limit based on velocity though, like how gravity does it, project to line etc
            this.entity.controller.applyForce(direction.mul(force));
        }

        if (Input.keys[Input.KEY_W]) {
            this.entity.controller.applyForce(new Vec2(0, -0.2));
        }
        if (Input.keys[Input.KEY_S]) {
            this.entity.controller.applyForce(new Vec2(0, 0.2));
        }

        const start = SimpleGrapple.getStartPoint(this.entity);
        Renderer.midcanvas.drawLine(start.x, start.y, this.grapplePoint.x, this.grapplePoint.y, 0xffffff, 1);

        this.ticks++;
    }

    disable() {
        this.disabled = true;
    }

    getCooldownPercentage() {
        return Math.min(this.cooldownTicks / SimpleGrapple.COOLDOWN_TICKS, 1);
    }

    shouldDestroy() {
        if (!this.grapplePoint) {
            return true;
        }

        if (this.cooldownTicks > SimpleGrapple.COOLDOWN_TICKS) {
            return true;
        }

        return false;
    }

    destroy() {
        this.audio.destroy();
    }
}