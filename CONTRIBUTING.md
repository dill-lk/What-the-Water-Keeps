# Contributing

Thanks for helping preserve and improve *What the Water Keeps*.

## Before opening a change

- Read [ARCHITECTURE.md](ARCHITECTURE.md) and keep the zero-build static-site structure.
- Do not add models, textures, music, or other binaries from unrelated games or mirrors.
- Confirm that new assets are original, appropriately licensed, or supplied by the original
  creator. Record their source and licence in the pull request.
- Keep realm-specific code in `src/realms/<realm>/` and reusable runtime code in `src/engine/`.

## Development

Serve the repository over HTTP:

```bash
python -m http.server 8000
```

Open `http://localhost:8000/` in a current browser. Test the affected realm directly with
`?realm=<id>` where useful.

## Pull requests

Describe:

- what changed and why;
- which realms, controls, or assets are affected;
- how the change was tested;
- whether any sample content or missing source asset remains;
- the licence and attribution for every new third-party asset.

Keep pull requests focused. Avoid formatting unrelated files or rewriting generated/bundled
files unless the change specifically requires it.

## Code style

- Use the existing ES module style and browser-compatible JavaScript.
- Prefer existing engine helpers over duplicate loaders or scene utilities.
- Dispose resources that are owned by a realm.
- Keep loading failures explicit and preserve the existing fallback UI.
- Add accessible labels and keyboard behavior for new controls.

## Asset changes

Every model sidecar must reference files that exist in the same checkout. Check asset paths
before submitting:

```powershell
Get-ChildItem assets -Recurse -File
```

Never substitute a visually similar model when a named model is unavailable; realm logic may
depend on its geometry, vertex colours, animations, or named points.
