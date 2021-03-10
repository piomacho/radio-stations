import { CoordinatesType } from "src/routes/OctaveExport";
export interface LocationType {
    lat: number,
    lng: number
}

interface LocationsType {
    locations: Array<LocationType>
}
export const getFieldsFromObject = (objectMap: Record<string, any>, fields: Array<string>) =>{
    return objectMap.map((element: Record<string, any>) => {
        let obj: Record<string, any> = {};
        fields.map((field: string) =>{
            obj[field] = element[field];
        })
        return obj;
    });
}


export const getCorners = async(results: Array<LocationType>) => {
    const grouped = sortAndGroupResultElements(results);
    const keysOfGroupedArray = Object.keys(grouped).map((item: string) =>  Number(item));
    const minLat = Math.min(...keysOfGroupedArray);
    const maxLat = Math.max(...keysOfGroupedArray);

    const maxLongMaxLat = maxLat && grouped[`${maxLat}`] && grouped[`${maxLat}`].slice(-1)[0].lng;
    const minLongMaxLat = maxLat && grouped[`${maxLat}`] && grouped[`${maxLat}`][0].lng;

    const maxLongMinLat = minLat && grouped[`${minLat}`] && grouped[`${minLat}`].slice(-1)[0].lng;
    const minLongMinLat = minLat && grouped[`${minLat}`] && grouped[`${minLat}`][0].lng;
    return {
        maxLongMaxLat: {
            lat: maxLat,
            lng: maxLongMaxLat
        },
        minLongMaxLat: {
            lat: maxLat,
            lng: minLongMaxLat
        },
        maxLongMinLat: {
            lat: minLat,
            lng: maxLongMinLat
        },
        minLongMinLat: {
            lat: minLat,
            lng: minLongMinLat
        }
    }

  }
  const sortAndGroupResultElements = (results:Array<LocationType>): any => {
    //@ts-ignore
    return results.sort((a, b) => {
           if (a.lat === b.lat) {
              return a.lng - b.lng ;
           }

           return a.lat > b.lat ? -1 : 1;
        }).reduce((r: Array<LocationType>, a: LocationType) => {
            //@ts-ignore
            r[a.lat] = [...r[a.lat] || [], a !== undefined && a];
            return r;
           }, {});
  }
//==
