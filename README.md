# 🌊 What the Water Keeps 

https://github.com/user-attachments/assets/10267983-6144-468e-ad2b-2260b09133bc




A complete, modular reverse-engineering and source reconstruction of the WebGL browser game **What the Water Keeps**, originally created by [Kevin Ngo](https://x.com).

🎮 **Live Mirror:** [echoes-beneath-the-tide.vercel.app](https://vercel.app)  
🌐 **Original Release:** [what-the-water-keeps.vercel.app](https://vercel.app)

---

## 📖 Background

The original release of *What the Water Keeps* shipped as a closed-source, heavily bundled production web build with no public repository or source maps—meaning right-clicking "View Source" gave you nothing to work with. 

Instead of accepting defeat, this project manually unpacked, de-bundled, and reconstructed the entire client-side architecture into a clean, readable, and hackable codebase. Every script, shader, asset dependency, and local Three.js module has been organized and verified to run offline without relying on the original deployment.

---

## ✨ What Was Reconstructed

- **De-bundled & Modularized Logic:** Unpacked minified production scripts into structured, readable modules under `src/` and `js/`.
- **Self-Contained Three.js Pipeline:** Isolated and wired up the local `vendor/three` dependencies so the WebGL rendering engine runs standalone.
- **Asset & UI Restoration:** Extracted and mapped all static resources (`assets/`, `images/`, `fonts/`, `css/`) alongside a working `site.webmanifest` for offline/PWA execution.
- **Zero-Build Local Execution:** Structured so developers can clone, serve, and modify the game mechanics, shaders, or physics immediately.

---

## 🗂️ Project Structure

```text
What-the-Water-Keeps/
├── assets/          # Audio files, shaders, and core game resources
├── css/             # UI styling, HUD layout, and responsive rules
├── fonts/           # Local typography assets
├── images/          # Textures, icons, and visual sprites
├── js/              # Runtime scripts and helper modules
├── src/             # Main game loop, Three.js scene setup, and mechanics
├── vendor/three/    # Local Three.js 3D rendering library
├── index.html       # Entry point
└── site.webmanifest # Progressive Web App manifest
```

---

## 🚀 Getting Started

Because modern browsers block ES modules and local Three.js assets over the `file://` protocol, run the project using any local HTTP server:

1. **Clone the repository**
   ```bash
   git clone https://github.com
   cd What-the-Water-Keeps
   ```

2. **Start a local development server**
   - **Using Node.js:**
     ```bash
     npx serve .
     ```
   - **Using Python:**
     ```bash
     python -m http.server 8000
     ```

3. **Play & Experiment**
   Open `http://localhost:3000` (or `http://localhost:8000`) in your browser.

---

## 🛠️ Contributing & Modding

This repository is actively structured for experimentation, gameplay tweaks, and new feature additions. Feel free to fork the repo, open issues, or submit pull requests if you want to build on top of the reconstructed engine.

---

## ☕ Support the Reverse-Engineering Grind

Unpacking minified WebGL bundles at 2 AM takes a lot of caffeine, stubbornness, and questionable life choices. If this repo saved you hours of staring at obfuscated code or helped you build something cool, show the boy some love:

- ⭐ **Smash that Star button** at the top right—it’s free dopamine and keeps the boat afloat!
- 🍴 **Fork the repo** and break the physics engine in creative ways.
- 🐛 **Open an Issue** just to drop a *"yo, nice work"* or pitch a wild mod idea.
- 📣 **Share the repo** with your dev homies who love reverse-engineering browser games.

---

## ⚖️ Credits & Disclaimer

- **Original Game & Concept:** Created by **Kevin Ngo** (`@kevin_t_ngo`). All original creative direction and game concepts belong to the original author.
- **Reverse Engineering & Reconstruction:** Maintained by [@dill-lk](https://github.com).
- **Purpose:** Published strictly for educational study, WebGL/Three.js research, and game preservation. If you are the original creator and have any concerns regarding this repository, please open an issue or reach out directly.
