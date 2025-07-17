# Guild Airship Builder

An incremental/idle browser game where players manage a guild to build an airship. Players start solo, manually performing tasks, then gradually recruit guildmates to automate work.

## Game Overview

- **Genre**: Incremental/Idle Game
- **Platform**: Web Browser (HTML/CSS/JavaScript)
- **Playtime**: 2-3 hours for complete playthrough
- **Theme**: Fantasy MMO guild building an airship

## Features

### Core Gameplay
- **Gathering**: Collect raw materials (Iron Ore, Wood, Stone)
- **Refining**: Process materials into useful components
- **Combat**: Fight enemies to earn currency
- **Guild Management**: Recruit guildmates to automate tasks
- **Progression**: Build airship components to achieve victory

### Technical Features
- **Auto-save**: Progress saved every 30 seconds
- **Offline Progress**: Automation continues when game is closed
- **Responsive Design**: Works on desktop and mobile
- **No External Dependencies**: Pure HTML/CSS/JS

## File Structure

```
guild-airship-builder/
├── index.html          # Main game page
├── css/
│   ├── main.css        # Core styling
│   └── components.css  # UI component styles
├── js/
│   ├── game.js         # Main game state and logic
│   ├── ui.js           # UI updates and interactions
│   ├── timer.js        # Timer system management
│   ├── storage.js      # Save/load functionality
│   └── config.js       # Game configuration and data
└── README.md           # This file
```

## Getting Started

1. Clone or download the project files
2. Open `index.html` in a web browser
3. Start by clicking "Gather Iron Ore" to begin your journey
4. Use earned materials to refine components
5. Fight enemies to earn currency for recruiting guildmates
6. Assign guildmates to automate tasks (coming in next update)
7. Build all airship components to win!

## Development Status

This is the initial version implementing Phase 1 & 2 of development:

### ✅ Completed Features
- Core timer system with visual feedback
- Resource gathering and storage limits
- Material refining system
- Basic combat with currency rewards
- Guildmate recruitment
- Save/load functionality
- Event logging
- Responsive UI

### 🚧 In Development
- Guildmate task assignment and automation
- Tier system (Basic → Advanced → Elite)
- Airship component crafting
- Guild upgrades and expansions

### 📋 Planned Features
- Content unlocking system
- Victory condition and completion tracking
- Speedrun timer
- Quality of life improvements

## Game Balance

### Time Investment
- **Early Game**: 15-30 minutes of manual clicking
- **Mid Game**: 45-60 minutes of guild management
- **Late Game**: 30-45 minutes of airship assembly
- **Total**: 2-3 hours for complete playthrough

### Resource Progression
- Raw materials have 3-4 second gathering times
- Refined materials take 4-6 seconds to process
- Combat encounters range from 4-8 seconds
- Storage limits encourage progression to new tiers

## Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers with JavaScript support

## Save System

- Automatic saves every 30 seconds
- Manual save on page close
- Uses browser localStorage (no server required)
- Offline progress calculation for automation
- Reset option available in-game

## Contributing

This is a personal project following a specific design document. The codebase is structured for easy expansion and modification.

### Development Phases
1. ✅ Foundation & Core Systems
2. ✅ Core Activities (partial)
3. 🚧 Guild Management & Automation
4. 📋 Progression & Content Unlocking
5. 📋 UI Polish & User Experience
6. 📋 End Game & Completion

## License

Open source - feel free to use, modify, or learn from this code.

---

*Last updated: Initial Release*