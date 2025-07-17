// timer.js - Timer system management

class Timer {
    constructor(id, duration, callback, onTick = null) {
        this.id = id;
        this.duration = duration;
        this.remaining = duration;
        this.callback = callback;
        this.onTick = onTick;
        this.isActive = false;
        this.intervalId = null;
        this.startTime = null;
    }

    start() {
        if (this.isActive) return false;
        
        this.isActive = true;
        this.startTime = Date.now();
        
        this.intervalId = setInterval(() => {
            this.remaining -= 100;
            
            if (this.onTick) {
                this.onTick(this.remaining, this.id);
            }
            
            if (this.remaining <= 0) {
                this.complete();
            }
        }, 100);

        return true;
    }

    complete() {
        this.isActive = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.callback(this.id);
    }

    reset() {
        this.remaining = this.duration;
        this.isActive = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.startTime = null;
    }

    pause() {
        if (!this.isActive) return;
        
        this.isActive = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    resume() {
        if (this.isActive || this.remaining <= 0) return;
        this.start();
    }

    // For save/load functionality
    serialize() {
        return {
            id: this.id,
            duration: this.duration,
            remaining: this.remaining,
            isActive: this.isActive,
            startTime: this.startTime
        };
    }

    static deserialize(data, callback, onTick) {
        const timer = new Timer(data.id, data.duration, callback, onTick);
        timer.remaining = data.remaining;
        
        // If timer was active when saved, calculate how much time has passed
        if (data.isActive && data.startTime) {
            const elapsed = Date.now() - data.startTime;
            timer.remaining = Math.max(0, data.remaining - elapsed);
            
            if (timer.remaining > 0) {
                timer.start();
            } else {
                // Timer should have completed while offline
                setTimeout(() => timer.complete(), 0);
            }
        }
        
        return timer;
    }
}

// Timer manager to handle multiple concurrent timers
class TimerManager {
    constructor() {
        this.timers = new Map();
    }

    createTimer(id, duration, callback, onTick = null) {
        // If timer already exists, clear it first
        if (this.timers.has(id)) {
            this.clearTimer(id);
        }

        const timer = new Timer(id, duration, callback, onTick);
        this.timers.set(id, timer);
        return timer;
    }

    startTimer(id) {
        const timer = this.timers.get(id);
        return timer ? timer.start() : false;
    }

    clearTimer(id) {
        const timer = this.timers.get(id);
        if (timer) {
            timer.reset();
            this.timers.delete(id);
        }
    }

    pauseAll() {
        this.timers.forEach(timer => timer.pause());
    }

    resumeAll() {
        this.timers.forEach(timer => timer.resume());
    }

    clearAll() {
        this.timers.forEach(timer => timer.reset());
        this.timers.clear();
    }

    // For save/load functionality
    serialize() {
        const data = {};
        this.timers.forEach((timer, id) => {
            data[id] = timer.serialize();
        });
        return data;
    }

    deserialize(data, callbackMap, onTickCallback) {
        this.clearAll();
        
        Object.values(data).forEach(timerData => {
            const callback = callbackMap[timerData.id];
            if (callback) {
                const timer = Timer.deserialize(timerData, callback, onTickCallback);
                this.timers.set(timerData.id, timer);
            }
        });
    }

    getActiveTimers() {
        return Array.from(this.timers.values()).filter(timer => timer.isActive);
    }

    getTimer(id) {
        return this.timers.get(id);
    }
}

// Global timer manager instance
const timerManager = new TimerManager();