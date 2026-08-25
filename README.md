# VortexQuest - 2D Action RPG & Custom Game Engine

**VortexQuest** is a single-player 2D Action Role-Playing Game (RPG) built from scratch using pure **TypeScript** and **HTML5 Canvas 2D**. It features a custom zero-dependency game engine with Separating Axis Theorem (SAT) polygon physics, Entity Component System (ECS) architecture, Finite State Machine (FSM) enemy AI, spatial hash grid partitioning, data-driven UI overlays, and persistent local state storage.

---

## 🚀 Quick Start Guide

### 📋 Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

---

## 🛠️ Installation
To set up the project locally:

```bash
# Clone or extract the repository
git clone https://github.com/divya-8143/VortexQuest.git
cd VortexQuest

# Install project dependencies
npm install
```

---

## 🏗️ Build Instructions
To compile TypeScript and bundle static production assets into `dist/`:

```bash
# Execute production build
npm run build
```

The compiled production bundle will be generated under `dist/assets/index-*.js`.

---

## 🎮 How to Run
To start the application server and launch the game locally:

### Option 1: Live Development Server (Vite)
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### Option 2: Production HTTP Server
```bash
npm start
```
Open your browser and navigate to `http://localhost:3000`.

---

## 🧪 Automated Testing
To run the complete automated test suite (7 core integration & logic tests):

```bash
npm test
```

---

## 📦 Dependencies & Technologies
- **TypeScript 5.0**: Typed interfaces and core application logic.
- **HTML5 Canvas 2D Context**: High-performance 60 FPS rendering pipeline.
- **Vite 4.5**: Lightning-fast ESBuild module bundler.
- **Node.js**: Runtime environment and static production file server.
- **LocalStorage API**: State serialization for hero progress and save games.

---

## 🕹️ Controls & Gameplay Guide
- **WASD / Arrow Keys**: Move Hero character
- **Spacebar**: Basic Melee Attack
- **1, 2, 3, 4, Q**: Execute Special Skill Powers
  - `1`: 🔥 Fire Slash (200% weapon damage)
  - `2`: ⚡ Vortex Dash (Forward evasive dash)
  - `3`: 🌩️ Lightning Storm (250% AOE strike)
  - `4`: 💚 Divine Heal (Restores 40% Max HP)
  - `Q`: 🌀 Vortex Annihilation (400% Ultimate)
- **E**: Interact / Talk with NPCs & Merchants
- **I**: Toggle Inventory Window
- **L**: Toggle Quest Log
- **K**: Toggle Skill Tree
- **C**: Toggle Hero Attribute Stats
- **M**: Open Game Manual & Instructions
- **ESC / Click ⏸️**: Pause Game & Save Progress

---

## 📜 License
Proprietary & Confidential - All Rights Reserved.
