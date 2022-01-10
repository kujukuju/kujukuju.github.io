class MovementHistory {
    entries;
    storageTime = 1500;
    storageLength = null;

    constructor() {
        this.entries = {};
    }

    add(time, positionX, positionY, velocityX, velocityY) {
        if (this.storageLength) {
            const keys = Object.keys(this.entries);
            keys.sort();

            if (keys.length > 3) {
                const mostRecentKey = keys[keys.length - 1];
                const mostRecentPosition = this.entries[mostRecentKey].position;
                if (mostRecentPosition.distance(new Vec2(positionX, positionY)) < 0.01) {
                    delete this.entries[mostRecentKey];
                    keys.length -= 1;
                }
            }

            if (keys.length > this.storageLength * 1.5) {
                delete this.entries[keys[0]];
            }
        }

        this.entries[time] = {
            position: new Vec2(positionX, positionY),
            velocity: new Vec2(velocityX, velocityY),
        };

        const keys = Object.keys(this.entries);
        if (this.storageLength) {
            if (keys.length > 2) {
                let length = 0;
                keys.sort();

                let lastPoint = this.entries[keys[keys.length - 1]].position;
                for (let i = keys.length - 2; i >= 0; i--) {
                    if (length > this.storageLength) {
                        delete this.entries[keys[i]];
                        continue;
                    }

                    length += lastPoint.distance(this.entries[keys[i]].position);
                    lastPoint = this.entries[keys[i]].position;
                }
            }
        } else {
            for (let i = 0; i < keys.length; i++) {
                if (keys[i] < time - this.storageTime) {
                    delete this.entries[keys[i]];
                }
            }
        }
    }

    getDistances(requestedDistanceList) {
        const times = Object.keys(this.entries);

        const points = [];
        points.length = requestedDistanceList.length;
        let requestedIndex = requestedDistanceList.length - 1;

        if (times.length === 0) {
            for (let i = 0; i < requestedDistanceList.length; i++) {
                points[i] = new Vec2(0, 0);
            }
            return points;
        } else if (times.length === 1) {
            for (let i = 0; i < requestedDistanceList.length; i++) {
                points[i] = this.entries[times[0]].position;
            }
            return points;
        } else {
            times.sort();

            let distance = 0;
            for (let i = times.length - 1; i > 0; i--) {
                const upperPoint = this.entries[times[i]].position;
                const lowerPoint = this.entries[times[i - 1]].position;

                const previousDistance = distance;
                distance += upperPoint.distance(lowerPoint);

                let requestedDistance = requestedDistanceList[requestedIndex];
                while (requestedDistance >= previousDistance && requestedDistance <= distance) {
                    const lowerDistance = previousDistance;
                    const upperDistance = distance;
                    const lowerKey = times[i];
                    const upperKey = times[i - 1];

                    let percent = (requestedDistance - lowerDistance) / (upperDistance - lowerDistance);
                    if (upperDistance - lowerDistance === 0) {
                        percent = 0;
                    }
    
                    const lowerEntry = this.entries[lowerKey];
                    const upperEntry = this.entries[upperKey];
        
                    const vec = new Vec2();
                    vec.x = lowerEntry.position.x + (upperEntry.position.x - lowerEntry.position.x) * percent;
                    vec.y = lowerEntry.position.y + (upperEntry.position.y - lowerEntry.position.y) * percent;

                    points[requestedIndex] = vec;
                    if (requestedIndex === 0) {
                        return points;
                    }

                    requestedIndex--;
                    requestedDistance = requestedDistanceList[requestedIndex];
                }
            }

            for (let i = requestedIndex; i >= 0; i--) {
                points[i] = this.entries[times[0]].position;
            }
            return points;
        }
    }

    getDistance(requestedDistance) {
        const times = Object.keys(this.entries);

        if (times.length === 0) {
            return new Vec2(0, 0);
        } else if (times.length === 1) {
            return this.entries[times[0]].position;
        } else {
            times.sort();

            let lowerKey = null;
            let upperKey = null;
            let lowerDistance = null;
            let upperDistance = null;

            let distance = 0;
            for (let i = times.length - 1; i > 0; i--) {
                const upperPoint = this.entries[times[i]].position;
                const lowerPoint = this.entries[times[i - 1]].position;

                const previousDistance = distance;
                distance += upperPoint.distance(lowerPoint);

                if (requestedDistance >= previousDistance && requestedDistance <= distance) {
                    lowerDistance = previousDistance;
                    upperDistance = distance;
                    lowerKey = times[i];
                    upperKey = times[i - 1];
                    break;
                }
            }

            if (!lowerKey || !upperKey) {
                return this.entries[times[0]].position;
            } else {
                let percent = (requestedDistance - lowerDistance) / (upperDistance - lowerDistance);
                if (upperDistance - lowerDistance === 0) {
                    percent = 0;
                }

                const lowerEntry = this.entries[lowerKey];
                const upperEntry = this.entries[upperKey];
    
                const vec = new Vec2();
                vec.x = lowerEntry.position.x + (upperEntry.position.x - lowerEntry.position.x) * percent;
                vec.y = lowerEntry.position.y + (upperEntry.position.y - lowerEntry.position.y) * percent;
                
                return vec;
            }
        }
    }

    getPositionAndVelocity(requestedTime) {
        const times = Object.keys(this.entries);

        let previousKey = null;
        let nextKey = null;

        for (let i = 0; i < times.length; i++) {
            const timeEntry = Number.parseInt(times[i]);

            if (timeEntry <= requestedTime) {
                if (!previousKey || timeEntry > previousKey) {
                    previousKey = timeEntry;
                }
            }

            if (timeEntry >= requestedTime) {
                if (!nextKey || timeEntry < nextKey) {
                    nextKey = timeEntry;
                }
            }
        }

        if (!previousKey && !nextKey) {
            return [new Vec2(0, 0), new Vec2(0, 0)];
        } else if (!previousKey) {
            return [this.entries[nextKey].position, this.entries[nextKey].velocity];
        } else if (!nextKey) {
            return [this.entries[previousKey].position, this.entries[previousKey].velocity];
        } else {
            const previousEntry = this.entries[previousKey];
            const nextEntry = this.entries[nextKey];

            let percent = Math.min(Math.max((requestedTime - previousKey) / (nextKey - previousKey), 0), 1);
            if (nextKey - previousKey === 0) {
                percent = 0;
            }

            const scale = 250 / 16;

            const previousVelocity = Vec2.copy(previousEntry.velocity).mul(scale);
            const nextVelocity = Vec2.copy(nextEntry.velocity).mul(scale);

            const vec = new Vec2();
            Utilities.hermite(percent, [previousEntry.position, nextEntry.position], [previousVelocity, nextVelocity], vec);

            const returnVel = new Vec2(previousVelocity.x / scale * (1 - percent) + nextVelocity.x / scale * percent, previousVelocity.y / scale * (1 - percent) + nextVelocity.y / scale * percent);
            return [vec, returnVel];
        }
    }

    get(requestedTime, millisecondsOverride) {
        millisecondsOverride = millisecondsOverride || 250;

        const times = Object.keys(this.entries);

        let previousKey = null;
        let nextKey = null;

        for (let i = 0; i < times.length; i++) {
            const timeEntry = Number.parseInt(times[i]);

            if (timeEntry <= requestedTime) {
                if (!previousKey || timeEntry > previousKey) {
                    previousKey = timeEntry;
                }
            }

            if (timeEntry >= requestedTime) {
                if (!nextKey || timeEntry < nextKey) {
                    nextKey = timeEntry;
                }
            }
        }

        if (!previousKey && !nextKey) {
            return new Vec2(0, 0);
        } else if (!previousKey) {
            return this.entries[nextKey].position;
        } else if (!nextKey) {
            return this.entries[previousKey].position;
        } else {
            const previousEntry = this.entries[previousKey];
            const nextEntry = this.entries[nextKey];

            let percent = Math.min(Math.max((requestedTime - previousKey) / (nextKey - previousKey), 0), 1);
            if (nextKey - previousKey === 0) {
                percent = 0;
            }

            const scale = millisecondsOverride / 16;

            const previousVelocity = Vec2.copy(previousEntry.velocity).mul(scale);
            const nextVelocity = Vec2.copy(nextEntry.velocity).mul(scale);

            const vec = new Vec2();
            Utilities.hermite(percent, [previousEntry.position, nextEntry.position], [previousVelocity, nextVelocity], vec);
            
            return vec;
        }
    }
}