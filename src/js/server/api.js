'use strict';

var url = require('url');
var path = require('path');
var request = require('request-promise');
var q = require('q');

var API_KEY = '0e6e4e38a762bb15b91e5b2b8e952401';

var cached = null;

exports.atCoordinates = function(lat, lng) {
    if (typeof(lat) !== 'number') throw new Error('Latitude must be a Number, got ' + typeof(lat) + ' instead');
    if (typeof(lng) !== 'number') throw new Error('Longitude must be a Number, got ' + typeof(lng) + ' instead');

    if (cached) return q(cached);

    var apiUrl = url.format({
        protocol: 'http',
        hostname: 'api.forecast.io',
        pathname: path.join('forecast', API_KEY, [lat, lng].join(','))
    });

    return request(apiUrl).then(function(res) {
        // FIXME Devlopment version
        cached = JSON.parse(res);

        return cached;
    });
};
