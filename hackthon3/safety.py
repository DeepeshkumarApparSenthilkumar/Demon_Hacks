"""
safety.py — Queries Chicago Data Portal crimes API to compute a safety score
near a given lat/lon. No API token required (throttled to ~1000 req/hr).
"""

import requests
from datetime import datetime, timedelta

CRIMES_URL = "https://data.cityofchicago.org/resource/crimes.json"


def get_safety_score(lat: float, lon: float, radius_m: int = 300) -> dict:
    """
    Query crimes within radius_m metres of lat/lon in the past 90 days.
    Returns safety_score label, crime_count, and crowd_level.
    """
    try:
        ninety_days_ago = (datetime.utcnow() - timedelta(days=90)).strftime("%Y-%m-%dT00:00:00.000")

        params = {
            "$where": f"within_circle(location,{lat},{lon},{radius_m}) AND date >= '{ninety_days_ago}'",
            "$limit": 20,
            "$order": "date DESC",
        }
        r = requests.get(CRIMES_URL, params=params, timeout=10)
        r.raise_for_status()
        crimes = r.json()
        count  = len(crimes)

        if count <= 2:
            safety_score = "safe"
            safety_label = "🟢 Safe"
            safety_color = "#22c55e"
        elif count <= 8:
            safety_score = "moderate"
            safety_label = "🟡 Moderate Caution"
            safety_color = "#eab308"
        else:
            safety_score = "caution"
            safety_label = "🔴 Use Caution"
            safety_color = "#ef4444"

        now      = datetime.now()
        hour     = now.hour
        weekday  = now.weekday()
        is_weekday = weekday < 5
        is_rush    = (7 <= hour <= 9) or (16 <= hour <= 19)

        if is_weekday and is_rush:
            crowd_level = "crowded"
            crowd_label = "🟠 Likely Crowded"
            crowd_color = "#f97316"
        else:
            crowd_level = "uncrowded"
            crowd_label = "🟢 Usually Uncrowded"
            crowd_color = "#22c55e"

        return {
            "crime_count":  count,
            "safety_score": safety_score,
            "safety_label": safety_label,
            "safety_color": safety_color,
            "crowd_level":  crowd_level,
            "crowd_label":  crowd_label,
            "crowd_color":  crowd_color,
        }

    except Exception as e:
        return {
            "crime_count":  -1,
            "safety_score": "unknown",
            "safety_label": "⚪ Unknown",
            "safety_color": "#6b7280",
            "crowd_level":  "unknown",
            "crowd_label":  "⚪ Unknown",
            "crowd_color":  "#6b7280",
            "error":        str(e),
        }