// TODO this should listen to the packet expiration time and automatically regenerate before it expires

const isNode = typeof module !== 'undefined';

const WebSocket = !isNode ? window.WebSocket : require('websocket').w3cwebsocket;

class TwitchAuthenticate {
    static fetchCode(clientID, modPermissions) {
        const defaultLocation = window.location.origin + '/';

        const params = 'client_id=' + clientID + '&redirect_uri=' + encodeURIComponent(defaultLocation) + '&response_type=code&scope=chat:read+chat:edit' + (modPermissions ? '+channel:moderate' : '');
        window.location.href = 'https://id.twitch.tv/oauth2/authorize?' + params;
    }

    static authenticate(clientID, secret, code) {
        const defaultLocation = window.location.origin + '/';

        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.onload = () => {
                if (request.status !== 200) {
                    console.log('Request completed with an incorrect status. ', request.status);
                    return reject(request.responseText);
                }

                console.log('Authentication completed.');
                console.log(JSON.parse(request.responseText));
                return resolve(JSON.parse(request.responseText));
            };
            request.onerror = () => {
                return reject(request.responseText);
            };

            const params = 'client_id=' + clientID + '&client_secret=' + secret + '&code=' + code + '&grant_type=authorization_code&redirect_uri=' + encodeURIComponent(defaultLocation);
            request.open('POST', 'https://id.twitch.tv/oauth2/token?' + params, true);
            request.send();
        });
    }
    
    static getURLParams() {
        const vars = {};
        window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => {
            vars[key] = value;
        });
    
        return vars;
    }

    static autoAuthenticatePleb(clientID, secret) {
        const defaultLocation = window.location.origin + '/';

        const code = TwitchAuthenticate.getURLParams().code;
        if (!code) {
            TwitchAuthenticate.fetchCode(clientID, false, defaultLocation);
            return;
        }

        window.history.replaceState(null, '', defaultLocation);

        TwitchAuthenticate.authenticate(clientID, secret, code).then(response => {
            TwitchPackets.connectPermanent(null, 'kujukuju', clientID, secret, response.refresh_token);
        });
    }

    static autoAuthenticateMod(clientID, secret) {
        const defaultLocation = window.location.origin + '/';

        const code = TwitchAuthenticate.getURLParams().code;
        if (!code) {
            TwitchAuthenticate.fetchCode(clientID, true, defaultLocation);
            return;
        }

        window.history.replaceState(null, '', defaultLocation);

        TwitchAuthenticate.authenticate(clientID, secret, code).then(response => {
            TwitchPackets.connectPermanent(null, 'kujukuju', clientID, secret, response.refresh_token);
        });
        
        TwitchPackets.addListener(TwitchPackets.EVENT_CONNECT, () => {
            const content = TwitchPackets._getCredentialInformation();
            console.log(content);
        });
    }
}

