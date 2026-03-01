"""
weather.py — Fetches weather from Open-Meteo for Chicago and returns alert logic.
No API key required.
"""

import requests

CHICAGO_LAT = 41.8781
CHICAGO_LON = -87.6298
OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

WMO_CODES = {
    0: "Clear Sky",        1: "Mainly Clear",      2: "Partly Cloudy",    3: "Overcast",
    45: "Foggy",           48: "Icy Fog",
    51: "Light Drizzle",   53: "Moderate Drizzle", 55: "Dense Drizzle",
    61: "Slight Rain",     63: "Moderate Rain",    65: "Heavy Rain",
    71: "Slight Snow",     73: "Moderate Snow",    75: "Heavy Snow",      77: "Snow Grains",
    80: "Rain Showers",    81: "Heavy Rain Showers", 82: "Violent Rain Showers",
    85: "Slight Snow Showers", 86: "Heavy Snow Showers",
    95: "Thunderstorm",    96: "Thunderstorm with Hail", 99: "Severe Thunderstorm",
}


def fetch_weather() -> dict:
    """
    Fetch current weather for Chicago from Open-Meteo.
    Returns dict with temp, condition, rain, snow, wind, and alert_message.
    """
    try:
        params = {
            "latitude":        CHICAGO_LAT,
            "longitude":       CHICAGO_LON,
            "current_weather": "true",
            "hourly":          "precipitation,snowfall,apparent_temperature,windspeed_10m",
            "timezone":        "America/Chicago",
            "forecast_days":   1,
        }
        r = requests.get(OPEN_METEO_URL, params=params, timeout=10)
        r.raise_for_status()
        data = r.json()

        cw      = data.get("current_weather", {})
        temp_c  = cw.get("temperature", 0)
        temp_f  = round(temp_c * 9 / 5 + 32, 1)
        wind_kmh = cw.get("windspeed", 0)
        wind_mph = round(wind_kmh * 0.621371, 1)
        wmo      = int(cw.get("weathercode", 0))
        condition = WMO_CODES.get(wmo, "Unknown")

        hourly        = data.get("hourly", {})
        precipitation = (hourly.get("precipitation") or [0])[0]
        snowfall      = (hourly.get("snowfall")      or [0])[0]
        precip = float(precipitation) if precipitation is not None else 0.0
        snow   = float(snowfall)      if snowfall      is not None else 0.0

        alert_message = ""
        alert_level   = "none"

        if snow > 0:
            alert_message = f"❄️ Snow detected ({snow:.1f} cm/hr) — Expect bus delays of 10–20 min. Bundle up & stay sheltered."
            alert_level   = "severe"
        elif precip > 0.3:
            alert_message = f"🌧️ Rain detected ({precip:.1f} mm/hr) — Expect bus delays of 5–15 min. Bring an umbrella."
            alert_level   = "moderate"
        elif wmo in (95, 96, 99):
            alert_message = "⛈️ Thunderstorm warning — Seek shelter immediately. Severe delays expected."
            alert_level   = "severe"
        elif wind_kmh > 50:
            alert_message = f"💨 High winds ({wind_mph} mph) — Bus service may be disrupted."
            alert_level   = "moderate"

        return {
            "temp_c":           temp_c,
            "temp_f":           temp_f,
            "condition":        condition,
            "wind_mph":         wind_mph,
            "precipitation_mm": precip,
            "snowfall_cm":      snow,
            "alert_message":    alert_message,
            "alert_level":      alert_level,
            "wmo_code":         wmo,
        }

    except Exception as e:
        return {
            "temp_c":           None,
            "temp_f":           None,
            "condition":        "Unavailable",
            "wind_mph":         0,
            "precipitation_mm": 0,
            "snowfall_cm":      0,
            "alert_message":    "",
            "alert_level":      "none",
            "error":            str(e),
        }