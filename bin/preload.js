#!/usr/bin/env node

'use strict';

var api = require('../src/js/server/api');
var logger = require('../src/js/server/logger').processing;
var moment = require('moment');
var q = require('q');

function preloader(date) {
    return function() {
        return api.preload(date);
    };
}

logger.log('info', 'Clearing cache before preload');

api.clearCache();

var promise = q();
var numPeriods = 10;
for (var i = 0; i < numPeriods; i++) {
    promise = promise.then(preloader(moment().add(3 * i, 'hours')));
}

promise.done(function() {
    logger.log('info', 'Preload complete');
}, function() {
    logger.log('error', 'Preload failed');
});
