"""
road_conditions.py — Chicago road & transit conditions.
Pulls from Chicago Data Portal (311 service requests) + weather impact logic.
No API key required.
"""

import requests
from datetime import datetime

CHICAGO_311_URL = "https://data.cityofchicago.org/resource/v6vf-nfxy.json"


def get_road_conditions(lat: float = None, lon: float = None, weather: dict = None) -> dict:
    """
    Returns road condition summary:
    - construction/pothole alerts from Chicago 311
    - weather-based impact (rain, snow, wind, thunderstorm)
    - rush hour traffic impact
    - overall condition label + color
    """
    alerts          = []
    condition_score = 0  # 0 = good, higher = worse

    # ── Weather impact ──────────────────────────────────────────────────────────
    if weather:
        snow   = weather.get("snowfall_cm",      0) or 0
        rain   = weather.get("precipitation_mm", 0) or 0
        wind   = weather.get("wind_mph",         0) or 0
        wmo    = weather.get("wmo_code",         0) or 0

        if snow > 0.5:
            alerts.append({
                "type": "weather", "icon": "❄️",
                "message":  f"Snow accumulation ({snow:.1f} cm/hr) — Roads may be slippery. Allow extra travel time.",
                "severity": "high",
            })
            condition_score += 3
        elif snow > 0:
            alerts.append({
                "type": "weather", "icon": "🌨️",
                "message":  "Light snow — Watch for icy patches near stops.",
                "severity": "moderate",
            })
            condition_score += 1

        if rain > 0.5:
            alerts.append({
                "type": "weather", "icon": "🌧️",
                "message":  f"Heavy rain ({rain:.1f} mm/hr) — Reduced visibility, bus delays likely.",
                "severity": "moderate",
            })
            condition_score += 2
        elif rain > 0:
            alerts.append({
                "type": "weather", "icon": "🌦️",
                "message":  "Light rain — Roads wet, minor delays possible.",
                "severity": "low",
            })
            condition_score += 1

        if wind > 35:
            alerts.append({
                "type": "weather", "icon": "💨",
                "message":  f"High winds ({wind} mph) — Bus service may be disrupted on elevated routes.",
                "severity": "moderate",
            })
            condition_score += 1

        if wmo in (95, 96, 99):
            alerts.append({
                "type": "weather", "icon": "⛈️",
                "message":  "Thunderstorm — Seek shelter. Significant delays expected system-wide.",
                "severity": "high",
            })
            condition_score += 4

    # ── Chicago 311 open requests near location ──────────────────────────────
    construction_count = 0
    if lat and lon:
        try:
            params = {
                "$where": f"within_circle(location,{lat},{lon},800) AND status='Open'",
                "$limit": 5,
                "$order": "created_date DESC",
            }
            r    = requests.get(CHICAGO_311_URL, params=params, timeout=8)
            data = r.json()
            construction_count = len(data)
            if construction_count > 0:
                alerts.append({
                    "type": "construction", "icon": "🚧",
                    "message":  f"{construction_count} open 311 service request(s) within 800m — possible road work or potholes nearby.",
                    "severity": "low",
                })
                condition_score += 1
        except Exception:
            pass

    # ── Rush hour impact ────────────────────────────────────────────────────────
    now     = datetime.now()
    hour    = now.hour
    weekday = now.weekday() < 5  # Mon–Fri
    if weekday and ((7 <= hour <= 9) or (16 <= hour <= 19)):
        alerts.append({
            "type": "traffic", "icon": "🚗",
            "message":  "Rush hour — Expect 5–15 min extra bus delays on major corridors (Lake Shore Dr, Michigan Ave, etc).",
            "severity": "moderate",
        })
        condition_score += 2
    elif not weekday:
        alerts.append({
            "type": "traffic", "icon": "✅",
            "message":  "Weekend — Lighter traffic, buses generally on schedule.",
            "severity": "low",
        })

    # ── Overall label ───────────────────────────────────────────────────────────
    if condition_score == 0:
        overall = {
            "label":       "🟢 Good",
            "color":       "#22c55e",
            "description": "Roads clear, normal transit operations expected.",
        }
    elif condition_score <= 2:
        overall = {
            "label":       "🟡 Fair",
            "color":       "#eab308",
            "description": "Minor conditions present — slight delays possible.",
        }
    elif condition_score <= 4:
        overall = {
            "label":       "🟠 Poor",
            "color":       "#f97316",
            "description": "Moderate conditions — plan for delays.",
        }
    else:
        overall = {
            "label":       "🔴 Severe",
            "color":       "#ef4444",
            "description": "Significant conditions — consider alternatives or allow extra time.",
        }

    return {
        "overall":              overall,
        "alerts":               alerts,
        "condition_score":      condition_score,
        "construction_nearby":  construction_count,
    }