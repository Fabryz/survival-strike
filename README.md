# Survival Strike - Tactical RTS

A browser-based tactical real-time strategy game inspired by Men of War, built with Three.js.

## 🎮 Overview

Survival Strike is a tactical RTS where you command squads of soldiers in real-time combat. Select units, issue orders, and engage in strategic warfare with an intelligent enemy AI.

## ✨ Features

### 🖱️ RTS Controls
- **Box Selection**: Drag to select multiple units
- **Single Selection**: Click individual units
- **Shift Selection**: Add units to current selection
- **Move Command**: Right-click ground to move selected units
- **Attack Command**: Right-click enemy to engage target
- **Formation System**: Units automatically arrange in tactical formations

### 👥 Unit Classes

| Class | HP | Ammo | Damage | Accuracy | Role |
|-------|----|----- |--------|----------|------|
| **Rifleman** | 100 | 30 | 20 | 70% | Versatile infantry |
| **Machinegunner** | 120 | 100 | 15 | 50% | Suppressive fire |
| **Sniper** | 80 | 10 | 80 | 95% | Precision elimination |

### 🎯 Combat System
- Automatic targeting and firing
- Ballistic projectiles with accuracy spread
- Health bars and damage feedback
- Unit death and removal

### 🎥 Camera System
- **WASD/Arrows**: Pan camera (relative to view angle)
- **Q/E**: Rotate camera
- **Mouse Wheel**: Zoom in/out
- Isometric tactical view

## 🚀 Installation

```bash
git clone git@github.com:Fabryz/survival-strike.git
cd survival-strike
npm install
npm start
```

Open `http://localhost:3000/index.html` in your browser.

## 🎮 Controls

| Action | Control |
|--------|---------|
| Select unit(s) | Left Click / Drag |
| Add to selection | Shift + Click |
| Move units | Right Click (ground) |
| Attack enemy | Right Click (enemy) |
| Pan camera | WASD / Arrow Keys |
| Rotate camera | Q / E |
| Zoom | Mouse Wheel |

## 📁 Project Structure

```
survival-strike/
├── src/
│   ├── SelectionManager.js    # Unit selection system
│   ├── MovementController.js  # Movement and formations
│   └── Unit.js                # Unit class with combat
├── index.html                 # Main HTML
├── main.js                    # Game loop
├── server.js                  # Express server
└── package.json
```

## 🔧 Technical Stack

- **Three.js** - 3D rendering engine
- **Express** - Web server
- **Socket.io** - Multiplayer ready (prepared)
- **ES6 Modules** - Modern JavaScript

## 🎯 Roadmap

### Planned Features
- [ ] Cover system (walls, sandbags, buildings)
- [ ] Advanced formations (line, wedge, dispersed)
- [ ] Tactical AI (flanking, cover seeking)
- [ ] Vehicles (jeep, tank)
- [ ] Fog of War
- [ ] Minimap
- [ ] Resource system
- [ ] Multiplayer (PvP/Co-op)

### Advanced Mechanics
- [ ] Stance system (prone, crouch, stand)
- [ ] Morale and suppression
- [ ] Limited ammo and resupply
- [ ] Medics and repairs
- [ ] Artillery support
- [ ] Strategic points capture

## 🤝 Contributing

Contributions are welcome! Feel free to fork and submit pull requests.

## 📄 License

MIT License - See LICENSE file for details.

---

**Enjoy commanding your troops!** 🎖️
