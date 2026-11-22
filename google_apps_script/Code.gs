/**
 * E-Ink Desk Calendar & Weather HUD - Google Apps Script
 * High-Readability Minimalist Templates for Kindle Paperwhite (KOReader)
 */

// Choose your default minimalist template:
// Options: "swiss" (Recommended), "editorial", "nordic", "cyberdeck"
// You can also override dynamically via URL: ?style=swiss (or editorial, nordic, cyberdeck)
const DEFAULT_STYLE = "swiss";

const CITY_NAME = "DEHRADUN";
const LATITUDE = 30.3165;
const LONGITUDE = 78.0322;

const ADDITIONAL_CALENDARS = [
  // "work_email@company.com",
];

function doGet(e) {
  const params = (e && e.parameter) || {};
  const format = (params.format || "html").toLowerCase();
  const style = (params.style || DEFAULT_STYLE).toLowerCase();

  const weekData = getWeeklyEvents();
  const weather = getWeatherData();

  // Plain-Text ASCII mode if explicitly requested
  if (format === "text") {
    const text = renderHackerText(weekData, weather);
    return ContentService.createTextOutput(text)
      .setMimeType(ContentService.MimeType.TEXT);
  }

  if (format === "json") {
    return ContentService.createTextOutput(JSON.stringify({ weekData, weather }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // HTML Minimalist Templates
  let html = "";
  if (style === "editorial") {
    html = renderEditorialHtml(weekData, weather);
  } else if (style === "nordic") {
    html = renderNordicHtml(weekData, weather);
  } else if (style === "cyberdeck") {
    html = renderCyberdeckHtml(weekData, weather);
  } else {
    // "swiss" is the default clean minimalist template
    html = renderSwissHtml(weekData, weather);
  }

  return ContentService.createTextOutput(html)
    .setMimeType(ContentService.MimeType.TEXT);
}

function getWeatherData() {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=Asia/Kolkata`;
    const resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const data = JSON.parse(resp.getContentText());

    if (data && data.current) {
      const cur = data.current;
      const daily = data.daily || {};
      const maxT = (daily.temperature_2m_max && daily.temperature_2m_max[0] != null) ? Math.round(daily.temperature_2m_max[0]) : "--";
      const minT = (daily.temperature_2m_min && daily.temperature_2m_min[0] != null) ? Math.round(daily.temperature_2m_min[0]) : "--";
      const temp = Math.round(cur.temperature_2m);
      const feels = Math.round(cur.apparent_temperature);
      const hum = Math.round(cur.relative_humidity_2m);
      const wind = Math.round(cur.wind_speed_10m);
      const desc = parseWeatherCode(cur.weather_code);
      let sunrise = "--:--";
      let sunset = "--:--";
      if (daily.sunrise && daily.sunrise[0]) sunrise = daily.sunrise[0].substring(11, 16);
      if (daily.sunset && daily.sunset[0]) sunset = daily.sunset[0].substring(11, 16);

      return { temp, feels, hum, wind, maxT, minT, desc, sunrise, sunset };
    }
  } catch (err) {
    Logger.log("Weather error: " + err);
  }
  return null;
}

function parseWeatherCode(code) {
  if (code === 0) return "CLEAR SKY";
  if (code === 1 || code === 2) return "PARTLY CLOUDY";
  if (code === 3) return "OVERCAST";
  if (code >= 45 && code <= 48) return "FOG / HAZE";
  if (code >= 51 && code <= 55) return "LIGHT DRIZZLE";
  if (code >= 61 && code <= 65) return "RAIN PRECIP";
  if (code >= 71 && code <= 77) return "SNOW PRECIP";
  if (code >= 80 && code <= 82) return "RAIN SHOWERS";
  if (code >= 95) return "THUNDERSTORM";
  return "STABLE";
}

// ============================================================================
// TEMPLATE 1: THE SWISS / BAUHAUS MINIMALIST (Clean, Large, Elegant Grid)
// ============================================================================
function renderSwissHtml(weekData, weather) {
  const now = new Date();
  const timeStr = formatHackerTime(now);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const fullDate = days[now.getDay()] + ', ' + now.getDate() + ' ' + months[now.getMonth()];

  let wxInfo = "";
  if (weather) {
    wxInfo = `
      <div class="swiss-wx">
        <span class="swiss-temp">${weather.temp}°C</span>
        <span class="swiss-desc">${weather.desc}</span>
        <div class="swiss-sub">Feels ${weather.feels}°C &bull; High ${weather.maxT}° / Low ${weather.minT}° &bull; Hum ${weather.hum}% &bull; Wind ${weather.wind} km/h</div>
      </div>
    `;
  } else {
    wxInfo = `<div class="swiss-wx"><span class="swiss-desc">WEATHER TELEMETRY OFFLINE</span></div>`;
  }

  // Today
  const today = weekData[0];
  let todayHtml = "";
  if (today.events.length === 0) {
    todayHtml = `<div class="swiss-empty">No meetings scheduled for today &mdash; Deep focus mode</div>`;
  } else {
    today.events.forEach(ev => {
      todayHtml += `
        <div class="swiss-event-row">
          <span class="swiss-event-time">${ev.time}</span>
          <span class="swiss-event-title">${ev.title}</span>
        </div>`;
    });
  }

  // Upcoming
  let upcomingHtml = "";
  let hasUpcoming = false;
  for (let i = 1; i < weekData.length; i++) {
    const day = weekData[i];
    if (day.events.length > 0) {
      hasUpcoming = true;
      upcomingHtml += `<div class="swiss-day-header">${day.dayShort.toUpperCase()} &bull; ${day.dateStr}</div>`;
      day.events.forEach(ev => {
        upcomingHtml += `
          <div class="swiss-event-row">
            <span class="swiss-event-time">${ev.time}</span>
            <span class="swiss-event-title">${ev.title}</span>
          </div>`;
      });
    }
  }

  if (!hasUpcoming) {
    upcomingHtml = `<div class="swiss-empty">No upcoming events scheduled for the next 7 days</div>`;
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @page { margin: 0; size: auto; }
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0; width: 100%;
    background: #ffffff; color: #000000;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }
  .swiss-container {
    padding: 10px 16px 8px 16px;
    width: 100%;
  }
  .swiss-top-bar {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-bottom: 3px solid #000000;
    padding-bottom: 6px;
    margin-bottom: 8px;
  }
  .swiss-clock {
    font-size: 56px;
    font-weight: 900;
    letter-spacing: -1px;
    line-height: 1;
  }
  .swiss-meta {
    text-align: right;
  }
  .swiss-city {
    font-size: 18px;
    font-weight: 800;
    letter-spacing: 2px;
  }
  .swiss-date {
    font-size: 16px;
    font-weight: 700;
    color: #222222;
  }
  .swiss-wx {
    margin-bottom: 12px;
  }
  .swiss-temp {
    font-size: 42px;
    font-weight: 900;
    letter-spacing: -1px;
    margin-right: 12px;
    display: inline-block;
    vertical-align: middle;
  }
  .swiss-desc {
    font-size: 22px;
    font-weight: 800;
    display: inline-block;
    vertical-align: middle;
  }
  .swiss-sub {
    font-size: 15px;
    font-weight: 700;
    color: #333333;
    margin-top: 4px;
  }
  .swiss-section-title {
    font-size: 22px;
    font-weight: 900;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    border-top: 2px solid #000000;
    border-bottom: 1px solid #000000;
    padding: 4px 0;
    margin: 10px 0 6px 0;
  }
  .swiss-event-row {
    padding: 5px 0;
    border-bottom: 1px solid #e0e0e0;
    font-size: 18px;
    line-height: 1.3;
  }
  .swiss-event-time {
    font-weight: 900;
    font-size: 18px;
    display: inline-block;
    min-width: 140px;
  }
  .swiss-event-title {
    font-weight: 700;
    font-size: 18px;
  }
  .swiss-day-header {
    font-size: 16px;
    font-weight: 900;
    letter-spacing: 1px;
    margin-top: 8px;
    padding-bottom: 2px;
    color: #111111;
  }
  .swiss-empty {
    font-size: 17px;
    font-style: italic;
    color: #444444;
    padding: 8px 0;
  }
  .swiss-footer {
    border-top: 1px solid #000000;
    margin-top: 12px;
    padding-top: 4px;
    font-size: 12px;
    font-weight: 800;
    display: flex;
    justify-content: space-between;
  }
</style>
</head>
<body>
<div class="swiss-container">
  <div class="swiss-top-bar">
    <div class="swiss-clock">${timeStr}</div>
    <div class="swiss-meta">
      <div class="swiss-city">${CITY_NAME}</div>
      <div class="swiss-date">${fullDate}</div>
    </div>
  </div>

  ${wxInfo}

  <div class="swiss-section-title">TODAY'S SCHEDULE</div>
  ${todayHtml}

  <div class="swiss-section-title">UPCOMING AGENDA</div>
  ${upcomingHtml}

  <div class="swiss-footer">
    <span>E-INK DESK DISPLAY &bull; ${CITY_NAME}</span>
    <span>AUTO-REFRESH: 120s</span>
  </div>
</div>
</body>
</html>`;
}

// ============================================================================
// TEMPLATE 2: THE EDITORIAL / BROADSHEET (Newspaper Masthead Style)
// ============================================================================
function renderEditorialHtml(weekData, weather) {
  const now = new Date();
  const timeStr = formatHackerTime(now);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const fullDate = days[now.getDay()] + ', ' + now.getDate() + ' ' + months[now.getMonth()];

  let wxLine = "";
  if (weather) {
    wxLine = `Dehradun: ${weather.temp}°C, ${weather.desc} &bull; High: ${weather.maxT}°C / Low: ${weather.minT}°C &bull; Humidity: ${weather.hum}% &bull; Sunrise: ${weather.sunrise} &bull; Sunset: ${weather.sunset}`;
  } else {
    wxLine = `Dehradun Telemetry Offline`;
  }

  // Today
  const today = weekData[0];
  let todayHtml = "";
  if (today.events.length === 0) {
    todayHtml = `<p class="ed-empty">&mdash; No formal engagements scheduled for today. Deep research &amp; focus mode active.</p>`;
  } else {
    today.events.forEach(ev => {
      todayHtml += `
        <div class="ed-event">
          <span class="ed-time">${ev.time}</span>
          <span class="ed-title">${ev.title}</span>
        </div>`;
    });
  }

  // Upcoming
  let upcomingHtml = "";
  let hasUpcoming = false;
  for (let i = 1; i < weekData.length; i++) {
    const day = weekData[i];
    if (day.events.length > 0) {
      hasUpcoming = true;
      upcomingHtml += `<div class="ed-day-tag">${day.dayShort.toUpperCase()} &mdash; ${day.dateStr}</div>`;
      day.events.forEach(ev => {
        upcomingHtml += `
          <div class="ed-event">
            <span class="ed-time">${ev.time}</span>
            <span class="ed-title">${ev.title}</span>
          </div>`;
      });
    }
  }

  if (!hasUpcoming) {
    upcomingHtml = `<p class="ed-empty">&mdash; No scheduled agenda items for the forthcoming week.</p>`;
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @page { margin: 0; size: auto; }
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0; width: 100%;
    background: #ffffff; color: #000000;
    font-family: Georgia, "Times New Roman", Times, serif;
  }
  .ed-container {
    padding: 10px 14px 6px 14px;
    width: 100%;
  }
  .ed-masthead {
    text-align: center;
    border-top: 3px solid #000000;
    border-bottom: 1px solid #000000;
    padding: 6px 0 4px 0;
    margin-bottom: 4px;
  }
  .ed-title {
    font-size: 32px;
    font-weight: 900;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin: 0;
    line-height: 1;
  }
  .ed-meta-bar {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    font-style: italic;
    border-bottom: 1px solid #000000;
    padding: 3px 0;
    margin-bottom: 8px;
  }
  .ed-weather-banner {
    font-size: 15px;
    font-weight: 600;
    font-style: italic;
    text-align: center;
    border-bottom: 2px solid #000000;
    padding-bottom: 6px;
    margin-bottom: 10px;
  }
  .ed-section-head {
    font-size: 22px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 2px solid #000000;
    padding-bottom: 2px;
    margin: 10px 0 6px 0;
  }
  .ed-event {
    padding: 5px 0;
    border-bottom: 1px dotted #888888;
    font-size: 18px;
    line-height: 1.3;
  }
  .ed-time {
    font-weight: 900;
    font-size: 18px;
    display: inline-block;
    min-width: 140px;
  }
  .ed-title {
    font-size: 18px;
  }
  .ed-day-tag {
    font-size: 17px;
    font-weight: 900;
    letter-spacing: 1px;
    margin-top: 8px;
    padding-bottom: 2px;
    border-bottom: 1px solid #000000;
    display: inline-block;
  }
  .ed-empty {
    font-size: 17px;
    font-style: italic;
    margin: 8px 0;
    color: #333333;
  }
  .ed-footer {
    border-top: 3px double #000000;
    margin-top: 14px;
    padding-top: 4px;
    font-size: 12px;
    font-style: italic;
    display: flex;
    justify-content: space-between;
  }
</style>
</head>
<body>
<div class="ed-container">
  <div class="ed-masthead">
    <h1 class="ed-title">The ${CITY_NAME} Chronicle</h1>
  </div>
  <div class="ed-meta-bar">
    <span>${fullDate}</span>
    <span>Edition: Live Desk HUD</span>
    <span>Current Time: <b>${timeStr}</b></span>
  </div>

  <div class="ed-weather-banner">${wxLine}</div>

  <div class="ed-section-head">Today's Engagements</div>
  ${todayHtml}

  <div class="ed-section-head">Upcoming Agenda &bull; Next 7 Days</div>
  ${upcomingHtml}

  <div class="ed-footer">
    <span>Published live to Kindle Paperwhite</span>
    <span>Synchronized every 2 minutes</span>
  </div>
</div>
</body>
</html>`;
}

// ============================================================================
// TEMPLATE 3: THE NORDIC / SCANDINAVIAN ZEN (Muji / Clean Rounded Cards)
// ============================================================================
function renderNordicHtml(weekData, weather) {
  const now = new Date();
  const timeStr = formatHackerTime(now);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateShort = days[now.getDay()] + ', ' + now.getDate() + ' ' + months[now.getMonth()];

  let wxBlock = "";
  if (weather) {
    wxBlock = `
      <div class="nordic-card">
        <div class="nordic-hero-row">
          <div>
            <div class="nordic-city">${CITY_NAME} &bull; ${dateShort}</div>
            <div class="nordic-clock">${timeStr}</div>
          </div>
          <div style="text-align: right;">
            <div class="nordic-temp">${weather.temp}°C</div>
            <div class="nordic-cond">${weather.desc}</div>
          </div>
        </div>
        <div class="nordic-divider"></div>
        <div class="nordic-subtext">
          Feels ${weather.feels}°C &nbsp;|&nbsp; High ${weather.maxT}° &nbsp;|&nbsp; Low ${weather.minT}° &nbsp;|&nbsp; Hum ${weather.hum}% &nbsp;|&nbsp; Wind ${weather.wind} km/h
        </div>
      </div>
    `;
  } else {
    wxBlock = `
      <div class="nordic-card">
        <div class="nordic-city">${CITY_NAME} &bull; ${dateShort} &bull; ${timeStr}</div>
        <div class="nordic-cond">Weather Telemetry Standby</div>
      </div>
    `;
  }

  // Today
  const today = weekData[0];
  let todayHtml = "";
  if (today.events.length === 0) {
    todayHtml = `<div class="nordic-empty">Clean slate today &mdash; focus and deep work</div>`;
  } else {
    today.events.forEach(ev => {
      todayHtml += `
        <div class="nordic-item">
          <span class="nordic-time">${ev.time}</span>
          <span class="nordic-title">${ev.title}</span>
        </div>`;
    });
  }

  // Upcoming
  let upcomingHtml = "";
  let hasUpcoming = false;
  for (let i = 1; i < weekData.length; i++) {
    const day = weekData[i];
    if (day.events.length > 0) {
      hasUpcoming = true;
      upcomingHtml += `<div class="nordic-day-pill">${day.dayShort.toUpperCase()} &bull; ${day.dateStr}</div>`;
      day.events.forEach(ev => {
        upcomingHtml += `
          <div class="nordic-item">
            <span class="nordic-time">${ev.time}</span>
            <span class="nordic-title">${ev.title}</span>
          </div>`;
      });
    }
  }

  if (!hasUpcoming) {
    upcomingHtml = `<div class="nordic-empty">No upcoming events on radar</div>`;
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @page { margin: 0; size: auto; }
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0; width: 100%;
    background: #ffffff; color: #000000;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  }
  .nordic-container {
    padding: 8px 12px;
    width: 100%;
  }
  .nordic-card {
    border: 2px solid #000000;
    border-radius: 8px;
    padding: 10px 14px;
    margin-bottom: 8px;
    background: #ffffff;
  }
  .nordic-hero-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .nordic-city {
    font-size: 16px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .nordic-clock {
    font-size: 50px;
    font-weight: 900;
    line-height: 1;
  }
  .nordic-temp {
    font-size: 50px;
    font-weight: 900;
    line-height: 1;
  }
  .nordic-cond {
    font-size: 16px;
    font-weight: 800;
    margin-top: 2px;
  }
  .nordic-divider {
    border-bottom: 1px solid #000000;
    margin: 8px 0 6px 0;
  }
  .nordic-subtext {
    font-size: 14px;
    font-weight: 700;
    color: #222222;
  }
  .nordic-card-title {
    font-size: 18px;
    font-weight: 900;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .nordic-item {
    padding: 5px 0;
    border-bottom: 1px solid #f0f0f0;
    font-size: 18px;
  }
  .nordic-time {
    font-weight: 900;
    font-size: 18px;
    display: inline-block;
    min-width: 130px;
  }
  .nordic-title {
    font-weight: 700;
    font-size: 18px;
  }
  .nordic-day-pill {
    font-size: 15px;
    font-weight: 900;
    background: #000000;
    color: #ffffff;
    padding: 2px 8px;
    border-radius: 4px;
    display: inline-block;
    margin: 6px 0 4px 0;
  }
  .nordic-empty {
    font-size: 16px;
    font-style: italic;
    color: #444444;
    padding: 4px 0;
  }
  .nordic-footer {
    text-align: center;
    font-size: 12px;
    font-weight: 800;
    color: #555555;
    margin-top: 8px;
  }
</style>
</head>
<body>
<div class="nordic-container">
  ${wxBlock}

  <div class="nordic-card">
    <div class="nordic-card-title">Today's Schedule</div>
    ${todayHtml}
  </div>

  <div class="nordic-card">
    <div class="nordic-card-title">Upcoming Week</div>
    ${upcomingHtml}
  </div>

  <div class="nordic-footer">
    ${CITY_NAME} Desk Display &bull; Sync 120s
  </div>
</div>
</body>
</html>`;
}

// ============================================================================
// TEMPLATE 4: THE CYBERDECK TERMINAL (Monospace Hacker HUD)
// ============================================================================
function renderCyberdeckHtml(weekData, weather) {
  const now = new Date();
  const timeStr = formatHackerTime(now);
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const dateStr = days[now.getDay()] + ' ' + now.getDate() + '.' + months[now.getMonth()];

  let wxHtml = "";
  if (weather) {
    wxHtml = `
      <div class="wx-box">
        <div class="wx-main">
          <span class="temp-huge">${weather.temp}°C</span>
          <div class="wx-title">
            <span class="wx-condition">${weather.desc}</span>
            <div class="wx-feels">FEELS LIKE ${weather.feels}°C</div>
          </div>
        </div>
        <div class="wx-metrics">
          <div class="metric"><b>HUMIDITY:</b> ${weather.hum}%</div>
          <div class="metric"><b>WIND:</b> ${weather.wind} KM/H</div>
          <div class="metric"><b>HIGH / LOW:</b> ${weather.maxT}°C / ${weather.minT}°C</div>
          <div class="metric"><b>SUN:</b> ${weather.sunrise} &rarr; ${weather.sunset}</div>
        </div>
      </div>
    `;
  } else {
    wxHtml = `<div class="idle-box">WX TELEMETRY OFFLINE // SENSOR LINK PENDING</div>`;
  }

  // 7-day mini radar strip
  let stripHtml = `<div class="radar-strip">`;
  weekData.forEach((day, idx) => {
    const isToday = idx === 0;
    const count = day.events.length;
    const tag = isToday ? "TODAY" : day.dayShort.toUpperCase();
    stripHtml += `
      <div class="strip-item ${isToday ? 'strip-today' : ''}">
        <div class="strip-day">${tag}</div>
        <div class="strip-val">${count > 0 ? count + ' OPS' : '---'}</div>
      </div>
    `;
  });
  stripHtml += `</div>`;

  // Today Operations
  const today = weekData[0];
  let todayHtml = "";
  if (today.events.length === 0) {
    todayHtml = `
      <div class="idle-box">
        &gt;&gt; NO ACTIVE MEETINGS SCHEDULED FOR TODAY<br>
        <span class="sub-idle">[STANDBY STATUS // DEEP FOCUS WORK MODE]</span>
      </div>`;
  } else {
    today.events.forEach(ev => {
      todayHtml += `
        <div class="event-card">
          <span class="ev-time">[${ev.time}]</span>
          <span class="ev-title">${ev.title}</span>
        </div>`;
    });
  }

  // Upcoming Radar
  let upcomingHtml = "";
  let hasUpcoming = false;
  for (let i = 1; i < weekData.length; i++) {
    const day = weekData[i];
    if (day.events.length > 0) {
      hasUpcoming = true;
      upcomingHtml += `
        <div class="day-group">
          <div class="day-label"><span class="day-tag">${day.dayShort.toUpperCase()} &bull; ${day.dateStr}</span></div>
          <div class="day-events">
      `;
      day.events.forEach(ev => {
        upcomingHtml += `
          <div class="event-card">
            <span class="ev-time">[${ev.time}]</span>
            <span class="ev-title">${ev.title}</span>
          </div>`;
      });
      upcomingHtml += `</div></div>`;
    }
  }

  if (!hasUpcoming) {
    upcomingHtml = `<div class="idle-box">&gt;&gt; RADAR SILENT // ZERO UPCOMING OPS FOR 7 DAYS</div>`;
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @page { margin: 0; size: auto; }
  * { box-sizing: border-box; }
  html, body {
    width: 100%;
    margin: 0;
    padding: 0;
    background: #ffffff;
    color: #000000;
    font-family: "DejaVu Sans Mono", "Courier New", Courier, monospace;
    -webkit-text-size-adjust: 100%;
  }
  .page-wrapper {
    padding: 8px 12px 6px 12px;
    width: 100%;
  }
  .hud-box {
    border: 3px solid #000000;
    padding: 8px 12px;
    margin-bottom: 8px;
    background: #ffffff;
  }
  .hud-title-bar {
    border-bottom: 2px solid #000000;
    padding-bottom: 4px;
    margin-bottom: 6px;
    overflow: hidden;
  }
  .node-title {
    font-size: 26px;
    font-weight: 900;
    letter-spacing: 1px;
    display: inline-block;
  }
  .status-badge {
    background: #000000;
    color: #ffffff;
    font-size: 14px;
    font-weight: 900;
    padding: 2px 8px;
    float: right;
    letter-spacing: 1px;
  }
  .time-line {
    font-size: 16px;
    font-weight: 800;
    margin-bottom: 6px;
  }
  .wx-box {
    border-top: 1px solid #000000;
    padding-top: 6px;
  }
  .wx-main {
    margin-bottom: 6px;
    overflow: hidden;
  }
  .temp-huge {
    font-size: 54px;
    font-weight: 900;
    letter-spacing: -2px;
    float: left;
    margin-right: 14px;
    line-height: 1;
  }
  .wx-title {
    padding-top: 4px;
  }
  .wx-condition {
    font-size: 22px;
    font-weight: 900;
    display: block;
  }
  .wx-feels {
    font-size: 14px;
    font-weight: 800;
    color: #333333;
    margin-top: 2px;
  }
  .wx-metrics {
    clear: both;
    display: table;
    width: 100%;
    font-size: 14px;
    font-weight: 800;
    border-top: 1px dashed #000000;
    padding-top: 4px;
    margin-top: 4px;
  }
  .metric {
    display: inline-block;
    width: 48%;
    padding: 2px 0;
  }
  .banner {
    background: #000000;
    color: #ffffff;
    font-size: 19px;
    font-weight: 900;
    padding: 3px 8px;
    margin: 8px 0 6px 0;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .event-card {
    border-left: 5px solid #000000;
    background: #fbfbfb;
    padding: 5px 8px;
    margin: 4px 0;
    font-size: 17px;
    line-height: 1.25;
  }
  .ev-time {
    font-weight: 900;
    font-size: 17px;
    margin-right: 6px;
    display: inline-block;
  }
  .ev-title {
    font-weight: 800;
    font-size: 17px;
  }
  .day-group {
    margin: 6px 0 4px 0;
  }
  .day-label {
    margin-bottom: 2px;
  }
  .day-tag {
    font-size: 15px;
    font-weight: 900;
    border-bottom: 2px solid #000000;
    padding-bottom: 1px;
    display: inline-block;
  }
  .idle-box {
    border: 2px dashed #000000;
    padding: 8px 10px;
    font-size: 15px;
    font-weight: 800;
    margin: 4px 0;
  }
  .sub-idle {
    font-size: 13px;
    font-weight: bold;
    color: #444444;
  }
  .radar-strip {
    display: table;
    width: 100%;
    table-layout: fixed;
    margin: 6px 0;
    border: 1px solid #000000;
    border-collapse: collapse;
  }
  .strip-item {
    display: table-cell;
    text-align: center;
    padding: 3px 1px;
    border-right: 1px solid #000000;
    font-size: 12px;
  }
  .strip-item:last-child {
    border-right: none;
  }
  .strip-today {
    background: #000000;
    color: #ffffff;
  }
  .strip-day {
    font-weight: 900;
    font-size: 12px;
  }
  .strip-val {
    font-weight: 800;
    font-size: 11px;
  }
  .telemetry-footer {
    border-top: 2px solid #000000;
    margin-top: 8px;
    padding-top: 4px;
    font-size: 11px;
    font-weight: 800;
    line-height: 1.3;
  }
</style>
</head>
<body>
<div class="page-wrapper">
  <div class="hud-box">
    <div class="hud-title-bar">
      <span class="node-title">CYBERDECK // ${CITY_NAME}.NODE</span>
      <span class="status-badge">ONLINE</span>
    </div>
    <div class="time-line">TIME: <b>${dateStr} // ${timeStr} IST</b></div>
    ${wxHtml}
  </div>

  <div class="banner">[#] ACTIVE OPERATIONS // TODAY</div>
  ${todayHtml}

  <div class="banner">[#] INTEL RADAR // UPCOMING WEEK</div>
  ${stripHtml}
  ${upcomingHtml}

  <div class="telemetry-footer">
    <b>[NODE: ${CITY_NAME}]</b> &bull; LAT: ${LATITUDE}°N, LON: ${LONGITUDE}°E &bull; SYNC: 120s HANDS-FREE<br>
    KOReader DeskDisplay v2.0 &bull; E-INK HIGH CONTRAST HUD &bull; ALL SYSTEMS NOMINAL
  </div>
</div>
</body>
</html>`;
}

// Plain-text ASCII fallback
function renderHackerText(weekData, weather) {
  const now = new Date();
  const timeStr = formatHackerTime(now);
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const dateStr = days[now.getDay()] + ' ' + now.getDate() + '.' + months[now.getMonth()];

  let out = "+--[ DESK // " + CITY_NAME + " ]---------+\n";
  out += "| TIME: " + dateStr + " // " + timeStr + " |\n";
  if (weather) {
    out += "| WX  : " + weather.temp + "C (" + weather.desc + ")\n";
  }
  out += "+---------------------------------+\n\n";

  const today = weekData[0];
  out += "[ TODAY'S AGENDA ]\n";
  if (today.events.length === 0) {
    out += " >> No active meetings today\n\n";
  } else {
    today.events.forEach(ev => {
      out += " >> " + ev.time + " :: " + ev.title + "\n";
    });
    out += "\n";
  }

  out += "[ UPCOMING WEEK ]\n";
  for (let i = 1; i < weekData.length; i++) {
    const day = weekData[i];
    if (day.events.length > 0) {
      out += " " + day.dayShort.toUpperCase() + " " + day.dateStr.toUpperCase() + "\n";
      day.events.forEach(ev => {
        out += "   " + ev.time + " -> " + ev.title + "\n";
      });
    }
  }

  return out;
}

function getWeeklyEvents() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOf7Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 23, 59, 59);

  let rawEvents = [];

  try {
    const primaryCal = CalendarApp.getDefaultCalendar();
    if (primaryCal) {
      rawEvents = rawEvents.concat(fetchEvents(primaryCal, startOfToday, endOf7Days));
    }
  } catch (err) {
    Logger.log("Calendar error: " + err);
  }

  ADDITIONAL_CALENDARS.forEach(calId => {
    try {
      const cal = CalendarApp.getCalendarById(calId);
      if (cal) {
        rawEvents = rawEvents.concat(fetchEvents(cal, startOfToday, endOf7Days));
      }
    } catch (err) {
      Logger.log("Calendar " + calId + " error: " + err);
    }
  });

  rawEvents.sort((a, b) => a.startEpoch - b.startEpoch);

  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const dayEvents = rawEvents.filter(ev => {
      const evD = new Date(ev.startEpoch);
      return evD.getFullYear() === d.getFullYear() &&
             evD.getMonth() === d.getMonth() &&
             evD.getDate() === d.getDate();
    });

    days.push({
      isToday: i === 0,
      dayShort: dayNames[d.getDay()],
      dateStr: `${d.getDate()}.${monthNames[d.getMonth()]}`,
      events: dayEvents
    });
  }

  return days;
}

function fetchEvents(calendar, start, end) {
  const events = calendar.getEvents(start, end);
  return events.map(ev => {
    const isAllDay = ev.isAllDayEvent();
    let timeStr = "ALL DAY";
    let startEpoch = ev.getStartTime().getTime();

    if (!isAllDay) {
      const s = ev.getStartTime();
      const e = ev.getEndTime();
      timeStr = formatMilitaryTime(s) + "-" + formatMilitaryTime(e);
    }

    return {
      title: ev.getTitle() || "(UNTITLED)",
      time: timeStr,
      startEpoch: startEpoch
    };
  });
}

function formatMilitaryTime(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return hours + ":" + minutes;
}

function formatHackerTime(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return hours + ":" + minutes;
}
