// game.js - Main game state and logic

const Game = {
    // Game state
    state: {
        materials: {
            ironOre: 0,
            wood: 0,
            stone: 0
        },
        refinedMaterials: {
            ironIngot: 0,
            plank: 0,
            brick: 0
        },
        currency: 0,
        guildmates: 0,
        maxGuildmates: 5,
        startTime: Date.now(),
        playTime: 0
    },

    // Initialize the game
    init() {
        this.loadGame();
        this.setupTimerCallbacks();
        UI.init();
        this.startAutoSave();
        UI.addLogEntry('Game loaded! Start gathering materials to begin your airship journey.');
    },

    // Setup timer callback mappings for save/load
    setupTimerCallbacks() {
        this.timerCallbacks = {
            // Gathering callbacks
            'gather-ironOre': (id) => this.completeGathering('ironOre'),
            'gather-wood': (id) => this.completeGathering('wood'),
            'gather-stone': (id) => this.completeGathering('stone'),
            
            // Refining callbacks
            'refine-ironIngot': (id) => this.completeRefining('ironIngot'),
            'refine-plank': (id) => this.completeRefining('plank'),
            'refine-brick': (id) => this.completeRefining('brick'),
            
            // Combat callbacks
            'combat-basic': (id) => this.completeCombat('basic'),
            'combat-advanced': (id) => this.completeCombat('advanced')
        };
    },

    // Gathering actions
    gatherMaterial(materialKey) {
        const material = GAME_CONFIG.materials[materialKey];
        const currentAmount = this.state.materials[materialKey] || 0;
        
        if (currentAmount >= material.storageLimit) {
            UI.addLogEntry(`Cannot gather ${material.name} - storage full!`);
            return false;
        }

        const timerId = `gather-${materialKey}`;
        const timer = timerManager.createTimer(
            timerId,
            material.gatherTime,
            this.timerCallbacks[timerId],
            (remaining, id) => UI.updateTimerDisplay(id, remaining)
        );

        if (timer.start()) {
            UI.setButtonState(materialKey + '-button', 'active', 'Gathering...');
            return true;
        }
        return false;
    },

    completeGathering(materialKey) {
        const material = GAME_CONFIG.materials[materialKey];
        const currentAmount = this.state.materials[materialKey] || 0;
        
        this.state.materials[materialKey] = Math.min(currentAmount + 1, material.storageLimit);
        UI.updateResourceDisplay();
        UI.addLogEntry(`Gathered 1 ${material.name}`);
        UI.setButtonState(materialKey + '-button', 'ready', `Gather ${material.name}`);
    },

    // Refining actions
    refineMaterial(refinedKey) {
        const refined = GAME_CONFIG.refinedMaterials[refinedKey];
        const currentAmount = this.state.refinedMaterials[refinedKey] || 0;
        
        if (currentAmount >= refined.storageLimit) {
            UI.addLogEntry(`Cannot refine ${refined.name} - storage full!`);
            return false;
        }

        // Check if we have enough materials
        for (const [materialKey, amount] of Object.entries(refined.cost)) {
            if ((this.state.materials[materialKey] || 0) < amount) {
                UI.addLogEntry(`Not enough materials to refine ${refined.name}`);
                return false;
            }
        }

        // Consume materials
        for (const [materialKey, amount] of Object.entries(refined.cost)) {
            this.state.materials[materialKey] -= amount;
        }

        const timerId = `refine-${refinedKey}`;
        const timer = timerManager.createTimer(
            timerId,
            refined.refineTime,
            this.timerCallbacks[timerId],
            (remaining, id) => UI.updateTimerDisplay(id, remaining)
        );

        if (timer.start()) {
            const costText = Object.entries(refined.cost)
                .map(([material, amount]) => `${amount} ${GAME_CONFIG.materials[material]?.name || material}`)
                .join(', ');
            UI.setButtonState(refinedKey + '-button', 'active', 'Refining...');
            UI.updateResourceDisplay();
            return true;
        }
        return false;
    },

    completeRefining(refinedKey) {
        const refined = GAME_CONFIG.refinedMaterials[refinedKey];
        const currentAmount = this.state.refinedMaterials[refinedKey] || 0;
        
        this.state.refinedMaterials[refinedKey] = Math.min(currentAmount + 1, refined.storageLimit);
        UI.updateResourceDisplay();
        UI.addLogEntry(`Refined 1 ${refined.name}`);
        
        const costText = Object.entries(refined.cost)
            .map(([material, amount]) => `${amount} ${GAME_CONFIG.materials[material]?.name || material}`)
            .join(', ');
        UI.setButtonState(refinedKey + '-button', 'ready', `Refine ${refined.name} (${costText})`);
    },

    // Combat actions
    doCombat(combatKey) {
        const combat = GAME_CONFIG.combat[combatKey];
        
        if (!combat.unlocked) {
            UI.addLogEntry(`${combat.name} is not yet unlocked`);
            return false;
        }

        const timerId = `combat-${combatKey}`;
        const timer = timerManager.createTimer(
            timerId,
            combat.time,
            this.timerCallbacks[timerId],
            (remaining, id) => UI.updateTimerDisplay(id, remaining)
        );

        if (timer.start()) {
            UI.setButtonState(combatKey + '-button', 'active', 'Fighting...');
            return true;
        }
        return false;
    },

    completeCombat(combatKey) {
        const combat = GAME_CONFIG.combat[combatKey];
        
        this.state.currency += combat.reward;
        UI.updateResourceDisplay();
        UI.addLogEntry(`Completed ${combat.name} - earned ${combat.reward} coins`);
        UI.setButtonState(combatKey + '-button', 'ready', `${combat.name} (+${combat.reward} coins)`);
    },

    // Guild management
    recruitGuildmate() {
        if (this.state.currency < GAME_CONFIG.guild.recruitCost) {
            UI.addLogEntry('Not enough currency to recruit guildmate');
            return false;
        }

        if (this.state.guildmates >= this.state.maxGuildmates) {
            UI.addLogEntry('Guild is at maximum capacity');
            return false;
        }

        this.state.currency -= GAME_CONFIG.guild.recruitCost;
        this.state.guildmates += 1;
        UI.updateResourceDisplay();
        UI.addLogEntry('Recruited a new guildmate!');
        return true;
    },

    // Utility methods
    hasResources(costs) {
        for (const [resource, amount] of Object.entries(costs)) {
            const available = this.state.materials[resource] || this.state.refinedMaterials[resource] || 0;
            if (available < amount) {
                return false;
            }
        }
        return true;
    },

    consumeResources(costs) {
        for (const [resource, amount] of Object.entries(costs)) {
            if (this.state.materials[resource] !== undefined) {
                this.state.materials[resource] -= amount;
            } else if (this.state.refinedMaterials[resource] !== undefined) {
                this.state.refinedMaterials[resource] -= amount;
            }
        }
    },

    // Save/Load functionality
    saveGame() {
        const saveData = {
            state: this.state,
            timers: timerManager.serialize(),
            timestamp: Date.now()
        };
        Storage.save(saveData);
    },

    loadGame() {
        const saveData = Storage.load();
        if (saveData) {
            this.state = { ...this.state, ...saveData.state };
            
            // Calculate offline time
            const offlineTime = Date.now() - (saveData.timestamp || Date.now());
            if (offlineTime > 5000) { // Only show if offline for more than 5 seconds
                UI.addLogEntry(`Welcome back! You were offline for ${Math.floor(offlineTime / 1000)} seconds.`);
            }
            
            // Restore timers
            if (saveData.timers) {
                timerManager.deserialize(
                    saveData.timers, 
                    this.timerCallbacks,
                    (remaining, id) => UI.updateTimerDisplay(id, remaining)
                );
            }
        }
    },

    startAutoSave() {
        setInterval(() => {
            this.saveGame();
        }, GAME_CONFIG.settings.autoSaveInterval);

        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveGame();
        });
    },

    // Reset game
    resetGame() {
        if (confirm('Are you sure you want to reset your progress? This cannot be undone!')) {
            Storage.clear();
            timerManager.clearAll();
            location.reload();
        }
    }
};

// Initialize game when page loads
window.addEventListener('load', () => {
    Game.init();
});