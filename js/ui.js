// ui.js - UI updates and interactions

const UI = {
    // Initialize the user interface
    init() {
        this.createGatheringButtons();
        this.createRefiningButtons();
        this.createCombatButtons();
        this.updateResourceDisplay();
        this.updateProgress();
        this.updateUnlockedContent();
        this.updateObjectiveDisplay();
    },

    // Create gathering action buttons
    createGatheringButtons() {
        const container = document.getElementById('gathering-actions');
        container.innerHTML = '';

        Object.keys(GAME_CONFIG.materials).forEach(materialKey => {
            const material = GAME_CONFIG.materials[materialKey];
            const button = document.createElement('button');
            button.className = 'action-button';
            button.id = materialKey + '-button';
            button.textContent = `Gather ${material.name}`;
            button.onclick = () => Game.gatherMaterial(materialKey);
            
            // Hide if not unlocked (but Iron Ore starts unlocked)
            if (!material.unlocked) {
                button.classList.add('hidden');
            }
            
            container.appendChild(button);
        });
    },

    // Create refining action buttons
    createRefiningButtons() {
        const container = document.getElementById('refining-actions');
        container.innerHTML = '';

        Object.keys(GAME_CONFIG.refinedMaterials).forEach(refinedKey => {
            const refined = GAME_CONFIG.refinedMaterials[refinedKey];
            const button = document.createElement('button');
            button.className = 'action-button';
            button.id = refinedKey + '-button';
            
            const costText = Object.entries(refined.cost)
                .map(([material, amount]) => `${amount} ${GAME_CONFIG.materials[material]?.name || material}`)
                .join(', ');
                
            button.textContent = `Refine ${refined.name} (${costText})`;
            button.onclick = () => Game.refineMaterial(refinedKey);
            
            // Hide if not unlocked
            if (!refined.unlocked) {
                button.classList.add('hidden');
            }
            
            container.appendChild(button);
        });
    },

    // Create combat action buttons
    createCombatButtons() {
        const container = document.getElementById('combat-actions');
        container.innerHTML = '';

        Object.keys(GAME_CONFIG.combat).forEach(combatKey => {
            const combat = GAME_CONFIG.combat[combatKey];
            const button = document.createElement('button');
            button.className = 'action-button';
            button.id = combatKey + '-button';
            button.textContent = `${combat.name} (+${combat.reward} coins)`;
            button.onclick = () => Game.doCombat(combatKey);
            
            // Hide if not unlocked
            if (!combat.unlocked) {
                button.classList.add('hidden');
            }
            
            container.appendChild(button);
        });
    },

    // Update resource display
    updateResourceDisplay() {
        const resourcesContainer = document.getElementById('resources-display');
        resourcesContainer.innerHTML = '';

        // Display raw materials
        Object.keys(GAME_CONFIG.materials).forEach(materialKey => {
            const material = GAME_CONFIG.materials[materialKey];
            const amount = Game.state.materials[materialKey] || 0;
            const resourceDiv = this.createResourceElement(material.name, amount, material.storageLimit);
            
            // Hide if not unlocked/discovered
            if (!Game.state.unlockedResources.has(materialKey)) {
                resourceDiv.classList.add('hidden');
            }
            
            resourcesContainer.appendChild(resourceDiv);
        });

        // Display refined materials
        Object.keys(GAME_CONFIG.refinedMaterials).forEach(materialKey => {
            const material = GAME_CONFIG.refinedMaterials[materialKey];
            const amount = Game.state.refinedMaterials[materialKey] || 0;
            const resourceDiv = this.createResourceElement(material.name, amount, material.storageLimit);
            
            // Hide if not unlocked/discovered
            if (!Game.state.unlockedResources.has(materialKey)) {
                resourceDiv.classList.add('hidden');
            }
            
            resourcesContainer.appendChild(resourceDiv);
        });

        // Update currency and guildmates
        document.getElementById('currency-display').textContent = Game.state.currency;
        document.getElementById('guildmates-display').textContent = `${Game.state.guildmates} / ${Game.state.maxGuildmates}`;
        
        // Update recruit button state
        const recruitButton = document.getElementById('recruit-button');
        if (recruitButton) {
            recruitButton.disabled = Game.state.currency < GAME_CONFIG.guild.recruitCost || 
                                   Game.state.guildmates >= Game.state.maxGuildmates;
        }
        
        // Update button affordability
        this.updateButtonStates();
    },

    // Create individual resource display element
    createResourceElement(name, amount, limit) {
        const div = document.createElement('div');
        div.className = 'resource';
        
        // Add visual indicator for full storage
        const isNearFull = amount >= limit * 0.8;
        const isFull = amount >= limit;
        
        if (isFull) {
            div.style.borderColor = '#e74c3c';
        } else if (isNearFull) {
            div.style.borderColor = '#f39c12';
        }
        
        div.innerHTML = `
            <div class="resource-name">${name}</div>
            <div class="resource-amount">${amount}</div>
            <div class="resource-storage">/ ${limit}</div>
        `;
        return div;
    },

    // Update timer displays on buttons
    updateTimerDisplay(timerId, remaining) {
        const buttonId = timerId.replace('gather-', '').replace('refine-', '').replace('combat-', '') + '-button';
        const button = document.getElementById(buttonId);
        
        if (button && remaining > 0) {
            const seconds = Math.ceil(remaining / 1000);
            let timerDisplay = button.querySelector('.timer-display');
            
            if (!timerDisplay) {
                timerDisplay = document.createElement('div');
                timerDisplay.className = 'timer-display';
                button.appendChild(timerDisplay);
            }
            
            timerDisplay.textContent = `${seconds}s remaining`;
            button.disabled = true;
        } else if (button) {
            const timerDisplay = button.querySelector('.timer-display');
            if (timerDisplay) {
                timerDisplay.remove();
            }
        }
    },

    // Set button state (ready, active, disabled)
    setButtonState(buttonId, state, text) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        // Remove existing timer display
        const timerDisplay = button.querySelector('.timer-display');
        if (timerDisplay) {
            timerDisplay.remove();
        }

        switch (state) {
            case 'ready':
                button.disabled = false;
                button.textContent = text;
                break;
            case 'active':
                button.disabled = true;
                button.textContent = text;
                break;
            case 'disabled':
                button.disabled = true;
                button.textContent = text;
                break;
        }
    },

    // Add entry to event log
    addLogEntry(message) {
        const log = document.getElementById('event-log');
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        
        const now = new Date();
        const timestamp = `[${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}]`;
        
        entry.innerHTML = `<span class="log-timestamp">${timestamp}</span> ${message}`;
        log.appendChild(entry);
        
        // Limit log entries to prevent memory issues
        while (log.children.length > GAME_CONFIG.settings.maxLogEntries) {
            log.removeChild(log.firstChild);
        }
        
        log.scrollTop = log.scrollHeight;
    },

    // Update overall progress
    updateProgress() {
        // Calculate progress based on airship components (placeholder for now)
        const totalComponents = Object.keys(GAME_CONFIG.airshipComponents).length;
        const completedComponents = Object.values(GAME_CONFIG.airshipComponents)
            .filter(component => component.completed).length;
        
        const progressPercent = totalComponents > 0 ? (completedComponents / totalComponents) * 100 : 0;
        
        const progressFill = document.getElementById('overall-progress');
        const progressText = document.getElementById('progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${progressPercent}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${Math.round(progressPercent)}% Complete`;
        }
    },

    // Update current objective display
    updateObjectiveDisplay() {
        const objectiveElement = document.getElementById('current-objective');
        if (!objectiveElement) return;
        
        // Find the next incomplete milestone
        const nextMilestone = Object.values(GAME_CONFIG.milestones).find(m => !m.completed);
        
        if (nextMilestone) {
            objectiveElement.textContent = nextMilestone.description;
            objectiveElement.className = 'objective';
        } else {
            objectiveElement.textContent = 'All milestones completed! Ready to build airship components.';
            objectiveElement.className = 'objective completed';
        }
    },

    // Update unlocked content visibility
    updateUnlockedContent() {
        // Update gathering buttons
        Object.keys(GAME_CONFIG.materials).forEach(materialKey => {
            const material = GAME_CONFIG.materials[materialKey];
            const button = document.getElementById(materialKey + '-button');
            if (button) {
                if (material.unlocked) {
                    button.classList.remove('hidden');
                } else {
                    button.classList.add('hidden');
                }
            }
        });

        // Update refining buttons and panel
        const hasRefiningUnlocked = Object.values(GAME_CONFIG.refinedMaterials).some(r => r.unlocked);
        const refiningPanel = document.getElementById('refining-panel');
        if (refiningPanel) {
            if (hasRefiningUnlocked) {
                refiningPanel.classList.remove('hidden');
            } else {
                refiningPanel.classList.add('hidden');
            }
        }

        Object.keys(GAME_CONFIG.refinedMaterials).forEach(refinedKey => {
            const refined = GAME_CONFIG.refinedMaterials[refinedKey];
            const button = document.getElementById(refinedKey + '-button');
            if (button) {
                if (refined.unlocked) {
                    button.classList.remove('hidden');
                } else {
                    button.classList.add('hidden');
                }
            }
        });

        // Update combat buttons and panel
        const hasCombatUnlocked = Object.values(GAME_CONFIG.combat).some(c => c.unlocked);
        const combatPanel = document.getElementById('combat-panel');
        if (combatPanel) {
            if (hasCombatUnlocked) {
                combatPanel.classList.remove('hidden');
            } else {
                combatPanel.classList.add('hidden');
            }
        }

        Object.keys(GAME_CONFIG.combat).forEach(combatKey => {
            const combat = GAME_CONFIG.combat[combatKey];
            const button = document.getElementById(combatKey + '-button');
            if (button) {
                if (combat.unlocked) {
                    button.classList.remove('hidden');
                } else {
                    button.classList.add('hidden');
                }
            }
        });

        // Update guild panel
        const guildPanel = document.getElementById('guild-panel');
        if (guildPanel) {
            if (GAME_CONFIG.guild.unlocked) {
                guildPanel.classList.remove('hidden');
            } else {
                guildPanel.classList.add('hidden');
            }
        }

        // Update resource display visibility
        this.updateResourceDisplay();
    },

    // Show notification (for important events)
    showNotification(message, type = 'info') {
        // Simple notification system - can be enhanced later
        this.addLogEntry(`★ ${message}`);
        
        // Could add toast notifications here in the future
        console.log(`[${type.toUpperCase()}] ${message}`);
    },

    // Update button availability based on resources
    updateButtonStates() {
        // Update refining buttons based on available materials
        Object.keys(GAME_CONFIG.refinedMaterials).forEach(refinedKey => {
            const refined = GAME_CONFIG.refinedMaterials[refinedKey];
            const button = document.getElementById(refinedKey + '-button');
            
            if (button && !button.disabled && refined.unlocked) {
                const canAfford = Object.entries(refined.cost).every(([material, amount]) => {
                    return (Game.state.materials[material] || 0) >= amount;
                });
                
                // Visual feedback for affordability
                if (canAfford) {
                    button.style.opacity = '1';
                } else {
                    button.style.opacity = '0.6';
                }
            }
        });
        
        // Update recruit button
        const recruitButton = document.getElementById('recruit-button');
        if (recruitButton && GAME_CONFIG.guild.unlocked) {
            const canRecruit = Game.state.currency >= GAME_CONFIG.guild.recruitCost && 
                             Game.state.guildmates < Game.state.maxGuildmates;
            recruitButton.style.opacity = canRecruit ? '1' : '0.6';
        }
    }
};