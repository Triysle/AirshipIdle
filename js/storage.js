// storage.js - Save/load functionality

const Storage = {
    SAVE_KEY: 'guildAirshipBuilder_save',
    
    // Save game data to localStorage
    save(data) {
        try {
            const saveData = {
                ...data,
                version: '1.0.0',
                timestamp: Date.now()
            };
            
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            UI.addLogEntry('Warning: Failed to save game progress');
            return false;
        }
    },

    // Load game data from localStorage
    load() {
        try {
            const savedData = localStorage.getItem(this.SAVE_KEY);
            if (!savedData) {
                return null;
            }

            const data = JSON.parse(savedData);
            
            // Validate save data structure
            if (!this.validateSaveData(data)) {
                console.warn('Invalid save data detected, starting fresh');
                this.clear();
                return null;
            }

            return data;
        } catch (error) {
            console.error('Failed to load game:', error);
            UI.addLogEntry('Warning: Failed to load saved progress, starting fresh');
            this.clear();
            return null;
        }
    },

    // Validate save data structure
    validateSaveData(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }

        // Check for required properties
        const requiredProps = ['state', 'timestamp'];
        for (const prop of requiredProps) {
            if (!(prop in data)) {
                return false;
            }
        }

        // Validate state structure
        if (!data.state || typeof data.state !== 'object') {
            return false;
        }

        const requiredStateProps = ['materials', 'refinedMaterials', 'currency', 'guildmates'];
        for (const prop of requiredStateProps) {
            if (!(prop in data.state)) {
                return false;
            }
        }

        return true;
    },

    // Clear all save data
    clear() {
        try {
            localStorage.removeItem(this.SAVE_KEY);
            return true;
        } catch (error) {
            console.error('Failed to clear save data:', error);
            return false;
        }
    },

    // Export save data as JSON string (for sharing/backup)
    export() {
        const data = this.load();
        if (!data) {
            return null;
        }

        return JSON.stringify(data, null, 2);
    },

    // Import save data from JSON string
    import(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            if (!this.validateSaveData(data)) {
                throw new Error('Invalid save data format');
            }

            return this.save(data);
        } catch (error) {
            console.error('Failed to import save data:', error);
            UI.addLogEntry('Failed to import save data - invalid format');
            return false;
        }
    },

    // Get save file info
    getSaveInfo() {
        const data = this.load();
        if (!data) {
            return null;
        }

        const saveDate = new Date(data.timestamp);
        const playTime = data.state.playTime || 0;
        
        return {
            saveDate: saveDate.toLocaleString(),
            playTime: this.formatPlayTime(playTime),
            version: data.version || 'Unknown',
            guildmates: data.state.guildmates || 0,
            currency: data.state.currency || 0
        };
    },

    // Format play time in readable format
    formatPlayTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    },

    // Check if localStorage is available
    isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    },

    // Get storage usage info
    getStorageInfo() {
        if (!this.isAvailable()) {
            return { available: false };
        }

        const saveData = localStorage.getItem(this.SAVE_KEY);
        const sizeInBytes = saveData ? new Blob([saveData]).size : 0;
        const sizeInKB = (sizeInBytes / 1024).toFixed(2);

        return {
            available: true,
            sizeInBytes,
            sizeInKB,
            hasSave: !!saveData
        };
    }
};