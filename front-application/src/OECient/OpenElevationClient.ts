import * as React from 'react';
import Q from 'q';

// export interface LocationsObjType {
//     latitude: number,
//     elevation: number,
//     longitude: number
// }

class OpenElevationRestClient extends React.Component {
    domain: string;

    constructor(domain: string) {
        super({}, {})
        this.domain = domain ? domain : 'http://localhost/api/v1';
        if (this.domain.length === 0) {
            throw new Error('Domain parameter must be specified as a string.');
        }
    }

   serializeQueryParams = (parameters: Record<string, any>) => {
        let str = [];
        for (let p in parameters) {
            if (parameters.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + '=' + encodeURIComponent(parameters[p]));
            }
        }
        return str.join('&');
    }

    mergeQueryParams = (parameters:  Record<string, any>,           queryParameters:  Record<string, any>) => {
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
        method: string,
        url: string,
        parameters: Record<string, any>,
        body: Record<string, any> | undefined | any,
        headers: Record<string, any>,
        queryParameters: Record<string, any>,
        form: Record<string, any>,
        deferred: Record<string, any>) => {
        const queryParams = queryParameters && Object.keys(queryParameters).length ? this.serializeQueryParams(queryParameters) : null;
        const urlWithParams = url + (queryParams ? '?' + queryParams : '');

        if (body && !Object.keys(body).length) {
            body = undefined;
        }

        fetch(urlWithParams, {
            method,
            headers,
            body: JSON.stringify(body)
        }).then((response) => {
            return response.json() ;
        }).then((body) => {
            deferred.resolve(body);
        }).catch((error) => {
            deferred.reject(error);
        });
    };
    /**
     *
     * @method
     * @name OpenElevationRestClient#postLookupNew
     * @param {object} parameters - method options and parameters

     */
    postLookupNew = (parameters : any) => {
        if (parameters === undefined) {
            parameters = {};
        }
        let deferred = Q.defer();
        let domain = this.domain,
            path = '/lookupnew';
        let body: Record<string, any> = {},
            queryParameters: Record<string, any> = {},
            headers: Record<string, any> = {},
            form: Record<string, any> = {};
        headers["Accept"] = ["application/json"];
        headers["Content-Type"] = ["application/json"];
        if (parameters['adapterLongitude'] !== undefined && parameters['adapterLatitude'] !== undefined && parameters['range'] !== undefined) {
            body = {"adapterLongitude": parameters['adapterLongitude'], adapterLatitude: parameters['adapterLatitude'], range: parameters['range'] };

        }

        queryParameters = this.mergeQueryParams(parameters, queryParameters);

        this.makeRequest('POST', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };
        /**
     *
     * @method
     * @name OpenElevationRestClient#postLookupNew
     * @param {object} parameters - method options and parameters

     */
    postLookupCoordsWeb = (parameters : any) => {
        if (parameters === undefined) {
            parameters = {};
        }
        let deferred = Q.defer();
        let domain = this.domain,
            path = '/lookup-web';
        let body: Record<string, any> = {},
            queryParameters: Record<string, any> = {},
            headers: Record<string, any> = {},
            form: Record<string, any> = {};
        headers["Accept"] = ["application/json"];
        headers["Content-Type"] = ["application/json"];
        if (parameters['adapterLongitude'] !== undefined && parameters['adapterLatitude'] !== undefined && parameters['range'] !== undefined && parameters['distanceBetweenPoints'] !== undefined) {
            body = {"adapterLongitude": parameters['adapterLongitude'], adapterLatitude: parameters['adapterLatitude'], range: parameters['range'], distanceBetweenPoints: parameters['distanceBetweenPoints'] };

        }

        queryParameters = this.mergeQueryParams(parameters, queryParameters);

        this.makeRequest('POST', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };

   /**
     *
     * @method
     * @name postLookupLineDistance
     * @param {object} parameters - method options and parameters

     */
    postLookupLineDistance = (parameters : any) => {
        if (parameters === undefined) {
            parameters = {};
        }
        let deferred = Q.defer();
        let domain = this.domain,
            path = '/lookup-line-distance';
        let body: Record<string, any> = {},
            queryParameters: Record<string, any> = {},
            headers: Record<string, any> = {},
            form: Record<string, any> = {};
        headers["Accept"] = ["application/json"];
        headers["Content-Type"] = ["application/json"];
        // /api/v1/lookup-line-distance

        if (parameters['adapterLatitude'] !== undefined &&
            parameters['adapterLongitude'] !== undefined &&
            parameters['range'] !== undefined &&
            parameters['distance'] !== undefined &&
            parameters['receiverLatitude'] !== undefined &&
            parameters['receiverLongitude'] !== undefined) {

            body = {
                adapterLatitude: parameters['adapterLatitude'],
                adapterLongitude: parameters['adapterLongitude'],
                distance: parameters['distance'],
                range: parameters['range'],
                receiverLatitude: parameters['receiverLatitude'],
                receiverLongitude: parameters['receiverLongitude']
            };
        }

        queryParameters = this.mergeQueryParams(parameters, queryParameters);

        this.makeRequest('POST', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };
   /**
     *
     * @method
     * @name OpenElevationRestClient#postLookupNew
     * @param {object} parameters - method options and parameters

     */
    postLookupLine = (parameters : any) => {
        if (parameters === undefined) {
            parameters = {};
        }
        let deferred = Q.defer();
        let domain = this.domain,
            path = '/lookup-line';
        let body: Record<string, any> = {},
            queryParameters: Record<string, any> = {},
            headers: Record<string, any> = {},
            form: Record<string, any> = {};
        headers["Accept"] = ["application/json"];
        headers["Content-Type"] = ["application/json"];


        if (parameters['adapterLatitude'] !== undefined &&
            parameters['adapterLongitude'] !== undefined &&
            parameters['range'] !== undefined &&
            parameters['numberOfPoints'] !== undefined &&
            parameters['receiverLatitude'] !== undefined &&
            parameters['receiverLongitude'] !== undefined) {

            body = {
                adapterLatitude: parameters['adapterLatitude'],
                adapterLongitude: parameters['adapterLongitude'],
                numberOfPoints: parameters['numberOfPoints'],
                range: parameters['range'],
                receiverLatitude: parameters['receiverLatitude'],
                receiverLongitude: parameters['receiverLongitude']
            };
        }

        queryParameters = this.mergeQueryParams(parameters, queryParameters);

        this.makeRequest('POST', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };


    /**
     *
     * @method
     * @name OpenElevationRestClient#postLookup
     * @param {object} parameters - method options and parameters
     * @param {string} parameters.locations - locations: [{latitude: 42.216667,longitude: 27.416667}]
     */
    postLookup = (parameters : any) => {
        if (parameters === undefined) {
            parameters = {};
        }
        let deferred = Q.defer();
        let domain = this.domain,
            path = '/lookup';
        let body: Record<string, any> = {},
            queryParameters: Record<string, any> = {},
            headers: Record<string, any> = {},
            form: Record<string, any> = {};

        headers["Accept"] = ["application/json"];
        headers["Content-Type"] = ["application/json"];

        if (parameters['locations'] !== undefined) {
            body = {"locations": parameters['locations'] };

        }

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
    getLookup = (parameters: Record<string, any>) => {
        if (parameters === undefined) {
            parameters = {};
        }
        let deferred = Q.defer();
        let domain = this.domain,
            path = '/lookup';
        let body :Record<string, any> = {},
            queryParameters :Record<string, any> = {},
            headers :Record<string, any> = {},
            form :Record<string, any> = {};

        if (parameters['locations'] !== undefined) {
            queryParameters['locations'] = parameters['locations'];
        }

        queryParameters = this.mergeQueryParams(parameters, queryParameters);

        this.makeRequest('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };

};

export default OpenElevationRestClient;