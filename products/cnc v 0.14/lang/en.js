/* =============================================================================
   ENGLISH (en) INTERFACE STRINGS
   ============================================================================= */
window.APP_I18N = window.APP_I18N || {};
window.APP_I18N.en = {
  // Top bar
  "app.title": "G-CODE VISUALIZER",
  "app.subtitle": "CNC TOOLPATH SIMULATION UNIT",
  "lang.select": "Interface language",
  "theme.toggle": "Toggle theme",
  "theme.light": "Light",
  "theme.dark": "Dark",

  // Status pill
  "status.noFile": "NO FILE LOADED",
  "status.parsing": "PARSING FILE...",
  "status.readyToSimulate": "READY TO SIMULATE",
  "status.ready": "READY",
  "status.running": "SIMULATION RUNNING",
  "status.paused": "PAUSED",
  "status.error": "ERROR",
  "status.noMoves": "NO TOOLPATH FOUND",
  "status.webglUnavailable": "3D UNAVAILABLE",

  // Panel titles
  "panel.machine": "MACHINE SETUP",
  "panel.upload": "LOAD PROGRAM",
  "panel.control": "SIMULATION CONTROL",
  "panel.telemetry": "LIVE TELEMETRY",

  // Machine setup
  "machine.typeLabel": "MACHINE TYPE",
  "machine.custom": "Custom size",
  "machine.widthLabel": "WIDTH X (mm)",
  "machine.heightLabel": "DEPTH Y (mm)",
  "machine.apply": "APPLY",
  "machine.appliedNote": "Work area updated",

  // Upload
  "upload.dropTitle": "DROP .GCODE / .NC FILE",
  "upload.dropSub": "or click to browse",
  "file.unsupported": "Unsupported file type.",
  "file.reading": "Reading {name}...",
  "file.parsing": "Parsing {name} — {pct}%",
  "file.error": "Failed to read file.",
  "file.summaryLine1": "{lines} lines · {size} KB",
  "file.summaryLine2": "{moves} moves parsed",
  "file.warnings": "⚠ Skipped {count} lines with invalid data",
  "file.noMoves": "No G0/G1/G2/G3 moves were found in this file.",

  // Controls
  "controls.play": "PLAY",
  "controls.pause": "PAUSE",
  "controls.reset": "RESET",
  "controls.speed": "SPEED MULTIPLIER",
  "controls.showRapids": "Show rapid (G0) moves",
  "controls.showStock": "Show stock material",

  // Telemetry
  "tele.line": "LINE",
  "tele.command": "COMMAND",
  "tele.x": "X (mm)",
  "tele.y": "Y (mm)",
  "tele.z": "Z (mm)",
  "tele.feed": "FEED",
  "tele.elapsed": "ELAPSED",
  "tele.total": "EST. TOTAL",
  "tele.cutLen": "CUT LEN",
  "tele.rapidLen": "RAPID LEN",
  "tele.bounds": "BOUNDS",

  // Viewport HUD
  "hud.wasteboard": "WASTEBOARD {w} × {h} mm",
  "hud.legendCut": "CUT (G1/G2/G3)",
  "hud.legendRapid": "RAPID (G0)",
  "hud.camHint": "DRAG TO ORBIT · SCROLL TO ZOOM · RIGHT-DRAG TO PAN",

  // Empty state
  "empty.title": "AWAITING TOOLPATH DATA",
  "empty.sub": "Load a .gcode or .nc file to begin simulation",

  // WebGL unavailable fallback screen
  "webgl.title": "3D VISUALIZATION UNAVAILABLE",
  "webgl.message": "This browser or device does not support WebGL — the technology required to render the 3D toolpath.",
  "webgl.suggestion": "Try: updating your browser to the latest version, enabling hardware graphics acceleration in its settings, or opening this page on a different computer. If this is a school PC, contact your teacher or network administrator.",
};
