import { CornersType } from "./OctaveExport";

var builder = require('xmlbuilder');

export const createKml = (corners: CornersType, fName: string) => {

    var kmlElement = builder.create("kml", {"xmlns": 'http://www.opengis.net/kml/2.2'})
    .ele('href', fName).up()
    .ele("viewBoundScale", "0.75").up()
    .ele("maxLongMaxLat-latitude", `${corners.maxLongMaxLat.lat}`).up()
    .ele("maxLongMaxLat-longitude", `${corners.maxLongMaxLat.lng}`).up()
    .ele("maxLongMinLat-latitude", `${corners.maxLongMinLat.lat}`).up()
    .ele("maxLongMinLat-longitude", `${corners.maxLongMinLat.lng}`).up()
    .ele("minLongMaxLa-latitude", `${corners.minLongMaxLat.lat}`).up()
    .ele("minLongMaxLat-longitude", `${corners.minLongMaxLat.lng}`).up()
    .ele("minLongMinLat-latitude", `${corners.minLongMinLat.lat}`).up()
    .ele("minLongMinLat-longitude", `${corners.minLongMinLat.lng}`)
    .end({ pretty: true});

    return kmlElement;
  }
