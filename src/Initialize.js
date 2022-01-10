window.addEventListener('load', () => {
    // this is to weed out bad browsers I guess
    // I noticed the audio library does this so im scared
    var a = null;
    var b = a ?? 0;

    if (window.location.protocol.startsWith('https')) {
        TwitchAuthenticate.autoAuthenticatePleb(C, S);
    } else {
        TwitchPackets.connectPermanent(null, 'kujukuju', C, S, R);
    }

    Renderer.initialize();
    Environment.initialize();
    Physics.initialize();
    GameState.initialize();
    Connection.initialize();
    InterfaceManager.initialize();
    SoulPlantManager.initialize();
    OneLinerManager.initialize();
    IntroLoreManager.initialize();
    AudioManager.initialize();

    Camera.setPositionImmediate(new Vec2(1343, 729));

    Loop.initialize();
});

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

const Vec2 = PixelScan.Vec2;
const AABB = PixelScan.AABB;
const FramedSprite = PixelScan.FramedSprite;
const Input = PixelScan.Input;
const World = PixelScan.World;
const GroundController = PixelScan.GroundController;
const FPSTracker = PixelScan.FPSTracker;
const CPUTracker = PixelScan.CPUTracker;
const ParallaxSprite = PixelScan.ParallaxSprite;
const Camera = PixelScan.Camera;
const PerlinNoise = PixelScan.PerlinNoise;
const Hash = PixelScan.Hash;
const DebugCanvas = PixelScan.DebugCanvas;
const DynamicTree = PixelScan.DynamicTree;
const BinaryHelper = PixelScan.BinaryHelper;

BinaryHelper.writeByte = (byte, bytes, index) => {
    bytes[index] = byte;
    return index + 1;
};

convertToString = (bytes) => {
    let string = '';
    for (let i = 0; i < bytes.length; i++) {
        string += String.fromCharCode(bytes[i]);
    }

    return string;
};

convertToFixedSpace = (point) => {
    const aabb = Camera.aabb;
    const percentX = (point.x - aabb.x) / aabb.width;
    const percentY = (point.y - aabb.y) / aabb.height;

    point.x = window.innerWidth * percentX;
    point.y = window.innerHeight * percentY;
};

TwitchPackets.sendBytes = (bytes) => {
    TwitchPackets.send(convertToString(bytes));
};

Camera.getMousePosition = () => {
    const percentX = Input.mousePosition.x / window.innerWidth;
    const percentY = Input.mousePosition.y / window.innerHeight;

    return Vec2.set(Camera.aabb.x + Camera.aabb.width * percentX, Camera.aabb.y + Camera.aabb.height * percentY).round();
};

World.prototype.scanLine = function(start, end) {
    const line = PixelScan.getLinePixels(start.x, start.y, end.x, end.y, true);

    for (let i = 0; i < line.length; i++) {
        if (this.getPixel(line[i].x, line[i].y)) {
            return line[i];
        }
    }

    return null;
};

World.prototype.scanLineEmpty = function(start, end) {
    const line = PixelScan.getLinePixels(start.x, start.y, end.x, end.y, true);

    for (let i = 0; i < line.length; i++) {
        if (!this.getPixel(line[i].x, line[i].y)) {
            return line[i];
        }
    }

    return null;
};

// the old method doesnt work and I cant fix it during this game jam Sadge
PixelScan.getLinePixels = (x1, y1, x2, y2, inclusive) => {
    const pixels = [];
    let start = new Vec2(x1, y1);

    let dx = x2 - x1;
    let dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length === 0) {
        return start;
    }

    dx /= length;
    dy /= length;

    let step = 1;
    pixels.push(start);
    while (step <= length) {
        const newPixelX = Math.round(start.x + step * dx);
        const newPixelY = Math.round(start.y + step * dy);

        const lastPixel = pixels[pixels.length - 1];
        if (newPixelX === lastPixel.x && newPixelY === lastPixel.y) {
            step += 1;
            continue;
        }

        if (newPixelX === x2 && newPixelY === y2) {
            if (inclusive) {
                pixels.push(new Vec2(newPixelX, newPixelY));
            }

            break;
        }

        pixels.push(new Vec2(newPixelX, newPixelY));

        step += 1;
    }

    return pixels;
};

