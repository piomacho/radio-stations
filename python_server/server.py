import sys
import json
import bottle
from bottle import route, run, request, response, hook

from gdal_interfaces import GDALTileInterface


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

def generateCoordinates(range1, x0, y0):

    cArray = []
    for x in range(range1):
        for y in range(range1):
            cArray += [{"latitude": round(((x0 + 0.001 * x) + sys.float_info.epsilon) * 1000) / 1000, "longitude": round(((y0 + 0.001 * y) + sys.float_info.epsilon) * 1000) / 1000 }]

    for x1 in range(range1):
        for y1 in range(range1):
            cArray += [{"latitude": round(((x0 - 0.001 * x1) + sys.float_info.epsilon) * 1000) / 1000, "longitude": round(((y0 + 0.001 * y1) + sys.float_info.epsilon) * 1000) / 1000 }]

    for x2 in range(range1):
        for y2 in range(range1):
            cArray += [{"latitude": round(((x0 - 0.001 * x2) + sys.float_info.epsilon) * 1000) / 1000, "longitude": round(((y0 - 0.001 * y2) + sys.float_info.epsilon) * 1000) / 1000 }]

    for x3 in range(range1):
        for y3 in range(range1):
            cArray += [{"latitude": round(((x0 + 0.001 * x3) + sys.float_info.epsilon) * 1000) / 1000, "longitude": round(((y0 - 0.001 * y3) + sys.float_info.epsilon) * 1000) / 1000 }]
    return cArray

def body_to_adapter():
    print("body_to_adapters ")
    print("TU ->>> ",generateCoordinates(20, 15.33, 20))
    try:
        print("tried", request.json)
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

    latlng = [1, 2]
    print("MYK !! ")
    # for l in locations:
    #     try:
    #         latlng += [ (l['latitude'],l['longitude']) ]
    #     except KeyError:
    #         raise InternalException(json.dumps({'error': '"%s" is not in a valid format.' % l}))

    return latlng



def do_lookup(get_locations_func):
    """
    Generic method which gets the locations in [(lat,lng),(lat,lng),...] format by calling get_locations_func
    and returns an answer ready to go to the client.
    :return: 
    """
    try:
        locations = get_locations_func()
        return {'results': [get_elevation(lat, lng) for (lat, lng) in locations]}
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
	print("du lukap new ")
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
    return do_lookup_new(body_to_adapter)

run(host='0.0.0.0', port=10000, server='gunicorn', workers=4)