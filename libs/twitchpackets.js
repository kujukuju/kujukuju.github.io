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
        0: '里',
        1: 'あ',
        2: 'い',
        3: 'う',
        4: 'え',
        5: 'お',
        6: 'か',
        7: 'き',
        8: 'く',
        9: 'け',
        10: 'こ',
        11: 'が',
        12: 'ぎ',
        13: 'ぐ',
        14: 'げ',
        15: 'ご',
        16: 'さ',
        17: 'し',
        18: 'す',
        19: 'せ',
        20: 'そ',
        21: 'ざ',
        22: 'じ',
        23: 'ず',
        24: 'ぜ',
        25: 'ぞ',
        26: 'た',
        27: 'ち',
        28: 'つ',
        29: 'て',
        30: 'と',
        31: 'だ',
        32: 'ぢ',
        46: 'づ',
        47: 'で',
        127: 'ど',
        128: 'な',
        129: 'に',
        130: 'ぬ',
        131: 'ね',
        132: 'の',
        133: 'は',
        134: 'ひ',
        135: 'ふ',
        136: 'へ',
        137: 'ほ',
        138: 'ば',
        139: 'び',
        140: 'ぶ',
        141: 'べ',
        142: 'ぼ',
        143: 'ぱ',
        144: 'ぴ',
        145: 'ぷ',
        146: 'ぺ',
        147: 'ぽ',
        148: 'ま',
        149: 'み',
        150: 'む',
        151: 'め',
        152: 'も',
        153: 'や',
        154: 'ゆ',
        155: 'よ',
        156: 'ら',
        157: 'り',
        158: 'る',
        159: 'れ',
        160: 'ろ',
        161: 'わ',
        162: 'を',
        163: 'ん',
        164: '的',
        165: '一',
        166: '人',
        167: '口',
        168: '土',
        169: '女',
        170: '心',
        171: '手',
        172: '日',
        173: '月',
        174: '木',
        175: '氵',
        176: '火',
        177: '纟',
        178: '艹',
        179: '讠',
        180: '辶',
        181: '钅',
        182: '刂',
        183: '宀',
        184: '贝',
        185: '匕',
        186: '力',
        187: '又',
        188: '犭',
        189: '禾',
        190: '虫',
        191: '阝',
        192: '大',
        193: '广',
        194: '田',
        195: '目',
        196: '石',
        197: '衤',
        198: '足',
        199: '马',
        200: '页',
        201: '巾',
        202: '米',
        203: '车',
        204: '八',
        205: '尸',
        206: '寸',
        207: '山',
        208: '攵',
        209: '彳',
        210: '十',
        211: '工',
        212: '方',
        213: '门',
        214: '饣',
        215: '欠',
        216: '儿',
        217: '冫',
        218: '子',
        219: '疒',
        220: '隹',
        221: '斤',
        222: '亠',
        223: '王',
        224: '白',
        225: '立',
        226: '羊',
        227: '艮',
        228: '冖',
        229: '厂',
        230: '皿',
        231: '礻',
        232: '穴',
        233: '走',
        234: '雨',
        235: '囗',
        236: '小',
        237: '戈',
        238: '几',
        239: '舌',
        240: '干',
        241: '殳',
        242: '夕',
        243: '止',
        244: '牜',
        245: '皮',
        246: '耳',
        247: '辛',
        248: '酉',
        249: '青',
        250: '鸟',
        251: '弓',
        252: '厶',
        253: '户',
        254: '羽',
        255: '舟',
    };

    static INVERTED_INVALID_CHAR_CODE_MAPS = {
        '里': 0,
        'あ': 1,
        'い': 2,
        'う': 3,
        'え': 4,
        'お': 5,
        'か': 6,
        'き': 7,
        'く': 8,
        'け': 9,
        'こ': 10,
        'が': 11,
        'ぎ': 12,
        'ぐ': 13,
        'げ': 14,
        'ご': 15,
        'さ': 16,
        'し': 17,
        'す': 18,
        'せ': 19,
        'そ': 20,
        'ざ': 21,
        'じ': 22,
        'ず': 23,
        'ぜ': 24,
        'ぞ': 25,
        'た': 26,
        'ち': 27,
        'つ': 28,
        'て': 29,
        'と': 30,
        'だ': 31,
        'ぢ': 32,
        'づ': 46,
        'で': 47,
        'ど': 127,
        'な': 128,
        'に': 129,
        'ぬ': 130,
        'ね': 131,
        'の': 132,
        'は': 133,
        'ひ': 134,
        'ふ': 135,
        'へ': 136,
        'ほ': 137,
        'ば': 138,
        'び': 139,
        'ぶ': 140,
        'べ': 141,
        'ぼ': 142,
        'ぱ': 143,
        'ぴ': 144,
        'ぷ': 145,
        'ぺ': 146,
        'ぽ': 147,
        'ま': 148,
        'み': 149,
        'む': 150,
        'め': 151,
        'も': 152,
        'や': 153,
        'ゆ': 154,
        'よ': 155,
        'ら': 156,
        'り': 157,
        'る': 158,
        'れ': 159,
        'ろ': 160,
        'わ': 161,
        'を': 162,
        'ん': 163,
        '的': 164,
        '一': 165,
        '人': 166,
        '口': 167,
        '土': 168,
        '女': 169,
        '心': 170,
        '手': 171,
        '日': 172,
        '月': 173,
        '木': 174,
        '氵': 175,
        '火': 176,
        '纟': 177,
        '艹': 178,
        '讠': 179,
        '辶': 180,
        '钅': 181,
        '刂': 182,
        '宀': 183,
        '贝': 184,
        '匕': 185,
        '力': 186,
        '又': 187,
        '犭': 188,
        '禾': 189,
        '虫': 190,
        '阝': 191,
        '大': 192,
        '广': 193,
        '田': 194,
        '目': 195,
        '石': 196,
        '衤': 197,
        '足': 198,
        '马': 199,
        '页': 200,
        '巾': 201,
        '米': 202,
        '车': 203,
        '八': 204,
        '尸': 205,
        '寸': 206,
        '山': 207,
        '攵': 208,
        '彳': 209,
        '十': 210,
        '工': 211,
        '方': 212,
        '门': 213,
        '饣': 214,
        '欠': 215,
        '儿': 216,
        '冫': 217,
        '子': 218,
        '疒': 219,
        '隹': 220,
        '斤': 221,
        '亠': 222,
        '王': 223,
        '白': 224,
        '立': 225,
        '羊': 226,
        '艮': 227,
        '冖': 228,
        '厂': 229,
        '皿': 230,
        '礻': 231,
        '穴': 232,
        '走': 233,
        '雨': 234,
        '囗': 235,
        '小': 236,
        '戈': 237,
        '几': 238,
        '舌': 239,
        '干': 240,
        '殳': 241,
        '夕': 242,
        '止': 243,
        '牜': 244,
        '皮': 245,
        '耳': 246,
        '辛': 247,
        '酉': 248,
        '青': 249,
        '鸟': 250,
        '弓': 251,
        '厶': 252,
        '户': 253,
        '羽': 254,
        '舟': 255,
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