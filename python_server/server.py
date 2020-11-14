# coding: utf-8
import sys
import json
import bottle
import math
import numpy
from bottle import route, run, request, response, hook

from gdal_interfaces import GDALTileInterface

import jsonpickle

class InternalException(ValueError):
    """
    Utility exception class to handle errors internally and return error codes to the client
    """
    pass


"""
Initialize a global interface. This can grow quite large, because it has a cache.
"""
interface = GDALTileInterface('data/', 'data/summary.json')
interface.create_summary_json()

def get_elevation(lat, lng):
    """
    Get the elevation at point (lat,lng) using the currently opened interface
    :param lat:
    :param lng:
    :return:
    """
    try:
        elevation = interface.lookup(lat, lng)
    except:
        return {
            'latitude': lat,
            'longitude': lng,
            'error': 'No such coordinate (%s, %s)' % (lat, lng)
        }
    return {
        'latitude': lat,
        'longitude': lng,
        'elevation': elevation
    }

def get_elevation_distance(lat, lng, distance):
    """
    Get the elevation at point (lat,lng) using the currently opened interface
    :param lat:
    :param lng:
    :return:
    """
    try:
        elevation = interface.lookup(lat, lng)
    except:
        return {
            'latitude': lat,
            'longitude': lng,
            'error': 'No such coordinate (%s, %s)' % (lat, lng)
        }

    return {
        'latitude': lat,
        'longitude': lng,
        'elevation': elevation,
        'distance': distance
    }

def get_elevation_distance_all(point):
    """
    Get the elevation at point (lat,lng) using the currently opened interface
    :param lat:
    :param lng:
    :return:

    """
    try:
        elevation = interface.lookup(point['latitude'], point['longitude'])
    except:
        return {
            'latitude': point['latitude'],
            'longitude': point['longitude'],
            'error': 'No such coordinate (%s, %s)' % (point['latitude'], point['longitude'])
        }

    return {
        'latitude': point['latitude'],
        'longitude': point['longitude'],
        'elevation': elevation,
        'distance': point['distance']
    }

@hook('after_request')
def enable_cors():
    """
    Enable CORS support.
    :return:
    """
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'PUT, GET, POST, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'


def lat_lng_from_location(location_with_comma):
    """
    Parse the latitude and longitude of a location in the format "xx.xxx,yy.yyy" (which we accept as a query string)
    :param location_with_comma:
    :return:
    """
    try:
        lat, lng = [float(i) for i in location_with_comma.split(',')]
        return lat, lng
    except:
        raise InternalException(json.dumps({'error': 'Bad parameter format "%s".' % location_with_comma}))


def query_to_locations():
    """
    Grab a list of locations from the query and turn them into [(lat,lng),(lat,lng),...]
    :return:
    """
    locations = request.query.locations
    if not locations:
        raise InternalException(json.dumps({'error': '"Locations" is required.'}))

    return [lat_lng_from_location(l) for l in locations.split('|')]


def body_to_locations():
    """
    Grab a list of locations from the body and turn them into [(lat,lng),(lat,lng),...]
    :return:
    """
    try:
        locations = request.json.get('locations', None)
    except Exception:
        raise InternalException(json.dumps({'error': 'Invalid JSON.'}))

    if not locations:
        raise InternalException(json.dumps({'error': '"Locations" is required in the body.'}))

    latlng = []
    for l in locations:
        try:
            latlng += [ (l['latitude'],l['longitude']) ]
        except KeyError:
            raise InternalException(json.dumps({'error': '"%s" is not in a valid format.' % l}))

    return latlng


def degrees_to_radians(degrees):
    pi = math.pi
    return degrees * (pi/180)

def radians_to_degrees(radians):
    return radians * (180 / math.pi)


def measureDistance(lat1, lon1, lat2, lon2):
    R = 6373.0

    lat1 = math.radians(lat1)
    lon1 = math.radians(lon1)
    lat2 = math.radians(lat2)
    lon2 = math.radians(lon2)

    dlon = lon2 - lon1
    dlat = lat2 - lat1

    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    distance = R * c

    return distance


def newCoordinates(latitude, longitude, dy, dx):
    r_earth = 6378.137
    new_latitude  = latitude  + (dy / r_earth) * (180 / math.pi)
    new_longitude = longitude + (dx / r_earth) * (180 / math.pi) / math.cos(latitude * math.pi/180)
    d = dict()
    d['lat'] = new_latitude
    d['lon'] = new_longitude
    return d

def getPoint(adapterX, adapterY, distance, m):
    point_b = (adapterX+dx(distance,m), adapterY+dy(distance,m))
    other_possible_point_b = (adapterX-dx(distance,m), adapterY-dy(distance,m)) # going the other way
    return point_b


