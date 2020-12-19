import { Request, Response, Router } from 'express';
import { chunkArray } from './chunkArray';
const axios = require('axios')
var fs = require('fs');



const router = Router();

const mergeQueryParams = (parameters:  Record<string, any>, queryParameters:  Record<string, any>) => {
    if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters)
            .forEach(function(parameterName) {
                let parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
    }
    return queryParameters;
}
const serializeQueryParams = (parameters: Record<string, any>) => {
    let str = [];
    for (let p in parameters) {
        if (parameters.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + '=' + encodeURIComponent(parameters[p]));
        }
    }
    return str.join('&');
}

const makeRequest = (
    method: string,
    url: string,
    parameters: Record<string, any>,
    body: Record<string, any> | undefined | any,
    headers: Record<string, any>,
    queryParameters: Record<string, any>,
    form: Record<string, any>,
    ): string | null => {
    const queryParams = queryParameters && Object.keys(queryParameters).length ? serializeQueryParams(queryParameters) : null;
    const urlWithParams = url + (queryParams ? '?' + queryParams : '');

    if (body && !Object.keys(body).length) {
        body = undefined;
    }

    return axios
  .post(urlWithParams, {
    body
  }).then(async(response: any) => {
        console.log("makeRequest 1  ")
        return response.data;
    }).then(async(body: any) => {
        console.log("makeRequest 2  ")
        // console.log("2  ")

        return Promise.resolve(body)
    }).catch((error: any) => {
        console.log("3  ");
        return null;
    });
};
// fetch(urlWithParams, {
//     method,
//     headers,
//     body: JSON.stringify(body)
// })
router.post('/generate', async (req: Request, res: Response) => {
    try {
        const { adapterLatitude, adapterLongitude, radius, pointsDistance } = req.body;
        const coords = generateCoordinates(radius, pointsDistance,adapterLatitude, adapterLongitude);
        let ITERATIONS = 200;
        const domain = 'http://0.0.0.0:10000';
        const chunkedArray = chunkArray(coords, ITERATIONS, true);
        const queryParameters: Record<string, any> = {}
        const allCoordinates = [];

        const headers: any = {};
        const form: Record<string, any> = {};
        headers["Accept"] = ["application/json"];
        headers["Content-Type"] = ["application/json"];

        const path = '/lookup-line-distance-all';

        for(let i = 0; i < ITERATIONS; i++) {
            const body = {
                adapterLatitude: adapterLatitude,
                adapterLongitude: adapterLongitude,
                distance: pointsDistance,
                receivers: chunkedArray[i],
            };
            const result = await makeRequest('POST', domain + '/api/v1' + path, body, body, headers, queryParameters, form);

            if(result) {
                allCoordinates.push(result);
                //@ts-ignore
                req.app.io.emit("loaderGenerate", i + 1);
                console.log("---->   ", allCoordinates.length)
            }
        }


        console.log("koniec ", allCoordinates.length)
            return res.status(200).json({
                coordinates: allCoordinates,
            });


    } catch (err) {
        return res.status(404).json({
            error: err.message,
        });
    }

});

const generateCoordinates = (radius: number, distance: number, latitude0: number, longitude0: number) => {
    const numberOfPoints = radius/distance;
    const cArray: any = [];

    let long = longitude0;
    let lat = latitude0;


    for (let i = 0; i < numberOfPoints; i++) {

        for (let j = 0; j < numberOfPoints; j++) {
            const results = destinationPoint(0, distance * j, lat, long);
            const latitudeNew = results && results.lat;
            const longitudeNew =  results && results.lon;
            cArray.push({"latitude": latitudeNew, "longitude": longitudeNew});
        }
        const a = destinationPoint(90, distance, latitude0, long)
        long = a !== null ? a.lon : 0;

    }
    long = longitude0;
    lat = latitude0;

    for (let i2 = 0; i2 < numberOfPoints; i2++) {
        for (let j2 = 1; j2 < numberOfPoints; j2++) {
            const results = destinationPoint(180, distance * j2, lat, long);
            const latitudeNew = results && results.lat;
            const longitudeNew =  results && results.lon;
            cArray.push({"latitude": latitudeNew, "longitude": longitudeNew});
        }
        const a = destinationPoint(90, distance, latitude0, long)
        long = a !== null ? a.lon : 0;
    }
    long = longitude0;
    lat = latitude0;


    for (let i3= 0; i3 < numberOfPoints; i3++) {
        for (let j3 = 0; j3 < numberOfPoints; j3++) {
            const results = destinationPoint(180, distance * j3, lat, long);
            const latitudeNew = results && results.lat;
            const longitudeNew = results && results.lon;
            cArray.push({"latitude": latitudeNew, "longitude": longitudeNew});
        }
        const a = destinationPoint(270, distance, latitude0, long)
        long = a !== null ? a.lon : 0;
    }
    long = longitude0;
    lat = latitude0;

    for (let i4 = 0; i4 < numberOfPoints; i4++) {
        for (let j4 = 1; j4 < numberOfPoints; j4++) {
            const results = destinationPoint(0, distance * j4, lat, long);
            const latitudeNew = results && results.lat;
            const longitudeNew =  results && results.lon;
            cArray.push({"latitude": latitudeNew, "longitude": longitudeNew});
        }
        const a = destinationPoint(270, distance, latitude0, long)
        long = a !== null ? a.lon : 0;

    }
    // fs.writeFile('damne.txt', JSON.stringify(cArray), function (err: any) {
    //     if (err) throw err;
    //     console.log('Saved!');
    //   });
    return cArray;
};


const destinationPoint = (brng: number, dist: number, lat: number, lng: number) => {
    dist = dist / 6371;
    brng = degrees_to_radians(brng);

    var lat1 = degrees_to_radians(lat);
    const lon1 = degrees_to_radians(lng);

    var lat2 = Math.asin(Math.sin(lat1) * Math.cos(dist) +
                         Math.cos(lat1) * Math.sin(dist) * Math.cos(brng));

    var lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(dist) *
                                 Math.cos(lat1),
                                 Math.cos(dist) - Math.sin(lat1) *
                                 Math.sin(lat2));

    if (isNaN(lat2) || isNaN(lon2)) return null;

    return {lat: radians_to_degrees(lat2), lon: radians_to_degrees(lon2)};
 }


const checkNextPoint = (bearing: number, distance: number, latitude: number, longitude: number) => {
    const R = 6371 //Radius of the Earth
    const brng = degrees_to_radians(bearing); //Bearing is 90 degrees converted to radians.
    console.log("brng ", brng)
    const d = distance; //Distance in km

    const lat1 = degrees_to_radians(latitude)
    const lon1 = degrees_to_radians(longitude)

    const lat2 = Math.asin( Math.sin(lat1)*Math.cos(d/R) +
     Math.cos(lat1)*Math.sin(d/R)*Math.cos(brng))

    const lon2 = lon1 + Math.atan2(Math.sin(brng)*Math.sin(d/R)*Math.cos(lat1),
             Math.cos(d/R)-Math.sin(lat1)*Math.sin(lat2))

    const lat2Res = radians_to_degrees(lat2)
    const lon2Res = radians_to_degrees(lon2)

    return {lat: lat2Res, lon: lon2Res};

}

const degrees_to_radians = (degrees: number) => {
  var pi = Math.PI;
  return degrees * (pi/180);
}

const radians_to_degrees = (radians: number) => {
  var pi = Math.PI;
  return radians * (180/pi);
}

export default router;
