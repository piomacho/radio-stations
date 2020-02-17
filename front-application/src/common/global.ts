export interface LocationType {
    latitude: number,
    longitude: number
}

interface LocationsType {
    locations: Array<LocationType>
}

export const callApiFetch = async (api: string) => {
    const response = await fetch(api);
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    
    return body;
};


export const generateTrialCoordinates = (x0: number, y0:number, range: number): Array<LocationType> => {
     const cArray: Array<LocationType>  = [];
 
     for(let x = 0; x < range; x++ ) {
       for(let y = 0; y < range; y++) {
         cArray.push({latitude: Math.round(((x0 + 0.001 * x) + Number.EPSILON) * 1000) / 1000, longitude: Math.round(((y0 + 0.001 * y) + Number.EPSILON) * 1000) / 1000 })
       }
     }
     return cArray;
   }