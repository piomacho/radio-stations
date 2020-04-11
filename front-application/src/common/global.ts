export interface LocationType {
    latitude: number,
    longitude: number
}

interface LocationsType {
    locations: Array<LocationType>
}

export const callApiFetch = async (api: string, params?: any) => {
    const response = await fetch(api, params);
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);

    return body;
};


export const generateTrialCoordinates = (x0: number, y0:number, range: number): Array<LocationType> => {
     const cArray: Array<LocationType>  = [];

     for(let x = 0; x < range/2; x++ ) {
       for(let y = 0; y < range/2; y++) {
        //  measureDistance(0, 1, 1, 1 );
         cArray.push({latitude: Math.round(((x0 + 0.001 * x) + Number.EPSILON) * 1000) / 1000, longitude: Math.round(((y0 + 0.001 * y) + Number.EPSILON) * 1000) / 1000 })
       }
     }


     for(let x = 0; x < range/2; x++ ) {
      for(let y = 0; y < range/2; y++) {
       //  measureDistance(0, 1, 1, 1 );
        cArray.push({latitude: Math.round(((x0 - 0.001 * x) + Number.EPSILON) * 1000) / 1000, longitude: Math.round(((y0 + 0.001 * y) + Number.EPSILON) * 1000) / 1000 })
      }
    }

    for(let x = 0; x < range/2; x++ ) {
      for(let y = 0; y < range/2; y++) {
       //  measureDistance(0, 1, 1, 1 );
        cArray.push({latitude: Math.round(((x0 - 0.001 * x) + Number.EPSILON) * 1000) / 1000, longitude: Math.round(((y0 - 0.001 * y) + Number.EPSILON) * 1000) / 1000 })
      }
    }


    for(let x = 0; x < range/2; x++ ) {
      for(let y = 0; y < range/2; y++) {
       //  measureDistance(0, 1, 1, 1 );
        cArray.push({latitude: Math.round(((x0 + 0.001 * x) + Number.EPSILON) * 1000) / 1000, longitude: Math.round(((y0 - 0.001 * y) + Number.EPSILON) * 1000) / 1000 })
      }
    }

     return cArray;
   }


export const measureDistance = (lat1: number , lon1: number, step: number): number => {
    const R = 6378.137; // Radius of earth in KM
    const dLat = (lat1 + step) * Math.PI / 180 - lat1 * Math.PI / 180;
    const dLon = (lon1 + step) * Math.PI / 180 - lon1 * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos((lat1 + step) * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    return d * 1000; // meters
}