var builder = require('xmlbuilder');

function createKml(maxLongMaxLat, maxLongMinLat, minLongMaxLat, minLongMinLat, fName) {

    var kmlElement = builder.create("kml", {"xmlns": 'http://www.opengis.net/kml/2.2'})
    .ele('href', fName).up()
    .ele("viewBoundScale", "0.75").up()
    .ele("maxLongMaxLat-latitude", `${maxLongMaxLat.lat}`).up()
    .ele("maxLongMaxLat-longitude", `${maxLongMaxLat.lng}`).up()
    .ele("maxLongMinLat-latitude", `${maxLongMinLat.lat}`).up()
    .ele("maxLongMinLat-longitude", `${maxLongMinLat.lng}`).up()
    .ele("minLongMaxLa-latitude", `${minLongMaxLat.lat}`).up()
    .ele("minLongMaxLat-longitude", `${minLongMaxLat.lng}`).up()
    .ele("minLongMinLat-latitude", `${minLongMinLat.lat}`).up()
    .ele("minLongMinLat-longitude", `${minLongMinLat.lng}`)
    .end({ pretty: true});

    return kmlElement;
  }

module.exports = { createKml }
// <?xml version="1.0" encoding="UTF-8"?>
// <kml xmlns="http://www.opengis.net/kml/2.2">
// <GroundOverlay><name>PL-fm-87500-5-10-H-250-272-18.856849743492-50.850569620164-13.png</name><color>88ffffff</color><Icon>
// <href>PL-fm-87500-5-10-H-250-272-18.856849743492-50.850569620164-13.png</href>
// <viewBoundScale>0.75</viewBoundScale></Icon><LatLonBox>
// <north> 52.65038</north>
// <south> 49.05083</south>
// <east> 21.7075</east>
// <west> 16.0061</west>
// </LatLonBox></GroundOverlay></kml>
