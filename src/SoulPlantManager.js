class SoulPlantManager {
    static SOUL_PLANT_TEXTURE = PIXI.Texture.from('assets/soul-plant.png');
    static GIRL_FRAME_TEXTURE = PIXI.Texture.from('assets/girl-frame.png');
    static SLIME_FRAME_TEXTURE = PIXI.Texture.from('assets/slime-frame.png');
    static WORM_FRAME_TEXTURE = PIXI.Texture.from('assets/worm-frame.png');
    static BIRD_FRAME_TEXTURE = PIXI.Texture.from('assets/bird-frame.png');
    static BOSS_FRAME_TEXTURE = PIXI.Texture.from('assets/boss-frame.png');
    static COLLECT_TEXTURE = PIXI.Texture.from('assets/collect-souls.png');

    static LIGHT_EXPLOSION_TEXTURE = PIXI.Texture.from('assets/light-explosion.png');
    static SMOKE_EXPLOSION_TEXTURE = PIXI.Texture.from('assets/smoke.png');

    static SOUL_SUCK_SOUND = new NSWA.Source('assets/soul-suck-loop.mp3', {loop: true, volume: 0.1});
    static soulSuckSound;

    static CHANGE_FORM_SOUND = new NSWA.Source('assets/change-form.mp3', {loop: false, volume: 0.7});
    static changeFormSound;

    static SOUL_EXPLOSION_SOUND = new NSWA.Source('assets/soul-explosion.wav', {volume: 0.8});
    static soulExplosionSoundIndex = 0;
    static soulExplosionSounds = [];

    static POSITIONS = [
        new Vec2(1339, 579),
        new Vec2(590, 757),
        new Vec2(2664, 879),
        new Vec2(2280, 1390),
        new Vec2(2925, 1843),
        new Vec2(883, 1881),
        new Vec2(1772, 1355),
    ];

    static sprites = [];

    static lightExplosionSprite;
    static smokeExplosionSprite;

    static floatingSouls = [];

    static soulCountMoon = 0;
    static soulCountSlime = 0;
    static soulCountWorm = 0;
    static soulCountBird = 0;
    static soulCountBoss = 0;

    static holdingCountMoon = 0;
    static holdingCountSlime = 0;
    static holdingCountWorm = 0;
    static holdingCountBird = 0;
    static holdingCountBoss = 0;

    static soulDepositDelay = 60;

    static collectionContainer = new PIXI.Container();
    static collectSprite;
    static girlFrameSprite;
    static girlCollectionText = new PIXI.Text('0 / 0', {fontFamily: 'Alagard', fontSize: 32, align: 'center', fill: 0xffffff});
    static girlHoldingText = new PIXI.Text('Holding 0', {fontFamily: 'Alagard', fontSize: 16, align: 'center', fill: 0xffffff});
    static slimeFrameSprite;
    static slimeCollectionText = new PIXI.Text('0 / 0', {fontFamily: 'Alagard', fontSize: 32, align: 'center', fill: 0xffffff});
    static slimeHoldingText = new PIXI.Text('Holding 0', {fontFamily: 'Alagard', fontSize: 16, align: 'center', fill: 0xffffff});
    static wormFrameSprite;
    static wormCollectionText = new PIXI.Text('0 / 0', {fontFamily: 'Alagard', fontSize: 32, align: 'center', fill: 0xffffff});
    static wormHoldingText = new PIXI.Text('Holding 0', {fontFamily: 'Alagard', fontSize: 16, align: 'center', fill: 0xffffff});
    static birdFrameSprite;
    static birdCollectionText = new PIXI.Text('0 / 0', {fontFamily: 'Alagard', fontSize: 32, align: 'center', fill: 0xffffff});
    static birdHoldingText = new PIXI.Text('Holding 0', {fontFamily: 'Alagard', fontSize: 16, align: 'center', fill: 0xffffff});
    static bossFrameSprite;
    static bossCollectionText = new PIXI.Text('0 / 0', {fontFamily: 'Alagard', fontSize: 32, align: 'center', fill: 0xffffff});
    static bossHoldingText = new PIXI.Text('Holding 0', {fontFamily: 'Alagard', fontSize: 16, align: 'center', fill: 0xffffff});

    static timeInFrontOfPlant = 0;
    static showingExplanationText = 0;

    static explanationText = new PIXI.Text('You must turn in souls as the creature that acquired them.', {fontFamily: 'Alagard', fontSize: 32, align: 'center', fill: 0xffffff})

    static initialize() {
        for (let i = 0; i < SoulPlantManager.POSITIONS.length; i++) {
            const position = SoulPlantManager.POSITIONS[i];

            const sprite = new FramedSprite(SoulPlantManager.SOUL_PLANT_TEXTURE, 40, 78, 9, 25);
            sprite.position.x = position.x;
            sprite.position.y = position.y + 1;
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 1;
            sprite.addAnimation('charging', 0, 14);
            sprite.addAnimation('loop', 10, 4);
            sprite.addAnimation('die', 15, 9);
            Renderer.backgroundish.addChild(sprite);

            SoulPlantManager.sprites.push(sprite);
        }

        SoulPlantManager.explanationText.visible = false;
        SoulPlantManager.explanationText.anchor.x = 0.5;
        SoulPlantManager.explanationText.anchor.y = 1;
        SoulPlantManager.explanationText.position.x = window.innerWidth / 2;
        SoulPlantManager.explanationText.position.y = window.innerHeight * (2 / 3);
        Renderer.fixed.addChild(SoulPlantManager.explanationText);

        SoulPlantManager.soulSuckSound = SoulPlantManager.SOUL_SUCK_SOUND.create();
        SoulPlantManager.soulSuckSound.setVolume(0);
        SoulPlantManager.soulSuckSound.setPannerOrientation(0, 0, -1);

        SoulPlantManager.soulExplosionSoundIndex = 0;
        SoulPlantManager.soulExplosionSounds = [SoulPlantManager.SOUL_EXPLOSION_SOUND.create(), SoulPlantManager.SOUL_EXPLOSION_SOUND.create()];
        SoulPlantManager.soulExplosionSounds[0].setPannerOrientation(0, 0, -1);
        SoulPlantManager.soulExplosionSounds[1].setPannerOrientation(0, 0, -1);

        SoulPlantManager.changeFormSound = SoulPlantManager.CHANGE_FORM_SOUND.create();
        SoulPlantManager.changeFormSound.setPannerOrientation(0, 0, -1);

        SoulPlantManager.smokeExplosionSprite = new FramedSprite(SoulPlantManager.SMOKE_EXPLOSION_TEXTURE, 45, 51, 12, 12);
        SoulPlantManager.smokeExplosionSprite.visible = false;
        SoulPlantManager.smokeExplosionSprite.anchor.x = 0.5;
        SoulPlantManager.smokeExplosionSprite.anchor.y = 0.9;
        SoulPlantManager.smokeExplosionSprite.scale.x = 2;
        SoulPlantManager.smokeExplosionSprite.scale.y = 2;
        Renderer.foreground.addChild(SoulPlantManager.smokeExplosionSprite);

        SoulPlantManager.lightExplosionSprite = new FramedSprite(SoulPlantManager.LIGHT_EXPLOSION_TEXTURE, 84, 81, 8, 8);
        SoulPlantManager.lightExplosionSprite.visible = false;
        SoulPlantManager.lightExplosionSprite.anchor.x = 0.5;
        SoulPlantManager.lightExplosionSprite.anchor.y = 1;
        Renderer.foreground.addChild(SoulPlantManager.lightExplosionSprite);

        Renderer.fixed.addChild(SoulPlantManager.collectionContainer);

        SoulPlantManager.collectSprite = new PIXI.Sprite(SoulPlantManager.COLLECT_TEXTURE);
        SoulPlantManager.collectSprite.scale.x = 1;
        SoulPlantManager.collectSprite.scale.y = 1;
        SoulPlantManager.collectSprite.position.x = 20;
        SoulPlantManager.collectSprite.position.y = 200;
        SoulPlantManager.collectionContainer.addChild(SoulPlantManager.collectSprite);

        SoulPlantManager.girlFrameSprite = new PIXI.Sprite(SoulPlantManager.GIRL_FRAME_TEXTURE);
        SoulPlantManager.girlFrameSprite.scale.x = 2;
        SoulPlantManager.girlFrameSprite.scale.y = 2;
        SoulPlantManager.girlFrameSprite.position.x = 20;
        SoulPlantManager.girlFrameSprite.position.y = 280;
        SoulPlantManager.collectionContainer.addChild(SoulPlantManager.girlFrameSprite);
        SoulPlantManager.girlCollectionText.position.x = SoulPlantManager.girlFrameSprite.position.x + 80;
        SoulPlantManager.girlCollectionText.position.y = SoulPlantManager.girlFrameSprite.position.y + 5;
        SoulPlantManager.collectionContainer.addChild(SoulPlantManager.girlCollectionText);
        SoulPlantManager.girlHoldingText.position.x = SoulPlantManager.girlFrameSprite.position.x + 80;
        SoulPlantManager.girlHoldingText.position.y = SoulPlantManager.girlFrameSprite.position.y + 40;
        SoulPlantManager.collectionContainer.addChild(SoulPlantManager.girlHoldingText);

        SoulPlantManager.slimeFrameSprite = new PIXI.Sprite(SoulPlantManager.SLIME_FRAME_TEXTURE);
        SoulPlantManager.slimeFrameSprite.scale.x = 2;
        SoulPlantManager.slimeFrameSprite.scale.y = 2;
        SoulPlantManager.slimeFrameSprite.position.x = 20;
        SoulPlantManager.slimeFrameSprite.position.y = 360;
        SoulPlantManager.collectionContainer.addChild(SoulPlantManager.slimeFrameSprite);
        SoulPlantManager.slimeCollectionText.position.x = SoulPlantManager.slimeFrameSprite.position.x + 80;
        SoulPlantManager.slimeCollectionText.position.y = SoulPlantManager.slimeFrameSprite.position.y + 5;
        SoulPlantManager.collectionContainer.addChild(SoulPlantManager.slimeCollectionText);
        SoulPlantManager.slimeHoldingText.position.x = SoulPlantManager.slimeFrameSprite.position.x + 80;
        SoulPlantManager.slimeHoldingText.position.y = SoulPlantManager.slimeFrameSprite.position.y + 40;
        SoulPlantManager.collectionContainer.addChild(SoulPlantManager.slimeHoldingText);

        SoulPlantManager.wormFrameSprite = new PIXI.Sprite(SoulPlantManager.WORM_FRAME_TEXTURE);
        SoulPlantManager.wormFrameSprite.scale.x = 2;
        SoulPlantManager.wormFrameSprite.scale.y = 2;
        SoulPlantManager.wormFrameSprite.position.x = 20;
        SoulPlantManager.wormFrameSprite.position.y = 440;
        SoulPlantManager.collectionContainer.addChild(SoulPlantManager.wormFrameSprite);
        SoulPlantManager.wormCollectionText.position.x = SoulPlantManager.wormFrameSprite.position.x + 80;
        SoulPlantManager.wormCollectionText.position.y = SoulPlantManager.wormFrameSprite.position.y + 5;
        SoulPlantManager.collectionContainer.addChild(SoulPlantManager.wormCollectionText);
        SoulPlantManager.wormHoldingText.position.x = SoulPlantManager.wormFrameSprite.position.x + 80;
        SoulPlantManager.wormHoldingText.position.y = SoulPlantManager.wormFrameSprite.position.y + 40;
        SoulPlantManager.collectionContainer.addChild(SoulPlantManager.wormHoldingText);

        SoulPlantManager.birdFrameSprite = new PIXI.Sprite(SoulPlantManager.BIRD_FRAME_TEXTURE);
        SoulPlantManager.birdFrameSprite.scale.x = 2;
        SoulPlantManager.birdFrameSprite.scale.y = 2;
        SoulPlantManager.birdFrameSprite.position.x = 20;
        SoulPlantManager.birdFrameSprite.position.y = 520;
        SoulPlantManager.collectionContainer.addChild(SoulPlantManager.birdFrameSprite);
        SoulPlantManager.birdCollectionText.position.x = SoulPlantManager.birdFrameSprite.position.x + 80;
        SoulPlantManager.birdCollectionText.position.y = SoulPlantManager.birdFrameSprite.position.y + 5;
        SoulPlantManager.collectionContainer.addChild(SoulPlantManager.birdCollectionText);
        SoulPlantManager.birdHoldingText.position.x = SoulPlantManager.birdFrameSprite.position.x + 80;
        SoulPlantManager.birdHoldingText.position.y = SoulPlantManager.birdFrameSprite.position.y + 40;
        SoulPlantManager.collectionContainer.addChild(SoulPlantManager.birdHoldingText);

        SoulPlantManager.bossFrameSprite = new PIXI.Sprite(SoulPlantManager.BOSS_FRAME_TEXTURE);
        SoulPlantManager.bossFrameSprite.scale.x = 2;
        SoulPlantManager.bossFrameSprite.scale.y = 2;
        SoulPlantManager.bossFrameSprite.position.x = 20;
        SoulPlantManager.bossFrameSprite.position.y = 520;
        SoulPlantManager.collectionContainer.addChild(SoulPlantManager.bossFrameSprite);
        SoulPlantManager.bossCollectionText.position.x = SoulPlantManager.bossFrameSprite.position.x + 80;
        SoulPlantManager.bossCollectionText.position.y = SoulPlantManager.bossFrameSprite.position.y + 5;
        SoulPlantManager.collectionContainer.addChild(SoulPlantManager.bossCollectionText);
        SoulPlantManager.bossHoldingText.position.x = SoulPlantManager.bossFrameSprite.position.x + 80;
        SoulPlantManager.bossHoldingText.position.y = SoulPlantManager.bossFrameSprite.position.y + 40;
        SoulPlantManager.collectionContainer.addChild(SoulPlantManager.bossHoldingText);
    }

    static update() {
        let insideIndex = -1;

        let playingSoulSuck = false;

        if (window.location.protocol.startsWith('file') && TwitchPackets._username === 'kujukuju') {
            SoulPlantManager.collectionContainer.visible = true;

            if (GameState.getRequiredMoonSouls() === 0) {
                SoulPlantManager.girlFrameSprite.visible = false;
                SoulPlantManager.girlCollectionText.visible = false;
                SoulPlantManager.girlHoldingText.visible = false;
            } else {
                SoulPlantManager.girlFrameSprite.visible = true;
                SoulPlantManager.girlCollectionText.visible = true;
                SoulPlantManager.girlHoldingText.visible = true;
            }

            if (GameState.getRequiredSlimeSouls() === 0) {
                SoulPlantManager.slimeFrameSprite.visible = false;
                SoulPlantManager.slimeCollectionText.visible = false;
                SoulPlantManager.slimeHoldingText.visible = false;
            } else {
                SoulPlantManager.slimeFrameSprite.visible = true;
                SoulPlantManager.slimeCollectionText.visible = true;
                SoulPlantManager.slimeHoldingText.visible = true;
            }

            if (GameState.getRequiredWormSouls() === 0) {
                SoulPlantManager.wormFrameSprite.visible = false;
                SoulPlantManager.wormCollectionText.visible = false;
                SoulPlantManager.wormHoldingText.visible = false;
            } else {
                SoulPlantManager.wormFrameSprite.visible = true;
                SoulPlantManager.wormCollectionText.visible = true;
                SoulPlantManager.wormHoldingText.visible = true;
            }

            if (GameState.getRequiredBirdSouls() === 0) {
                SoulPlantManager.birdFrameSprite.visible = false;
                SoulPlantManager.birdCollectionText.visible = false;
                SoulPlantManager.birdHoldingText.visible = false;
            } else {
                SoulPlantManager.birdFrameSprite.visible = true;
                SoulPlantManager.birdCollectionText.visible = true;
                SoulPlantManager.birdHoldingText.visible = true;
            }

            if (GameState.getRequiredBossSouls() === 0) {
                SoulPlantManager.bossFrameSprite.visible = false;
                SoulPlantManager.bossCollectionText.visible = false;
                SoulPlantManager.bossHoldingText.visible = false;
            } else {
                SoulPlantManager.bossFrameSprite.visible = true;
                SoulPlantManager.bossCollectionText.visible = true;
                SoulPlantManager.bossHoldingText.visible = true;
            }

            if (GameState.roundStarted() && !GameState.paused) {
                const clientEntity = EntityInformation.getClientEntity();
                if (!clientEntity) {
                    SoulPlantManager.resetSouls();
                } else {
                    if (clientEntity instanceof MoonEntity) {
                        SoulPlantManager.holdingCountSlime = 0;
                        SoulPlantManager.holdingCountWorm = 0;
                        SoulPlantManager.holdingCountBird = 0;
                        SoulPlantManager.holdingCountBoss = 0;
                    } else if (clientEntity instanceof StickySlimeEntity) {
                        SoulPlantManager.holdingCountWorm = 0;
                        SoulPlantManager.holdingCountBird = 0;
                        SoulPlantManager.holdingCountBoss = 0;
                    } else if (clientEntity instanceof WormEntity) {
                        SoulPlantManager.holdingCountSlime = 0;
                        SoulPlantManager.holdingCountBird = 0;
                        SoulPlantManager.holdingCountBoss = 0;
                    } else if (clientEntity instanceof BirdEntity) {
                        SoulPlantManager.holdingCountSlime = 0;
                        SoulPlantManager.holdingCountWorm = 0;
                        SoulPlantManager.holdingCountBoss = 0;
                    } else if (clientEntity instanceof BossEntity) {
                        SoulPlantManager.holdingCountSlime = 0;
                        SoulPlantManager.holdingCountWorm = 0;
                        SoulPlantManager.holdingCountBird = 0;
                    }

                    let found = false;
                    const aabb = new AABB();
                    for (let i = 0; i < SoulPlantManager.POSITIONS.length; i++) {
                        const position = SoulPlantManager.POSITIONS[i];

                        aabb.x = position.x - 25 - 10;
                        aabb.y = position.y - 60 - 10;
                        aabb.width = 50 + 20;
                        aabb.height = 60 + 20;

                        if (aabb.contains(clientEntity.controller.position.x, clientEntity.controller.position.y)) {
                            insideIndex = i;
                            if (Math.floor(SoulPlantManager.sprites[i].getRealFrame()) < 10) {
                                SoulPlantManager.sprites[i].stepAnimation('charging', 0.2, false);
                            } else {
                                SoulPlantManager.sprites[i].stepAnimation('loop', 0.2, true);
                            }

                            if (!SoulPlantManager.soulSuckSound.isPlaying()) {
                                SoulPlantManager.soulSuckSound.play();
                                SoulPlantManager.soulSuckSound.seek(0);
                            }
                            SoulPlantManager.soulSuckSound.setPannerPosition(position.x * AudioManager.SCALE, position.y * AudioManager.SCALE, 0);
                            SoulPlantManager.soulSuckSound.setVolume(Math.min(SoulPlantManager.soulSuckSound.getVolume() + 0.1, 1));

                            playingSoulSuck = true;

                            // deposit souls now
                            SoulPlantManager.soulDepositDelay -= 1;
                            if (SoulPlantManager.soulDepositDelay === 0) {
                                SoulPlantManager.soulDepositDelay = 60;

                                if (clientEntity instanceof MoonEntity) {
                                    if (SoulPlantManager.holdingCountMoon > 0) {
                                        SoulPlantManager.holdingCountMoon--;
                                        SoulPlantManager.soulCountMoon++;
                                        SoulPlantManager.timeInFrontOfPlant = -60;

                                        SoulPlantManager.lightExplosionSprite.visible = true;
                                        SoulPlantManager.lightExplosionSprite.position.x = position.x;
                                        SoulPlantManager.lightExplosionSprite.position.y = position.y + 10;
                                        SoulPlantManager.lightExplosionSprite.gotoAnimation(null, 0);

                                        Camera.shake();
                                        SoulPlantManager.playSoulExplosion(position.x, position.y);
                                    }
                                } else if (clientEntity instanceof StickySlimeEntity) {
                                    if (SoulPlantManager.holdingCountSlime > 0) {
                                        SoulPlantManager.holdingCountSlime--;
                                        SoulPlantManager.soulCountSlime++;
                                        SoulPlantManager.timeInFrontOfPlant = -60;

                                        SoulPlantManager.lightExplosionSprite.visible = true;
                                        SoulPlantManager.lightExplosionSprite.position.x = position.x;
                                        SoulPlantManager.lightExplosionSprite.position.y = position.y + 10;
                                        SoulPlantManager.lightExplosionSprite.gotoAnimation(null, 0);

                                        Camera.shake();
                                        SoulPlantManager.playSoulExplosion(position.x, position.y);
                                    }
                                } else if (clientEntity instanceof WormEntity) {
                                    if (SoulPlantManager.holdingCountWorm > 0) {
                                        SoulPlantManager.holdingCountWorm--;
                                        SoulPlantManager.soulCountWorm++;
                                        SoulPlantManager.timeInFrontOfPlant = -60;

                                        SoulPlantManager.lightExplosionSprite.visible = true;
                                        SoulPlantManager.lightExplosionSprite.position.x = position.x;
                                        SoulPlantManager.lightExplosionSprite.position.y = position.y + 10;
                                        SoulPlantManager.lightExplosionSprite.gotoAnimation(null, 0);

                                        Camera.shake();
                                        SoulPlantManager.playSoulExplosion(position.x, position.y);
                                    }
                                } else if (clientEntity instanceof BirdEntity) {
                                    if (SoulPlantManager.holdingCountBird > 0) {
                                        SoulPlantManager.holdingCountBird--;
                                        SoulPlantManager.soulCountBird++;
                                        SoulPlantManager.timeInFrontOfPlant = -60;

                                        SoulPlantManager.lightExplosionSprite.visible = true;
                                        SoulPlantManager.lightExplosionSprite.position.x = position.x;
                                        SoulPlantManager.lightExplosionSprite.position.y = position.y + 10;
                                        SoulPlantManager.lightExplosionSprite.gotoAnimation(null, 0);

                                        Camera.shake();
                                        SoulPlantManager.playSoulExplosion(position.x, position.y);
                                    }
                                } else if (clientEntity instanceof BossEntity) {
                                    if (SoulPlantManager.holdingCountBoss > 0) {
                                        SoulPlantManager.holdingCountBoss--;
                                        SoulPlantManager.soulCountBoss++;
                                        SoulPlantManager.timeInFrontOfPlant = -60;

                                        SoulPlantManager.lightExplosionSprite.visible = true;
                                        SoulPlantManager.lightExplosionSprite.position.x = position.x;
                                        SoulPlantManager.lightExplosionSprite.position.y = position.y + 10;
                                        SoulPlantManager.lightExplosionSprite.gotoAnimation(null, 0);

                                        Camera.shake();
                                        SoulPlantManager.playSoulExplosion(position.x, position.y);
                                    }
                                }
                            }

                            found = true;
                            break;
                        }
                    }

                    if (!found) {
                        SoulPlantManager.soulDepositDelay = 60;
                    }
                }
            } else {
                playingSoulSuck = false;
            }
        } else {
            SoulPlantManager.collectionContainer.visible = false;
        }

        if (!playingSoulSuck) {
            SoulPlantManager.timeInFrontOfPlant = Math.min(SoulPlantManager.timeInFrontOfPlant, 0);
            if (SoulPlantManager.soulSuckSound.getVolume() > 0) {
                SoulPlantManager.soulSuckSound.setVolume(Math.max(SoulPlantManager.soulSuckSound.getVolume() - 0.05, 0));
            } else {
                if (SoulPlantManager.soulSuckSound.isPlaying()) {
                    SoulPlantManager.soulSuckSound.stop();
                }
            }
        } else {
            SoulPlantManager.timeInFrontOfPlant++;
        }

        if (SoulPlantManager.timeInFrontOfPlant > 120) {
            let hasSouls = false;
            hasSouls = hasSouls || SoulPlantManager.holdingCountMoon > 0;
            hasSouls = hasSouls || SoulPlantManager.holdingCountSlime > 0;
            hasSouls = hasSouls || SoulPlantManager.holdingCountWorm > 0;
            hasSouls = hasSouls || SoulPlantManager.holdingCountBird > 0;
            hasSouls = hasSouls || SoulPlantManager.holdingCountBoss > 0;
            if (hasSouls) {
                SoulPlantManager.showingExplanationText = 180;
            }
        }

        if (SoulPlantManager.showingExplanationText > 0) {
            SoulPlantManager.showingExplanationText--;

            SoulPlantManager.explanationText.visible = true;
        } else {
            SoulPlantManager.explanationText.visible = false;
        }
        
        if (GameState.roundStarted() && !GameState.paused) {
            for (let i = 0; i < SoulPlantManager.sprites.length; i++) {
                if (i === insideIndex) {
                    continue;
                }

                const sprite = SoulPlantManager.sprites[i];
                const frame = Math.floor(sprite.getRealFrame());

                if (frame === 0) {
                    continue;
                } else if (frame < 10) {
                    sprite.stepAnimation('charging', 0.2, false);
                } else if (frame === 10) {
                    sprite.stepAnimation('die', 0.2, false);
                } else if (frame < 13) {
                    sprite.stepAnimation('loop', 0.2, false);
                } else if (frame < 23) {
                    sprite.stepAnimation('die', 0.2, false);
                } else if (frame === 23) {
                    sprite.gotoAnimation('charging', 0);
                }
            }
        }

        if (SoulPlantManager.lightExplosionSprite.visible) {
            SoulPlantManager.lightExplosionSprite.stepAnimation(null, 0.4);

            if (Math.floor(SoulPlantManager.lightExplosionSprite.getFrame()) === 7) {
                SoulPlantManager.lightExplosionSprite.visible = false;
            }
        }

        if (SoulPlantManager.smokeExplosionSprite.visible) {
            SoulPlantManager.smokeExplosionSprite.stepAnimation(null, 0.3);

            if (Math.floor(SoulPlantManager.smokeExplosionSprite.getFrame()) === 11) {
                SoulPlantManager.smokeExplosionSprite.visible = false;
            }
        }

        // suck up souls I guess if they've been standing near it for like 2 seconds
        SoulPlantManager.girlCollectionText.text = SoulPlantManager.soulCountMoon + ' / ' + GameState.getRequiredMoonSouls();
        SoulPlantManager.slimeCollectionText.text = SoulPlantManager.soulCountSlime + ' / ' + GameState.getRequiredSlimeSouls();
        SoulPlantManager.wormCollectionText.text = SoulPlantManager.soulCountWorm + ' / ' + GameState.getRequiredWormSouls();
        SoulPlantManager.birdCollectionText.text = SoulPlantManager.soulCountBird + ' / ' + GameState.getRequiredBirdSouls();
        SoulPlantManager.bossCollectionText.text = SoulPlantManager.soulCountBoss + ' / ' + GameState.getRequiredBossSouls();

        SoulPlantManager.girlHoldingText.text = 'Holding ' + SoulPlantManager.holdingCountMoon;
        SoulPlantManager.slimeHoldingText.text = 'Holding ' + SoulPlantManager.holdingCountSlime;
        SoulPlantManager.wormHoldingText.text = 'Holding ' + SoulPlantManager.holdingCountWorm;
        SoulPlantManager.birdHoldingText.text = 'Holding ' + SoulPlantManager.holdingCountBird;
        SoulPlantManager.bossHoldingText.text = 'Holding ' + SoulPlantManager.holdingCountBoss;

        for (let i = 0; i < SoulPlantManager.floatingSouls.length; i++) {
            if (SoulPlantManager.floatingSouls[i].shouldDestroy()) {
                SoulPlantManager.floatingSouls[i].destroy();
                SoulPlantManager.floatingSouls.splice(i, 1);
                i--;

                continue;
            }

            SoulPlantManager.floatingSouls[i].update();
        }
    }

    static playSoulExplosion(x, y) {
        const audio = SoulPlantManager.soulExplosionSounds[SoulPlantManager.soulExplosionSoundIndex];
        SoulPlantManager.soulExplosionSoundIndex = (SoulPlantManager.soulExplosionSoundIndex + 1) % SoulPlantManager.soulExplosionSounds.length;

        audio.setPannerPosition(x * AudioManager.SCALE, y * AudioManager.SCALE, 0);
        audio.play();
        audio.seek(0);
    }

    static receiveSoul(position, EntityClass) {
        if (window.location.protocol.startsWith('file') && TwitchPackets._username === 'kujukuju') {
            // will spawn a soul that move towards you
            const soul = new FloatingSoul(position, EntityClass);
            SoulPlantManager.floatingSouls.push(soul);

            Renderer.foreground.addChild(soul);
        }
    }

    static completedRound() {
        const requiredMoonSouls = GameState.getRequiredMoonSouls();
        const requiredSlimeSouls = GameState.getRequiredSlimeSouls();
        const requiredWormSouls = GameState.getRequiredWormSouls();
        const requiredBirdSouls = GameState.getRequiredBirdSouls();
        const requiredBossSouls = GameState.getRequiredBossSouls();

        let completed = true;
        completed = completed && SoulPlantManager.soulCountMoon >= requiredMoonSouls;
        completed = completed && SoulPlantManager.soulCountSlime >= requiredSlimeSouls;
        completed = completed && SoulPlantManager.soulCountWorm >= requiredWormSouls;
        completed = completed && SoulPlantManager.soulCountBird >= requiredBirdSouls;
        completed = completed && SoulPlantManager.soulCountBoss >= requiredBossSouls;

        return completed;
    }

    static resetSouls() {
        SoulPlantManager.holdingCountMoon = 0;
        SoulPlantManager.holdingCountSlime = 0;
        SoulPlantManager.holdingCountWorm = 0;
        SoulPlantManager.holdingCountBird = 0;
        SoulPlantManager.holdingCountBoss = 0;
        SoulPlantManager.soulCountMoon = 0;
        SoulPlantManager.soulCountSlime = 0;
        SoulPlantManager.soulCountWorm = 0;
        SoulPlantManager.soulCountBird = 0;
        SoulPlantManager.soulCountBoss = 0;
        SoulPlantManager.soulDepositDelay = 60;
    }

    static convertMoon(EntityClass) {
        const moonEntity = EntityInformation.getMoonEntity();
        if (!moonEntity) {
            return;
        }

        if (moonEntity.constructor.name === EntityClass.name) {
            return;
        }
        
        const existingHistory = moonEntity.history;
        const existingAccurateHistory = moonEntity.accurateHistory;

        moonEntity.destroy();
        const newEntity = new EntityClass('kujukuju');
        if (existingHistory) {
            newEntity.existingHistory = existingHistory;
        }
        if (existingAccurateHistory) {
            newEntity.existingAccurateHistory = existingAccurateHistory;
        }
        newEntity.controller.position.copy(moonEntity.controller.position);
        EntityInformation.addEntity('kujukuju', newEntity);

        SoulPlantManager.smokeExplosionSprite.visible = true;
        SoulPlantManager.smokeExplosionSprite.position.x = moonEntity.controller.position.x;
        SoulPlantManager.smokeExplosionSprite.position.y = moonEntity.controller.position.y;
        SoulPlantManager.smokeExplosionSprite.gotoAnimation(null, 0);

        Camera.shake();
        SoulPlantManager.changeFormSound.setPannerPosition(moonEntity.controller.position.x * AudioManager.SCALE, moonEntity.controller.position.y * AudioManager.SCALE, 0);
        SoulPlantManager.changeFormSound.play();
        SoulPlantManager.changeFormSound.seek(0);
    }
}
