import { Request, Response, Router } from 'express';
import { getCorners } from 'src/common/global';
import { chunkArray } from './chunkArray';
import { handleExportToOctave, SegmentResultType } from './octaveExportFunctions';
import axiosRetry from 'axios-retry';
const axios = require('axios')
var fs = require('fs');
const json = require('big-json');
const path = require('path');
const oboe = require('oboe');


axiosRetry(axios, { retries: 3 });

interface ElevationSegmentType {
    latitude: number,
    longitude: number,
    elevation: number,
    distance: number
  }

interface SegmentFullResultType {
    receiver: {
      longitude: number,
      latitude: number
    },
    points: Array<ElevationSegmentType>
  }


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
        // console.log("1  ")
        return response.data;
    }).then(async(body: any) => {
        // console.log("2  ")
        // console.log("2  ")

        return Promise.resolve(body.results)
    }).catch((error: any) => {
        console.log("3  ", error);
        return null;
    });
};

const removeResultsFile = () => {
    fs.stat(path.join(__dirname, '../../full-result.json'), function (err: string) {

        if (err) {
            return console.error(err);
        }
        fs.unlink(path.join(__dirname, '../../full-result.json'),function () {
            console.log("JSON removed");
            fs.writeFile(path.join(__dirname, '../../full-result.json'), '[', function () {

            });
        });
    });
}

router.post('/generate', async (req: Request, res: Response) => {
    try {
        const { adapter, radius, pointsDistance, fileName, dataFactor,  } = req.body;
        console.log("------> adapter", adapter)
        const coords = generateCoordinates(radius, pointsDistance, adapter.latitude, adapter.longitude);
        const corners = await getCorners(coords);
        removeResultsFile();


        let ITERATIONS = 800;
        if(dataFactor >= 300) {
            ITERATIONS = 2700;
        }
        const domain = 'http://0.0.0.0:10000';
        const chunkedArray = chunkArray(coords, ITERATIONS, true);
        const queryParameters: Record<string, any> = {}
        const allCoordinates: any = [];

        const headers: any = {};
        const form: Record<string, any> = {};
        headers["Accept"] = ["application/json"];
        headers["Content-Type"] = ["application/json"];


        const pathName = '/lookup-line-distance-all';

        let counter = 0;
        res.status(200).json({coordinates: "luz"});
        for(let i = 0; i < ITERATIONS; i++) {
            //@ts-ignore
            // headers["Content-Length"] = Buffer.byteLength(chunkedArray[i]);
            const body = {
                final: (i === ITERATIONS - 1),
                adapterLatitude: adapter.latitude,
                adapterLongitude: adapter.longitude,
                distance: pointsDistance,
                receivers: chunkedArray[i],
            };
            const result = await makeRequest('POST', domain + '/api/v1' + pathName, body, body, headers, queryParameters, form);
            if(result) {
                try {

                    counter = counter + 1;
                       //@ts-ignore
                    req.app.io.emit("loaderGenerate", counter);
                   if(counter === ITERATIONS){
                    fs.appendFile(path.join(__dirname, '../../full-result.json'), '""]', function (err: string) {
                        if (err) throw err;

                        console.log('Saved!');
                        const readStream = fs.createReadStream(path.join(__dirname, '../../full-result.json'));
                        oboe(readStream)
                        .node('!.*', function(drink: any){

                          allCoordinates.push(drink);

                           // By returning oboe.drop, the parsed JSON object will be freed,
                           // allowing it to be garbage collected.
                           return oboe.drop;

                        }).done(function( finalJson: any ){

                           // most of the nodes have been dropped

                           console.log( finalJson );  // logs: {"drinks":[]}
                                   //@ts-ignore
                                const dataConstructedForOctave: Array<SegmentResultType> = constructDataForOctave(allCoordinates, adapter.latitude, adapter.longitude, adapter.height, `${adapter.frequency}`);

                                handleExportToOctave(dataConstructedForOctave, adapter.longitude,adapter.latitude, adapter.height, fileName, dataFactor, corners, `${adapter.frequency}`, req )

                        })





                    });

                   }
                }catch (err) {
                    console.error("parsing erorr")
                    return res.status(404).json({
                        error: err.message,
                }
                );

            }
        }}





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

const constructDataForOctave = (data: any, latitude: number, longitude: number, height: string, frequency: string):any  => {
    const resultArray:any  = [];

    data && data.map((element:SegmentFullResultType, iterator: number) => {
        // console.log("--- ", element.)
        if(element.receiver) {
            resultArray.push({
                coordinates: element.points,
                adapter: { latitude: latitude, longitude: longitude, height: height, frequency: frequency},
                receiver:  { latitude: +element.receiver.latitude, longitude: +element.receiver.longitude }
              });
        }
      });
      return resultArray;
}


export default router;