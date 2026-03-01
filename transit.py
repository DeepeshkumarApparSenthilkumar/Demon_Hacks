"""
transit.py — CTA Bus & Train positions + arrival predictions for BusGuard Chicago.
Paste your CTA keys directly below.
"""

import os
import random
from dotenv import load_dotenv
import requests
from datetime import datetime, timezone, timedelta

# ─── PASTE YOUR KEYS HERE ─────────────────────────────────────────────────────
load_dotenv()
BUS_TRACKER_KEY   = os.getenv("BUS_TRACKER_KEY")    
TRAIN_TRACKER_KEY = os.getenv("TRAIN_TRACKER_KEY")


# ─────────────────────────────────────────────────────────────────────────────

BUS_TRACKER_URL     = "http://www.ctabustracker.com/bustime/api/v2/getvehicles"
TRAIN_POSITIONS_URL = "https://lapi.transitchicago.com/api/1.0/ttpositions.aspx"
TRAIN_ARRIVALS_URL  = "https://lapi.transitchicago.com/api/1.0/ttarrivals.aspx"

# CTA API short codes → friendly name + color
LINE_INFO = {
    "red":  {"name": "Red",    "color": "#c60c30"},
    "blue": {"name": "Blue",   "color": "#00a1de"},
    "brn":  {"name": "Brown",  "color": "#62361b"},
    "g":    {"name": "Green",  "color": "#009b3a"},
    "org":  {"name": "Orange", "color": "#f9461c"},
    "p":    {"name": "Purple", "color": "#522398"},
    "pink": {"name": "Pink",   "color": "#e27ea6"},
    "y":    {"name": "Yellow", "color": "#f9e300"},
}

# Friendly name → color
NAME_TO_COLOR = {v["name"]: v["color"] for v in LINE_INFO.values()}

# Line code map for arrivals API
LINE_CODE_MAP = {
    "red": "Red", "blue": "Blue", "brn": "Brown", "g": "Green",
    "org": "Orange", "p": "Purple", "pink": "Pink", "y": "Yellow",
}

# Real station coordinates for simulation fallback
L_LINES = {
    "Red": {
        "color": "#c60c30",
        "stations": [
            (42.0184, -87.6726), (41.9808, -87.6677), (41.9657, -87.6526),
            (41.9484, -87.6556), (41.9241, -87.6527), (41.9090, -87.6782),
            (41.8827, -87.6298), (41.8681, -87.6298), (41.8500, -87.6298),
            (41.8285, -87.6192), (41.7943, -87.5907), (41.7508, -87.6247),
        ]
    },
    "Blue": {
        "color": "#00a1de",
        "stations": [
            (41.9742, -87.9073), (41.9831, -87.8087), (41.9215, -87.7071),
            (41.9006, -87.7109), (41.8827, -87.6298), (41.8759, -87.6353),
            (41.8500, -87.7108),
        ]
    },
    "Brown": {
        "color": "#62361b",
        "stations": [
            (41.9808, -87.6677), (41.9657, -87.6526), (41.9434, -87.6502),
            (41.9241, -87.6527), (41.9090, -87.6356), (41.8975, -87.6310),
            (41.8827, -87.6298),
        ]
    },
    "Green": {
        "color": "#009b3a",
        "stations": [
            (41.8864, -87.8130), (41.8827, -87.7262), (41.8827, -87.6298),
            (41.8285, -87.6192), (41.7943, -87.5907), (41.7868, -87.7522),
        ]
    },
    "Orange": {
        "color": "#f9461c",
        "stations": [
            (41.7868, -87.7522), (41.8268, -87.7108), (41.8500, -87.6608),
            (41.8530, -87.6327), (41.8681, -87.6298), (41.8827, -87.6298),
        ]
    },
    "Pink": {
        "color": "#e27ea6",
        "stations": [
            (41.8500, -87.7108), (41.8268, -87.7108), (41.8500, -87.6608),
            (41.8681, -87.6298), (41.8827, -87.6298),
        ]
    },
    "Purple": {
        "color": "#522398",
        "stations": [
            (42.0734, -87.6825), (42.0081, -87.6674), (41.9808, -87.6677),
            (41.9657, -87.6526), (41.9241, -87.6527), (41.8975, -87.6310),
            (41.8827, -87.6298),
        ]
    },
    "Yellow": {
        "color": "#f9e300",
        "stations": [
            (42.0734, -87.6825), (42.0449, -87.6799), (42.0184, -87.6726),
        ]
    },
}


# ─── Timezone helper ──────────────────────────────────────────────────────────

