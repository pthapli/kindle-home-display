#!/bin/sh
# E-ink Meeting Board Refresh Loop for Kindle (KUAL)
# Fetches an optimized meeting board PNG and renders directly to e-ink screen via eips

PID_FILE="/tmp/kindle_dashboard_loop.pid"
IMAGE_URL="http://192.168.1.100:8080/meetings.png"
LOCAL_IMAGE="/tmp/meetings.png"
INTERVAL=300 # refresh every 5 minutes (300 seconds)

start_dashboard() {
  if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    eips 0 0 "Dashboard is already running"
    return
  fi

  eips -c
  eips 0 0 "Starting Meeting Board..."

  # Run loop in background
  (
    while true; do
      # Fetch latest meeting display image from your Mac/Server
      if curl -s -f -o "$LOCAL_IMAGE" "$IMAGE_URL"; then
        eips -c
        eips -g "$LOCAL_IMAGE"
      else
        eips 0 0 "Failed to fetch $IMAGE_URL"
      fi
      sleep "$INTERVAL"
    done
  ) &

  echo $! > "$PID_FILE"
  eips 0 1 "Meeting Board Active (PID: $(cat "$PID_FILE"))"
}

stop_dashboard() {
  if [ -f "$PID_FILE" ]; then
    kill "$(cat "$PID_FILE")" 2>/dev/null
    rm -f "$PID_FILE"
    eips -c
    eips 0 0 "Meeting Board Stopped"
  else
    eips 0 0 "No running dashboard found"
  fi
}

case "$1" in
  start)
    start_dashboard
    ;;
  stop)
    stop_dashboard
    ;;
  *)
    echo "Usage: $0 {start|stop}"
    ;;
esac
