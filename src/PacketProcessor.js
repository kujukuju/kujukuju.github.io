class PacketProcessor {
    static TYPE_VALIDATE = 0;
    static TYPE_ENTITY = 1;
    static TYPE_POSITION_VELOCITY = 2;
    static TYPE_REQUEST_MORE = 3;
    static TYPE_JOIN_VALIDATE = 4;
    static TYPE_JOIN_APPROVED = 5;
    static TYPE_ROUND = 6;
    static TYPE_SET_HEALTH = 7;
    static TYPE_ATTACHED_SLIME = 8;
    static TYPE_DETACH = 9;
    static TYPE_KILL = 10;
    static TYPE_THROWING_STAR = 11;
    static TYPE_NETWORKED_NORMAL = 12;
    static TYPE_PAUSED = 13;
    static TYPE_SLAMMING = 14;

    static ENTITY_TYPE_MOON = 0;
    static ENTITY_TYPE_STICKY_SLIME = 1;
    static ENTITY_TYPE_WORM = 2;
    static ENTITY_TYPE_BIRD = 3;
    static ENTITY_TYPE_BOSS = 4;

    static process(username, message) {
        if (message.length === 0) {
            return;
        }

        const type = message.charCodeAt(0);

        switch (type) {
            case PacketProcessor.TYPE_VALIDATE: {
                const hashValue = BinaryHelper.readInt(message.charCodeAt(1), message.charCodeAt(2), message.charCodeAt(3), message.charCodeAt(4));
                const hash = Hash.integerHash(username);
                if (hashValue !== hash) {
                    return;
                }

                PacketProcessor.process(username, message.substring(5));
            } break;

            case PacketProcessor.TYPE_ENTITY: {
                // if youre moon and the person who sent this packet isnt an approved entity inform them I guess
                // or just ignore it and let everyone desync lol
                if (window.location.protocol.startsWith('file') && TwitchPackets._username === 'kujukuju') {
                    if (!GameState.approvedEntities[username]) {
                        return;
                    }
                }

                const entityType = BinaryHelper.readInt(message.charCodeAt(1), message.charCodeAt(2), message.charCodeAt(3), message.charCodeAt(4));

                let RequestedEntityType = null;
                switch (entityType) {
                    case PacketProcessor.ENTITY_TYPE_MOON: {
                        RequestedEntityType = MoonEntity;
                    } break;

                    case PacketProcessor.ENTITY_TYPE_STICKY_SLIME: {
                        RequestedEntityType = StickySlimeEntity;
                    } break;

                    case PacketProcessor.ENTITY_TYPE_WORM: {
                        RequestedEntityType = WormEntity;
                    } break;

                    case PacketProcessor.ENTITY_TYPE_BIRD: {
                        RequestedEntityType = BirdEntity;
                    } break;

                    case PacketProcessor.ENTITY_TYPE_BOSS: {
                        RequestedEntityType = BossEntity;
                    } break;

                    default:
                        console.error('Invalid entity type. ', entityType);
                }

                if (RequestedEntityType === MoonEntity && username !== 'kujukuju') {
                    console.error('Someone tried to claim moon entity.');
                    return;
                }

                if (RequestedEntityType) {
                    let existingHistory = null;
                    let existingAccurateHistory = null;
                    if (EntityInformation.entities[username]) {
                        if (!(EntityInformation.entities[username] instanceof RequestedEntityType)) {
                            existingHistory = EntityInformation.entities[username].history;
                            existingAccurateHistory = EntityInformation.entities[username].accurateHistory;
                            EntityInformation.entities[username].destroy();
                        }
                    }

                    if (!EntityInformation.entities[username]) {
                        if (EntityInformation.canCreateEntity(username)) {
                            EntityInformation.addEntity(username, new RequestedEntityType(username));
                        }
                    }

                    if (EntityInformation.entities[username]) {
                        if (existingHistory) {
                            EntityInformation.entities[username].history = existingHistory;
                        }
                        if (existingAccurateHistory) {
                            EntityInformation.entities[username].accurateHistory = existingAccurateHistory;
                        }
                    }
                }

                PacketProcessor.process(username, message.substring(5));
            } break;

            case PacketProcessor.TYPE_POSITION_VELOCITY: {
                const positionX = BinaryHelper.readFloat(message.charCodeAt(1), message.charCodeAt(2), message.charCodeAt(3), message.charCodeAt(4));
                const positionY = BinaryHelper.readFloat(message.charCodeAt(5), message.charCodeAt(6), message.charCodeAt(7), message.charCodeAt(8));
                const velocityX = BinaryHelper.readFloat(message.charCodeAt(9), message.charCodeAt(10), message.charCodeAt(11), message.charCodeAt(12));
                const velocityY = BinaryHelper.readFloat(message.charCodeAt(13), message.charCodeAt(14), message.charCodeAt(15), message.charCodeAt(16));
                const prevPositionX = BinaryHelper.readFloat(message.charCodeAt(17), message.charCodeAt(18), message.charCodeAt(19), message.charCodeAt(20));
                const prevPositionY = BinaryHelper.readFloat(message.charCodeAt(21), message.charCodeAt(22), message.charCodeAt(23), message.charCodeAt(24));
                const prevVelocityX = BinaryHelper.readFloat(message.charCodeAt(25), message.charCodeAt(26), message.charCodeAt(27), message.charCodeAt(28));
                const prevVelocityY = BinaryHelper.readFloat(message.charCodeAt(29), message.charCodeAt(30), message.charCodeAt(31), message.charCodeAt(32));

                const entity = EntityInformation.entities[username];
                if (entity) {
                    EntityInformation.lastActiveTimes[username] = Date.now();
                    entity.addHistory(positionX, positionY, velocityX, velocityY, prevPositionX, prevPositionY, prevVelocityX, prevVelocityY);
                }

                PacketProcessor.process(username, message.substring(33));
            } break;

            case PacketProcessor.TYPE_REQUEST_MORE: {
                if (!window.location.protocol.startsWith('file') || TwitchPackets._username !== 'kujukuju') {
                    if (!EntityInformation.getClientEntity() && GameState.canPlebJoin()) {
                        const bytes = [];
                        let index = 0;

                        index = Packets.writeValidatePacket(TwitchPackets._username, bytes, index);
                        index = Packets.writeJoinValidatePacket(TwitchPackets._username, bytes, index);
        
                        TwitchPackets.sendBytes(bytes);
                    }
                }

                PacketProcessor.process(username, message.substring(1));
            } break;

            case PacketProcessor.TYPE_JOIN_VALIDATE: {
                const hashValue = BinaryHelper.readInt(message.charCodeAt(1), message.charCodeAt(2), message.charCodeAt(3), message.charCodeAt(4));
                const hash = Hash.integerHash(username);
                if (hashValue !== hash) {
                    return;
                }

                if (MoonPackets.canApprovePlayer(username)) {
                    MoonPackets.approvePlayer(username);
                }

                PacketProcessor.process(username, message.substring(5));
            } break;

            case PacketProcessor.TYPE_JOIN_APPROVED: {
                if (username !== 'kujukuju') {
                    return;
                }

                let currentUsername = '';
                let index = 1;
                while (index < message.length) {
                    if (message.charCodeAt(index) < 10) {
                        if (TwitchPackets._username === currentUsername) {
                            GameState.plebAccepted(message.charCodeAt(index));
                        }

                        currentUsername = '';
                    } else {
                        currentUsername += message.substring(index, index + 1);
                    }

                    index++;
                }

                // this message doesnt recurse
            } break;

            case PacketProcessor.TYPE_ROUND: {
                if (username !== 'kujukuju') {
                    console.error('Someone else specifying rounds.');
                    return;
                }

                const round = BinaryHelper.readInt(message.charCodeAt(1), message.charCodeAt(2), message.charCodeAt(3), message.charCodeAt(4));

                GameState.round = round;

                PacketProcessor.process(username, message.substring(5));
            } break;

            case PacketProcessor.TYPE_SET_HEALTH: {
                if (username !== 'kujukuju') {
                    console.error('Someone else setting health.');
                    return;
                }

                const hash = BinaryHelper.readInt(message.charCodeAt(1), message.charCodeAt(2), message.charCodeAt(3), message.charCodeAt(4));
                const health = message.charCodeAt(5);

                // do something
                const entity = EntityInformation.getEntityFromHash(hash);
                if (entity) {
                    entity.setHealth(health);
                }

                PacketProcessor.process(username, message.substring(6));
            } break;

            case PacketProcessor.TYPE_ATTACHED_SLIME: {
                if (username !== 'kujukuju') {
                    console.error('Someone else attaching slime.');
                    return;
                }

                const hash = BinaryHelper.readInt(message.charCodeAt(1), message.charCodeAt(2), message.charCodeAt(3), message.charCodeAt(4));
                const attachedHash = BinaryHelper.readInt(message.charCodeAt(5), message.charCodeAt(6), message.charCodeAt(7), message.charCodeAt(8));
                const attachedOffsetX = BinaryHelper.readFloat(message.charCodeAt(9), message.charCodeAt(10), message.charCodeAt(11), message.charCodeAt(12));
                const attachedOffsetY = BinaryHelper.readFloat(message.charCodeAt(13), message.charCodeAt(14), message.charCodeAt(15), message.charCodeAt(16));

                // do something
                const entity = EntityInformation.getEntityFromHash(hash);
                if (entity) {
                    if (entity instanceof StickySlimeEntity) {
                        const attachedEntity = EntityInformation.getEntityFromHash(attachedHash);
                        if (attachedEntity) {
                            entity.attachToEntity(attachedEntity, new Vec2(attachedOffsetX, attachedOffsetY));
                        }
                    }
                }

                PacketProcessor.process(username, message.substring(17));
            } break;

            case PacketProcessor.TYPE_DETACH: {
                const hash = BinaryHelper.readInt(message.charCodeAt(1), message.charCodeAt(2), message.charCodeAt(3), message.charCodeAt(4));
                const entity = EntityInformation.getEntityFromHash(hash);
                if (entity && entity.detach) {
                    entity.detach(false);
                }

                PacketProcessor.process(username, message.substring(5));
            } break;

            case PacketProcessor.TYPE_KILL: {
                if (username !== 'kujukuju') {
                    console.error('Someone else killing.');
                    return;
                }

                const hash = BinaryHelper.readInt(message.charCodeAt(1), message.charCodeAt(2), message.charCodeAt(3), message.charCodeAt(4));
                const entity = EntityInformation.getEntityFromHash(hash);
                if (entity) {
                    entity.kill();
                }

                PacketProcessor.process(username, message.substring(5));
            } break;

            case PacketProcessor.TYPE_THROWING_STAR: {
                if (username !== 'kujukuju') {
                    console.error('Someone else throwing star.');
                    return;
                }

                const positionX = BinaryHelper.readFloat(message.charCodeAt(1), message.charCodeAt(2), message.charCodeAt(3), message.charCodeAt(4));
                const positionY = BinaryHelper.readFloat(message.charCodeAt(5), message.charCodeAt(6), message.charCodeAt(7), message.charCodeAt(8));
                const directionX = BinaryHelper.readFloat(message.charCodeAt(9), message.charCodeAt(10), message.charCodeAt(11), message.charCodeAt(12));
                const directionY = BinaryHelper.readFloat(message.charCodeAt(13), message.charCodeAt(14), message.charCodeAt(15), message.charCodeAt(16));

                const entity = EntityInformation.getMoonEntity();
                if (entity && entity.abilities && entity instanceof MoonEntity) {
                    entity.abilities.push(new ThrowingStar(new Vec2(positionX, positionY), new Vec2(directionX, directionY)));
                }

                PacketProcessor.process(username, message.substring(17));
            } break;

            case PacketProcessor.TYPE_NETWORKED_NORMAL: {
                const normalX = BinaryHelper.readFloat(message.charCodeAt(1), message.charCodeAt(2), message.charCodeAt(3), message.charCodeAt(4));
                const normalY = BinaryHelper.readFloat(message.charCodeAt(5), message.charCodeAt(6), message.charCodeAt(7), message.charCodeAt(8));

                const entity = EntityInformation.entities[username];
                if (entity && entity.setNetworkedNormal) {
                    entity.setNetworkedNormal(new Vec2(normalX, normalY));
                }

                PacketProcessor.process(username, message.substring(9));
            } break;

            case PacketProcessor.TYPE_PAUSED: {
                if (username !== 'kujukuju') {
                    console.error('Someone else pausing.');
                    return;
                }

                const paused = !!message.charCodeAt(1);
                GameState.paused = paused;

                PacketProcessor.process(username, message.substring(2));
            } break;

            case PacketProcessor.TYPE_SLAMMING: {
                const slamming = !!message.charCodeAt(1);

                const entity = EntityInformation.entities[username];
                if (entity && entity.setNetworkedSlamming) {
                    entity.setNetworkedSlamming(slamming);
                }

                PacketProcessor.process(username, message.substring(2));
            } break;

            default:
                console.error('Found invalid packet type. ', type);
        }
    }
}