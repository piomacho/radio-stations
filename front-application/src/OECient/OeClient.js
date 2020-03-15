import * as React from 'react';
import Q from 'q';

// export interface LocationsObjType {
//     latitude: number,
//     elevation: number,
//     longitude: number
// }

class OpenElevationRestClient extends React.Component {
    domain;

    constructor(domain) {
        super({}, {})
        // let domain = (typeof options === 'object') ? options.domain : options;
        this.domain = domain ? domain : 'http://localhost/api/v1';
        if (this.domain.length === 0) {
            throw new Error('Domain parameter must be specified as a string.');
        }
    }

   serializeQueryParams = (parameters) => {
        let str = [];
        for (let p in parameters) {
            if (parameters.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + '=' + encodeURIComponent(parameters[p]));
            }
        }
        return str.join('&');
    }

    mergeQueryParams = (parameters, queryParameters) => {
        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters)
                .forEach(function(parameterName) {
                    let parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
        }
        return queryParameters;
    }

    makeRequest = (
        method,
        url,
        parameters,
        body,
        headers,
        queryParameters,
        form,
        deferred) => {
        const queryParams = queryParameters && Object.keys(queryParameters).length ? this.serializeQueryParams(queryParameters) : null;
        const urlWithParams = url + (queryParams ? '?' + queryParams : '');

        if (body && !Object.keys(body).length) {
            body = undefined;
        }
        let bodyProper = JSON.stringify({
            "locations":
            [
            {
            "latitude": 10,
            "longitude": 10
            },
            {
            "latitude":20,
            "longitude": 20
            },
            {
            "latitude":41.161758,
            "longitude":-8.583933
            }
            ]
            
            });
            
         console.log("url ", urlWithParams)
        fetch(urlWithParams, {
            method,
            headers,
            body:bodyProper
        }).then((response) => {
            console.log("no ja pierdole 1");
            return response.json() ;
        }).then((body) => {
            console.log("no ja pierdole 2", body);
            deferred.resolve(body);
        }).catch((error) => {
            deferred.reject(error);
        });
    };

    /**
     * 
     * @method
     * @name OpenElevationRestClient#postLookup
     * @param {object} parameters - method options and parameters
   
     */
    postLookup = (parameters) => {
        console.log("IDZIE")
        if (parameters === undefined) {
            parameters = {};
        }
        let deferred = Q.defer();
        let domain = this.domain,
            path = '/lookup';
        let body ,
            queryParameters = {},
            headers = {},
            form = {};

        headers["Accept"] = ["application/json"];
        headers["Content-Type"] = ["application/json"];

        if (parameters['locations'] !== undefined) {
            body = {"locations": parameters['locations'] };
            
        }
        // console.log("body ", body,' domain',domain + path," parameters", parameters, "bdody,", body,'head', headers, "query",  queryParameters, "form,", form, "deff", deferred);    

        queryParameters = this.mergeQueryParams(parameters, queryParameters);

        this.makeRequest('POST', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };
    /**
     * List altitude for locations.

     * @method
     * @name OpenElevationRestClient#getLookup
     * @param {object} parameters - method options and parameters
         * @param {string} parameters.locations - locations=42.216667,27.416667
     */
    getLookup = (parameters) => {
        if (parameters === undefined) {
            parameters = {};
        }
        let deferred = Q.defer();
        let domain = this.domain,
            path = '/lookup';
        let body = {},
            queryParameters  = {},
            headers  = {},
            form = {};

        if (parameters['locations'] !== undefined) {
            queryParameters['locations'] = parameters['locations'];
        }

        queryParameters = this.mergeQueryParams(parameters, queryParameters);

        this.makeRequest('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };

};

export default OpenElevationRestClient;