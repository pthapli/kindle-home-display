#!/bin/sh
# Launches Kindle Experimental Browser directly to your TinyURL dashboard
# Path: /mnt/us/extensions/dashboard/bin/open_calendar.sh

DASHBOARD_URL="https://tinyurl.com/pthapli"

# Disable screensaver so screen stays on
lipc-set-prop -i com.lab126.powerd preventScreenSaver 1

# Launch native browser directly to your URL
lipc-set-prop com.lab126.appmgrd start "app://com.lab126.browser?${DASHBOARD_URL}"

eips 0 0 "Opening Calendar Dashboard..."
