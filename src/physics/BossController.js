class BossController {
    position = new Vec2();
    velocity = new Vec2();
    jumping = false;
    falling = false;
    normals = [];
    accel = 0.01;
    friction = 0.75;
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
    dashing = false;

    maxJumpStrength = 12;
    minJumpStrength = 6;

    _jumpingForce = 0;
    _jumpingDelta = 0;
    _currentFallingFrames = 0;

    // previousNormals = [];

    availableDashCharge = 300;
    maxDashCharge = 300;

    constructor() {

    }

    applyAcceleration(mousePosition, mouseDown, bodyShape) {
        const accelVec = Vec2.copy(mousePosition).subtract(this.position);
        let accelLength = accelVec.length();
        accelLength = Math.min(Math.max(accelLength - 10, 0), 20);
        accelVec.normalize().multiply(accelLength).multiply(0.01);

        let friction = 0.02;
        this.dashing = false;
        if (mouseDown && this.availableDashCharge > 0) {
            this.availableDashCharge = Math.max(this.availableDashCharge - 1, 0);
            friction *= 0.4;
            accelVec.mul(2);
            this.dashing = true;
        }

        let undergroundStrength = Physics.world.getPixel(Math.round(this.position.x), Math.round(this.position.y)) ? 1 : 0;
        if (!undergroundStrength && bodyShape.length > 1) {
            const percentIncrement = 1 / (bodyShape.length - 1);
            for (let i = bodyShape.length - 1; i > 0; i--) {
                const start = bodyShape[i];
                const next = bodyShape[i - 1];

                const dx = next.x - start.x;
                const dy = next.y - start.y;
                for (let a = 0; a < 10; a++) {
                    const pointX = Math.round(start.x + dx * a / 10);
                    const pointY = Math.round(start.y + dy * a / 10);

                    if (Physics.world.getPixel(pointX, pointY)) {
                        undergroundStrength = Math.max(Math.min(percentIncrement * i + percentIncrement / (a / 10), 1), 0);
                        break;
                    }
                }

                if (undergroundStrength > 0) {
                    break;
                }
            }
        }

        if (!mouseDown) {
            this.availableDashCharge = Math.min(this.availableDashCharge + undergroundStrength * 1, this.maxDashCharge);
        }

        this.velocity.add(accelVec);

        const frictionForce = Vec2.copy(this.velocity).mul(undergroundStrength / 2 + 0.5)
        const magnitudeSquared = frictionForce.magnitudeSquared();
        frictionForce.negate().normalize().mul(Math.max(magnitudeSquared * friction, 0.1));
        this.velocity.add(frictionForce);

        this.position.add(this.velocity);

        // this.position.x = Math.max(Math.min(this.position.x, Physics.TEXTURE.width - 320), 320);
        // this.position.y = Math.max(Math.min(this.position.y, Physics.TEXTURE.height - 180), 180);
        this.position.x = Math.max(Math.min(this.position.x, Physics.TEXTURE.width - 480), 480);
        this.position.y = Math.max(Math.min(this.position.y, Physics.TEXTURE.height - 270), 270);
    }

    applyForce(force) {
        this.velocity.add(force);
    }
}