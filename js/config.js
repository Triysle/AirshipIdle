// config.js - Game configuration and data

const GAME_CONFIG = {
    // Raw materials that can be gathered
    materials: {
        ironOre: { 
            name: 'Iron Ore', 
            gatherTime: 3000, 
            storageLimit: 50,
            tier: 'basic'
        },
        wood: { 
            name: 'Wood', 
            gatherTime: 2500, 
            storageLimit: 50,
            tier: 'basic'
        },
        stone: { 
            name: 'Stone', 
            gatherTime: 3500, 
            storageLimit: 50,
            tier: 'basic'
        }
    },

    // Refined materials created from raw materials
    refinedMaterials: {
        ironIngot: { 
            name: 'Iron Ingot', 
            refineTime: 5000, 
            cost: { ironOre: 2 }, 
            storageLimit: 25,
            tier: 'basic'
        },
        plank: { 
            name: 'Plank', 
            refineTime: 4000, 
            cost: { wood: 2 }, 
            storageLimit: 25,
            tier: 'basic'
        },
        brick: { 
            name: 'Brick', 
            refineTime: 6000, 
            cost: { stone: 3 }, 
            storageLimit: 20,
            tier: 'basic'
        }
    },

    // Combat activities that generate currency
    combat: {
        basic: { 
            name: 'Patrol Woods', 
            time: 4000, 
            reward: 5,
            tier: 'basic',
            unlocked: true
        },
        advanced: { 
            name: 'Clear Bandits', 
            time: 8000, 
            reward: 12,
            tier: 'advanced',
            unlocked: false
        }
    },

    // Guild management settings
    guild: {
        recruitCost: 10,
        baseMaxGuildmates: 5,
        maxGuildmatesPerUpgrade: 3
    },

    // Upgrade system (to be implemented)
    upgrades: {
        guildHall: {
            name: 'Guild Hall Expansion',
            cost: { currency: 50, plank: 10, brick: 5 },
            effect: 'Increases guild capacity by 3',
            unlocked: false
        }
    },

    // Airship components (victory conditions)
    airshipComponents: {
        hull: {
            name: 'Airship Hull',
            cost: { ironIngot: 20, plank: 15 },
            completed: false
        },
        engine: {
            name: 'Airship Engine',
            cost: { ironIngot: 15, brick: 10 },
            completed: false
        },
        balloon: {
            name: 'Airship Balloon',
            cost: { plank: 25, ironIngot: 10 },
            completed: false
        }
    },

    // Game settings
    settings: {
        autoSaveInterval: 30000, // 30 seconds
        maxLogEntries: 100
    }
};