// TODO be sure there are no little floating islands of pixels you could get stuck on
const checkWorldCollisions = (aabb) => {
    for (let x = 0; x < aabb.width; x++) {
        if (Physics.world.getPixel(aabb.x + x, aabb.y)) {
            return true;
        }
        if (Physics.world.getPixel(aabb.x + x, aabb.y + aabb.height - 1)) {
            return true;
        }
    }

    for (let y = 0; y < aabb.height; y++) {
        if (Physics.world.getPixel(aabb.x, aabb.y + y)) {
            return true;
        }
        if (Physics.world.getPixel(aabb.x + aabb.width - 1, aabb.y + y)) {
            return true;
        }
    }

    return false;
};

const potentiallyUnstuck = (position, aabb) => {
    const newAABB = AABB.copy(aabb);
    newAABB.x += Math.round(position.x);
    newAABB.y += Math.round(position.y);

    if (!checkWorldCollisions(newAABB)) {
        return;
    }

    const movedAABB = AABB.copy(newAABB);

    let radius = 2;
    while (true) {
        for (let i = 0; i < 360; i += 10) {
            const radians = i / 360 * Math.PI * 2;

            const offsetX = Math.cos(radians) * radius;
            const offsetY = Math.sin(radians) * radius;
            movedAABB.x = Math.round(newAABB.x + offsetX);
            movedAABB.y = Math.round(newAABB.y + offsetY);

            if (movedAABB.x < 0 || movedAABB.y < 0 || movedAABB.x + movedAABB.width >= Physics.TEXTURE.width || movedAABB.y + movedAABB.height >= Physics.TEXTURE.height) {
                continue;
            }

            if (!checkWorldCollisions(movedAABB)) {
                position.x += offsetX;
                position.y += offsetY;
                return;
            }
        }

        radius += 2;
    }
};

AABB.prototype.intersects = function(aabb) {
    let intersects = this.x < aabb.x + aabb.width;
    intersects = intersects && this.y < aabb.y + aabb.height;
    intersects = intersects && this.x + this.width >= aabb.x;
    intersects = intersects && this.y + this.height >= aabb.y;
    return intersects;
}

const easeInOut = (t) => {
    const p = 2.0 * t * t;
    return t < 0.5 ? p : -p + (4.0 * t) - 1.0;
};

const nearestPointOnLineSegment = (line, point) => {
    const dx = line[1].x - line[0].x;
    const dy = line[1].y - line[0].y;
    const d2 = dx * dx + dy * dy;

    if (d2 === 0) {
        return new Vec2(line[0].x, line[0].y);
    }

    const t = ((point.x - line[0].x) * (line[1].x - line[0].x) + (point.y - line[0].y) * (line[1].y - line[0].y)) / d2;
    if (t < 0) {
        return new Vec2(line[0].x, line[0].y);
    }
    if (t > 1) {
        return new Vec2(line[1].x, line[1].y);
    }

    return new Vec2(line[0].x + t * (line[1].x - line[0].x), line[0].y + t * (line[1].y - line[0].y));
};

const distanceToLineSegment = (line, point) => {
    const nearestPoint = nearestPointOnLineSegment(line, point);

    const dx = nearestPoint.x - point.x;
    const dy = nearestPoint.y - point.y;
    return Math.sqrt(dx * dx + dy * dy);
};

FramedSprite.prototype.getRealFrame = function() {
    if (this.currentName && this.animations[this.currentName]) {
        return this.currentFrame + this.animations[this.currentName].start;
    } else {
        return this.currentFrame;
    }
}

SourceInstance.prototype.__setVolume = SourceInstance.prototype.setVolume;
SourceInstance.prototype.setVolume = function(volume) {
    const mul = this._source ? this._source._volume : 1;
    this.__setVolume(volume * mul);
}

SourceInstance.prototype.__getVolume = SourceInstance.prototype.getVolume;
SourceInstance.prototype.getVolume = function() {
    const mul = (this._source ? this._source._volume : 1) || 1;

    return this.__getVolume() / mul;
}
