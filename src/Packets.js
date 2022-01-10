class Packets {
    static writeValidatePacket(username, bytes, index) {
        index = BinaryHelper.writeByte(PacketProcessor.TYPE_VALIDATE, bytes, index);
        const hash = Hash.integerHash(username);
        index = BinaryHelper.writeInt(hash, bytes, index);

        return index;
    }

    static writeEntityPacket(type, bytes, index) {
        index = BinaryHelper.writeByte(PacketProcessor.TYPE_ENTITY, bytes, index);
        index = BinaryHelper.writeInt(type, bytes, index);

        return index;
    }

    static writePositionVelocityPacket(positionX, positionY, velocityX, velocityY, prevPositionX, prevPositionY, prevVelocityX, prevVelocityY, bytes, index) {
        index = BinaryHelper.writeByte(PacketProcessor.TYPE_POSITION_VELOCITY, bytes, index);
        index = BinaryHelper.writeFloat(positionX, bytes, index);
        index = BinaryHelper.writeFloat(positionY, bytes, index);
        index = BinaryHelper.writeFloat(velocityX, bytes, index);
        index = BinaryHelper.writeFloat(velocityY, bytes, index);
        index = BinaryHelper.writeFloat(prevPositionX, bytes, index);
        index = BinaryHelper.writeFloat(prevPositionY, bytes, index);
        index = BinaryHelper.writeFloat(prevVelocityX, bytes, index);
        index = BinaryHelper.writeFloat(prevVelocityY, bytes, index);

        return index;
    }

    static writeRequestMorePacket(bytes, index) {
        index = BinaryHelper.writeByte(PacketProcessor.TYPE_REQUEST_MORE, bytes, index);

        return index;
    }

    static writeJoinValidatePacket(username, bytes, index) {
        index = BinaryHelper.writeByte(PacketProcessor.TYPE_JOIN_VALIDATE, bytes, index);
        index = BinaryHelper.writeInt(Hash.integerHash(username), bytes, index);

        return index;
    }

    static writeJoinApprovedPacket(usernameList, bytes, index) {
        index = BinaryHelper.writeByte(PacketProcessor.TYPE_JOIN_APPROVED, bytes, index);
        for (let i = 0; i < usernameList.length; i++) {
            const username = usernameList[i];
            const entityType = GameState.approvedEntityRequestedTypes[username] || 1;

            for (let i = 0; i < username.length; i++) {
                index = BinaryHelper.writeByte(username.charCodeAt(i), bytes, index);
            }

            index = BinaryHelper.writeByte(entityType, bytes, index);
        }

        return index;
    }

    static writeRoundPacket(roundNumber, bytes, index) {
        index = BinaryHelper.writeByte(PacketProcessor.TYPE_ROUND, bytes, index);
        index = BinaryHelper.writeInt(roundNumber, bytes, index);

        return index;
    }

    static writeSetHealthPacket(username, health, bytes, index) {
        index = BinaryHelper.writeByte(PacketProcessor.TYPE_SET_HEALTH, bytes, index);
        index = BinaryHelper.writeInt(Hash.integerHash(username), bytes, index);
        index = BinaryHelper.writeByte(Math.min(Math.max(health, 0), 100), bytes, index);

        return index;
    }

    static writeAttachedSlimePacket(username, attachedUsername, attachedOffset, bytes, index) {
        index = BinaryHelper.writeByte(PacketProcessor.TYPE_ATTACHED_SLIME, bytes, index);
        index = BinaryHelper.writeInt(Hash.integerHash(username), bytes, index);
        index = BinaryHelper.writeInt(Hash.integerHash(attachedUsername), bytes, index);
        index = BinaryHelper.writeFloat(attachedOffset.x, bytes, index);
        index = BinaryHelper.writeFloat(attachedOffset.y, bytes, index);

        return index;
    }

    static writeDetachPacket(username, bytes, index) {
        index = BinaryHelper.writeByte(PacketProcessor.TYPE_DETACH, bytes, index);
        index = BinaryHelper.writeInt(Hash.integerHash(username), bytes, index);

        return index;
    }

    static writeKillEntityPacket(username, bytes, index) {
        index = BinaryHelper.writeByte(PacketProcessor.TYPE_KILL, bytes, index);
        index = BinaryHelper.writeInt(Hash.integerHash(username), bytes, index);

        return index;
    }

    static writeThrowingStarPacket(position, direction, bytes, index) {
        index = BinaryHelper.writeByte(PacketProcessor.TYPE_THROWING_STAR, bytes, index);
        index = BinaryHelper.writeFloat(position.x, bytes, index);
        index = BinaryHelper.writeFloat(position.y, bytes, index);
        index = BinaryHelper.writeFloat(direction.x, bytes, index);
        index = BinaryHelper.writeFloat(direction.y, bytes, index);

        return index;
    }

    static writeNetworkedNormalPacket(normal, bytes, index) {
        index = BinaryHelper.writeByte(PacketProcessor.TYPE_NETWORKED_NORMAL, bytes, index);
        index = BinaryHelper.writeFloat(normal.x, bytes, index);
        index = BinaryHelper.writeFloat(normal.y, bytes, index);

        return index;
    }

    static writePausedPacket(paused, bytes, index) {
        index = BinaryHelper.writeByte(PacketProcessor.TYPE_PAUSED, bytes, index);
        index = BinaryHelper.writeByte(paused ? 1 : 0, bytes, index);

        return index;
    }

    static writeSlamPacket(slamming, bytes, index) {
        index = BinaryHelper.writeByte(PacketProcessor.TYPE_SLAMMING, bytes, index);
        index = BinaryHelper.writeByte(slamming ? 1 : 0, bytes, index);

        return index;
    }
}