def _chicago_now() -> datetime:
    """
    Return current time in Chicago (America/Chicago).
    Works without pytz by using the UTC offset directly.
    Chicago is UTC-6 (CST) or UTC-5 (CDT).
    We detect DST by checking if pytz is available; otherwise use a safe fallback.
    """
    try:
        import pytz
        return datetime.now(pytz.timezone("America/Chicago"))
    except ImportError:
        pass

    # Fallback: determine Chicago offset manually
    # Chicago is UTC-6 in winter (CST), UTC-5 in summer (CDT)
    # DST: 2nd Sunday March → 1st Sunday November
    utc_now = datetime.now(timezone.utc)
    year    = utc_now.year

    # 2nd Sunday in March
    march1  = datetime(year, 3, 1, tzinfo=timezone.utc)
    dst_start = march1 + timedelta(days=(6 - march1.weekday()) % 7 + 7)

    # 1st Sunday in November
    nov1    = datetime(year, 11, 1, tzinfo=timezone.utc)
    dst_end = nov1 + timedelta(days=(6 - nov1.weekday()) % 7)

    if dst_start <= utc_now < dst_end:
        offset = timedelta(hours=-5)   # CDT
    else:
        offset = timedelta(hours=-6)   # CST

    return utc_now.astimezone(timezone(offset))


