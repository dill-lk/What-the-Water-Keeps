# What the Water Keeps — Architecture

## Overview

What the Water Keeps is a zero-build browser game. `index.html` is the entry point and
loads the ES module application directly in the browser. The runtime uses local Three.js
modules, hand-authored realm modules, GLB models, texture atlases, and a small UI layer.

The application is intentionally deployable as static files:

```text
index.html
  ├─ css/style.css
  ├─ src/main.js
  │   ├─ src/engine/*
  │   ├─ src/realms/*
  │   └─ vendor/three/*
  ├─ assets/art/*
  ├─ assets/models/*
  ├─ assets/audio/*
  └─ images/* and fonts/*
```

## Runtime flow

1. `index.html` renders the loading screen, opening still, canvas, and fallback copy.
2. `src/main.js` reads URL developer parameters, loads the boat and lantern, creates the
   `Engine`, and registers the realm list.
3. `src/engine/engine.js` owns the renderer, camera, update loop, input, water, post-processing,
   quality settings, and shared texture/model lifetime.
4. `src/realms/index.js` defines the ordered waterways. Each realm is lazy-loaded only when
   needed.
5. A realm builds its route, scenery, lighting, creatures, stage moments, and colliders through
   the shared engine helpers.
6. `src/ui.js` connects the rendered ride to navigation, controls, audio, realm titles, and
   accessibility states.

## Engine responsibilities

| Area | Responsibility |
| --- | --- |
| `src/engine/engine.js` | Three.js renderer, camera, frame loop, quality governor, and shared resources |
| `src/engine/realms.js` | Lazy realm loading, activation, prewarming, and disposal |
| `src/engine/boat*.js` | Boat model loading, movement, steering, and hero presentation |
| `src/engine/water-final.js` | Final water surface and reflection rendering |
| `src/engine/water-final-sim.js` | Water simulation and wave state |
| `src/engine/models.js` | GLB loading, caching, instancing, animation, and model disposal |
| `src/engine/kit.js` | Shared placement, texture, model, collider, and scene-building helpers |
| `src/engine/gouache.js` | Vertex-painted materials and the hand-painted rendering treatment |
| `src/engine/post.js` | Bloom, painterly filtering, and final frame composition |
| `src/engine/input.js` | Mouse, touch, keyboard, and camera input |
| `src/engine/audio.js` | Audio manifest loading and music playback |

## Realms

The ride currently contains these lazy-loaded realms:

1. Landing
2. The dyers' reach
3. The orchard in flood
4. The town below
5. The theatre of leaves
6. The answering sea
7. The orchard in snow
8. The standing sky

Each realm normally follows the same composition:

```text
realm entry
  ├─ plan.js       route, measurements, materials, and art manifest
  ├─ set.js        shared realm setup and loading
  ├─ heroes*.js    landmarks and featured models
  ├─ kit*.js       repeated scenery and placement helpers
  ├─ cast*.js      animals, weather, particles, and ambient life
  ├─ light.js      lighting and colour changes
  └─ stage.js      scripted moments and transitions
```

## Asset pipeline

Assets are loaded at runtime from the `assets/` directory:

- `assets/art/` contains WebP environment paintings, surfaces, skies, and atlases.
- `assets/models/` contains vertex-painted GLB models and JSON sidecar data.
- `assets/audio/` contains the music manifest and audio files.
- `fonts/` contains the locally bundled Cormorant Garamond font files.
- `images/` contains favicons and social preview artwork.

GLB files are loaded through `src/engine/models.js`, cached by URL, and released when the
last realm using a model is disposed. JSON sidecars provide placement, animation, points,
variants, and other metadata that should remain alongside their corresponding models.

## Known asset gap

The checked-in orchard and snow sidecar manifests reference additional apple and snow GLB
files that are not present in this checkout. The missing references are concentrated in:

- `assets/models/orchard/apple_wood.json`
- `assets/models/snow/apple_snow.json`
- `assets/models/snow/left_snow.json`

The code already handles several optional sidecars defensively, but the missing GLBs should
be restored from the original build artifacts before treating the orchard and snow realms as
complete. Do not replace them with unrelated models: their geometry, vertex colours, named
parts, and points are part of the realm logic.

## Local development

The browser must serve the repository over HTTP because ES modules and local GLB/texture
requests do not work reliably from `file://` URLs:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`.

Useful developer query parameters include:

- `?realm=landing` — start in a specific realm
- `?shot=name.png` — render a development still
- `?q=low|medium|high` — choose render quality
- `?calm=1` — enable reduced motion
- `?meter=1` — show frame and render metrics
- `?ui=0` — hide the interface for a clean view

## Suggested next features

These additions fit the existing architecture without requiring a framework migration:

1. **Save and resume journey state** — persist realm, route position, camera look, and audio
   preference in `localStorage`.
2. **Photo mode** — freeze the simulation, hide the HUD, adjust field of view, and download a
   screenshot using the existing developer capture path.
3. **Realm accessibility controls** — add subtitles for staged moments, stronger contrast mode,
   reduced flashing, and a keyboard-only navigation guide.
4. **Discoverable memory log** — let players revisit found objects, creatures, and realm notes
   from the existing UI without interrupting the ride.
5. **Adaptive audio layers** — crossfade ambience and music based on realm, speed, weather, and
   stage cues using the existing audio manager.
6. **Asset diagnostics screen** — expose failed model, texture, and audio requests in a
   developer-only panel so incomplete realm content is visible immediately.
7. **Offline install improvements** — add a service worker with a versioned cache for static
   modules and assets after the missing model set has been restored.

## Extension guidelines

- Keep realm-specific behavior inside `src/realms/<realm>/`.
- Put reusable rendering and loading behavior in `src/engine/`.
- Add new models with their JSON sidecars and preserve named parts/points used by realm code.
- Prefer lazy loading and disposal over loading every realm at startup.
- Keep the static-file deployment model; new tooling should be optional rather than required.
