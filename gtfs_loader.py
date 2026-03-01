"""
gtfs_loader.py — Downloads and parses CTA GTFS zip using built-in csv module.
No pandas or numpy required. Same API as before.
"""

import csv
import io
import os
import zipfile
import requests
import math

GTFS_URL = "https://www.transitchicago.com/downloads/sch_data/google_transit.zip"
CACHE_DIR = os.path.join(os.path.dirname(__file__), "_gtfs_cache")

# Module-level caches (list of dicts instead of DataFrames)
stops_df      = None
routes_df     = None
trips_df      = None
stop_times_df = None
_loaded       = False


def _read_csv_from_zip(z, filename):
    """Read a CSV file from zip and return list of dicts."""
    with z.open(filename) as f:
        content = f.read().decode("utf-8-sig")
        reader  = csv.DictReader(io.StringIO(content))
        return [row for row in reader]


def _download_gtfs() -> bytes:
    print("📥 Downloading CTA GTFS data from transitchicago.com ...")
    r = requests.get(GTFS_URL, timeout=120)
    r.raise_for_status()
    print(f"   ↳ Downloaded {len(r.content) / 1024:.0f} KB")
    return r.content


def _load_from_zip(zip_bytes: bytes):
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as z:
        print(f"   ↳ Files in zip: {z.namelist()}")
        stops      = _read_csv_from_zip(z, "stops.txt")
        routes     = _read_csv_from_zip(z, "routes.txt")
        trips      = _read_csv_from_zip(z, "trips.txt")
        stop_times = _read_csv_from_zip(z, "stop_times.txt")

    for s in stops:
        try:
            s["stop_lat"] = float(s.get("stop_lat", 0))
            s["stop_lon"] = float(s.get("stop_lon", 0))
        except (ValueError, TypeError):
            s["stop_lat"] = 0.0
            s["stop_lon"] = 0.0

    for st in stop_times:
        try:
            st["stop_sequence"] = int(st.get("stop_sequence", 0))
        except (ValueError, TypeError):
            st["stop_sequence"] = 0

    return stops, routes, trips, stop_times


def load_gtfs(force_reload: bool = False):
    global stops_df, routes_df, trips_df, stop_times_df, _loaded

    if _loaded and not force_reload:
        return

    cache_path = os.path.join(CACHE_DIR, "google_transit.zip")

    if not force_reload and os.path.exists(cache_path):
        print("💾 Using cached GTFS zip ...")
        with open(cache_path, "rb") as f:
            zip_bytes = f.read()
    else:
        zip_bytes = _download_gtfs()
        os.makedirs(CACHE_DIR, exist_ok=True)
        with open(cache_path, "wb") as f:
            f.write(zip_bytes)
        print("💾 GTFS zip cached to disk.")

    stops_df, routes_df, trips_df, stop_times_df = _load_from_zip(zip_bytes)
    _loaded = True

    print(
        f"✅ GTFS loaded — {len(stops_df):,} stops, "
        f"{len(routes_df):,} routes, "
        f"{len(trips_df):,} trips, "
        f"{len(stop_times_df):,} stop-time rows"
    )


def haversine(lat1, lon1, lat2, lon2):
    R = 6_371_000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi    = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def search_stops_by_name(query: str, limit: int = 10) -> list:
    if stops_df is None:
        return []
    q = query.lower().strip()
    results = []
    for s in stops_df:
        if q in s.get("stop_name", "").lower():
            results.append({
                "stop_id":   s["stop_id"],
                "stop_name": s["stop_name"],
                "stop_lat":  s["stop_lat"],
                "stop_lon":  s["stop_lon"],
            })
        if len(results) >= limit:
            break
    return results


def find_nearest_stops(lat: float, lon: float, radius_m: float = 500, limit: int = 5) -> list:
    if stops_df is None:
        return []
    dlat = radius_m / 111_000
    dlon = radius_m / (111_000 * math.cos(math.radians(lat)))
    nearby = []
    for s in stops_df:
        slat = s["stop_lat"]
        slon = s["stop_lon"]
        if slat == 0 or slon == 0:
            continue
        if abs(slat - lat) > dlat or abs(slon - lon) > dlon:
            continue
        dist = haversine(lat, lon, slat, slon)
        if dist <= radius_m:
            nearby.append({
                "stop_id":    s["stop_id"],
                "stop_name":  s["stop_name"],
                "stop_lat":   slat,
                "stop_lon":   slon,
                "distance_m": dist,
            })
    nearby.sort(key=lambda x: x["distance_m"])
    return nearby[:limit]


def get_next_arrivals(stop_id: str, now_seconds: int, limit: int = 5) -> list:
    if stop_times_df is None or trips_df is None or routes_df is None:
        return []

    sid = str(stop_id)

    def to_seconds(t):
        try:
            parts = str(t).strip().split(":")
            return int(parts[0])*3600 + int(parts[1])*60 + int(parts[2])
        except Exception:
            return -1

    trips_by_id  = {t["trip_id"]: t for t in trips_df}
    routes_by_id = {r["route_id"]: r for r in routes_df}

    future = []
    for st in stop_times_df:
        if st["stop_id"] != sid:
            continue
        secs = to_seconds(st["arrival_time"])
        if now_seconds <= secs <= now_seconds + 10800:
            future.append((secs, st))

    future.sort(key=lambda x: x[0])
    future = future[:limit]

    results = []
    for secs, st in future:
        trip   = trips_by_id.get(st["trip_id"], {})
        route  = routes_by_id.get(trip.get("route_id", ""), {})
        mins   = (secs - now_seconds) // 60
        results.append({
            "route_short":  route.get("route_short_name", "?"),
            "route_long":   route.get("route_long_name",  "?"),
            "headsign":     trip.get("trip_headsign",     ""),
            "arrival_time": st["arrival_time"],
            "minutes_away": mins,
            "ghost_risk":   mins < 0 or mins > 60,
        })

    return results


def get_routes_near(lat: float, lon: float, radius_m: float = 400):
    if stop_times_df is None:
        return [], []

    nearby_stops = find_nearest_stops(lat, lon, radius_m, limit=10)
    if not nearby_stops:
        return [], []

    stop_ids  = {s["stop_id"] for s in nearby_stops}
    trip_ids  = {st["trip_id"] for st in stop_times_df if st["stop_id"] in stop_ids}
    route_ids = {t["route_id"] for t in trips_df if t["trip_id"] in trip_ids}

    routes = []
    seen   = set()
    for r in routes_df:
        if r["route_id"] in route_ids and r["route_id"] not in seen:
            routes.append({
                "route_id":         r["route_id"],
                "route_short_name": r.get("route_short_name", ""),
                "route_long_name":  r.get("route_long_name",  ""),
            })
            seen.add(r["route_id"])

    return routes, nearby_stops