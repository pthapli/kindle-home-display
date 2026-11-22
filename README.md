# Kindle Paperwhite (KUAL & KOReader) Workspace

This directory contains ready-to-deploy extensions and configurations to turn your jailbroken Kindle Paperwhite (with **KUAL** and **KOReader**) into an interactive desk display for meetings and smart home accessories.

---

## 1. Quick Install: KUAL Smart Home & Meetings Extension

We prepared a ready-to-copy extension under `kual_extensions/dashboard/`.

### Installation Steps:
1. Make sure your Kindle is plugged into your Mac.
2. Copy the `kual_extensions/dashboard` folder directly to `/Volumes/Kindle/extensions/`:
   ```bash
   cp -r kual_extensions/dashboard /Volumes/Kindle/extensions/
   ```
3. Safely eject the Kindle from your Mac.
4. Open **KUAL** on your Kindle. You will now see **Smart Home & Meetings** with one-tap buttons:
   * **Toggle Desk Lamp**
   * **Meeting Mode (Focus)**
   * **All Lights Off**
   * **Start Meeting Board** (auto-refreshing E-ink screen loop)
   * **Keep Screen Awake (No Sleep)**

---

## 2. Using KOReader for Meeting Display

If you prefer using KOReader:
* **Mac Mirroring via VNC:** Enable the `vnc.koplugin` inside KOReader (**Tools** → **Plugin management** → **VNC**) to mirror your Mac's calendar or meeting window directly to your Kindle screen.
* **Keep Screen Awake:** In KOReader, tap top menu → **Settings (gear icon)** → **Device** → **Screen** → **Screen timeout** → Set to **Never**.

---

## 3. Detailed Guide & Configuration
* See [KINDLE_DASHBOARD_SETUP.md](file:///Users/pthapli/Desktop/Work/personal/kindle/KINDLE_DASHBOARD_SETUP.md) for full architecture details, Home Assistant tokens, and screen refresh tuning.
