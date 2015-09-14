'use strict';

var moment = require('moment');
var path = require('path');
var winston = require('winston');

var config = require('../../../config');

function timestamp() {
    return moment().format('YY-MM-DD HH:mm:ss');
}

function formatter(options) {
    return [
        options.timestamp(),
        options.level.toUpperCase(),
        options.message || '',
        options.meta && Object.keys(options.meta).length ? JSON.stringify(options.meta) : ''
    ].join(' ');
}

exports.processing = new winston.Logger({
    transports: [
        new (winston.transports.Console)({ timestamp: timestamp, formatter: formatter }),
        new (winston.transports.File)({ filename: path.join(config.LOG_DIR, 'processing.log'), json: false, timestamp: timestamp, formatter: formatter })
    ]
});

exports.http = new winston.Logger({
    transports: [
        new (winston.transports.Console)({ timestamp: timestamp, formatter: formatter }),
        new (winston.transports.File)({ filename: path.join(config.LOG_DIR, 'http.log'), json: false, timestamp: timestamp, formatter: formatter })
    ]
});
