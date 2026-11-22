# Standalone Kindle Paperwhite Calendar Setup (Google Cloud - No Mac Needed)

This setup runs **100% in Google's cloud** using **Google Apps Script (free)**.
Your Mac does **not** need to stay on. The Kindle fetches and refreshes directly over Wi-Fi.

Now includes **Today's Detailed Agenda** + **7-Day Weekly View** with one-touch switching on your Kindle screen!

---

## Updating an Existing Deployment (or Creating New)

1. Open your project on **[script.google.com](https://script.google.com)**.
2. Replace all the code in `Code.gs` with the updated code from:
   * **[google_apps_script/Code.gs](file:///Users/pthapli/Desktop/Work/personal/kindle/google_apps_script/Code.gs)**
3. Press `Cmd + S` to save.
4. In the top-right corner, click **Deploy → Manage deployments**:
   * Click the **Pencil (Edit icon)** next to your active deployment.
   * Under **Version**, select **"New version"**.
   * Click **Deploy**.
5. Your existing URL will now automatically have the **Today** and **This Week** views!

---

## Features on Your Kindle Display

* **One-Touch Tabs:** Tap **[ TODAY ]** or **[ THIS WEEK ]** right on the Kindle screen to switch between today's detailed schedule and the 7-day overview.
* **Auto-Refresh:** Automatically fetches updates every 5 minutes from Google Cloud.
* **Multi-Account Support:** Add secondary calendar emails to `ADDITIONAL_CALENDARS` in `Code.gs`.
* **Zero Host Dependency:** You can shut down your Mac completely.
