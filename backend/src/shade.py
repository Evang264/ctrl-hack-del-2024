from geopy.distance import geodesic
from datetime import datetime
import requests
import pvlib
from pvlib import solarposition
import pytz

# Calculate the shaded percentage of a given route
def calculate_shade(route, obstructions, sun_positions, date_time):
    shaded_distance = 0
    total_distance = 0
    
    # Get sun position for the given date_time at the first point of the route
    sun_pos = calculate_sun_position(route[0], date_time)

    for i in range(len(route) - 1):
        total_distance += geodesic(route[i], route[i + 1]).meters  # Total route length in meters
        segment_shade = calculate_segment_shade(route[i], route[i + 1], obstructions, sun_pos)
        shaded_distance += segment_shade
    
    shade_percentage = (shaded_distance / total_distance) * 100 if total_distance else 0
    return shade_percentage

# Function to calculate the sun's position for a given time and location
def calculate_sun_position(location, date_time):
    # Location: (latitude, longitude)
    # Date_time: datetime object
    
    lat, lon = location
    tz = pytz.timezone('America/Toronto')  # Timezone of Waterloo, ON
    date_time = tz.localize(date_time)  # Localize the datetime object to Toronto time zone
    
    # Use pvlib to calculate the sun's position at the given time
    solar_position = solarposition.get_solarposition(date_time, lat, lon)
    
    # Extract solar position info: azimuth (angle from north) and altitude (elevation angle)
    azimuth = solar_position['azimuth'].iloc[0]
    altitude = solar_position['elevation'].iloc[0]
    
    return {'azimuth': azimuth, 'altitude': altitude}

# Function to calculate shade for a route segment
def calculate_segment_shade(start_point, end_point, obstructions, sun_pos):
    shade_coverage = 0
    
    for obstruction in obstructions:
        # Check if obstruction is on the path
        if is_obstruction_on_path(start_point, end_point, obstruction):
            # Calculate the angle between the sun and the obstruction
            angle = calculate_obstruction_angle(start_point, obstruction['location'], sun_pos)
            # If the obstruction is blocking the sun (i.e., sun's altitude is lower than the obstruction angle)
            if angle < 0:  # Angle in this case represents if the obstruction blocks sunlight
                shade_coverage += 10  # This is a simplified approach
            
    return shade_coverage

# Function to calculate the angle of obstruction relative to the sun's position
def calculate_obstruction_angle(start_point, obstruction_point, sun_pos):
    # Calculate the direction from the start_point to the obstruction_point
    start_lat, start_lon = start_point
    obstruction_lat, obstruction_lon = obstruction_point
    
    # Use geodesic to calculate distance and azimuth from start_point to obstruction
    distance = geodesic(start_point, obstruction_point).meters
    azimuth = geodesic(start_point, obstruction_point).initial

    # Use sun's azimuth and altitude to calculate the angle
    sun_azimuth = sun_pos['azimuth']
    sun_altitude = sun_pos['altitude']

    # Simplified logic to compare angles - if the obstruction is in the way of the sun
    # In a more sophisticated model, you would calculate the shadow length and blockage based on sun altitude
    if abs(sun_azimuth - azimuth) < 45 and sun_altitude > 20:  # Check if obstruction is within a blocking range
        return -1  # The negative angle signifies that the obstruction is blocking sunlight
    return 1  # Otherwise, return a positive value, indicating no blockage

# Function to check if an obstruction lies on the path between two points
def is_obstruction_on_path(start_point, end_point, obstruction):
    # Simplified logic for checking if an obstruction is on the route path
    return geodesic(start_point, obstruction['location']).meters < 100 and geodesic(obstruction['location'], end_point).meters < 100
