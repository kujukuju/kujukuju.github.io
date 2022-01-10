class MoonPackets {
    static TYPE_PACKET = 0;
    static TYPE_APPROVE = 1;

    static forcedApprovalList = [];
    static queue = [];

    static additionalBytes = [];

    static requestedMorePlayers = false;

    static send(data) {
        if (!window.location.protocol.startsWith('file') || TwitchPackets._username !== 'kujukuju') {
            // max message size is around 500, so well limit to 450 I guess
            while (MoonPackets.additionalBytes.length > 0 && data.length + MoonPackets.additionalBytes[0].length <= 450) {
                const addBytes = MoonPackets.additionalBytes.shift();
                for (let i = 0; i < addBytes.length; i++) {
                    data.push(addBytes[i]);
                }
            }

            TwitchPackets.sendBytes(data);
            return;
        }

        // there can only be one normal packet in the queue, because we send absolute data .... ?
        for (let i = 0; i < MoonPackets.queue.length; i++) {
            if (MoonPackets.queue[i].type === MoonPackets.TYPE_PACKET) {
                MoonPackets.queue.splice(i, 1);
                i--;
            }
        }

        MoonPackets.queue.push({
            type: MoonPackets.TYPE_PACKET,
            data: data,
        });
    }

    static approvePlayer(username) {
        if (GameState.approvedEntities[username]) {
            GameState.approvedEntities[username] = Date.now();
            return;
        }

        GameState.approvedEntityRequestedTypes[username] = GameState.getRemainingApprovalEntityType();
        GameState.approvedEntities[username] = Date.now();

        MoonPackets.queue.push({
            type: MoonPackets.TYPE_MOD,
            username: username,
        });
    }

    static addAdditionalPacketBytes(bytes) {
        MoonPackets.additionalBytes.push(bytes);
    }

    static canApprovePlayer(username) {
        const usernameHash = Hash.integerHash(username);
        if (usernameHash === Hash.integerHash('kujukuju')) {
            return false;
        }
        // if this hash already exists reject them I guess?
        for (const name in GameState.approvedEntities) {
            const hash = Hash.integerHash(name);
            if (usernameHash === hash) {
                return false;
            }
        }

        {
            // I dont think this will ever happen, but you have to be able to hash their username within the space of an integer
            const bytes = [];
            BinaryHelper.writeInt(usernameHash, bytes, 0);
            const resolvedHash = BinaryHelper.readInt(bytes[0], bytes[1], bytes[2], bytes[3]);
            if (resolvedHash !== usernameHash) {
                return false;
            }
        }

        // if (username.toLowerCase() === 'smolboisad') {
        //     return true;
        // }
        if (username.toLowerCase() === 'kujukujupackets') {
            return true;
        }
        if (username.toLowerCase() === 'rayneee') {
            return true;
        }
        if (username.toLowerCase() === 'garek') {
            return true;
        }
        if (username.toLowerCase() === 'sodapoppin') {
            return true;
        }
        if (username.toLowerCase() === 'vigors') {
            return true;
        }
        if (username.toLowerCase() === 'surefour') {
            return true;
        }
        if (username.toLowerCase() === 'moonmoon') {
            return true;
        }

        if (Object.keys(GameState.approvedEntities).length >= GameState.requiredEntityCount) {
            return false;
        }

        return true;
    }

    static requestMorePlayers() {
        MoonPackets.requestedMorePlayers = true;
    }

    static sendPackets() {
        if (!TwitchPackets.canSendPacketImmediately()) {
            return;
        }

        // I think this is supposed to be limited to moon????
        if (!window.location.protocol.startsWith('file') || TwitchPackets._username !== 'kujukuju') {
            return;
        }

        if (MoonPackets.forcedApprovalList.length >= 5) {
            const bytes = [];
            let index = 0;
            index = Packets.writeValidatePacket(TwitchPackets._username, bytes, index);
            index = Packets.writeRoundPacket(GameState.round, bytes, index);
            index = Packets.writePausedPacket(GameState.paused, bytes, index);
            index = Packets.writeJoinApprovedPacket(MoonPackets.forcedApprovalList, bytes, index);

            TwitchPackets.sendBytes(bytes);

            MoonPackets.forcedApprovalList.length = 0;

            return;
        }

        const entryIndex = MoonPackets.queue.findIndex(entry => entry.type === MoonPackets.TYPE_MOD);
        if (entryIndex !== -1) {
            const entry = MoonPackets.queue.splice(entryIndex, 1)[0];

            // only approve them if its within 3 seconds so that they wont desync by the time theyve created their entity
            if (Date.now() - GameState.approvedEntities[entry.username] < 3000) {
                MoonPackets.forcedApprovalList.push(entry.username);
                TwitchPackets.sendText('/mod ' + entry.username);
            }

            return;
        }

        if (MoonPackets.forcedApprovalList.length > 0) {
            const bytes = [];
            let index = 0;
            index = Packets.writeValidatePacket(TwitchPackets._username, bytes, index);
            index = Packets.writeRoundPacket(GameState.round, bytes, index);
            index = Packets.writePausedPacket(GameState.paused, bytes, index);
            index = Packets.writeJoinApprovedPacket(MoonPackets.forcedApprovalList, bytes, index);

            TwitchPackets.sendBytes(bytes);

            MoonPackets.forcedApprovalList.length = 0;

            return;
        }

        if (MoonPackets.requestedMorePlayers) {
            MoonPackets.requestedMorePlayers = false;

            const bytes = [];
            let index = 0;
            index = Packets.writeValidatePacket(TwitchPackets._username, bytes, index);
            index = Packets.writeRoundPacket(GameState.round, bytes, index);
            index = Packets.writePausedPacket(GameState.paused, bytes, index);
            index = Packets.writeRequestMorePacket(bytes, index);

            TwitchPackets.sendBytes(bytes);

            return;
        }

        // finally send normal packets
        if (MoonPackets.queue.length > 1) {
            console.error('you should only have 1 real packet to send at a given time');
        }

        if (GameState.round > 0) {
            const hasNormalPacket = MoonPackets.queue[0] && MoonPackets.queue[0].type === MoonPackets.TYPE_PACKET;
            // add required moon specific info here
            const bytes = hasNormalPacket ? MoonPackets.queue.shift().data : [];
            let index = bytes.length;
            if (bytes.length === 0) {
                index = Packets.writeValidatePacket(TwitchPackets._username, bytes, index);
            }
            index = Packets.writeRoundPacket(GameState.round, bytes, index);
            index = Packets.writePausedPacket(GameState.paused, bytes, index);

            // max message size is around 500, so well limit to 450 I guess
            while (MoonPackets.additionalBytes.length > 0 && bytes.length + MoonPackets.additionalBytes[0].length <= 450) {
                const addBytes = MoonPackets.additionalBytes.shift();
                for (let i = 0; i < addBytes.length; i++) {
                    bytes.push(addBytes[i]);
                }
            }

            TwitchPackets.sendBytes(bytes);
        }
    }
}
