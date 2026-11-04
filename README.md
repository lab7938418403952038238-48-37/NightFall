# NIGHTFALL

NIGHTFALL is a custom AutoHotkey v2 automation project with a WebView2 HTML/CSS/JavaScript interface.

## Run

1. Install AutoHotkey v2.
2. Make sure the Microsoft Edge WebView2 Runtime is installed.
3. Keep the repository folders together; do not move `Main.ahk` away from `GUI`, `core`, or `bitmaps`.
4. Run `NightFall/Main.ahk`.

The app uses the matching `core/32bit/WebView2Loader.dll` or `core/64bit/WebView2Loader.dll` based on the AutoHotkey process architecture.

## Interface

- `GUI/index.html`: page layout
- `GUI/style.css`: responsive black/purple theme
- `GUI/app.js`: UI interactions and WebView bridge
- `Main.ahk`: AutoHotkey host, hotkeys, INI settings and WebView callbacks

## Existing engine files

The existing movement code is in `core/Move.ahk`. Its configured base speed is updated by the Settings slider and saved to `NightFall.ini`. Movement image templates are initialised by `core/Movement.ahk`, and screen offset templates by `core/Offset.ahk`. GDI+ is loaded from `bitmaps/Gdip_All.ahk`.

## Current implementation status

The GUI, navigation, settings controls, field/pattern discovery, gather configuration, local INI persistence, WebView callbacks, window controls and F1–F4 hotkeys are connected.

The full farming loop is not enabled yet. The current repository still needs a completed scanner/detection pipeline, validated field route and pattern execution, and a real camera-sensitivity measurement routine. The camera calibration button currently performs a preflight check and explicitly reports that sensitivity measurement is pending; it does not invent a sensitivity value. Honey, buff and session charts remain empty until real measurements are sent by the engine.

### Hotkeys

- F1: Start/preflight
- F2: Stop and release held inputs
- F3: Close NIGHTFALL
- F4: Reload NIGHTFALL
