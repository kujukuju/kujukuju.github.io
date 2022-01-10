class GameState {
    static SAD_BALD_TEXTURE = PIXI.Texture.from('assets/sadbald.png');

    static MOON_SPAWNS = [
        new Vec2(672, 757),
        new Vec2(1343, 729),
        new Vec2(2319, 942),
        new Vec2(1604, 1392),
        new Vec2(967, 1126),
        new Vec2(2664, 879),
        new Vec2(2742, 1396),
    ];

    static PLEB_SPAWNS = [
        new Vec2(2346, 1576),
        new Vec2(3021, 1539),
        new Vec2(1043, 1394),
        new Vec2(1387, 1555),
        new Vec2(2274, 1348),
        new Vec2(1257, 1809),
    ];

    static ROUNDS = [
        null,
        // {
        //     entities: {
        //         slime: 0,
        //         worm: 1,
        //         bird: 1,
        //         boss: 0,
        //     },
        //     required: {
        //         moon: 3,
        //         slime: 0,
        //         worm: 1,
        //         bird: 1,
        //         boss: 0,
        //     },
        // },
        {
            entities: {
                slime: 8,
                worm: 6,
                bird: 0,
                boss: 0,
            },
            required: {
                moon: 14,
                slime: 4,
                worm: 4,
                bird: 0,
                boss: 0,
            },
        },

        null,
        // {
        //     entities: {
        //         slime: 0,
        //         worm: 0,
        //         bird: 1,
        //         boss: 0,
        //     },
        //     required: {
        //         moon: 2,
        //         slime: 0,
        //         worm: 0,
        //         bird: 2,
        //         boss: 0,
        //     },
        // },
        {
            entities: {
                slime: 10,
                worm: 8,
                bird: 6,
                boss: 0,
            },
            required: {
                moon: 16,
                slime: 2,
                worm: 2,
                bird: 6,
                boss: 0,
            },
        },

        null,
        // {
        //     entities: {
        //         slime: 0,
        //         worm: 0,
        //         bird: 0,
        //         boss: 1,
        //     },
        //     required: {
        //         moon: 3,
        //         slime: 0,
        //         worm: 0,
        //         bird: 0,
        //         boss: 0,
        //     },
        // },
        {
            entities: {
                slime: 12,
                worm: 10,
                bird: 8,
                boss: 1,
            },
            required: {
                moon: 24,
                slime: 2,
                worm: 2,
                bird: 2,
                boss: 10,
            },
        },
    ];

    static firstSpawn = true;

    static menuOpen = true;
    static paused = false;

    static approvedEntities = {};
    static approvedEntityRequestedTypes = {};

    static betweenRoundTimer = 0;

    static round = 0;

    static waitingText = new PIXI.Text('Waiting on more players...\n\nThis might take 1 minute...', {fontFamily: 'Alagard', fontSize: 32, align: 'center', fill: 0xffffff});

    static washedUpMode = false;

    static DesiredEntityType = null;

    static DEATH_COOLDOWN = Math.round(8000 / 16);
    static spawnCooldown = 0;

    static respawnContainer = new PIXI.Container();

    static respawnText = new PIXI.Text('You\'ve been defeated...\nLive again... 8', {fontFamily: 'Alagard', fontSize: 32, align: 'center', fill: 0xffffff});

    static betweenRoundContainer = new PIXI.Container();
    static betweenRoundText = new PIXI.Text('', {fontFamily: 'Alagard', fontSize: 32, align: 'center', fill: 0xffffff});

    static winScreen = new PIXI.Container();

    static pausedContainer = new PIXI.Container();
    static pausedText = new PIXI.Text('FORCIBLY PAUSED FOR EVERYONE LOL', {fontFamily: 'Alagard', fontSize: 32, align: 'center', fill: 0xffffff})

    static initialize() {
        if (window.location.protocol.startsWith('file')) {
            document.getElementById('bad').style.display = 'block';
        }

        document.getElementById('play-button').addEventListener('click', () => {
            document.getElementById('screen').style.display = 'none';
            GameState.menuOpen = false;

            if (window.location.protocol.startsWith('file') && TwitchPackets._username === 'kujukuju') {
                GameState.DesiredEntityType = StickySlimeEntity;
            } else {
                document.getElementById('wait-screen').style.display = 'block';
            }

            EntityInformation.setClientEntityName(TwitchPackets._username);
        });

        document.getElementById('bad-checkbox').addEventListener('change', () => {
            if (!window.location.protocol.startsWith('file')) {
                return;
            }

            GameState.washedUpMode = document.getElementById('bad-checkbox').checked;
            document.getElementById('paused-bad-checkbox').checked = GameState.washedUpMode;
            if (GameState.washedUpMode) {
                MoonEntity.maxHearts = 12;
                MoonEntity.remainingHearts = 12;
                StickySlimeEntity.maxHearts = 12;
                StickySlimeEntity.remainingHearts = 12;
                WormEntity.maxHearts = 24;
                WormEntity.remainingHearts = 24;
                BirdEntity.maxHearts = 16;
                BirdEntity.remainingHearts = 16;
                BossEntity.maxHearts = 80;
                BossEntity.remainingHearts = 80;
            } else {
                MoonEntity.maxHearts = 3;
                MoonEntity.remainingHearts = 3;
                StickySlimeEntity.maxHearts = 3;
                StickySlimeEntity.remainingHearts = 3;
                WormEntity.maxHearts = 6;
                WormEntity.remainingHearts = 6;
                BirdEntity.maxHearts = 4;
                BirdEntity.remainingHearts = 4;
                BossEntity.maxHearts = 20;
                BossEntity.remainingHearts = 20;
            }
        });

        document.getElementById('paused-bad-checkbox').addEventListener('change', () => {
            if (!window.location.protocol.startsWith('file')) {
                return;
            }

            GameState.washedUpMode = document.getElementById('paused-bad-checkbox').checked;
            document.getElementById('bad-checkbox').checked = GameState.washedUpMode;
            if (GameState.washedUpMode) {
                MoonEntity.maxHearts = 12;
                MoonEntity.remainingHearts = 12;
                StickySlimeEntity.maxHearts = 12;
                StickySlimeEntity.remainingHearts = 12;
                WormEntity.maxHearts = 24;
                WormEntity.remainingHearts = 24;
                BirdEntity.maxHearts = 16;
                BirdEntity.remainingHearts = 16;
                BossEntity.maxHearts = 80;
                BossEntity.remainingHearts = 80;
            } else {
                MoonEntity.maxHearts = 3;
                MoonEntity.remainingHearts = 3;
                StickySlimeEntity.maxHearts = 3;
                StickySlimeEntity.remainingHearts = 3;
                WormEntity.maxHearts = 6;
                WormEntity.remainingHearts = 6;
                BirdEntity.maxHearts = 4;
                BirdEntity.remainingHearts = 4;
                BossEntity.maxHearts = 20;
                BossEntity.remainingHearts = 20;
            }
        });

        Renderer.fixed.addChild(GameState.respawnContainer);
        const backgroundSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
        backgroundSprite.tint = 0x0a0210;
        backgroundSprite.width = 2560;
        backgroundSprite.height = 1440;
        GameState.respawnContainer.addChild(backgroundSprite);
        GameState.respawnText.anchor.x = 0.5;
        GameState.respawnText.anchor.y = 1;
        GameState.respawnText.position.x = window.innerWidth / 2;
        GameState.respawnText.position.y = window.innerHeight / 2;
        GameState.respawnContainer.addChild(GameState.respawnText);

        GameState.waitingText.position.x = window.innerWidth / 2;
        GameState.waitingText.position.y = window.innerHeight / 2;
        GameState.waitingText.anchor.x = 0.5;
        Renderer.fixed.addChild(GameState.waitingText);

        const betweenRoundBackground = new PIXI.Sprite(PIXI.Texture.WHITE);
        betweenRoundBackground.tint = 0x0a0210;
        betweenRoundBackground.width = 2560;
        betweenRoundBackground.height = 1440;
        GameState.betweenRoundContainer.addChild(betweenRoundBackground);
        GameState.betweenRoundText.anchor.x = 0.5;
        GameState.betweenRoundText.anchor.y = 1;
        GameState.betweenRoundText.position.x = window.innerWidth / 2;
        GameState.betweenRoundText.position.y = window.innerHeight / 2;
        GameState.betweenRoundContainer.addChild(GameState.betweenRoundText);
        GameState.betweenRoundContainer.visible = false;
        setTimeout(() => {
            Renderer.fixed.addChild(GameState.betweenRoundContainer);
        }, 1000);

        const winBackground = new PIXI.Sprite(PIXI.Texture.WHITE);
        winBackground.tint = 0x0a0210;
        winBackground.width = 2560;
        winBackground.height = 1440;
        GameState.winScreen.addChild(winBackground);
        const winText = new PIXI.Text('As it turns out... The legend was a lie.\n\nThe Baldlings are, after all, desperate for hair and hope.', {fontFamily: 'Alagard', fontSize: 32, align: 'center', fill: 0xffffff})
        winText.anchor.x = 0.5;
        winText.anchor.y = 1;
        winText.position.x = window.innerWidth / 2;
        winText.position.y = window.innerHeight / 2 - 200;
        GameState.winScreen.addChild(winText);
        const sadBald = new PIXI.Sprite(GameState.SAD_BALD_TEXTURE);
        sadBald.scale.x = 4;
        sadBald.scale.y = 4;
        sadBald.anchor.x = 0.5;
        sadBald.anchor.y = 0;
        sadBald.position.x = window.innerWidth / 2;
        sadBald.position.y = window.innerHeight / 2 + 100 - 200;
        GameState.winScreen.addChild(sadBald);
        const thanksText = new PIXI.Text('Thanks for playing!', {fontFamily: 'Alagard', fontSize: 32, align: 'center', fill: 0xffffff})
        thanksText.anchor.x = 0.5;
        thanksText.anchor.y = 0;
        thanksText.position.x = window.innerWidth / 2;
        thanksText.position.y = window.innerHeight / 2 + 250 - 200;
        GameState.winScreen.addChild(thanksText);
        GameState.winScreen.visible = false;
        GameState.winScreen.alpha = 0;
        setTimeout(() => {
            Renderer.fixed.addChild(GameState.winScreen);
        }, 3000);

        const pausedBackground = new PIXI.Sprite(PIXI.Texture.WHITE);
        pausedBackground.tint = 0x0a0210;
        pausedBackground.width = 2560;
        pausedBackground.height = 1440;
        pausedBackground.alpha = 0.75;
        GameState.pausedContainer.addChild(pausedBackground);
        GameState.pausedText.anchor.x = 0.5;
        GameState.pausedText.anchor.y = 1;
        GameState.pausedText.position.x = window.innerWidth / 2;
        GameState.pausedText.position.y = window.innerHeight / 2;
        GameState.pausedContainer.addChild(GameState.pausedText);
        GameState.pausedContainer.visible = false;
        setTimeout(() => {
            Renderer.fixed.addChild(GameState.pausedContainer);
        }, 2000);

        let released = true;
        document.addEventListener('keydown', event => {
            if (event.key.toLowerCase() !== 'escape') {
                return true;
            }

            if (!released) {
                return true;
            }

            if (!GameState.paused && !GameState.roundStarted()) {
                return;
            }

            if (window.location.protocol.startsWith('file') && TwitchPackets._username === 'kujukuju') {
                GameState.paused = !GameState.paused;
            }
        });
        document.addEventListener('keydown', event => {
            if (event.key.toLowerCase() !== 'escape') {
                return true;
            }

            released = true;
        });
    }

    static canPlebJoin() {
        return document.getElementById('wait-screen').style.display === 'block';
    }

    static plebAccepted(entityType) {
        document.getElementById('wait-screen').style.display = 'none';

        let EntityType = null;
        switch (entityType) {
            case PacketProcessor.ENTITY_TYPE_STICKY_SLIME: {
                EntityType = StickySlimeEntity;
            } break;

            case PacketProcessor.ENTITY_TYPE_WORM: {
                EntityType = WormEntity;
            } break;

            case PacketProcessor.ENTITY_TYPE_BIRD: {
                EntityType = BirdEntity;
            } break;

            case PacketProcessor.ENTITY_TYPE_BOSS: {
                EntityType = BossEntity;
            } break;

            default:
                console.error('Accepted with an unknown entity type. ', entityType);
        }

        GameState.DesiredEntityType = EntityType;
    }

    static getMoonSpawn() {
        if (GameState.firstSpawn) {
            GameState.firstSpawn = false;

            return new Vec2(1343, 729);
        }

        return GameState.MOON_SPAWNS[Math.floor(Math.random() * GameState.MOON_SPAWNS.length)];
    }

    static getPlebSpawn() {
        return GameState.PLEB_SPAWNS[Math.floor(Math.random() * GameState.PLEB_SPAWNS.length)];
    }

    static update() {
        if (GameState.round === 5) {
            AudioManager.playBossMusic();
        } else if (GameState.round === 6) {
            AudioManager.playCreditMusic();
        } else if (GameState.round > 0) {
            AudioManager.playNormalMusic();
        }

        if (window.location.protocol.startsWith('file') && TwitchPackets._username === 'kujukuju') {
            // if youre missing entities force pause
            if (GameState.roundStarted() && GameState.completelyMissingEntities()) {
                GameState.pausedText.text = 'Some players disconnected...\n\nFinding more players.';
                GameState.paused = true;
            } else {
                if (GameState.pausedText.text === 'Some players disconnected...\n\nFinding more players.') {
                    GameState.paused = false;
                }

                GameState.pausedText.text = 'FORCIBLY PAUSED FOR EVERYONE LOL';
            }

            if (window.location.protocol.startsWith('file')) {
                if (GameState.paused) {
                    document.getElementById('paused-screen-bad').style.display = 'block';
                } else {
                    document.getElementById('paused-screen-bad').style.display = 'none';
                }
            }

            // validate that the entities actually exist within the allowed time
            if (!GameState.menuOpen && (!GameState.roundStarted() || GameState.paused)) {
                let roundCanStart = true;

                // every approved entity must exist
                const now = Date.now();
                const entityNames = Object.keys(GameState.approvedEntities);
                for (let i = 0; i < entityNames.length; i++) {
                    const name = entityNames[i];
                    if (EntityInformation.lastActiveTimes[name]) {
                        continue;
                    }

                    roundCanStart = false;

                    if (now - GameState.approvedEntities[name] > 8000) {
                        delete GameState.approvedEntities[name];
                        delete GameState.approvedEntityRequestedTypes[name];
                    }
                }

                if (Object.keys(GameState.approvedEntities).length < GameState.getRequiredEntityCount()) {
                    roundCanStart = false;
                    MoonPackets.requestMorePlayers();
                }

                if (!GameState.roundStarted() && roundCanStart && !GameState.paused && GameState.betweenRoundTimer === 0 && !GameState.gameFinished()) {
                    GameState.round++;
                }
            }

            if (GameState.gameFinished()) {
                GameState.winScreen.visible = true;
                GameState.winScreen.alpha = Math.min(GameState.winScreen.alpha + 0.02, 1);
            } else {
                if (GameState.roundStarted() && SoulPlantManager.completedRound()) {
                    GameState.round++;
                    GameState.betweenRoundTimer = 360;

                    SoulPlantManager.resetSouls();
                    SoulPlantManager.convertMoon(MoonEntity);

                    if (GameState.round === 2) {
                        GameState.betweenRoundText.text = 'Somethings not quite right...\n\nI need souls that are more unique...';
                    }

                    if (GameState.round === 4) {
                        GameState.betweenRoundText.text = 'I can feel it... It\'s almost working.\n\nI just need souls from something much, much larger...';
                    }
                }

                if (GameState.betweenRoundTimer > 0) {
                    GameState.betweenRoundTimer--;

                    const alpha = Math.min(Math.min(GameState.betweenRoundTimer / 30, 1), Math.min((360 - GameState.betweenRoundTimer) / 30, 1));
                    GameState.betweenRoundContainer.alpha = alpha;
                    GameState.betweenRoundContainer.visible = true;
                    if (alpha === 0) {
                        GameState.betweenRoundContainer.visible = false;
                    }
                } else {
                    GameState.betweenRoundContainer.visible = false;
                }
            }
        }

        GameState.pausedContainer.visible = GameState.paused;

        // if your entity is dead, and the round has started, respawn timer
        GameState.spawnCooldown = Math.max(GameState.spawnCooldown - 1, 0);
        if (!EntityInformation.getClientEntity()) {
            if (GameState.DesiredEntityType && !GameState.spawnCooldown) {
                if (EntityInformation.canCreateEntity(TwitchPackets._username)) {
                    EntityInformation.addEntity(TwitchPackets._username, new GameState.DesiredEntityType(TwitchPackets._username));
    
                    const clientEntity = EntityInformation.getClientEntity();
                    if (clientEntity) {
                        const moon = GameState.DesiredEntityType === MoonEntity;
                        const spawn = moon ? GameState.getMoonSpawn() : GameState.getPlebSpawn();
                        clientEntity.controller.position.copy(spawn);
                        Camera.setPositionImmediate(spawn);
                    }
                }
            }
        }

        if (GameState.spawnCooldown > 0) {
            GameState.respawnContainer.visible = true;
            GameState.respawnText.text = 'You\'ve been defeated...\nLive again... ' + Math.min(Math.ceil(GameState.spawnCooldown / 60), Math.floor(GameState.DEATH_COOLDOWN / 60));
        } else {
            GameState.respawnContainer.visible = false;
        }

        if (GameState.roundStarted()) {
            GameState.waitingText.visible = false;

            const moonEntity = EntityInformation.getMoonEntity();
            if (!moonEntity) {
                const plebEntities = EntityInformation.getPlebEntities();
                for (let i = 0; i < plebEntities.length; i++) {
                    plebEntities[i].remainingHearts = plebEntities[i].maxHearts;
                }
            }
        } else {
            GameState.waitingText.visible = true;

            const plebEntities = EntityInformation.getPlebEntities();
            for (let i = 0; i < plebEntities.length; i++) {
                plebEntities[i].remainingHearts = plebEntities[i].maxHearts;
            }

            const moonEntity = EntityInformation.getMoonEntity();
            if (moonEntity) {
                moonEntity.remainingHearts = moonEntity.maxHearts;
            }
        }
    }

    static roundStarted() {
        return GameState.round === 1 || GameState.round === 3 || GameState.round === 5;
    }

    static getRoundInfo() {
        return GameState.ROUNDS[GameState.round] ? GameState.ROUNDS[GameState.round] : GameState.ROUNDS[GameState.round + 1];
    }

    static getRemainingApprovalEntityType() {
        let requestedSlimes = GameState.getRequiredSlimeCount();
        let requestedWorms = GameState.getRequiredWormCount();
        let requestedBirds = GameState.getRequiredBirdCount();
        let requestedBosses = GameState.getRequiredBossCount();

        for (const name in GameState.approvedEntities) {
            const type = GameState.approvedEntityRequestedTypes[name];

            switch (type) {
                case PacketProcessor.ENTITY_TYPE_STICKY_SLIME: {
                    requestedSlimes--;
                } break;
                
                case PacketProcessor.ENTITY_TYPE_WORM: {
                    requestedWorms--;
                } break;
                
                case PacketProcessor.ENTITY_TYPE_BIRD: {
                    requestedBirds--;
                } break;
                
                case PacketProcessor.ENTITY_TYPE_BOSS: {
                    requestedBosses--;
                } break;

                default:
                    console.error('Found an unknown requested approval type. ', type);
            }
        }

        if (requestedSlimes > 0) {
            return PacketProcessor.ENTITY_TYPE_STICKY_SLIME;
        }
        if (requestedWorms > 0) {
            return PacketProcessor.ENTITY_TYPE_WORM;
        }
        if (requestedBirds > 0) {
            return PacketProcessor.ENTITY_TYPE_BIRD;
        }
        if (requestedBosses > 0) {
            return PacketProcessor.ENTITY_TYPE_BOSS;
        }

        const random = Math.random();
        if (random < 0.333) {
            return PacketProcessor.ENTITY_TYPE_STICKY_SLIME;
        } else if (random < 0.667) {
            return PacketProcessor.ENTITY_TYPE_WORM;
        } else {
            if (GameState.getRequiredBirdCount() > 0) {
                return PacketProcessor.ENTITY_TYPE_BIRD;
            }
            return PacketProcessor.ENTITY_TYPE_WORM;
        }
    }

    static getRequiredSlimeCount() {
        const round = GameState.getRoundInfo();
        if (!round) {
            return 0;
        }
        
        return round.entities.slime;
    }

    static getRequiredWormCount() {
        const round = GameState.getRoundInfo();
        if (!round) {
            return 0;
        }
        
        return round.entities.worm;
    }

    static getRequiredBirdCount() {
        const round = GameState.getRoundInfo();
        if (!round) {
            return 0;
        }
        
        return round.entities.bird;
    }

    static getRequiredBossCount() {
        const round = GameState.getRoundInfo();
        if (!round) {
            return 0;
        }
        
        return round.entities.boss;
    }

    static getRequiredEntityCount() {
        const round = GameState.getRoundInfo();
        if (!round) {
            return 0;
        }

        const requiredEntities = round.entities;
        const values = Object.values(requiredEntities);
        let sum = 0;
        for (let i = 0; i < values.length; i++) {
            sum += values[i];
        }

        return sum;
    }

    static getRequiredMoonSouls() {
        const round = GameState.getRoundInfo();
        if (!round) {
            return 0;
        }

        return round.required.moon || 0;
    }

    static getRequiredSlimeSouls() {
        const round = GameState.getRoundInfo();
        if (!round) {
            return 0;
        }

        return round.required.slime || 0;
    }

    static getRequiredWormSouls() {
        const round = GameState.getRoundInfo();
        if (!round) {
            return 0;
        }

        return round.required.worm || 0;
    }

    static getRequiredBirdSouls() {
        const round = GameState.getRoundInfo();
        if (!round) {
            return 0;
        }

        return round.required.bird || 0;
    }

    static getRequiredBossSouls() {
        const round = GameState.getRoundInfo();
        if (!round) {
            return 0;
        }

        return round.required.boss || 0;
    }

    static gameFinished() {
        return GameState.round === GameState.ROUNDS.length;
    }

    static completelyMissingEntities() {
        let requestedSlimes = GameState.getRequiredSlimeCount() > 0 ? 1 : 0;
        let requestedWorms = GameState.getRequiredWormCount() > 0 ? 1 : 0;
        let requestedBirds = GameState.getRequiredBirdCount() > 0 ? 1 : 0;
        let requestedBosses = GameState.getRequiredBossCount() > 0 ? 1 : 0;

        for (const name in GameState.approvedEntities) {
            const type = GameState.approvedEntityRequestedTypes[name];

            switch (type) {
                case PacketProcessor.ENTITY_TYPE_STICKY_SLIME: {
                    requestedSlimes = 0;
                } break;
                
                case PacketProcessor.ENTITY_TYPE_WORM: {
                    requestedWorms = 0;
                } break;
                
                case PacketProcessor.ENTITY_TYPE_BIRD: {
                    requestedBirds = 0;
                } break;
                
                case PacketProcessor.ENTITY_TYPE_BOSS: {
                    requestedBosses = 0;
                } break;

                default:
                    console.error('Found an unknown requested approval type.');
            }
        }

        if (requestedSlimes > 0 || requestedWorms > 0 || requestedBirds > 0 || requestedBosses > 0) {
            return true;
        }

        return false;
    }
}