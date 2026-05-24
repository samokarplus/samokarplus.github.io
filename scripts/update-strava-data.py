#!/usr/bin/env python3
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

CLIENT_ID = os.environ.get("STRAVA_CLIENT_ID")
CLIENT_SECRET = os.environ.get("STRAVA_CLIENT_SECRET")
REFRESH_TOKEN = os.environ.get("STRAVA_REFRESH_TOKEN")
YEAR = datetime.now(timezone.utc).year
OUTPUT_PATH = Path("strava-data.json")


def api_request(url, method="GET", data=None, token=None):
  headers = {}
  body = None

  if token:
    headers["Authorization"] = f"Bearer {token}"

  if data is not None:
    body = urlencode(data).encode("utf-8")
    headers["Content-Type"] = "application/x-www-form-urlencoded"

  request = Request(url, data=body, headers=headers, method=method)

  with urlopen(request, timeout=30) as response:
    return json.loads(response.read().decode("utf-8"))


def get_access_token():
  if not CLIENT_ID or not CLIENT_SECRET or not REFRESH_TOKEN:
    missing = [
      name
      for name, value in {
        "STRAVA_CLIENT_ID": CLIENT_ID,
        "STRAVA_CLIENT_SECRET": CLIENT_SECRET,
        "STRAVA_REFRESH_TOKEN": REFRESH_TOKEN
      }.items()
      if not value
    ]
    raise RuntimeError(f"Missing required Strava secrets: {', '.join(missing)}")

  payload = api_request(
    "https://www.strava.com/oauth/token",
    method="POST",
    data={
      "client_id": CLIENT_ID,
      "client_secret": CLIENT_SECRET,
      "refresh_token": REFRESH_TOKEN,
      "grant_type": "refresh_token"
    }
  )
  return payload["access_token"]


def get_activities(access_token):
  start = int(datetime(YEAR, 1, 1, tzinfo=timezone.utc).timestamp())
  end = int(datetime(YEAR + 1, 1, 1, tzinfo=timezone.utc).timestamp())
  activities = []
  page = 1

  while True:
    params = urlencode({
      "after": start,
      "before": end,
      "per_page": 200,
      "page": page
    })
    page_activities = api_request(
      f"https://www.strava.com/api/v3/athlete/activities?{params}",
      token=access_token
    )

    if not page_activities:
      break

    activities.extend(page_activities)
    page += 1

  return activities


def is_run(activity):
  return activity.get("type") == "Run" or activity.get("sport_type") in {
    "Run",
    "TrailRun",
    "VirtualRun"
  }


def is_ride(activity):
  return activity.get("type") == "Ride" or activity.get("sport_type") in {
    "GravelRide",
    "MountainBikeRide",
    "Ride",
    "VirtualRide"
  }


def is_walk(activity):
  return activity.get("type") == "Walk" or activity.get("sport_type") == "Walk"


def is_swim(activity):
  return activity.get("type") == "Swim" or activity.get("sport_type") == "Swim"


def write_stats(activities):
  runs = [activity for activity in activities if is_run(activity)]
  rides = [activity for activity in activities if is_ride(activity)]
  walks = [activity for activity in activities if is_walk(activity)]
  swims = [activity for activity in activities if is_swim(activity)]
  run_distance_meters = sum(activity.get("distance", 0) for activity in runs)
  run_elevation_meters = sum(activity.get("total_elevation_gain", 0) for activity in runs)
  ride_distance_meters = sum(activity.get("distance", 0) for activity in rides)
  walk_distance_meters = sum(activity.get("distance", 0) for activity in walks)
  walk_elevation_meters = sum(activity.get("total_elevation_gain", 0) for activity in walks)
  swim_distance_meters = sum(activity.get("distance", 0) for activity in swims)
  total_elevation_meters = run_elevation_meters + walk_elevation_meters

  stats = {
    "connected": True,
    "year": YEAR,
    "miles": round(run_distance_meters / 1609.344, 1),
    "elevationFeet": round(total_elevation_meters * 3.28084),
    "activityCount": len(runs),
    "runMiles": round(run_distance_meters / 1609.344, 1),
    "runElevationFeet": round(run_elevation_meters * 3.28084),
    "runCount": len(runs),
    "walkMiles": round(walk_distance_meters / 1609.344, 1),
    "walkElevationFeet": round(walk_elevation_meters * 3.28084),
    "walkCount": len(walks),
    "totalElevationFeet": round(total_elevation_meters * 3.28084),
    "bikeMiles": round(ride_distance_meters / 1609.344, 1),
    "bikeCount": len(rides),
    "swimYards": round(swim_distance_meters * 1.09361),
    "swimCount": len(swims),
    "updatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds")
  }

  OUTPUT_PATH.write_text(json.dumps(stats, indent=2) + "\n")


def main():
  try:
    access_token = get_access_token()
    write_stats(get_activities(access_token))
  except Exception as error:
    print(f"Failed to update Strava data: {error}", file=sys.stderr)
    raise


if __name__ == "__main__":
  main()
