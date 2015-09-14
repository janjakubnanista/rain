'use strict';

var api = require('../../src/js/server/api');
var expect = require('expect.js');

var location = { lat: 49.406373, lng: 19.483884 };
var time = new Date();

describe.only('API V2', function() {
    it('should throw an error if first parameter is not a number', function() {
        expect(function() {
            api.atCoordinates(time, null, 42, function() {});
        }).to.throwError();
    });

    it('should throw an error if second parameter is not a number', function() {
        expect(function() {
            api.atCoordinates(time, 42, null, function() {});
        }).to.throwError();
    });

    it('should call callback with image data', function() {
        return api.atCoordinates(time, location.lat, location.lng).then(function(value) {
            expect(value).to.be.a('number');
            expect(value).to.not.be.lessThan(0);
        });
    });
});