def dy(distance, m):
    return m*dx(distance, m)

def dx(distance, m):
    return math.sqrt(distance/(m**2+1))

def calculate_initial_compass_bearing(adapterLongitude, adapterLatitude, receiverLongitude, receiverLatitude):

    lat1 = math.radians(adapterLatitude)
    lat2 = math.radians(receiverLatitude)

    diffLong = math.radians(adapterLongitude - receiverLongitude)

    x = math.sin(diffLong) * math.cos(lat2)
    y = math.cos(lat1) * math.sin(lat2) - (math.sin(lat1)
            * math.cos(lat2) * math.cos(diffLong))

    initial_bearing = math.atan2(x, y)

    initial_bearing = math.degrees(initial_bearing)
    compass_bearing = (initial_bearing + 360) % 360

    return compass_bearing



def calculateBearing(adapterLongitude, adapterLatitude, receiverLongitude, receiverLatitude):
    X = math.cos(receiverLatitude) * math.sin(receiverLongitude - adapterLongitude)
    Y = math.cos(adapterLatitude) * math.sin(receiverLatitude) - math.sin(adapterLatitude) * math.cos(receiverLatitude) * math.cos(receiverLongitude - adapterLongitude)
    B = math.atan2(X,Y)

    return B

def generateCoordinatesNew(range1, numberOfPoints, adapterLongitude, adapterLatitude, receiverLongitude, receiverLatitude):
    cArray = []
    brng = calculateBearing(degrees_to_radians(adapterLongitude), degrees_to_radians(adapterLatitude), degrees_to_radians(receiverLongitude), degrees_to_radians(receiverLatitude))

    for x in range(int(numberOfPoints)):
        d = (float(range1)/int(numberOfPoints)) * x

        R = 6378.1 #Radius of the Earth

        lat1 = math.radians(adapterLatitude) #Current lat point converted to radians
        lon1 = math.radians(adapterLongitude) #Current long point converted to radians

        lat2 = math.asin( math.sin(lat1)*math.cos(d/R) +
            math.cos(lat1)*math.sin(d/R)*math.cos(brng))

        lon2 = lon1 + math.atan2(math.sin(brng)*math.sin(d/R)*math.cos(lat1),
                    math.cos(d/R)-math.sin(lat1)*math.sin(lat2))

        lat2 = math.degrees(lat2)
        lon2 = math.degrees(lon2)

        cArray += [{"distance": measureDistance( adapterLatitude, adapterLongitude, lat2, lon2 ),"latitude": lat2, "longitude": lon2}]

    return cArray
class result:
    def __init__(self, coords, points):
        self.coords = coords
        self.points = points

class fullResult:
    def __init__(self, coords, points):
        self.receiver = coords
        self.points = points

def generateCoordinatesDistanceAll(distance, adapterLongitude, adapterLatitude, receivers):
    cArray = []
    resultArray=[]
    for i in range(int(len(receivers))):
        cArray = []

        brng = calculateBearing(degrees_to_radians(adapterLongitude), degrees_to_radians(adapterLatitude), degrees_to_radians(receivers[i]['longitude']), degrees_to_radians(receivers[i]['latitude']))
        range1 = measureDistance(adapterLatitude, adapterLongitude, receivers[i]['latitude'], receivers[i]['longitude'])
        numberOfPoints = float(range1)/float(distance)
        for x in range(int(numberOfPoints)):
            d = (float(range1)/int(numberOfPoints)) * x

            R = 6378.1 #Radius of the Earth

            lat1 = math.radians(adapterLatitude) #Current lat point converted to radians
            lon1 = math.radians(adapterLongitude) #Current long point converted to radians

            lat2 = math.asin( math.sin(lat1)*math.cos(d/R) +
                math.cos(lat1)*math.sin(d/R)*math.cos(brng))

            lon2 = lon1 + math.atan2(math.sin(brng)*math.sin(d/R)*math.cos(lat1),
                        math.cos(d/R)-math.sin(lat1)*math.sin(lat2))

            lat2 = math.degrees(lat2)
            lon2 = math.degrees(lon2)
            cArray += [{"distance": measureDistance( adapterLatitude, adapterLongitude, lat2, lon2 ),"latitude": lat2, "longitude": lon2}]
            if(x == int(numberOfPoints) - 1):
                resultArray.append(result({"latitude": receivers[i]['latitude'], "longitude": receivers[i]['longitude']}, cArray))

    return resultArray

