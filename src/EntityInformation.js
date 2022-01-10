class EntityInformation {
    static entities = {};
    static clientEntityName = null;
    static lastActiveTimes = {};

    static tempDead = {};

    static update() {
        const now = Date.now();
        for (const name in EntityInformation.entities) {
            EntityInformation.entities[name].update();
        }

        for (const name in EntityInformation.tempDead) {
            if (now - EntityInformation.tempDead[name] > 4000) {
                delete EntityInformation.tempDead[name];
            }
        }
    }

    static cullEntities() {
        const now = Date.now();
        for (const name in EntityInformation.entities) {
            if (EntityInformation.clientEntityName === name) {
                continue;
            }
            if (name === 'kujukuju') {
                continue;
            }
            
            if (now - EntityInformation.lastActiveTimes[name] > 8000) {
                EntityInformation.entities[name].destroy();
                delete EntityInformation.lastActiveTimes[name];
                delete EntityInformation.tempDead[name];
                delete GameState.approvedEntities[name];
                delete GameState.approvedEntityRequestedTypes[name];
            }
        }
    }

    static canCreateEntity(name) {
        return !EntityInformation.tempDead[name];
    }

    static addDeadEntity(name) {
        EntityInformation.tempDead[name] = Date.now();
    }

    static getMoonEntity() {
        return EntityInformation.entities['kujukuju'];
    }

    static getEntityFromHash(hash) {
        for (const name in EntityInformation.entities) {
            const nameHash = Hash.integerHash(name);
            if (hash === nameHash) {
                return EntityInformation.entities[name];
            }
        }

        return null;
    }

    static getPlebEntities() {
        const entities = [];
        for (const name in EntityInformation.entities) {
            if (EntityInformation.entities[name].__name === 'kujukuju') {
                continue;
            }

            entities.push(EntityInformation.entities[name]);
        }

        return entities;
    }

    static getClientEntity() {
        return EntityInformation.entities[EntityInformation.clientEntityName];
    }

    static setClientEntityName(name) {
        EntityInformation.clientEntityName = name;
    }

    static addEntity(name, entity) {
        EntityInformation.lastActiveTimes[name] = Date.now();
        entity.__name = name;
        EntityInformation.entities[name] = entity;
    }
    
    static silentRemoveEntity(entity) {
        delete EntityInformation.entities[entity.__name];
    }
}