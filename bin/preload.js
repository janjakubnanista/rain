#!/usr/bin/env node

'use strict';

require('./setup');

var api = require('../src/js/server/api');
var logger = require('../src/js/server/logger').processing;
var moment = require('moment');
var q = require('q');

function preloader(date) {
    return function() {
        return api.preload(date).then(function(dataPath) {
            logger.log('info', 'Preloaded file %s', dataPath);
        });
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
}, function(error) {
    logger.log('error', 'Preload failed', { error: error && error.message, stack: error && error.stack });
});
