#!/bin/sh
# Background Sync Helper for Kindle Desk Calendar
# Wakes Wi-Fi and fetches schedule with strict non-blocking timeouts

# 1. Wake Wi-Fi and keep power alive
lipc-set-prop com.lab126.cmd wirelessEnable 1
lipc-set-prop -i com.lab126.powerd preventScreenSaver 1

# 2. Fetch schedule from Google Cloud (Strict 8s connect, 12s max duration)
curl -s --connect-timeout 8 -m 12 -L 'https://tinyurl.com/pthapli?format=text' -o /tmp/fresh_cal.txt

# 3. If valid data was received, update target files and drop flag for KOReader
if [ -s /tmp/fresh_cal.txt ]; then
  cp /tmp/fresh_cal.txt /mnt/us/0_Live_Meetings.txt
  cp /tmp/fresh_cal.txt /mnt/us/documents/0_Live_Meetings.txt
  touch /tmp/cal_updated.flag
fi