def generateCoordinatesDistance(range1, distance, adapterLongitude, adapterLatitude, receiverLongitude, receiverLatitude):
    cArray = []
    brng = calculateBearing(degrees_to_radians(adapterLongitude), degrees_to_radians(adapterLatitude), degrees_to_radians(receiverLongitude), degrees_to_radians(receiverLatitude))

    numberOfPoints = float(range1)/int(distance);

    for x in range(int(numberOfPoints)):
        d = (float(range1)/int(numberOfPoints)) * x

        R = 6378.1 #Radius of the Earth

        lat1 = math.radians(adapterLatitude) #Current lat point converted to radians
        lon1 = math.radians(adapterLongitude) #Current long point converted to radians

        lat2 = math.asin( math.sin(lat1)*math.cos(d/R) +
            math.cos(lat1)*math.sin(d/R)*math.cos(brng))

        lon2 = lon1 + math.atan2(math.sin(brng)*math.sin(d/R)*math.cos(lat1),
                    math.cos(d/R)-math.sin(lat1)*math.sin(lat2))

        lat2 = math.degrees(lat2)
        lon2 = math.degrees(lon2)

        cArray += [{"distance": measureDistance( adapterLatitude, adapterLongitude, lat2, lon2 ),"latitude": lat2, "longitude": lon2}]

    return cArray

def generateCoordinates(range1, x0, y0):
    unitDistance = 0.007
    cArray = []
    for x in range(range1):
        for y in range(range1):
            latitudeNew = round(((x0 + unitDistance * x) + sys.float_info.epsilon) * 1000) / 1000
            longitudeNew =  round(((y0 + unitDistance * y) + sys.float_info.epsilon) * 1000) / 1000
            cArray += [{"latitude": latitudeNew, "longitude": longitudeNew, "distance": measureDistance( x0, y0, latitudeNew, longitudeNew ) }]

    for x1 in range(range1):
        for y1 in range(range1):
            latitudeNew = round(((x0 - unitDistance * x1) + sys.float_info.epsilon) * 1000) / 1000
            longitudeNew =  round(((y0 + unitDistance * y1) + sys.float_info.epsilon) * 1000) / 1000
            cArray += [{"latitude": latitudeNew, "longitude": longitudeNew, "distance": measureDistance( x0, y0, latitudeNew, longitudeNew ) }]

    for x2 in range(range1):
        for y2 in range(range1):
            latitudeNew = round(((x0 - unitDistance * x2) + sys.float_info.epsilon) * 1000) / 1000
            longitudeNew =  round(((y0 - unitDistance * y2) + sys.float_info.epsilon) * 1000) / 1000
            cArray += [{"latitude": latitudeNew, "longitude": longitudeNew, "distance": measureDistance( x0, y0, latitudeNew, longitudeNew )}]

    for x3 in range(range1):
        for y3 in range(range1):
            latitudeNew = round(((x0 + unitDistance * x3) + sys.float_info.epsilon) * 1000) / 1000
            longitudeNew =  round(((y0 - unitDistance * y3) + sys.float_info.epsilon) * 1000) / 1000
            cArray += [{"latitude": latitudeNew, "longitude": longitudeNew, "distance": measureDistance( x0, y0, latitudeNew, longitudeNew ) }]
    return cArray

def body_to_adapter():
    try:
        adapterLatitude = request.json.get('adapterLatitude', None)
        adapterLongitude = request.json.get('adapterLongitude', None)
        rangePar = request.json.get('range', None)
    except Exception:
        raise InternalException(json.dumps({'error': 'Invalid JSON.'}))

    if not adapterLatitude:
        raise InternalException(json.dumps({'error': '"adapterLatitude" is required in the body.'}))
    if not adapterLongitude:
        raise InternalException(json.dumps({'error': '"adapterLongitude" is required in the body.'}))
    if not rangePar:
        raise InternalException(json.dumps({'error': '"range" is required in the body.'}))

    locations = generateCoordinates(rangePar, adapterLatitude, adapterLongitude)
    latlng = [];

    for l in locations:
        try:
            latlng += [ (l['latitude'],l['longitude'], l['distance']) ]
        except KeyError:
            raise InternalException(json.dumps({'error': '"%s" is not in a valid format.' % l}))

    return latlng