def _parse_mins(arr_time: str) -> int | None:
    """
    Parse CTA arrival time → minutes from now.
    Handles both formats:
      - '20260301 00:44:16'  (old format)
      - '2026-03-01T00:44:16' (ISO format — what CTA actually returns)
    """
    if not arr_time:
        return None
    try:
        # Try ISO format first: 2026-03-01T00:44:16
        if 'T' in arr_time:
            arr_naive = datetime.strptime(arr_time, "%Y-%m-%dT%H:%M:%S")
        else:
            arr_naive = datetime.strptime(arr_time, "%Y%m%d %H:%M:%S")

        now_chi   = _chicago_now()
        arr_aware = arr_naive.replace(tzinfo=now_chi.tzinfo)
        diff      = (arr_aware - now_chi).total_seconds()
        return max(0, int(diff // 60))
    except Exception as e:
        print(f"Time parse error for '{arr_time}': {e}")
        return None


# ─── Bus positions ─────────────────────────────────────────────────────────────

def get_bus_positions(route: str = None) -> list:
    """
    Fetch real-time bus positions.
    CTA Bus Tracker API requires specific route numbers — calling with no route
    returns an error. We fetch the busiest Chicago routes in batches of 10.
    """
    if not BUS_TRACKER_KEY:
        return []

    # CTA requires route filter. Fetch top busy routes in batches (max 10 per call)
    if route:
        route_batches = [route]
    else:
        route_batches = [
            "3,4,6,8,9,11,12,18,20,22",
            "24,26,29,30,36,49,50,51,52,53",
            "54,55,56,60,62,63,65,66,67,70",
            "72,73,74,75,77,79,80,81,82,X9",
        ]

    all_vehicles = []
    for batch in route_batches:
        try:
            params = {"key": BUS_TRACKER_KEY, "format": "json", "rt": batch}
            r      = requests.get(BUS_TRACKER_URL, params=params, timeout=8)
            data   = r.json().get("bustime-response", {})
            vehicles = data.get("vehicle", [])
            if isinstance(vehicles, dict):
                vehicles = [vehicles]
            if not isinstance(vehicles, list):
                continue
            for v in vehicles:
                if v.get("lat") and v.get("lon"):
                    all_vehicles.append({
                        "vid":         v.get("vid"),
                        "route":       v.get("rt"),
                        "lat":         float(v.get("lat", 0)),
                        "lon":         float(v.get("lon", 0)),
                        "heading":     int(v.get("hdg", 0)),
                        "destination": v.get("des", ""),
                        "type":        "bus",
                        "simulated":   False,
                    })
        except Exception as e:
            print(f"Bus tracker error (batch {batch}): {e}")

    print(f"🚌 Buses fetched: {len(all_vehicles)}")
    return all_vehicles


# ─── Train positions ───────────────────────────────────────────────────────────

def get_train_positions() -> list:
    """Fetch live train GPS positions. Falls back to simulation if API fails."""
    if not TRAIN_TRACKER_KEY:
        return _simulate_trains()
    try:
        params = {
            "key":        TRAIN_TRACKER_KEY,
            "rt":         "red,blue,brn,g,org,p,pink,y",
            "outputType": "JSON",
        }
        r      = requests.get(TRAIN_POSITIONS_URL, params=params, timeout=10)
        body   = r.json()
        ctatt  = body.get("ctatt", {})
        routes = ctatt.get("route", [])

        if not routes:
            errCd = ctatt.get("errCd", "?")
            errNm = ctatt.get("errNm", "?")
            print(f"Train positions: no routes. errCd={errCd} errNm={errNm}")
            return _simulate_trains()

        if isinstance(routes, dict):
            routes = [routes]

        trains = []
        for line_data in routes:
            api_code  = line_data.get("@name", "").lower()
            info      = LINE_INFO.get(api_code, {})
            line_name = info.get("name", api_code.title())
            color     = info.get("color", "#a78bfa")

            train_list = line_data.get("train", [])
            if isinstance(train_list, dict):
                train_list = [train_list]
            if not train_list:
                continue

            for t in train_list:
                try:
                    lat = float(t.get("lat", 0))
                    lon = float(t.get("lon", 0))
                except (TypeError, ValueError):
                    continue
                if lat == 0 or lon == 0:
                    continue

                trains.append({
                    "run":          t.get("rn", ""),
                    "line":         line_name,
                    "color":        color,
                    "lat":          lat,
                    "lon":          lon,
                    "heading":      int(t.get("heading", 0)),
                    "destination":  t.get("destNm", ""),
                    "next_station": t.get("nextStaNm", ""),
                    "type":         "train",
                    "simulated":    False,
                })

        print(f"✅ Live trains: {len(trains)} across {len(routes)} lines")
        return trains if trains else _simulate_trains()

    except Exception as e:
        print(f"❌ Train positions error: {e}")
        return _simulate_trains()


def _simulate_trains() -> list:
    """Smooth time-based simulation along real L line coordinates."""
    now_chi  = _chicago_now()
    minute   = now_chi.hour * 60 + now_chi.minute
    trains   = []
    for line_name, info in L_LINES.items():
        stations = info["stations"]
        for i in range(3):
            progress = ((i / 3) + (minute % 60) / 60.0) % 1.0
            n        = len(stations) - 1
            seg_len  = 1.0 / n
            seg_idx  = min(int(progress / seg_len), n - 1)
            t        = (progress - seg_idx * seg_len) / seg_len
            lat      = stations[seg_idx][0] + (stations[seg_idx+1][0] - stations[seg_idx][0]) * t
            lon      = stations[seg_idx][1] + (stations[seg_idx+1][1] - stations[seg_idx][1]) * t
            rng      = random.Random(f"{line_name}{i}{minute // 5}")
            lat     += (rng.random() - 0.5) * 0.0008
            lon     += (rng.random() - 0.5) * 0.0008
            direction = "Northbound" if progress < 0.5 else "Southbound"
            trains.append({
                "run":          f"{line_name[0]}{i+1:02d}",
                "line":         line_name,
                "color":        info["color"],
                "lat":          round(lat, 6),
                "lon":          round(lon, 6),
                "heading":      0,
                "destination":  f"{line_name} Line · {direction}",
                "next_station": "",
                "type":         "train",
                "simulated":    True,
            })
    return trains


# ─── Train arrival predictions ─────────────────────────────────────────────────

def get_train_arrivals() -> dict:
    """
    Fetch next arrival predictions for all 8 L lines.
    Queries Clark/Lake (7 lines) + Howard (Yellow line).
    Returns: { "Red": [{run, dest, mins, approaching, scheduled}, ...], ... }
    """
    if not TRAIN_TRACKER_KEY:
        return {}

    # Clark/Lake (mapid 40380) serves Red/Blue/Brown/Green/Orange/Pink/Purple
    # Howard    (mapid 40900) serves Yellow/Purple/Red
    station_ids      = [40380, 40900]
    arrivals_by_line = {}

    for mapid in station_ids:
        try:
            params = {
                "key":        TRAIN_TRACKER_KEY,
                "mapid":      mapid,
                "max":        6,           # fetch more so we get 2 per line
                "outputType": "JSON",
            }
            r     = requests.get(TRAIN_ARRIVALS_URL, params=params, timeout=8)
            body  = r.json()
            ctatt = body.get("ctatt", {})
            etas  = ctatt.get("eta", [])

            if isinstance(etas, dict):
                etas = [etas]
            if not etas:
                print(f"No ETAs from mapid={mapid}: {body}")
                continue

            for eta in etas:
                rt        = eta.get("rt", "").lower()
                line_name = LINE_CODE_MAP.get(rt, rt.title())
                arr_time  = eta.get("arrT", "")
                is_app    = eta.get("isApp", "0") == "1"
                is_sch    = eta.get("isSch", "0") == "1"

                # Calculate minutes using correct Chicago timezone
                mins = _parse_mins(arr_time)

                entry = {
                    "run":         eta.get("rn", ""),
                    "dest":        eta.get("destNm", ""),
                    "mins":        mins,
                    "arr_time":    arr_time,
                    "next_sta":    eta.get("staNm", ""),
                    "approaching": is_app,
                    "scheduled":   is_sch,
                }

                if line_name not in arrivals_by_line:
                    arrivals_by_line[line_name] = []
                if len(arrivals_by_line[line_name]) < 2:
                    arrivals_by_line[line_name].append(entry)

        except Exception as e:
            print(f"Train arrivals error (mapid={mapid}): {e}")

    # Debug output so you can see what came back
    for line, arrs in arrivals_by_line.items():
        for a in arrs:
            print(f"  {line}: {a['dest']} → {a['mins']} min (arr_time={a['arr_time']}, app={a['approaching']})")

    return arrivals_by_line


# ─── Combined ─────────────────────────────────────────────────────────────────

def get_all_transit(route: str = None) -> dict:
    return {
        "buses":        get_bus_positions(route),
        "trains":       get_train_positions(),
        "has_live_key": bool(TRAIN_TRACKER_KEY),
    }