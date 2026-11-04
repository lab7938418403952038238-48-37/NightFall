# VESPER

VESPER is a Bee Swarm Simulator automation project built with AutoHotkey v2 and a custom WebView2 interface.

## Project status

This branch is the VESPER rebrand and integration foundation. The current UI and AHK host are retained and renamed. Start currently performs a Roblox/preflight check only; it does **not** yet run a complete gather/conversion loop. Scanner-driven farming, validated movement routes, pattern execution, and camera calibration still need integration and in-game testing.

## Run

1. Install AutoHotkey v2.
2. Install the Microsoft Edge WebView2 Runtime.
3. Keep the `NightFall` project directory and its subfolders together.
4. Run `NightFall/Main.ahk`.

## Interface

- `NightFall/GUI/index.html`: VESPER interface markup
- `NightFall/GUI/style.css`: responsive black/purple theme
- `NightFall/GUI/app.js`: UI interactions and WebView bridge
- `NightFall/Main.ahk`: AutoHotkey host, settings, hotkeys and WebView callbacks

## Existing engine components

Movement and image-search components are in `NightFall/core`; GDI+ is in `NightFall/bitmaps`. The field discovery routine reads `gtf-*.ahk` files from `NightFall/paths`. Paths must be validated against the user's game resolution, camera sensitivity, movement speed and hive position before unattended use.

## Keybinds

- F1: Start/preflight
- F2: Stop and release held inputs
- F3: Close VESPER
- F4: Reload VESPER

## Upstream attribution and licence

This project incorporates and adapts code from [Kairos](https://github.com/KairosMacro/Kairos), Copyright the Kairos contributors, distributed under the GNU General Public License v3.0. See the repository's `LICENSE` file and `THIRD_PARTY_NOTICES.md`. Kairos also credits Natro Macro and the listed third-party library authors in its upstream README; consult the upstream project for their notices and licensing details.