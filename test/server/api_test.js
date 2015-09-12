var api = require('../../src/js/server/api');

var expect = require('expect.js');

describe('API', function() {
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

    it('should call callback with response payload', function() {
        return api.atCoordinates(42, 0).then(function(res) {
            expect(res).to.be.an(Object);
        });
    });
});
