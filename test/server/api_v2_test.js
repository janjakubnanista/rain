'use strict';

var api = require('../../src/js/server/api.v2');
var expect = require('expect.js');

describe.only('API V2', function() {
    it('should throw an error if first parameter is not a number', function() {
        expect(function() {
            api.atCoordinates(null, 42, function() {});
        }).to.throwError();
    });

    it('should throw an error if second parameter is not a number', function() {
        expect(function() {
            api.atCoordinates(42, null, function() {});
        }).to.throwError();
    });

    it('should call callback with image data', function() {
        return api.atCoordinates(42, 0).then(function(res) {
            expect(res).to.be.a(Buffer);
        });
    });
});