class TwitchPackets {
    static INVALID_CHAR_CODE_MAPS = {
        0: '???',
        1: '???',
        2: '???',
        3: '???',
        4: '???',
        5: '???',
        6: '???',
        7: '???',
        8: '???',
        9: '???',
        10: '???',
        11: '???',
        12: '???',
        13: '???',
        14: '???',
        15: '???',
        16: '???',
        17: '???',
        18: '???',
        19: '???',
        20: '???',
        21: '???',
        22: '???',
        23: '???',
        24: '???',
        25: '???',
        26: '???',
        27: '???',
        28: '???',
        29: '???',
        30: '???',
        31: '???',
        32: '???',
        46: '???',
        47: '???',
        127: '???',
        128: '???',
        129: '???',
        130: '???',
        131: '???',
        132: '???',
        133: '???',
        134: '???',
        135: '???',
        136: '???',
        137: '???',
        138: '???',
        139: '???',
        140: '???',
        141: '???',
        142: '???',
        143: '???',
        144: '???',
        145: '???',
        146: '???',
        147: '???',
        148: '???',
        149: '???',
        150: '???',
        151: '???',
        152: '???',
        153: '???',
        154: '???',
        155: '???',
        156: '???',
        157: '???',
        158: '???',
        159: '???',
        160: '???',
        161: '???',
        162: '???',
        163: '???',
        164: '???',
        165: '???',
        166: '???',
        167: '???',
        168: '???',
        169: '???',
        170: '???',
        171: '???',
        172: '???',
        173: '???',
        174: '???',
        175: '???',
        176: '???',
        177: '???',
        178: '???',
        179: '???',
        180: '???',
        181: '???',
        182: '???',
        183: '???',
        184: '???',
        185: '???',
        186: '???',
        187: '???',
        188: '???',
        189: '???',
        190: '???',
        191: '???',
        192: '???',
        193: '???',
        194: '???',
        195: '???',
        196: '???',
        197: '???',
        198: '???',
        199: '???',
        200: '???',
        201: '???',
        202: '???',
        203: '???',
        204: '???',
        205: '???',
        206: '???',
        207: '???',
        208: '???',
        209: '???',
        210: '???',
        211: '???',
        212: '???',
        213: '???',
        214: '???',
        215: '???',
        216: '???',
        217: '???',
        218: '???',
        219: '???',
        220: '???',
        221: '???',
        222: '???',
        223: '???',
        224: '???',
        225: '???',
        226: '???',
        227: '???',
        228: '???',
        229: '???',
        230: '???',
        231: '???',
        232: '???',
        233: '???',
        234: '???',
        235: '???',
        236: '???',
        237: '???',
        238: '???',
        239: '???',
        240: '???',
        241: '???',
        242: '???',
        243: '???',
        244: '???',
        245: '???',
        246: '???',
        247: '???',
        248: '???',
        249: '???',
        250: '???',
        251: '???',
        252: '???',
        253: '???',
        254: '???',
        255: '???',
    };

    static INVERTED_INVALID_CHAR_CODE_MAPS = {
        '???': 0,
        '???': 1,
        '???': 2,
        '???': 3,
        '???': 4,
        '???': 5,
        '???': 6,
        '???': 7,
        '???': 8,
        '???': 9,
        '???': 10,
        '???': 11,
        '???': 12,
        '???': 13,
        '???': 14,
        '???': 15,
        '???': 16,
        '???': 17,
        '???': 18,
        '???': 19,
        '???': 20,
        '???': 21,
        '???': 22,
        '???': 23,
        '???': 24,
        '???': 25,
        '???': 26,
        '???': 27,
        '???': 28,
        '???': 29,
        '???': 30,
        '???': 31,
        '???': 32,
        '???': 46,
        '???': 47,
        '???': 127,
        '???': 128,
        '???': 129,
        '???': 130,
        '???': 131,
        '???': 132,
        '???': 133,
        '???': 134,
        '???': 135,
        '???': 136,
        '???': 137,
        '???': 138,
        '???': 139,
        '???': 140,
        '???': 141,
        '???': 142,
        '???': 143,
        '???': 144,
        '???': 145,
        '???': 146,
        '???': 147,
        '???': 148,
        '???': 149,
        '???': 150,
        '???': 151,
        '???': 152,
        '???': 153,
        '???': 154,
        '???': 155,
        '???': 156,
        '???': 157,
        '???': 158,
        '???': 159,
        '???': 160,
        '???': 161,
        '???': 162,
        '???': 163,
        '???': 164,
        '???': 165,
        '???': 166,
        '???': 167,
        '???': 168,
        '???': 169,
        '???': 170,
        '???': 171,
        '???': 172,
        '???': 173,
        '???': 174,
        '???': 175,
        '???': 176,
        '???': 177,
        '???': 178,
        '???': 179,
        '???': 180,
        '???': 181,
        '???': 182,
        '???': 183,
        '???': 184,
        '???': 185,
        '???': 186,
        '???': 187,
        '???': 188,
        '???': 189,
        '???': 190,
        '???': 191,
        '???': 192,
        '???': 193,
        '???': 194,
        '???': 195,
        '???': 196,
        '???': 197,
        '???': 198,
        '???': 199,
        '???': 200,
        '???': 201,
        '???': 202,
        '???': 203,
        '???': 204,
        '???': 205,
        '???': 206,
        '???': 207,
        '???': 208,
        '???': 209,
        '???': 210,
        '???': 211,
        '???': 212,
        '???': 213,
        '???': 214,
        '???': 215,
        '???': 216,
        '???': 217,
        '???': 218,
        '???': 219,
        '???': 220,
        '???': 221,
        '???': 222,
        '???': 223,
        '???': 224,
        '???': 225,
        '???': 226,
        '???': 227,
        '???': 228,
        '???': 229,
        '???': 230,
        '???': 231,
        '???': 232,
        '???': 233,
        '???': 234,
        '???': 235,
        '???': 236,
        '???': 237,
        '???': 238,
        '???': 239,
        '???': 240,
        '???': 241,
        '???': 242,
        '???': 243,
        '???': 244,
        '???': 245,
        '???': 246,
        '???': 247,
        '???': 248,
        '???': 249,
        '???': 250,
        '???': 251,
        '???': 252,
        '???': 253,
        '???': 254,
        '???': 255,
    };

