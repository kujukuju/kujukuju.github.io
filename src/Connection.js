class Connection {
    static initialize() {
        TwitchPackets.addListener(TwitchPackets.EVENT_CONNECT, () => {
            if (!TwitchPackets._username) {
                return;
            }
            for (let i = 0; i < TwitchPackets._username.length; i++) {
                const charCode = TwitchPackets._username.charCodeAt(i);
                if (charCode < 10 || charCode > 255) {
                    return;
                }
            }

            if (!Renderer.glEnabled) {
                console.log('gl not enabled');
                return;
            }

            document.getElementById('play-button').style.display = 'inline-block';
        });

        TwitchPackets.addListener(TwitchPackets.EVENT_MESSAGE, message => {
            if (!message || !message.username || !message.message) {
                console.error('Got an invalid packet.', message);
                return;
            }
            
            if (message.message.charCodeAt(0) !== PacketProcessor.TYPE_VALIDATE) {
                console.error('Got a packet that\'s first type was not validate.');
                return;
            }

            PacketProcessor.process(message.username, message.message);
        });
    }
}