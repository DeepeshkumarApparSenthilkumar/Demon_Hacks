"""
gtfs_loader.py — Downloads and parses CTA GTFS zip into pandas DataFrames.
Called once on startup; results cached in module-level globals.
"""

import io
import os
import zipfile
import requests
import pandas as pd
import math

GTFS_URL = "https://www.transitchicago.com/downloads/sch_data/google_transit.zip"
CACHE_DIR = os.path.join(os.path.dirname(__file__), "_gtfs_cache")

# Module-level caches
stops_df = None
routes_df = None
trips_df = None
stop_times_df = None
_loaded = False


def _download_gtfs() -> bytes:
    """Download GTFS zip and return raw bytes."""
    print("📥 Downloading CTA GTFS data from transitchicago.com ...")
    r = requests.get(GTFS_URL, timeout=120)
    r.raise_for_status()
    print(f"   ↳ Downloaded {len(r.content) / 1024:.0f} KB")
    return r.content


def _load_from_zip(zip_bytes: bytes):
    """Parse needed CSV files from zip bytes and return DataFrames."""
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as z:
        names = z.namelist()
        print(f"   ↳ Files in zip: {names}")

        stops      = pd.read_csv(z.open("stops.txt"),      dtype=str)
        routes     = pd.read_csv(z.open("routes.txt"),     dtype=str)
        trips      = pd.read_csv(z.open("trips.txt"),      dtype=str)
        stop_times = pd.read_csv(z.open("stop_times.txt"), dtype=str)

    for df in [stops, routes, trips, stop_times]:
        df.columns = df.columns.str.strip()

    stops["stop_lat"] = pd.to_numeric(stops["stop_lat"], errors="coerce")
    stops["stop_lon"] = pd.to_numeric(stops["stop_lon"], errors="coerce")
    stop_times["stop_sequence"] = pd.to_numeric(stop_times["stop_sequence"], errors="coerce")

    return stops, routes, trips, stop_times


def load_gtfs(force_reload: bool = False):
    """
    Load GTFS data into module globals.
    Downloads fresh copy if cache doesn't exist or force_reload=True.
    """
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


# ─── Query helpers ────────────────────────────────────────────────────────────

def haversine(lat1, lon1, lat2, lon2):
    """Return distance in metres between two lat/lon points."""
    R = 6_371_000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi    = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def search_stops_by_name(query: str, limit: int = 10) -> list[dict]:
    """Return stops whose names contain the query string (case-insensitive)."""
    if stops_df is None:
        return []
    q    = query.lower().strip()
    mask = stops_df["stop_name"].str.lower().str.contains(q, na=False)
    return stops_df[mask][["stop_id","stop_name","stop_lat","stop_lon"]].head(limit).to_dict(orient="records")


def find_nearest_stops(lat: float, lon: float, radius_m: float = 500, limit: int = 5) -> list[dict]:
    """Return stops within radius_m metres of lat/lon, sorted by distance."""
    if stops_df is None:
        return []
    df   = stops_df.dropna(subset=["stop_lat","stop_lon"]).copy()
    dlat = radius_m / 111_000
    dlon = radius_m / (111_000 * math.cos(math.radians(lat)))
    mask = (
        df["stop_lat"].between(lat - dlat, lat + dlat) &
        df["stop_lon"].between(lon - dlon, lon + dlon)
    )
    nearby = df[mask].copy()
    nearby["distance_m"] = nearby.apply(
        lambda r: haversine(lat, lon, r["stop_lat"], r["stop_lon"]), axis=1
    )
    nearby = nearby[nearby["distance_m"] <= radius_m].sort_values("distance_m")
    return nearby[["stop_id","stop_name","stop_lat","stop_lon","distance_m"]].head(limit).to_dict(orient="records")


def get_next_arrivals(stop_id: str, now_seconds: int, limit: int = 5) -> list[dict]:
    """
    Return the next scheduled arrivals at stop_id after now_seconds.
    Handles >24h times (overnight trips).
    """
    if stop_times_df is None or trips_df is None or routes_df is None:
        return []

    sid = str(stop_id)
    st  = stop_times_df[stop_times_df["stop_id"] == sid][["trip_id","arrival_time"]].copy()
    if st.empty:
        return []

    def to_seconds(t):
        try:
            parts = str(t).strip().split(":")
            return int(parts[0])*3600 + int(parts[1])*60 + int(parts[2])
        except Exception:
            return -1

    st["secs"] = st["arrival_time"].apply(to_seconds)
    future = st[(st["secs"] >= now_seconds) & (st["secs"] <= now_seconds + 10800)].copy()
    future = future.sort_values("secs").head(limit)

    trips_cols = ["trip_id","route_id"]
    if "trip_headsign" in trips_df.columns:
        trips_cols.append("trip_headsign")

    merged = future.merge(trips_df[trips_cols], on="trip_id", how="left")
    if "trip_headsign" not in merged.columns:
        merged["trip_headsign"] = ""

    merged = merged.merge(
        routes_df[["route_id","route_short_name","route_long_name"]],
        on="route_id", how="left"
    )

    results = []
    for _, row in merged.iterrows():
        secs_away   = int(row["secs"]) - now_seconds
        minutes_away = secs_away // 60
        results.append({
            "route_short":  row.get("route_short_name", "?"),
            "route_long":   row.get("route_long_name",  "?"),
            "headsign":     row.get("trip_headsign",    ""),
            "arrival_time": row["arrival_time"],
            "minutes_away": minutes_away,
            "ghost_risk":   minutes_away < 0 or minutes_away > 60,
        })

    return results


def get_routes_near(lat: float, lon: float, radius_m: float = 400):
    """Return list of routes serving stops within radius_m of lat/lon."""
    if stop_times_df is None:
        return [], []
    nearby_stops = find_nearest_stops(lat, lon, radius_m, limit=10)
    if not nearby_stops:
        return [], []
    stop_ids = [s["stop_id"] for s in nearby_stops]
    st = stop_times_df[stop_times_df["stop_id"].isin(stop_ids)][["trip_id"]].drop_duplicates()
    t  = trips_df[trips_df["trip_id"].isin(st["trip_id"])][["route_id"]].drop_duplicates()
    r  = routes_df[routes_df["route_id"].isin(t["route_id"])][
        ["route_id","route_short_name","route_long_name"]
    ].drop_duplicates()
    return r.to_dict(orient="records"), nearby_stops