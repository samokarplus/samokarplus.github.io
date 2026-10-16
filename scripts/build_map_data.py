#!/usr/bin/env python3
"""Builds places-map-data.js (simplified world + US map outlines) from public-domain
Natural Earth and US state GeoJSON. Only needed if you want to regenerate the map shapes:

    python3 scripts/build_map_data.py world.geojson us-states.geojson > places-map-data.js

Sources:
  https://github.com/nvkelso/natural-earth-vector (ne_110m_admin_0_countries.geojson, public domain)
  https://github.com/PublicaMundi/MappingAPI (us-states.json)
The map projections here must match the formulas in script.js (renderPlaces).
"""
import json, math, sys

# ---------- projections ----------
A1, A2, A3, A4 = 1.340264, -0.081106, 0.000893, 0.003796

def equal_earth(lon, lat):
    l, p = math.radians(lon), math.radians(lat)
    t = math.asin(math.sqrt(3) / 2 * math.sin(p))
    t2, t6 = t * t, t ** 6
    x = 2 * math.sqrt(3) * l * math.cos(t) / (3 * (9 * A4 * t6 * t2 + 7 * A3 * t6 + 3 * A2 * t2 + A1))
    y = t * (A1 + A2 * t2 + t6 * (A3 + A4 * t2))
    return x, y

PHI1, PHI2, PHI0, LAM0 = map(math.radians, (29.5, 45.5, 37.5, -96.0))
N = (math.sin(PHI1) + math.sin(PHI2)) / 2
C = math.cos(PHI1) ** 2 + 2 * N * math.sin(PHI1)
RHO0 = math.sqrt(C - 2 * N * math.sin(PHI0)) / N

def albers(lon, lat):
    rho = math.sqrt(C - 2 * N * math.sin(math.radians(lat))) / N
    th = N * (math.radians(lon) - LAM0)
    return rho * math.sin(th), RHO0 - rho * math.cos(th)

# ---------- simplification ----------
def dp(points, tol):
    if len(points) < 3:
        return points
    (x1, y1), (x2, y2) = points[0], points[-1]
    dx, dy = x2 - x1, y2 - y1
    norm = math.hypot(dx, dy) or 1e-9
    idx, dmax = 0, 0
    for i in range(1, len(points) - 1):
        d = abs(dy * points[i][0] - dx * points[i][1] + x2 * y1 - y2 * x1) / norm
        if d > dmax:
            idx, dmax = i, d
    if dmax > tol:
        return dp(points[: idx + 1], tol)[:-1] + dp(points[idx:], tol)
    return [points[0], points[-1]]

def ring_path(ring, proj, sx, sy, tx, ty, tol):
    pts = [(proj(lon, lat)) for lon, lat in ring]
    pts = [(x * sx + tx, y * sy + ty) for x, y in pts]
    # a closed ring has identical ends, so split it at the farthest point before simplifying
    far = max(range(len(pts)), key=lambda i: (pts[i][0] - pts[0][0]) ** 2 + (pts[i][1] - pts[0][1]) ** 2)
    pts = dp(pts[: far + 1], tol)[:-1] + dp(pts[far:], tol)
    if len(pts) < 4:
        return ""
    return "M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in pts) + "Z"

def geometry_path(geom, *args):
    polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
    out = ""
    for poly in polys:
        for ring in poly[:1]:  # outer ring only; holes are tiny lakes
            out += ring_path(ring, *args)
    return out

def build(world_file, us_file):
    world = json.load(open(world_file))
    # Equal Earth bounds: lon +-180 at equator for width; lat 84 .. -58 for height
    xmax = equal_earth(180, 0)[0]
    ytop = equal_earth(0, 84)[1]
    ybot = equal_earth(0, -58)[1]
    W = 1000.0
    scale = W / (2 * xmax)
    H = (ytop - ybot) * scale
    tx, ty = W / 2, ytop * scale
    countries = {}
    for f in world["features"]:
        code = f["properties"]["ADM0_A3"]
        if code == "ATA":
            continue
        d = geometry_path(f["geometry"], equal_earth, scale, -scale, tx, ty, 0.35)
        if d:
            countries[code] = {"n": f["properties"]["ADMIN"], "d": d}
    us = json.load(open(us_file))
    names = {
        "Alabama": "AL", "Arizona": "AZ", "Arkansas": "AR", "California": "CA", "Colorado": "CO",
        "Connecticut": "CT", "Delaware": "DE", "District of Columbia": "DC", "Florida": "FL",
        "Georgia": "GA", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA",
        "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
        "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
        "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH",
        "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC",
        "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA",
        "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD", "Tennessee": "TN",
        "Texas": "TX", "Utah": "UT", "Vermont": "VT", "Virginia": "VA", "Washington": "WA",
        "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY",
    }
    # bounds of the contiguous US in Albers units
    pts = []
    for f in us["features"]:
        if f["properties"]["name"] not in names:
            continue
        polys = f["geometry"]["coordinates"] if f["geometry"]["type"] == "MultiPolygon" else [f["geometry"]["coordinates"]]
        for poly in polys:
            for lon, lat in poly[0]:
                pts.append(albers(lon, lat))
    minx, maxx = min(p[0] for p in pts), max(p[0] for p in pts)
    miny, maxy = min(p[1] for p in pts), max(p[1] for p in pts)
    UW = 1000.0
    uscale = UW / (maxx - minx)
    UH = (maxy - miny) * uscale
    utx, uty = -minx * uscale, maxy * uscale
    states = {}
    for f in us["features"]:
        name = f["properties"]["name"]
        if name not in names:
            continue
        d = geometry_path(f["geometry"], albers, uscale, -uscale, utx, uty, 0.5)
        states[names[name]] = {"n": name, "d": d}
    data = {
        "world": {"w": W, "h": round(H, 1), "scale": scale, "tx": tx, "ty": ty, "countries": countries},
        "us": {"w": UW, "h": round(UH, 1), "scale": uscale, "tx": utx, "ty": uty, "states": states},
    }
    return data

if __name__ == "__main__":
    data = build(sys.argv[1], sys.argv[2])
    print("// Generated by scripts/build_map_data.py. Simplified outlines from Natural Earth (public domain) and US state boundaries.")
    print("window.placesMapData = " + json.dumps(data, separators=(",", ":")) + ";")
