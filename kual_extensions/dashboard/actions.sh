#!/bin/sh
# Actions script for KUAL Smart Home & Meetings extension (Alexa & Multi-Calendar)
# Path on Kindle: /mnt/us/extensions/dashboard/actions.sh

# ---- ALEXA WEBHOOK CONFIGURATION ----
# Alexa routines can be triggered via free webhook services:
# 1. Virtual Smart Home (https://www.virtualsmarthome.xyz/url_switch/)
# 2. Voice Monkey (https://voicemonkey.io)
# Paste your generated webhook URLs below:

URL_DESK_LAMP="https://api-v2.voicemonkey.io/trigger?token=YOUR_TOKEN&device=desk-lamp"
URL_MEETING_MODE="https://api-v2.voicemonkey.io/trigger?token=YOUR_TOKEN&routine=meeting-mode"
URL_ALL_OFF="https://api-v2.voicemonkey.io/trigger?token=YOUR_TOKEN&routine=all-off"

ACTION="$1"

case "$ACTION" in
  toggle_desk_lamp)
    curl -s "$URL_DESK_LAMP" > /dev/null 2>&1 &
    eips 0 0 "Alexa: Desk Lamp Toggled"
    ;;
    
  meeting_mode)
    curl -s "$URL_MEETING_MODE" > /dev/null 2>&1 &
    eips 0 0 "Alexa: Meeting Mode (Focus) Active"
    ;;
    
  all_off)
    curl -s "$URL_ALL_OFF" > /dev/null 2>&1 &
    eips 0 0 "Alexa: All Lights Turned Off"
    ;;
    
  nosleep)
    # Native Kindle power management override (keeps display awake)
    lipc-set-prop -i com.lab126.powerd preventScreenSaver 1
    eips 0 0 "Screen Saver Disabled (No Sleep)"
    ;;
    
  sleep)
    # Restores normal power saving
    lipc-set-prop -i com.lab126.powerd preventScreenSaver 0
    eips 0 0 "Screen Saver Restored"
    ;;
    
  *)
    echo "Usage: $0 {toggle_desk_lamp|meeting_mode|all_off|nosleep|sleep}"
    ;;
esac
