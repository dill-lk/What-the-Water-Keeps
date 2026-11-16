# Feature implementation backlog

This is the implementation order for future gameplay work. It is intentionally separate from
the architecture document so individual features can become focused pull requests.

## 1. Save and resume

Add a small `src/engine/save.js` module that serializes:

- active realm id;
- route distance and lateral offset;
- camera yaw and pitch;
- reduced-motion and audio settings;
- save schema version.

Write only validated JSON to `localStorage`. Restore after the engine and realm list are ready,
and show a clear reset action when saved data is incompatible.

## 2. Photo mode

Add a UI toggle that:

- pauses simulation;
- hides navigation and HUD chrome;
- preserves the current camera;
- exposes a simple field-of-view control;
- downloads a PNG from the renderer canvas;
- restores the previous state on Escape.

The feature should work without changing realm content or adding a new rendering path.

## Implemented: paddling camera views

Press `V` while riding to cycle through four smooth camera positions:

- **Boat** — the original first-person view;
- **Starboard** — a low side view that keeps the paddle and lantern in frame;
- **Bow** — a forward-mounted view for reading the waterway;
- **Over-shoulder** — a raised view that shows the boat moving through the scene.

The view offset is local to the boat eye rig, so mouse, touch, keyboard, and gamepad look
controls remain available in every mode. Reduced-motion mode shortens the transition without
removing the view choices. The next iteration can expose these names in the HUD and persist the
selected view with the save-state feature.

## 3. Accessibility settings

Extend the existing UI settings with:

- reduced motion;
- high contrast;
- subtitles for staged moments;
- keyboard control hints;
- an option to reduce bloom and flashing light changes.

Settings should be persisted with the save module and applied before the first realm is built.

## 4. Memory log

Give staged discoveries stable ids and add a lightweight journal view in `src/ui.js`.
Realm stage modules should emit discovery events rather than manipulating journal markup
directly. The journal must be optional, keyboard accessible, and never block the ride.

## 5. Asset diagnostics

Add a developer-only `?diagnostics=1` panel that reports failed and successful model, texture,
audio, and sidecar requests. Keep diagnostics out of normal visitor UI and make it easy to
copy the report when a realm is incomplete.

## 6. Offline caching

After all required source assets are restored, add a versioned service worker for static files.
Cache the application shell first, then large realm assets as they are requested. Failed cache
writes must not prevent the live network path from working.

## Implementation rules

- Prefer one focused feature per pull request.
- Add a fallback for browsers without the feature API.
- Respect `prefers-reduced-motion`.
- Avoid adding a build step or framework dependency.
- Test desktop, touch input, keyboard input, and a cold page load.
