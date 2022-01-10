class AudioManager {
    static INTRO_MUSIC = new NSWA.Source('assets/epic-travel.mp3', {loop: true, volume: 0.5});
    static CREDIT_MUSIC = new NSWA.Source('assets/introvert.mp3', {loop: true, volume: 0.5});

    static normalIndex = 0;
    static NORMAL_MUSIC = [
        new NSWA.Source('assets/zapsplat1.mp3', {loop: false, volume: 0.35}),
        new NSWA.Source('assets/zapsplat2.mp3', {loop: false, volume: 0.35}),
    ];

    static bossIndex = 0;
    static BOSS_MUSIC = [
        new NSWA.Source('assets/dragon-slayer.mp3', {loop: false, volume: 0.5}),
        new NSWA.Source('assets/endless-storm.mp3', {loop: false, volume: 0.5}),
        new NSWA.Source('assets/executioner.mp3', {loop: false, volume: 0.5}),
    ];

    static HIT_AUDIO = new NSWA.Source('assets/hit.mp3', {loop: false, volume: 0.5});
    static hitNoises = [];
    static hitIndex = 0;

    static requestedMusic = null;
    static currentAudio = null;

    static SCALE = 0.02;

    static position = new Vec2(0, 0);

    // static introMusic;
    // static fadingOutIntroMusic = false;

    static initialize() {
        NSWA.setListenerOrientation(0, 0, 1, 0, -1, 0);
        NSWA.setVolume(1);

        for (let i = 0; i < 10; i++) {
            AudioManager.hitNoises.push(AudioManager.HIT_AUDIO.create());
            AudioManager.hitNoises[i].setPannerOrientation(0, 0, -1);
        }

        setTimeout(() => {
            AudioManager.playIntroMusic();
        }, 1000);
    }

    static update() {
        AudioManager.position.x = Camera.aabb.x + Camera.aabb.width / 2;
        AudioManager.position.y = Camera.aabb.y + Camera.aabb.height / 2;
        NSWA.setListenerPosition(AudioManager.position.x * AudioManager.SCALE, AudioManager.position.y * AudioManager.SCALE, 10); // maybe z should be back a little bit? like 20

        // if (AudioManager.fadingOutIntroMusic) {
        //     const newVolume = Math.max(AudioManager.introMusic.getVolume() - 0.02, 0);
        //     if (newVolume > 0) {
        //         AudioManager.introMusic.setVolume(newVolume);
        //     } else {
        //         AudioManager.introMusic.stop();
        //         AudioManager.introMusic.destroy();
        //     }
        // }

        for (let i = 0; i < AudioManager.hitNoises.length; i++) {
            const noise = AudioManager.hitNoises[i];
            if (noise.isPlaying()) {
                if (noise.getCurrentTime() >= AudioManager.HIT_AUDIO.getDuration()) {
                    noise.stop();
                }
            }
        }

        if (AudioManager.currentAudio && AudioManager.currentAudio._source && AudioManager.currentAudio.getCurrentTime() >= AudioManager.currentAudio._source.getDuration()) {
            if (AudioManager.NORMAL_MUSIC.includes(AudioManager.currentAudio._source)) {
                AudioManager.normalIndex = (AudioManager.normalIndex + 1) % AudioManager.NORMAL_MUSIC.length;
            }
            if (AudioManager.BOSS_MUSIC.includes(AudioManager.currentAudio._source)) {
                AudioManager.bossIndex = (AudioManager.bossIndex + 1) % AudioManager.BOSS_MUSIC.length;
            }
        }

        const requestedAudio = AudioManager.getRequestedAudio();
        if (requestedAudio !== (AudioManager.currentAudio ? AudioManager.currentAudio._source : AudioManager.currentAudio)) {
            if (!AudioManager.currentAudio) {
                if (requestedAudio) {
                    AudioManager.currentAudio = requestedAudio.create();
                    AudioManager.currentAudio.play();
                } else {
                    AudioManager.currentAudio = null;
                }
            } else {
                if (AudioManager.currentAudio.getCurrentTime() < AudioManager.currentAudio._source.getDuration()) {
                    const newVolume = Math.max(AudioManager.currentAudio.getVolume() - 0.02, 0);
                    if (newVolume === 0) {
                        AudioManager.currentAudio.stop();
                        if (requestedAudio) {
                            AudioManager.currentAudio = requestedAudio.create();
                            AudioManager.currentAudio.play();
                        } else {
                            AudioManager.currentAudio = null;
                        }
                    } else {
                        AudioManager.currentAudio.setVolume(newVolume);
                    }
                } else {
                    AudioManager.currentAudio.stop();
                    if (requestedAudio) {
                        AudioManager.currentAudio = requestedAudio.create();
                        AudioManager.currentAudio.play();
                    } else {
                        AudioManager.currentAudio = null;
                    }
                }
            }
        }
    }

    static autoAdjustVolume(instance, isSelf, forceRange) {
        if (GameState.round === 6) {
            instance.setVolume(0);
            instance.stop();
            return;
        }

        const positionX = instance._pannerNode.positionX.value || 0;
        const positionY = instance._pannerNode.positionY.value || 0;

        const dx = AudioManager.position.x - positionX / AudioManager.SCALE;
        const dy = AudioManager.position.y - positionY / AudioManager.SCALE;

        // well just try linear for now I guess
        const d = Math.sqrt(dx * dx + dy * dy);
        const range = forceRange || 650;
        const volume = 1 - Math.min(d / range, 1);

        if (volume === 0 && instance.isPlaying()) {
            instance.__lastTime = instance.getCurrentTime();
            instance.stop();
        }
        if (volume > 0 && !instance.isPlaying()) {
            const startTime = instance.__lastTime || 0;
            instance.play(startTime);
        }

        const mul = isSelf ? 0.5 : 1;

        instance.setVolume(volume * mul);
    }

    static getRequestedAudio() {
        if (AudioManager.requestedMusic === 'intro') {
            return AudioManager.INTRO_MUSIC;
        } else if (AudioManager.requestedMusic === 'normal') {
            return AudioManager.NORMAL_MUSIC[AudioManager.normalIndex];
        } else if (AudioManager.requestedMusic === 'boss') {
            return AudioManager.BOSS_MUSIC[AudioManager.bossIndex];
        } else if (AudioManager.requestedMusic === 'credit') {
            return AudioManager.CREDIT_MUSIC;
        }

        return null;
    }

    static playIntroMusic() {
        AudioManager.requestedMusic = 'intro';
    }

    static playNormalMusic() {
        AudioManager.requestedMusic = 'normal';
    }

    static playBossMusic() {
        AudioManager.requestedMusic = 'boss';
    }

    static playCreditMusic() {
        AudioManager.requestedMusic = 'credit';
    }

    static playHitNoise(x, y) {
        const noise = AudioManager.hitNoises[AudioManager.hitIndex];
        AudioManager.hitIndex = (AudioManager.hitIndex + 1) % AudioManager.hitNoises.length;

        noise.setPannerPosition(x * AudioManager.SCALE, y * AudioManager.SCALE, 0);

        if (!noise.isPlaying()) {
            noise.play();
        }
        noise.seek(0);
    }
}