def body_to_line_distance():
    try:
        adapterLatitude = request.json.get('adapterLatitude', None)
        adapterLongitude = request.json.get('adapterLongitude', None)
        distance = request.json.get('distance', None)
        adapterLatitude = request.json.get('adapterLatitude', None)
        receiverLatitude = request.json.get('receiverLatitude', None)
        receiverLongitude = request.json.get('receiverLongitude', None)
        rangePar = request.json.get('range', None)


    except Exception:
        raise InternalException(json.dumps({'error': 'Invalid JSON.'}))

    if not adapterLatitude:
        raise InternalException(json.dumps({'error': '"adapterLatitude" is required in the body.'}))
    if not adapterLongitude:
        raise InternalException(json.dumps({'error': '"adapterLongitude" is required in the body.'}))
    if not rangePar:
        raise InternalException(json.dumps({'error': '"range" is required in the body.'}))
    if not distance:
        raise InternalException(json.dumps({'error': '"distance" is required in the body.'}))
    if not receiverLatitude:
        raise InternalException(json.dumps({'error': '"receiverLatitude" is required in the body.'}))
    if not receiverLongitude:
        raise InternalException(json.dumps({'error': '"receiverLongitude" is required in the body.'}))
    # GENEROWANIE SIATKI PUNKTOW
    locations = generateCoordinatesDistance(rangePar, distance, adapterLongitude, adapterLatitude, receiverLongitude, receiverLatitude)
    latlng = [];
    for l in locations:
        try:
            latlng += [ (l['latitude'],l['longitude'],l['distance']) ]
        except KeyError:
            raise InternalException(json.dumps({'error': '"%s" is not in a valid format.' % l}))

    d = dict();
    d['results'] = latlng
    d['receiverLatitude']   = receiverLatitude
    d['receiverLongitude']   = receiverLongitude


    return d

def body_to_line_distance_all():
    try:
        adapterLatitude = request.json.get('adapterLatitude', None)
        adapterLongitude = request.json.get('adapterLongitude', None)
        distance = request.json.get('distance', None)
        receivers = request.json.get('receivers', None)

    except Exception:
        raise InternalException(json.dumps({'error': 'Invalid JSON.'}))

    if not adapterLatitude:
        raise InternalException(json.dumps({'error': '"adapterLatitude" is required in the body.'}))
    if not adapterLongitude:
        raise InternalException(json.dumps({'error': '"adapterLongitude" is required in the body.'}))
    if not distance:
        raise InternalException(json.dumps({'error': '"distance" is required in the body.'}))
    if not receivers:
        raise InternalException(json.dumps({'error': '"receivers" is required in the body.'}))

    # GENEROWANIE SIATKI PUNKTOW

    locations = generateCoordinatesDistanceAll(distance, adapterLongitude, adapterLatitude, receivers)

    latlng = []
    latLngFull = []

    d = dict();

    return locations

def body_to_line():
    try:
        adapterLatitude = request.json.get('adapterLatitude', None)
        adapterLongitude = request.json.get('adapterLongitude', None)
        numberOfPoints = request.json.get('numberOfPoints', None)
        adapterLatitude = request.json.get('adapterLatitude', None)
        receiverLatitude = request.json.get('receiverLatitude', None)
        receiverLongitude = request.json.get('receiverLongitude', None)
        rangePar = request.json.get('range', None)

    except Exception:
        raise InternalException(json.dumps({'error': 'Invalid JSON.'}))

    if not adapterLatitude:
        raise InternalException(json.dumps({'error': '"adapterLatitude" is required in the body.'}))
    if not adapterLongitude:
        raise InternalException(json.dumps({'error': '"adapterLongitude" is required in the body.'}))
    if not rangePar:
        raise InternalException(json.dumps({'error': '"range" is required in the body.'}))
    if not numberOfPoints:
        raise InternalException(json.dumps({'error': '"numberOfPoints" is required in the body.'}))
    if not receiverLatitude:
        raise InternalException(json.dumps({'error': '"receiverLatitude" is required in the body.'}))
    if not receiverLongitude:
        raise InternalException(json.dumps({'error': '"receiverLongitude" is required in the body.'}))

    locations = generateCoordinatesNew(rangePar, numberOfPoints, adapterLongitude, adapterLatitude, receiverLongitude, receiverLatitude)
    latlng = [];
    for l in locations:
        try:
            latlng += [ (l['latitude'],l['longitude'],l['distance']) ]
        except KeyError:
            raise InternalException(json.dumps({'error': '"%s" is not in a valid format.' % l}))

    return latlng



def do_lookup(get_locations_func):
    """
    Generic method which gets the locations in [(lat,lng),(lat,lng),...] format by calling get_locations_func
    and returns an answer ready to go to the client.
    :return:
    """
    try:
        locations = get_locations_func()
        return {'results': [get_elevation_distance(lat, lng, dst) for (lat, lng, dst) in locations]}
    except InternalException as e:
        response.status = 400
        response.content_type = 'application/json'
        return e.args[0]



