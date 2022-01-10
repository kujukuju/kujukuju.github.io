class SlimeController {
    position = new Vec2();
    velocity = new Vec2();
    jumping = false;
    falling = false;
    normals = [];
    accel = 2;
    friction = 0.25;
    // the fricton that is applied on top of default friction once you've exceeded max speed
    terminalFriction = 0.15;
    speed = 4;
    // the y component of the maximumly angled normal vector that you're able to walk on, default 30 degrees
    groundNormalSlope = 0.707;
    // the x component of the maximumly angled normal vector that you're able to slide on, default 30 degrees
    wallNormalSlope = 0.866;
    groundJumpVelocity = 5.4;
    wallJumpVelocity = 5.4 * 1.5;
    fallingFrames = 10;
    allowedStepHeight = 6;
    gravityScale = 0;

    chargeFrames = 0;
    maxChargeFrames = 60;

    maxJumpStrength = 12;
    minJumpStrength = 6;

    _jumpingForce = 0;
    _jumpingDelta = 0;
    _currentFallingFrames = 0;

    previousNormals = [];
    previousPreviousNormals = [];

    averagedNormal = new Vec2();

    jumped = false;

    constructor() {

    }

    applyAcceleration(up, left, down, right, mousePosition, mouseDown, attached) {
        const wall = this.normals.length > 0 || this.previousNormals.length > 0 || this.previousPreviousNormals.length > 0 || attached;

        let friction = wall ? this.friction : this.friction / 20;

        const accelVec = new Vec2();
        if (up) {
            accelVec.y -= this.accel;
        }
        if (left) {
            accelVec.x -= this.accel;
        }
        if (down) {
            accelVec.y += this.accel;
        }
        if (right) {
            accelVec.x += this.accel;
        }

        if (this.normals.length + this.previousNormals.length + this.previousPreviousNormals.length === 0) {
            accelVec.y = 0;
        }

        let existingAccelSpeed = Vec2.copy(this.velocity).projectOnto(accelVec).length() * 0.9;
        if (this.velocity.dot(accelVec) <= 0) {
            existingAccelSpeed = 0;
        }

        const accelSpeed = accelVec.length();
        const appliedAccel = Vec2.copy(accelVec).normalize().multiply(Math.max(accelSpeed - existingAccelSpeed * existingAccelSpeed, 0));

        this.averagedNormal.x = 0;
        this.averagedNormal.y = 0;
        if (this.normals.length + this.previousNormals.length + this.previousPreviousNormals.length > 0) {
            for (let i = 0; i < this.normals.length; i++) {
                this.averagedNormal.add(this.normals[i]);
            }
            
            for (let i = 0; i < this.previousNormals.length; i++) {
                this.averagedNormal.add(this.previousNormals[i]);
            }
            
            for (let i = 0; i < this.previousPreviousNormals.length; i++) {
                this.averagedNormal.add(this.previousPreviousNormals[i]);
            }
            
            this.averagedNormal.x /= (this.normals.length + this.previousNormals.length + this.previousPreviousNormals.length);
            this.averagedNormal.y /= (this.normals.length + this.previousNormals.length + this.previousPreviousNormals.length);
        }

        if (appliedAccel.magnitudeSquared() > 0) {
            this.velocity.add(appliedAccel);

            if (this.normals.length + this.previousNormals.length + this.previousPreviousNormals.length > 0) {
                // this means youre applying accel while youre on a wall, so we need to cancel out that accel against your normal
                accelVec.projectOnto(this.averagedNormal);
                if (accelVec.dot(this.averagedNormal) > 0) {
                    this.velocity.add(accelVec.negate());
                }

                this.velocity.add(Vec2.copy(this.averagedNormal).negate().mul(0.8));
            }
        }
        
        // while charging friction is higher
        if (wall && mouseDown) {
            friction = this.friction * 2;
        }

        const initialSpeed = this.velocity.length();
        if (initialSpeed >= friction) {
            this.velocity.normalize().mul(initialSpeed - friction);
        } else {
            this.velocity.x = 0;
            this.velocity.y = 0;
        }

        this.jumped = false;
        if (wall) {
            if (mouseDown) {
                this.chargeFrames = Math.min(this.chargeFrames + 1, this.maxChargeFrames);
            } else {
                if (this.chargeFrames > 0) {
                    // jump
                    const direction = Vec2.copy(mousePosition).sub(this.position).normalize();
                    const strength = this.minJumpStrength + (this.maxJumpStrength - this.minJumpStrength) * (this.chargeFrames / this.maxChargeFrames);
                    this.applyForce(direction.mul(strength));
                    this.chargeFrames = 0;
                    this.jumped = true;
                }
            }
        } else {
            this.chargeFrames = 0;
        }

        if (!wall) {
            // fake gravity
            let bodyFallingSpeed = Vec2.copy(this.velocity).projectOnto(Physics.world.gravity).length() * 0.01 * Physics.world.airResistance;
            if (this.velocity.dot(Physics.world.gravity) <= 0) {
                bodyFallingSpeed = 0;
            }

            const gravitySpeed = Physics.world.gravity.length();
            const appliedGravity = Vec2.copy(Physics.world.gravity).normalize().multiply(Math.max(gravitySpeed - bodyFallingSpeed * bodyFallingSpeed, 0));
            this.velocity.add(appliedGravity);
        }

        this.previousPreviousNormals.length = 0;
        for (let i = 0; i < this.previousNormals.length; i++) {
            this.previousPreviousNormals.push(Vec2.copy(this.previousNormals[i]));
        }

        this.previousNormals.length = 0;
        for (let i = 0; i < this.normals.length; i++) {
            this.previousNormals.push(Vec2.copy(this.normals[i]));
        }

        this.position.x = Math.max(Math.min(this.position.x, Physics.TEXTURE.width - 320), 320);
        this.position.y = Math.max(Math.min(this.position.y, Physics.TEXTURE.height - 180), 180);
    }

    applyForce(force) {
        this.velocity.add(force);
    }
}