# Kindle Paperwhite Autonomous E-Ink Desk Display

Turn a jailbroken **Kindle Paperwhite (PW3)** into an autonomous, hands-free e-ink desk display for live calendar meetings and local weather telemetry.

---

## 🌟 Current Architecture (Phase 1: Active)

The system is designed to be **100% free** and run **fully autonomously over Kindle Wi-Fi**. Your computer/Mac does **not** need to stay powered on.

```
┌─────────────────────────────────┐
│     Google Apps Script Cloud     │
│   (script.google.com / Code.gs) │
│  • Google Calendar API (multi)  │
│  • Open-Meteo Weather (Dehradun)│
└────────────────┬────────────────┘
                 │ HTTP GET (every 2-5 min)
                 ▼
┌─────────────────────────────────┐
│   Kindle Paperwhite (KOReader)   │
│  • `deskcalendar.koplugin`      │
│  • Native curl download         │
│  • Silent e-ink reload          │
│  • Renders `0_Live_Meetings.html`│
└─────────────────────────────────┘
```

### 1. Cloud Backend: Google Apps Script (`google_apps_script/Code.gs`)
- Aggregates events across primary and secondary Google Calendar accounts for Today and the upcoming 7 days.
- Queries Open-Meteo API for real-time weather telemetry in **Dehradun, Uttarakhand, India** (temperature, feels-like, condition, humidity, wind, daily min/max, sunrise/sunset).
- Returns clean, standalone, high-contrast HTML documents tailored for E-Ink rendering.
- Features **4 built-in minimalist visual templates** with dynamic toggle support:
  - **`swiss`** *(Default)*: Clean Bauhaus / Helvetica-inspired layout, massive numerals, hairline dividers, zero ghosting.
  - **`editorial`**: Broadsheet newspaper masthead (*The Dehradun Chronicle*), serif typography, double-rules.
  - **`nordic`**: Scandinavian / Muji style, soft rounded cards, clean pill badges.
  - **`cyberdeck`**: High-contrast monospace terminal HUD, inverted badges, 7-day mini radar strip.

### 2. Device Display: KOReader HTML Engine
- KOReader's document rendering engine natively renders `0_Live_Meetings.html` with full CSS support (large legible desk typography, extra bold weights, inverted badges).
- No modern browser JS dependencies or complex runtime requirements.

### 3. Background Sync: KOReader Plugin (`deskcalendar.koplugin`)
Located in `koreader_plugin/deskcalendar.koplugin/` (installed on Kindle at `/mnt/us/koreader/plugins/deskcalendar.koplugin/`):
- Prevents Kindle screen sleep (`lipc-set-prop com.lab126.powerd preventScreenSaver 1`).
- Ensures Wi-Fi stays awake before network requests (`lipc-set-prop com.lab126.cmd wirelessEnable 1`).
- Fetches fresh HTML silently using `curl` with non-blocking timeouts (`-m 10`).
- Dispatches a document `Reload` event to KOReader to refresh the e-ink screen hands-free.

---

## 🚀 Quick Setup & Deployment

### Step 1: Deploy Google Apps Script
1. Go to **[script.google.com](https://script.google.com)** and create a new project.
2. Paste the contents of [`google_apps_script/Code.gs`](google_apps_script/Code.gs).
3. (Optional) Select your preferred template on Line 9 (`swiss`, `editorial`, `nordic`, or `cyberdeck`).
4. Click **Deploy → New deployment**:
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the generated Web App URL (or create a shortlink via TinyURL).

### Step 2: Install KOReader Plugin on Kindle
1. Plug Kindle via USB.
2. Copy `koreader_plugin/deskcalendar.koplugin` to `/Volumes/Kindle/koreader/plugins/`.
3. In `deskcalendar.koplugin/main.lua`, update the `curl` URL to your Google Apps Script URL.
4. Eject Kindle and launch KOReader.
5. In KOReader, open **`0_Live_Meetings.html`**. The screen will automatically refresh on schedule!

---

## 🔮 Future Roadmap (Phase 2)

* **Smart Home & Alexa Accessory Controls:** Trigger Alexa routines and smart home accessories (lighting focus modes, desk lamp toggles) via webhook triggers and touch-sensitive zones.
* **KUAL Booklet Controls:** Standalone touch dashboard via KUAL extensions (`kual_extensions/dashboard/`).
* **Interactive Touch Views:** Direct touch-driven switches between Today, 7-Day, and Smart Home controls right on the Kindle glass.

---

## 📁 Repository Structure

```text
├── google_apps_script/
│   └── Code.gs                  # Google Apps Script backend (Calendar, Weather, HTML templates)
├── koreader_plugin/
│   └── deskcalendar.koplugin/   # KOReader autonomous background sync plugin
│       ├── _meta.lua
│       └── main.lua
├── kual_extensions/             # (Phase 2) KUAL launcher extensions for accessory controls
│   └── dashboard/
├── dashboard/                   # (Reference) Standalone web dashboard mockup
└── KINDLE_DASHBOARD_SETUP.md    # Detailed configuration notes
```
