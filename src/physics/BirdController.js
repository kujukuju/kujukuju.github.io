class BirdController {
    position = new Vec2();
    velocity = new Vec2();
    jumping = false;
    falling = false;
    normals = [];
    accel = 0.1;
    friction = 0.01;
    // the fricton that is applied on top of default friction once you've exceeded max speed
    terminalFriction = 0.15;
    speed = 24;
    // the y component of the maximumly angled normal vector that you're able to walk on, default 30 degrees
    groundNormalSlope = 0.707;
    // the x component of the maximumly angled normal vector that you're able to slide on, default 30 degrees
    wallNormalSlope = 0.866;
    groundJumpVelocity = 5.4;
    wallJumpVelocity = 5.4 * 1.5;
    fallingFrames = 10;
    allowedStepHeight = 6;
    gravityScale = 0.5;

    chargeFrames = 0;
    maxChargeFrames = 60;

    maxJumpStrength = 12;
    minJumpStrength = 6;

    _jumpingForce = 0;
    _jumpingDelta = 0;
    _currentFallingFrames = 0;

    previousNormals = [];

    averagedNormal = new Vec2();

    jumped = false;

    slamming = false;
    slamCooldown = 0;
    maxSlamCooldown = 120;

    ground = false;

    constructor() {

    }

    applyAcceleration(up, left, down, right, mouseDown) {
        const accelVec = new Vec2();
        if (up) {
            accelVec.y -= this.accel;
        }
        if (left) {
            accelVec.x -= this.accel;
        }
        if (right) {
            accelVec.x += this.accel;
        }

        this.ground = false;
        for (let i = 0; i < this.normals.length; i++) {
            if (this.normals[i].y < -this.groundNormalSlope) {
                this.ground = true;
                break;
            }
        }

        const friction = this.ground ? this.friction * 4 : this.friction;

        const initialVelocityX = this.velocity.x;
        if (Math.abs(this.velocity.x + accelVec.x) <= friction) {
            this.velocity.x = 0;
        } else {
            this.velocity.x += accelVec.x;
            this.velocity.x -= Math.sign(this.velocity.x) * friction;
        }
    
        if (Math.abs(initialVelocityX) > this.speed && Math.abs(this.velocity.x) > this.speed) {
            if (Math.abs(this.velocity.x) > Math.abs(initialVelocityX)) {
                // in this scenario we want to match the previously applied acceleration to the friciton to only cancel it out, then apply the terminal friction on top
                this.velocity.x -= (accelVec.x - Math.sign(accelVec.x) * friction);
            }
    
            if (Math.abs(this.velocity.x) - this.terminalFriction <= this.speed) {
                // because we're able to go past the max speed using the terminal friction we only adjust to the max speed
                this.velocity.x = Math.sign(this.velocity.x) * this.speed;
            } else {
                this.velocity.x -= Math.sign(this.velocity.x) * this.terminalFriction;
            }
        } else if (Math.abs(this.velocity.x) > this.speed) {
            // if this scenario we want to slow you down to the maximum speed because we were the ones that applied you to be above it
            this.velocity.x = Math.sign(this.velocity.x) * this.speed;
        }

        if (Math.abs(this.velocity.x) > 0.01) {
            this.velocity.x -= Math.sign(this.velocity.x) * this.velocity.x * this.velocity.x * friction;
        } else {
            this.velocity.x = 0;
        }

        let bodyFlyingSpeed = this.velocity.y * 0.1;
        if (bodyFlyingSpeed > 0) {
            bodyFlyingSpeed = 0;
        }

        const flyingSpeed = -3 * accelVec.y;
        const appliedFlying = Math.max(flyingSpeed - bodyFlyingSpeed * bodyFlyingSpeed, 0);
        this.velocity.add(new Vec2(0, -appliedFlying));

        this.slamCooldown = Math.max(this.slamCooldown - 1, 0);
        if (mouseDown && !this.slamming && this.slamCooldown === 0) {
            this.slamming = true;
        }
        if (this.slamming && !mouseDown) {
            this.slamming = false;
        }
        if (this.ground) {
            this.slamming = false;
        }

        if (this.slamming) {
            this.slamCooldown = this.maxSlamCooldown;

            let bodySlamSpeed = this.velocity.y * 0.1;
            if (bodySlamSpeed < 0) {
                bodySlamSpeed = 0;
            }
    
            const slamSpeed = 2;
            const appliedSlamming = Math.max(slamSpeed - bodySlamSpeed * bodySlamSpeed, 0);
            this.velocity.add(new Vec2(0, appliedSlamming));
        }

        this.position.x = Math.max(Math.min(this.position.x, Physics.TEXTURE.width - 320), 320);
        this.position.y = Math.max(Math.min(this.position.y, Physics.TEXTURE.height - 180), 180);
    }

    applyForce(force) {
        this.velocity.add(force);
    }
}