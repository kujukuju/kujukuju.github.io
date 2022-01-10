class OneLinerManager {
    static text;

    static previousEntityType;

    static remainingTicks = 0;

    static seenTypes = {};

    static initialize() {
        OneLinerManager.text = new PIXI.Text('', {fontFamily: 'Alagard', fontSize: 32, align: 'center', fill: 0xffffff});
        OneLinerManager.text.anchor.x = 0.5;
        OneLinerManager.text.anchor.y = 0;
        OneLinerManager.text.position.y = 200;
        Renderer.fixed.addChild(OneLinerManager.text);
    }

    static update() {
        let currentEntityType = null;
        if (EntityInformation.getClientEntity()) {
            currentEntityType = EntityInformation.getClientEntity().constructor.name;
        }
        
        OneLinerManager.text.position.x = window.innerWidth / 2;

        if (GameState.roundStarted()) {
            if (currentEntityType !== this.previousEntityType) {
                this.previousEntityType = currentEntityType;

                if (currentEntityType && !OneLinerManager.seenTypes[currentEntityType]) {
                    OneLinerManager.remainingTicks = 720;

                    OneLinerManager.seenTypes[currentEntityType] = true;

                    switch (currentEntityType) {
                        case 'MoonEntity': {
                            OneLinerManager.text.text = 'You\'re alive.\n\nCollect your souls and offer them to the soul plants.';
                        } break;

                        case 'StickySlimeEntity': {
                            OneLinerManager.text.text = 'Stick onto enemies to damage them!\n\nAny sudden movements will knock you off.\n\nHold down the mouse button to jump.';
                        } break;

                        case 'WormEntity': {
                            OneLinerManager.text.text = 'Stay in the walls!\n\nGravity affects you in the open!\n\nHold down the mouse button to go fast.';
                        } break;

                        case 'BirdEntity': {
                            OneLinerManager.text.text = 'Hold down the mouse button to kirby slam the ground!';
                        } break;

                        case 'BossEntity': {
                            OneLinerManager.text.text = 'Stay in the walls!\n\nHold down the mouse button to go fast.';
                        } break;

                        default:
                            OneLinerManager.text.text = '';
                            console.error('Found unknown entity. ', currentEntityType);
                    }
                }
            }
        }

        OneLinerManager.remainingTicks = Math.max(OneLinerManager.remainingTicks - 1, 0);
        const opacity = Math.min(Math.max(OneLinerManager.remainingTicks / 20, 0), 1);
        if (opacity > 0) {
            OneLinerManager.text.visible = true;
            OneLinerManager.text.alpha = opacity;
        } else {
            OneLinerManager.text.visible = false;
        }
    }
}