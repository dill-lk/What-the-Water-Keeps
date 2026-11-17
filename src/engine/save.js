// The small, deliberately versioned journey save. It is kept separate from the interface options
// because the ride can also be started without the interface.
export const SAVE_VERSION = 1;
export const SAVE_KEY = 'quiet-current:journey:v1';

const finite = (value, min, max) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;

export function validateSave(value) {
  if (!value || value.version !== SAVE_VERSION || typeof value.realmId !== 'string' || !value.realmId) return null;
  const route = value.route, camera = value.camera, settings = value.settings || {};
  if (!route || !finite(route.distance, 0, 1e6) || !finite(route.lateral, -1e4, 1e4)) return null;
  if (!camera || !finite(camera.yaw, -Math.PI * 2, Math.PI * 2) || !finite(camera.pitch, -Math.PI / 2, Math.PI / 2)) return null;
  if (settings.reducedMotion !== undefined && typeof settings.reducedMotion !== 'boolean') return null;
  if (settings.music !== undefined && typeof settings.music !== 'boolean') return null;
  if (settings.musicVolume !== undefined && !finite(settings.musicVolume, 0, 1)) return null;
  if (settings.soundVolume !== undefined && !finite(settings.soundVolume, 0, 1)) return null;
  return {
    version: SAVE_VERSION, realmId: value.realmId,
    route: { distance: route.distance, lateral: route.lateral },
    camera: { yaw: camera.yaw, pitch: camera.pitch },
    settings: { ...settings },
  };
}

export function readSave(storage = globalThis.localStorage) {
  try {
    const raw = storage && storage.getItem(SAVE_KEY);
    if (raw == null) return { value: null, incompatible: false };
    const value = validateSave(JSON.parse(raw));
    return { value, incompatible: !value };
  } catch {
    return { value: null, incompatible: true };
  }
}

export function writeSave(value, storage = globalThis.localStorage) {
  const valid = validateSave(value);
  if (!valid) return false;
  try { storage && storage.setItem(SAVE_KEY, JSON.stringify(valid)); return true; } catch { return false; }
}

export function clearSave(storage = globalThis.localStorage) {
  try { storage && storage.removeItem(SAVE_KEY); } catch { /* storage may be unavailable */ }
}
