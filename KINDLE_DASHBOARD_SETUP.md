# Kindle Paperwhite Autonomous Desk Display Setup Guide

## Architecture Overview

This project turns an e-ink Kindle Paperwhite (PW3) into an autonomous desk HUD that stays up to date 24/7 with zero ongoing costs and zero computer host dependencies.

### Phase 1: Current Implementation (Calendar + Weather HUD)
1. **Google Apps Script Backend:**
   - Free, serverless runtime hosted on Google Cloud infrastructure.
   - Accesses Google Calendar APIs directly with your Google account credentials.
   - Calls Open-Meteo for live weather metrics in Dehradun.
   - Generates fully self-contained HTML pages with embedded CSS.
   - Supports 4 visual styles (`swiss`, `editorial`, `nordic`, `cyberdeck`).
2. **KOReader Document Engine:**
   - KOReader renders `.html` files natively via its internal e-book layout engine.
   - Supports custom CSS typography, large fonts, bold text, inverted contrast blocks, and page layout properties.
   - Eliminates all limitations of the obsolete 2013-era stock Kindle browser.
3. **`deskcalendar.koplugin` Background Worker:**
   - Lives inside KOReader plugins directory.
   - Wakes up periodically (configurable interval: 2m for testing, 5m-10m for production).
   - Wakes Wi-Fi via Kindle `lipc` commands.
   - Downloads the latest HTML output from Google Apps Script.
   - Silently issues a document reload to refresh the e-ink screen hands-free.

---

## Google Apps Script Deployment

1. Visit **[script.google.com](https://script.google.com)**.
2. Paste the full contents of `google_apps_script/Code.gs`.
3. Set your preferred default layout style:
   ```javascript
   const DEFAULT_STYLE = "swiss"; // "swiss", "editorial", "nordic", or "cyberdeck"
   ```
4. If monitoring multiple calendars, add secondary Google accounts to `ADDITIONAL_CALENDARS`:
   ```javascript
   const ADDITIONAL_CALENDARS = [
     "work_email@company.com"
   ];
   ```
5. Click **Deploy → Manage Deployments → Edit → New Version → Deploy**.
6. Set access to **Anyone**.

---

## KOReader Plugin Configuration

The plugin source is located at `koreader_plugin/deskcalendar.koplugin/`:
- **`_meta.lua`**: Plugin metadata definition.
- **`main.lua`**: Background loop logic.

### Refresh Interval:
In `main.lua`, line 15:
```lua
local REFRESH_INTERVAL = 120 -- Interval in seconds (120 = 2 min, 300 = 5 min)
```

---

## Phase 2 Roadmap: Smart Home & Automation

Planned future extensions include:
- **Alexa / Smart Home Accessory Webhooks:** Triggering room lights, desk lamps, and focus routines directly from Kindle touch events or physical actions.
- **KUAL Launcher Shortcuts:** Standalone touch dashboard controls using KUAL booklets.
- **Interactive Multi-Screen Navigation:** Swapping between Agenda, Weather Radar, and Home Control panels with simple touch gestures in KOReader.
