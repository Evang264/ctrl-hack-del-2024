from pysolar.solar import get_altitude, get_azimuth
from datetime import datetime

def calculate_sun_position(lat, lng, datetime_obj):
    """
    Calculate the sun's position (altitude and azimuth) based on latitude,
    longitude, and a full datetime object.

    :param lat: Latitude of the location
    :param lng: Longitude of the location
    :param datetime_obj: Datetime object representing the specific time
    :return: Tuple of (altitude, azimuth) in degrees
    """
    # Calculate the altitude and azimuth using the pysolar library
    altitude = get_altitude(lat, lng, datetime_obj)
    azimuth = get_azimuth(lat, lng, datetime_obj)
    
    return altitude, azimuth
