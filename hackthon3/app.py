"""
app.py — BusGuard Chicago: Flask backend
Ghost bus detection powered by CTA GTFS + Chicago Data Portal + Open-Meteo.
"""

import threading
from datetime import datetime
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS

import gtfs_loader
import weather as weather_module
import safety as safety_module
import chatbot as chatbot_module
import transit as transit_module
import road_conditions as road_module

app = Flask(__name__)
CORS(app)

# ─── Load GTFS on startup in a background thread ─────────────────────────────
def _load_gtfs_background():
    try:
        gtfs_loader.load_gtfs()
    except Exception as e:
        print(f"❌ GTFS load failed: {e}")

t = threading.Thread(target=_load_gtfs_background, daemon=True)
t.start()


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _now_seconds() -> int:
    """Seconds past midnight, local time."""
    now = datetime.now()
    return now.hour * 3600 + now.minute * 60 + now.second


def _geocode_query(q: str) -> tuple | None:
    """Try Nominatim geocoding for a query string."""
    import requests as req
    try:
        r = req.get(
            "https://nominatim.openstreetmap.org/search",
            params={"q": f"{q} Chicago", "format": "json", "limit": 1},
            headers={"User-Agent": "BusGuard-Chicago/1.0"},
            timeout=8,
        )
        data = r.json()
        if data:
            return float(data[0]["lat"]), float(data[0]["lon"])
    except Exception:
        pass
    return None


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/gtfs_status")
def gtfs_status():
    loaded = gtfs_loader._loaded
    return jsonify({
        "loaded": loaded,
        "routes_count":     len(gtfs_loader.routes_df)     if loaded and gtfs_loader.routes_df     is not None else 0,
        "stops_count":      len(gtfs_loader.stops_df)      if loaded and gtfs_loader.stops_df      is not None else 0,
        "trips_count":      len(gtfs_loader.trips_df)      if loaded and gtfs_loader.trips_df      is not None else 0,
        "stop_times_count": len(gtfs_loader.stop_times_df) if loaded and gtfs_loader.stop_times_df is not None else 0,
    })


@app.route("/api/search")
def search_stops():
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify({"error": "Query required"}), 400

    if not gtfs_loader._loaded:
        return jsonify({"error": "GTFS data loading, please wait…"}), 503

    results = gtfs_loader.search_stops_by_name(q, limit=10)

    if len(results) < 3:
        coords = _geocode_query(q)
        if coords:
            nearby = gtfs_loader.find_nearest_stops(coords[0], coords[1], radius_m=600, limit=8)
            existing_ids = {r["stop_id"] for r in results}
            for s in nearby:
                if s["stop_id"] not in existing_ids:
                    results.append(s)

    return jsonify({"stops": results[:10]})


@app.route("/api/arrivals")
def get_arrivals():
    stop_id = request.args.get("stop_id", "").strip()
    if not stop_id:
        return jsonify({"error": "stop_id required"}), 400

    if not gtfs_loader._loaded:
        return jsonify({"error": "GTFS data loading, please wait…"}), 503

    now_secs = _now_seconds()
    arrivals = gtfs_loader.get_next_arrivals(stop_id, now_secs, limit=5)

    stop_info = {}
    if gtfs_loader.stops_df is not None:
        row = gtfs_loader.stops_df[gtfs_loader.stops_df["stop_id"] == str(stop_id)]
        if not row.empty:
            stop_info = {
                "stop_name": row.iloc[0].get("stop_name", ""),
                "lat":       float(row.iloc[0].get("stop_lat", 0)),
                "lon":       float(row.iloc[0].get("stop_lon", 0)),
            }

    for a in arrivals:
        if a["minutes_away"] < -5:
            a["ghost_alert"]   = True
            a["ghost_message"] = "⚠️ GHOST BUS ALERT — This bus may not show up"
        else:
            a["ghost_alert"]   = False
            a["ghost_message"] = ""

    return jsonify({"stop_id": stop_id, "stop_info": stop_info, "arrivals": arrivals})


@app.route("/api/weather")
def get_weather():
    return jsonify(weather_module.fetch_weather())


@app.route("/api/safety")
def get_safety():
    try:
        lat = float(request.args.get("lat", 0))
        lon = float(request.args.get("lon", 0))
    except ValueError:
        return jsonify({"error": "lat and lon must be numbers"}), 400

    if lat == 0 and lon == 0:
        return jsonify({"error": "lat and lon required"}), 400

    return jsonify(safety_module.get_safety_score(lat, lon))


@app.route("/api/chat", methods=["POST"])
def chat():
    body    = request.get_json(silent=True) or {}
    message = body.get("message", "").strip()
    if not message:
        return jsonify({"error": "message required"}), 400

    reply = chatbot_module.handle_message(message)
    return jsonify({"reply": reply})


@app.route("/api/transit")
def get_transit():
    """Returns bus + train positions for the map."""
    route = request.args.get("route", None)
    return jsonify(transit_module.get_all_transit(route))


@app.route("/api/train_arrivals")
def get_train_arrivals():
    """Returns next arrival predictions for all 8 L lines from CTA API."""
    return jsonify(transit_module.get_train_arrivals())


@app.route("/api/road_conditions")
def get_road_conditions():
    """Returns road condition alerts based on weather + Chicago 311 data."""
    try:
        lat = float(request.args.get("lat", 0)) or None
        lon = float(request.args.get("lon", 0)) or None
    except ValueError:
        lat, lon = None, None

    weather = weather_module.fetch_weather()
    return jsonify(road_module.get_road_conditions(lat, lon, weather))


# ─── Main ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("🚌 BusGuard Chicago starting...")
    print("   Flask server on http://localhost:5000")
    app.run(debug=False, host="0.0.0.0", port=5000, use_reloader=False)