def do_lookup_distance(get_locations_func):
    """
    Generic method which gets the locations in [(lat,lng),(lat,lng),...] format by calling get_locations_func
    and returns an answer ready to go to the client.
    :return:
    """
    try:
        locations = get_locations_func()
        return {'results': [get_elevation_distance(lat, lng, dst) for (lat, lng, dst) in locations]}
    except InternalException as e:
        response.status = 400
        response.content_type = 'application/json'
        return e.args[0]


def do_lookup_line_distance(get_locations_func):
    """
    Generic method which gets the locations in [(lat,lng),(lat,lng),...] format by calling get_locations_func
    and returns an answer ready to go to the client.
    :return:
    """
    try:
        locations = get_locations_func()['results']
        latitude = get_locations_func()['receiverLatitude']
        longitude = get_locations_func()['receiverLongitude']
        return {'results': [get_elevation_distance(lat, lng, dst) for (lat, lng, dst) in locations], 'receiver': {'latitude': latitude, 'longitude': longitude }}
    except InternalException as e:
        response.status = 400
        response.content_type = 'application/json'
        return e.args[0]

def do_lookup_line_distance_all(get_locations_func):
    """
    Generic method which gets the locations in [(lat,lng),(lat,lng),...] format by calling get_locations_func
    and returns an answer ready to go to the client.
    :return:
    """
    try:
        resultArray = []
        allData = get_locations_func();
        for data in allData:
            resultArray.append(fullResult({'latitude': data.coords['latitude'], 'longitude': data.coords['longitude'] }, [get_elevation_distance_all(pointData) for pointData in data.points] ))
        finalResult = jsonpickle.encode(resultArray, unpicklable=False)
        return {'results': finalResult}
    except InternalException as e:
        response.status = 400
        response.content_type = 'application/json'
        return e.args[0]

def do_lookup_new(get_locations_func):
    """
    Generic method which gets the locations in [(lat,lng),(lat,lng),...] format by calling get_locations_func
    and returns an answer ready to go to the client.
    :return:
    """
    try:
        locations = get_locations_func()
        return {'results': locations}
    except InternalException as e:
        response.status = 400
        response.content_type = 'application/json'
        return e.args[0]

# Base Endpoint
URL_ENDPOINT = '/api/v1/lookup'

# For CORS
@route(URL_ENDPOINT, method=['OPTIONS'])
def cors_handler():
    return {}

@route(URL_ENDPOINT, method=['GET'])
def get_lookup():
    """
    GET method. Uses query_to_locations.
    :return:
    """
    return do_lookup(query_to_locations)


@route(URL_ENDPOINT, method=['POST'])
def post_lookup():
    """
        GET method. Uses body_to_locations.
        :return:
        """
    return do_lookup(body_to_locations)

# Base Endpoint
URL_ENDPOINT_NEW = '/api/v1/lookupnew'

# For CORS
@route(URL_ENDPOINT_NEW, method=['OPTIONS'])
def cors_handler():
    return {}

@route(URL_ENDPOINT_NEW, method=['POST'])
def post_lookup_new():
    """
        GET method. Uses body_to_locations.
        :return:
        """
    return do_lookup(body_to_adapter)

# Base Endpoint
URL_ENDPOINT_LINE = '/api/v1/lookup-line'

# For CORS
@route(URL_ENDPOINT_LINE, method=['OPTIONS'])
def cors_handler():
    return {}

@route(URL_ENDPOINT_LINE, method=['POST'])
def post_lookup_line():
    """
        GET method. Uses body_to_locations.
        :return:
        """
    return do_lookup_distance(body_to_line)


# Base Endpoint
URL_ENDPOINT_LINE_DISTANCE = '/api/v1/lookup-line-distance'

# For CORS
@route(URL_ENDPOINT_LINE_DISTANCE, method=['OPTIONS'])
def cors_handler():
    return {}

@route(URL_ENDPOINT_LINE_DISTANCE, method=['POST'])
def post_lookup_line_distance():
    """
        GET method. Uses body_to_locations.
        :return:
        """
    return do_lookup_line_distance(body_to_line_distance)


# Base Endpoint
URL_ENDPOINT_LINE_DISTANCE_ALL = '/api/v1/lookup-line-distance-all'

# For CORS
@route(URL_ENDPOINT_LINE_DISTANCE_ALL, method=['OPTIONS'])
def cors_handler():
    return {}

@route(URL_ENDPOINT_LINE_DISTANCE_ALL, method=['POST'])
def post_lookup_line_distance_all():
    """
        GET method. Uses body_to_locations.
        :return:
        """
    return do_lookup_line_distance_all(body_to_line_distance_all)

run(host='0.0.0.0', port=10000, server='gunicorn', workers=4)