    static MESSAGES_PER_30_SECONDS = 60;
    static EVENT_CONNECT = 'connect';
    static EVENT_DISCONNECT = 'disconnect';
    static EVENT_RAW_MESSAGE = 'raw-message';
    static EVENT_MESSAGE = 'message';
    static EVENT_ERROR = 'error';

    // socket information
    static _socket = null;
    static _autoReconnect = false;
    static _username = null;
    static _hostUsername = null;
    static _clientID = null;
    static _secret = null;
    static _refreshToken = null;

    // event listeners
    static _eventListeners = {};

    // rate limiting
    static _messageSentTimes = [];
    static _messageQueue = [];

    static getAccessToken(clientID, secret, refreshToken) {
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.onload = () => {
                if (request.status !== 200) {
                    return reject(request.responseText);
                }

                console.info('Twitch packets refresh authentication completed successfully.');
                return resolve(JSON.parse(request.responseText));
            };
            request.onerror = () => {
                return reject(request.responseText);
            };

            const params = 'grant_type=refresh_token&refresh_token=' + refreshToken + '&client_id=' + clientID + '&client_secret=' + secret;
            request.open('POST', 'https://id.twitch.tv/oauth2/token?' + params, true);
            request.send();
        });
    }

    static connectTemporary(username, hostUsername, accessToken) {
        TwitchPackets._autoReconnect = false;
        TwitchPackets._username = username;
        TwitchPackets._hostUsername = hostUsername;
        TwitchPackets._clientID = null;
        TwitchPackets._secret = null;
        TwitchPackets._refreshToken = null;

        TwitchPackets._connect(accessToken);
    }

    static connectPermanent(username, hostUsername, clientID, secret, refreshToken) {
        TwitchPackets._autoReconnect = true;
        TwitchPackets._username = username;
        TwitchPackets._hostUsername = hostUsername;
        TwitchPackets._clientID = clientID;
        TwitchPackets._secret = secret;
        TwitchPackets._refreshToken = refreshToken;

        TwitchPackets._connect(null);
    }

    static send(message) {
        if (!message) {
            return;
        }

        // validate every fucking character
        for (let i = 0; i < message.length; i++) {
            if (message.charCodeAt(i) > 255) {
                console.error('Your message contained a character that had a character code > 255, which isn\'t allowed. ', message.charCodeAt(i), message.charAt(i));
                return;
            }

            if (TwitchPackets.INVALID_CHAR_CODE_MAPS.hasOwnProperty(message.charCodeAt(i))) {
                message = message.substring(0, i) + TwitchPackets.INVALID_CHAR_CODE_MAPS[message.charCodeAt(i)] + message.substring(i + 1);
            }
        }

        if (message.length > 500) {
            console.error('Twitch packets tried to send a message that was over the 500 character limit. ', message);
            return;
        }

        const delay = TwitchPackets._getCurrentMessageDelay();
        const sendPromise = new Promise(resolve => {
            setTimeout(() => {
                TwitchPackets._send('PRIVMSG #' + TwitchPackets._hostUsername + ' :' + message);
                return resolve();
            }, delay);
        });

        TwitchPackets._messageQueue.push(sendPromise);
        sendPromise.then(() => {
            TwitchPackets._messageQueue = TwitchPackets._messageQueue.filter(promise => promise !== sendPromise);
            TwitchPackets._addMessageSentTime();
        });

        return sendPromise;
    }

    static sendText(message) {
        if (!message) {
            return;
        }

        // validate every fucking character
        for (let i = 0; i < message.length; i++) {
            if (message.charCodeAt(i) > 255) {
                console.error('Your message contained a character that had a character code > 255, which isn\'t allowed. ', message.charCodeAt(i), message.charAt(i));
                return;
            }
        }

        if (message.length > 500) {
            console.error('Twitch packets tried to send a message that was over the 500 character limit. ', message);
            return;
        }

        const delay = TwitchPackets._getCurrentMessageDelay();
        const sendPromise = new Promise(resolve => {
            setTimeout(() => {
                TwitchPackets._send('PRIVMSG #' + TwitchPackets._hostUsername + ' :' + message);
                return resolve();
            }, delay);
        });

        TwitchPackets._messageQueue.push(sendPromise);
        sendPromise.then(() => {
            TwitchPackets._messageQueue = TwitchPackets._messageQueue.filter(promise => promise !== sendPromise);
            TwitchPackets._addMessageSentTime();
        });

        return sendPromise;
    }

    static disconnect() {
        TwitchPackets._autoReconnect = false;
        TwitchPackets._username = null;
        TwitchPackets._hostUsername = null;
        TwitchPackets._clientID = null;
        TwitchPackets._secret = null;
        TwitchPackets._refreshToken = null;
        if (TwitchPackets._socket) {
            TwitchPackets._socket.close();
        }
    }

    static isConnected() {
        return TwitchPackets._socket && TwitchPackets._socket.readyState === 1;
    }

    static canSendPacketImmediately() {
        return TwitchPackets._getCurrentMessageDelay() === 0;
    }

    static getPacketRate() {
        return 30000 / TwitchPackets.MESSAGES_PER_30_SECONDS;
    }

    static addListener(event, listener) {
        TwitchPackets._eventListeners[event] = TwitchPackets._eventListeners[event] || [];
        TwitchPackets._eventListeners[event].push(listener);
    }

    static removeListener(event, listener) {
        if (!listener) {
            delete TwitchPackets._eventListeners[event];
        }

        TwitchPackets._eventListeners[event] = (TwitchPackets._eventListeners[event] || []).filter(currentListener => {
            return currentListener !== listener;
        });

        if (TwitchPackets._eventListeners[event].length === 0) {
            delete TwitchPackets._eventListeners[event];
        }
    }

    static _addMessageSentTime() {
        TwitchPackets._messageSentTimes.push(Date.now());
    }

    static _getCurrentMessageDelay() {
        const now = Date.now();

        while (TwitchPackets._messageSentTimes.length > 0 && now - TwitchPackets._messageSentTimes[0] > 30000) {
            TwitchPackets._messageSentTimes.shift();
        }

        // the problem with this logic, although its neat, is that if theres ever a delay in sending, then 30 seconds past that there will be a cluster of sending, then 30 seconds past that there will be another delay, and so on
        // const rate = 30000 / TwitchPackets.MESSAGES_PER_30_SECONDS;
        // const sessionRateDelay = Math.max((TwitchPackets._messageSentTimes.length + 1) * rate - (now - TwitchPackets._messageSentTimes[0] || 0), 0);
        // const queueDelay = TwitchPackets._messageQueue.length * rate;
        // return sessionRateDelay + queueDelay;

        const rate = TwitchPackets.getPacketRate();
        const mostRecentMessageDelay = Math.max(rate - (now - (TwitchPackets._messageSentTimes[TwitchPackets._messageSentTimes.length - 1] || 0)), 0);
        const queueDelay = TwitchPackets._messageQueue.length * rate;
        return mostRecentMessageDelay + queueDelay;
    }

    static _connect(accessToken) {
        if (TwitchPackets._socket && !(TwitchPackets._socket.readyState === 2 || TwitchPackets._socket.readyState === 3)) {
            console.info('Twitch packets is disconnecting from the current socket...');
            TwitchPackets._socket.close();

            if (!TwitchPackets._autoReconnect) {
                TwitchPackets._createNewSocket(accessToken);
            }
        } else {
            TwitchPackets._createNewSocket(accessToken);
        }
    }

    static _createNewSocket(accessToken) {
        if (accessToken) {
            console.info('Twitch packets is connecting to a new socket...');
            TwitchPackets._socket = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
            TwitchPackets._socket.addEventListener('message', event => TwitchPackets._onMessage(event));
            TwitchPackets._socket.addEventListener('error', event => TwitchPackets._onError(event));
            TwitchPackets._socket.addEventListener('open', () => TwitchPackets._onOpen(accessToken));
            TwitchPackets._socket.addEventListener('close', () => TwitchPackets._onClose());
            return;
        }

        if (!TwitchPackets._autoReconnect) {
            console.error('Twitch packets attempted to connect to a new socket without being given an access token.');
            return;
        }

        TwitchPackets.getAccessToken(TwitchPackets._clientID, TwitchPackets._secret, TwitchPackets._refreshToken).then(response => {
            if (!response.access_token) {
                console.error('Twitch packets received a valid access token response without an access token. ', response);
                return;
            }

            if (!response.refresh_token) {
                console.error('Twitch packets received a valid access token response without an refresh token. ', response);
                return;
            }

            const request = new XMLHttpRequest();
            request.onload = () => {
                if (request.status !== 200) {
                    console.log('Request completed with an incorrect status. ', request.status);
                    return reject(request.responseText);
                }

                console.log('Username request completed.');
                TwitchPackets._username = JSON.parse(request.responseText).data[0].display_name;
            };
            request.onerror = () => {
                console.error(request.responseText);
            };

            request.open('GET', 'https://api.twitch.tv/helix/users', false);
            request.setRequestHeader('Authorization', 'Bearer ' + response.access_token);
            request.setRequestHeader('Client-Id', TwitchPackets._clientID);
            request.send();

            console.log(TwitchPackets._username);

            TwitchPackets._refreshToken = response.refresh_token;
            TwitchPackets._createNewSocket(response.access_token);
        }).catch(error => {
            console.error('Twitch packets refresh authentication request completed with an incorrect status. ', error);
        });
    }

    static _getCredentialInformation() {
        return {
            username: TwitchPackets._username,
            clientID: TwitchPackets._clientID,
            secret: TwitchPackets._secret,
            refreshToken: TwitchPackets._refreshToken,
        };
    }

    static _send(message) {
        if (!TwitchPackets._socket || TwitchPackets._socket.readyState !== 1) {
            console.info('Twitch packets tried to send a message when the socket wasn\'t ready. ', message);
            return;
        }

        TwitchPackets._socket.send(message);
    }

    static _onMessage(event) {
        TwitchPackets._dispatch(TwitchPackets.EVENT_RAW_MESSAGE, event);

        const username = event.data.split('!')[0].substring(1);
        if (username === TwitchPackets._username) {
            return;
        }

        let message = event.data ? event.data.split('PRIVMSG #' + TwitchPackets._hostUsername + ' :')[1] : undefined;
        if (message === undefined) {
            return;
        }

        // un-validate every fucking character
        for (let i = 0; i < message.length; i++) {
            if (TwitchPackets.INVERTED_INVALID_CHAR_CODE_MAPS.hasOwnProperty(message.charAt(i))) {
                message = message.substring(0, i) + String.fromCharCode(TwitchPackets.INVERTED_INVALID_CHAR_CODE_MAPS[message.charAt(i)]) + message.substring(i + 1);
            }
        }

        TwitchPackets._dispatch(TwitchPackets.EVENT_MESSAGE, {username: username, message: message.substring(0, message.length - 2)});
    }

    static _onError(event) {
        console.error('Twitch packets socket error: ', event);

        TwitchPackets._dispatch(TwitchPackets.EVENT_ERROR, event);
    }

    static _onOpen(accessToken) {
        console.info('Twitch packets socket connected.');
        TwitchPackets._send('PASS oauth:' + accessToken);
        TwitchPackets._send('NICK ' + TwitchPackets._username);
        TwitchPackets._send('JOIN #' + TwitchPackets._hostUsername);

        TwitchPackets._dispatch(TwitchPackets.EVENT_CONNECT);
    }

    static _onClose() {
        console.info('Twitch packets socket closed.');

        TwitchPackets._dispatch(TwitchPackets.EVENT_DISCONNECT);

        if (!TwitchPackets._autoReconnect) {
            console.info('Twitch packets will not attempt to reconnect.');
            return;
        }

        TwitchPackets._createNewSocket(null);
    }

    static _dispatch(event, result) {
        const listeners = TwitchPackets._eventListeners[event] || [];
        for (let i = 0; i < listeners.length; i++) {
            listeners[i](result);
        }
    }
}

if (!isNode) {
    module = {
        exports: null,
    };
}

module.exports = TwitchPackets;