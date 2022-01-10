class Logic {
    static update() {
        InterfaceManager.resetAbilityCooldowns();

        EntityInformation.cullEntities();
        if (GameState.roundStarted() && !GameState.paused) {
            EntityInformation.update();
        }

        const clientEntity = EntityInformation.getClientEntity();
        if (clientEntity) {
            Camera.setPosition(clientEntity.controller.position);
            if (clientEntity instanceof BossEntity) {
                Camera.setScale(new Vec2(2.5, 2.5));
            } else {
                Camera.setScale(new Vec2(3, 3));
            }
        }

        Camera.update();
        Environment.update();

        AudioManager.update();

        GameState.update();

        DeadBodyManager.update();

        SoulPlantManager.update();

        InterfaceManager.update();

        OneLinerManager.update();

        IntroLoreManager.update();

        if (clientEntity) {
            clientEntity.sendPackets();
        }

        MoonPackets.sendPackets();
    }
}