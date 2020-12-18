import { CoordinatesType } from "src/routes/OctaveExport";

export const getFieldsFromObject = (objectMap: Record<string, any>, fields: Array<string>) =>{
    return objectMap.map((element: Record<string, any>) => {
        let obj: Record<string, any> = {};
        fields.map((field: string) =>{
            obj[field] = element[field];
        })
        return obj;
    });
}


export const getCorners = (results: Array<CoordinatesType>) => {
    const grouped = sortAndGroupResultElements(results);

    const keysOfGroupedArray = Object.keys(grouped).map((item: string) =>  Number(item));
    const minLat = Math.min(...keysOfGroupedArray);
    const maxLat = Math.max(...keysOfGroupedArray);

    const maxLongMaxLat = maxLat && grouped[`${maxLat}`] && grouped[`${maxLat}`].slice(-1)[0].longitude;
    const minLongMaxLat = maxLat && grouped[`${maxLat}`] && grouped[`${maxLat}`][0].longitude;

    const maxLongMinLat = minLat && grouped[`${minLat}`] && grouped[`${minLat}`].slice(-1)[0].longitude;
    const minLongMinLat = minLat && grouped[`${minLat}`] && grouped[`${minLat}`][0].longitude;

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
  const sortAndGroupResultElements = (results:Array<CoordinatesType>): any => {
    //@ts-ignore
    return results.sort((a, b) => {
           if (a.latitude === b.latitude) {
              // Price is only important when cities are the same
              return a.longitude - b.longitude ;
           }

           return a.latitude > b.latitude ? -1 : 1;
        }).reduce((r: Array<CoordinatesType>, a: CoordinatesType) => {
            //@ts-ignore
            r[a.latitude] = [...r[a.latitude] || [], a !== undefined && a];
            return r;
           }, {});
  }
