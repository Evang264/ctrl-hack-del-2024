from flask import Flask, request, jsonify
import requests
from config import GOOGLE_MAPS_API_KEY
from utils.solar import calculate_sun_position
from utils.shade import calculate_shade
from shapely.geometry import LineString, Polygon
import datetime
import pytz

app = Flask(__name__)

@app.route('/')
def home():
    return "Hello, world!"

@app.route('/get_shaded_route', methods=['POST'])
def get_shaded_route():
    data = request.json
    origin = data.get('origin')
    destination = data.get('destination')
    departure_time = data.get('departure_time')

    if not origin or not destination or not departure_time:
        return jsonify({'error': 'Missing required parameters.'}), 400
    
    print(f"Current time: {datetime.datetime.now(pytz.UTC)}")


    # Convert departure_time to a timezone-aware datetime object (assuming UTC)
    departure_time = datetime.datetime.fromisoformat(departure_time).replace(tzinfo=pytz.UTC)

    print(f"Origin: {origin}, Destination: {destination}, Departure Time: {departure_time}")
    
    # Get routes from Google Directions API
    directions_url = 'https://maps.googleapis.com/maps/api/directions/json'
    params = {
        'origin': origin,
        'destination': destination,
        'departure_time': int(departure_time.timestamp()),
        'key': GOOGLE_MAPS_API_KEY
    }
    response = requests.get(directions_url, params=params)
    
    print(f"Request URL: {response.url}")
    print(f"Request Params: {params}")
    print(f"Response Status Code: {response.status_code}")
    print(f"Response Data: {response.json()}")

    routes = response.json().get('routes', [])

    if not routes:
        return jsonify({'error': 'No routes found.'}), 404

    obstructions = data.get('obstructions', [])

    # Calculate sun position at origin, midpoint, and destination
    origin_lat, origin_lng = map(float, origin.split(','))
    dest_lat, dest_lng = map(float, destination.split(','))
    midpoint_lat = (origin_lat + dest_lat) / 2
    midpoint_lng = (origin_lng + dest_lng) / 2

    sun_positions = [
        calculate_sun_position(origin_lat, origin_lng, departure_time),
        calculate_sun_position(midpoint_lat, midpoint_lng, departure_time),
        calculate_sun_position(dest_lat, dest_lng, departure_time)
    ]

    avg_sun_altitude = sum(pos[0] for pos in sun_positions) / len(sun_positions)
    avg_sun_azimuth = sum(pos[1] for pos in sun_positions) / len(sun_positions)

    shaded_area = calculate_shade(obstructions, avg_sun_azimuth, avg_sun_altitude)

    best_route = None
    max_shade_coverage = -1

    for route in routes:
        overview_poly = route['overview_polyline']['points']
        route_coords = decode_polyline(overview_poly)
        route_line = LineString(route_coords)

        # Calculate shade overlap
        shade_overlap = route_line.intersection(shaded_area).length
        if shade_overlap > max_shade_coverage:
            max_shade_coverage = shade_overlap
            best_route = route

    if not best_route:
        return jsonify({'error': 'No optimal shaded route found.'}), 404

    return jsonify({
        'route': best_route,
        'shade_coverage': max_shade_coverage
    })

def decode_polyline(polyline_str):
    """Decodes a polyline using Google's algorithm."""
    import polyline
    return polyline.decode(polyline_str)

if __name__ == '__main__':
    app.run(debug=True)
