#!/bin/sh
# Native Kindle E-Ink Calendar Display using hardware eips
# Fetches plain text from your Google Apps Script and draws directly to screen (bypasses browser)

URL="https://tinyurl.com/pthapli?format=text"
TMP_FILE="/tmp/calendar_agenda.txt"

# Prevent screen from sleeping
lipc-set-prop -i com.lab126.powerd preventScreenSaver 1

eips 0 0 "Fetching your calendar over Wi-Fi..."

# Fetch plain-text agenda (following Google 302 redirects)
curl -s -L "$URL" -o "$TMP_FILE"

if [ -s "$TMP_FILE" ]; then
  # Full screen clear to prevent e-ink ghosting
  eips -c
  
  # Draw Header
  eips 1 1 "========================================"
  eips 1 2 "           TODAY'S MEETINGS             "
  eips 1 3 "========================================"
  
  row=5
  while IFS= read -r line || [ -n "$line" ]; do
    # Skip empty lines
    [ -z "$line" ] && continue
    
    # Print each meeting line (row by row)
    eips 2 "$row" "$line"
    row=$((row + 2))
    
    # Max rows for Paperwhite screen
    if [ "$row" -ge 34 ]; then
      break
    fi
  done < "$TMP_FILE"
  
  eips 1 36 "----------------------------------------"
  eips 1 37 "[ Screen Awake ] Press Power to sleep"
else
  eips 0 0 "Error: Could not reach calendar. Check Wi-Fi."
fi
