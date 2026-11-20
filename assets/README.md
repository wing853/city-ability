# HD raster asset pack (v1)

This folder is reserved for **real WebP/PNG art**, not SVG approximations.

## Files in the prepared package
- `assets/environment/wet_neon_road.webp` — 1024×1024 wet neon asphalt texture
- `visual_target.webp` — concept/reference composition, **not** a game-ready tile

The raster package is provided separately in the ChatGPT conversation as `city_ability_hd_assets_v1.zip`. Binary image files have **not yet been uploaded to this repository**. Do not change the live renderer to load these paths until the files are present.

## Integration
1. Upload `wet_neon_road.webp` to `assets/environment/`.
2. Keep existing collision and world coordinates.
3. Tile/crop the road texture on the world background, while retaining collision overlays.
4. Create transparent building, cherry blossom and fighter sprites as separate PNG/WebP assets, then replace the current vector placeholders.
5. Test on mobile before enabling by default.

Reference visual direction: neon-lit rainy Korean city at night, cherry blossoms, detailed anime 2D action RPG.
