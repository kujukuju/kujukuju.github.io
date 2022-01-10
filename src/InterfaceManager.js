class InterfaceManager {
    static website = new PIXI.Text('kujukuju.github.io', {fontFamily: 'Alagard', fontSize: 32, align: 'center', fill: 0xffffff});

    static playerText = new PIXI.Text('Players', {fontFamily: 'Alagard', fontSize: 24, align: 'center', fill: 0xffffff});
    static playerCount = new PIXI.Text('0 / 0', {fontFamily: 'Alagard', fontSize: 24, align: 'center', fill: 0xffffff});

    static abilityCooldowns = [];

    static initialize() {
        InterfaceManager.website.anchor.x = 0.5;
        InterfaceManager.website.position.x = window.innerWidth / 2;
        InterfaceManager.website.position.y = 20;

        // TODO TODO TODO TODO
        InterfaceManager.website.visible = false;

        Renderer.fixed.addChild(InterfaceManager.website);

        InterfaceManager.hearts = new Hearts();
        InterfaceManager.hearts.scale.x = 3;
        InterfaceManager.hearts.scale.y = 3;
        InterfaceManager.hearts.position.y = 110;
        InterfaceManager.hearts.alwaysShow = true;
        Renderer.fixed.addChild(InterfaceManager.hearts);

        InterfaceManager.playerText.position.x = 20;
        InterfaceManager.playerText.position.y = 10;
        Renderer.fixed.addChild(InterfaceManager.playerText);
        InterfaceManager.playerCount.position.x = 20;
        InterfaceManager.playerCount.position.y = 40;
        Renderer.fixed.addChild(InterfaceManager.playerCount);
    }

    static update() {
        InterfaceManager.website.position.x = window.innerWidth / 2;
        InterfaceManager.hearts.position.x = Math.round(window.innerWidth / 2);

        const clientEntity = EntityInformation.getClientEntity();
        InterfaceManager.hearts.update(clientEntity);

        const entityCount = EntityInformation.getPlebEntities().length;
        const requiredEntityCount = GameState.getRequiredEntityCount();
        InterfaceManager.playerCount.text = entityCount + ' / ' + requiredEntityCount;
    }

    static resetAbilityCooldowns() {
        for (let i = 0; i < InterfaceManager.abilityCooldowns.length; i++) {
            InterfaceManager.abilityCooldowns[i][0].visible = false;
            InterfaceManager.abilityCooldowns[i][1].visible = false;
        }
    }

    static setAbilityCooldown(index, percent) {
        if (!InterfaceManager.abilityCooldowns[index]) {
            InterfaceManager.abilityCooldowns[index] = [new PIXI.Sprite(PIXI.Texture.WHITE), new PIXI.Sprite(PIXI.Texture.WHITE)];
            Renderer.fixed.addChild(InterfaceManager.abilityCooldowns[index][0]);
            Renderer.fixed.addChild(InterfaceManager.abilityCooldowns[index][1]);

            InterfaceManager.abilityCooldowns[index][0].position.x = -120 + window.innerWidth / 2;
            InterfaceManager.abilityCooldowns[index][0].position.y = 124 + index * 12;
            InterfaceManager.abilityCooldowns[index][0].width = 240;
            InterfaceManager.abilityCooldowns[index][0].height = 8;
            InterfaceManager.abilityCooldowns[index][0].tint = 0x301c1c;

            InterfaceManager.abilityCooldowns[index][1].position.x = InterfaceManager.abilityCooldowns[index][0].position.x;
            InterfaceManager.abilityCooldowns[index][1].position.y = InterfaceManager.abilityCooldowns[index][0].position.y;
            InterfaceManager.abilityCooldowns[index][1].width = InterfaceManager.abilityCooldowns[index][0].width * percent;
            InterfaceManager.abilityCooldowns[index][1].height = InterfaceManager.abilityCooldowns[index][0].height;
            InterfaceManager.abilityCooldowns[index][1].tint = 0xffffff;
        }

        InterfaceManager.abilityCooldowns[index][0].visible = true;
        InterfaceManager.abilityCooldowns[index][1].visible = true;
        InterfaceManager.abilityCooldowns[index][0].position.x = Math.round(-120 + window.innerWidth / 2);
        InterfaceManager.abilityCooldowns[index][1].position.x = InterfaceManager.abilityCooldowns[index][0].position.x;
        InterfaceManager.abilityCooldowns[index][1].width = Math.round(InterfaceManager.abilityCooldowns[index][0].width * percent);
    }
}