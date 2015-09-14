'use strict';

var exec = require('child_process').exec;
var fs = require('fs');
var logger = require('../logger').processing;
var moment = require('moment');
var path = require('path');
var q = require('q');
var temp = require('temp');
var url = require('url');

var config = require('../../../../config');

function quantizeTime(time) {
    var quantizedTime = moment(time);
    quantizedTime.hours(quantizedTime.hours() - quantizedTime.hours() % 3);

    return quantizedTime.format('DDMMYYYY-HH');
}

function getCachedPath(time) {
    var quantizedTime = quantizeTime(time);
    var cachedPath = quantizedTime + '.png';

    return path.join(config.DATA_CACHE_DIR, cachedPath);
}

function getSHMUUrl(time) {
    var quantizedTime = quantizeTime(time);
    var imageUrlName = 'zrazky_' + quantizedTime + '.png';

    return url.format({
        protocol: 'http',
        hostname: 'www.shmu.sk',
        pathname: path.join('data/datanwp/zrazky/', imageUrlName)
    });
}

function getCached(time) {
    var cachedPath = getCachedPath(time);

    return fs.existsSync(cachedPath) ? cachedPath : null;
}

function getImageFromSHMU(time) {
    var imageURL = getSHMUUrl(time);
    var downloadPath = temp.openSync({ suffix: '.png' }).path;
    var command = [
        path.join(__dirname, 'bin/download.sh'),
        imageURL,
        downloadPath
    ].join(' ');

    return q.nfcall(exec, command).then(function() {
        return downloadPath;
    });
}

function diffImage(imagePath) {
    var referencePath = path.join(__dirname, 'res', 'reference.png');
    var processedPath = temp.openSync({ suffix: '.png' }).path;
    var command = [
        path.join(__dirname, 'bin/compare.sh'),
        referencePath,
        imagePath,
        processedPath
    ].join(' ');

    return q.nfcall(exec, command).then(function() {
        return processedPath;
    });
}

function evaluateImage(imagePath, x, y) {
    var binsPath = path.join(__dirname, 'res', 'bins.txt');
    var command = [
        path.join(__dirname, 'bin/evaluate.sh'),
        imagePath,
        binsPath,
        x, y
    ].join(' ');

    return q.nfcall(exec, command).then(function(value) {
        return parseFloat(value);
    });
}

function cacheData(time, dataPath) {
    var cachedPath = getCachedPath(time);
    var data = fs.readFileSync(dataPath);

    fs.writeFileSync(cachedPath, data);

    return cachedPath;
}

function getData(time) {
    var formattedTime = moment(time).format('YYYY-MM-DD HH:mm');
    logger.log('info', 'Getting data for %s', formattedTime);

    var cachedPath = getCached(time);
    if (cachedPath) {
        logger.log('info', 'Returning cached data for %s', formattedTime);

        return q(cachedPath);
    }

    logger.log('info', 'Fetching fresh data for %s', formattedTime);

    var filesToDelete = [];

    return getImageFromSHMU(time).then(function downloadSuccessful(downloadPath) {
        filesToDelete.push(downloadPath);

        return diffImage(downloadPath);
    }).then(function diffSuccessful(diffedPath) {
        filesToDelete.push(diffedPath);

        return cacheData(time, diffedPath);
    }).fin(function deleteIntermediaryFiles() {
        logger.log('info', 'Removing intermediary files: %s', filesToDelete.join(', '));

        filesToDelete.map(fs.unlinkSync.bind(fs));
    });
}

function latLngToXY(lat, lng) {
    return {
        x: 95.57836499 * lng - 1593.407956,
        y: - 148.1929283 * lat + 7357.007776
    };
}

function getDataAtLatLng(time, lat, lng) {
    var coords = latLngToXY(lat, lng);

    return getData(time).then(function(diffedPath) {
        return evaluateImage(diffedPath, Math.round(coords.x), Math.round(coords.y));
    });
}

exports.preload = function(time) {
    return getData(time);
};

exports.clearCache = function() {
    fs.readdirSync(config.DATA_CACHE_DIR).forEach(function(fileName) {
        fs.unlinkSync(path.join(config.DATA_CACHE_DIR, fileName));
    });
};

exports.atCoordinates = function(time, lat, lng) {
    if (typeof(lat) !== 'number') throw new Error('Latitude must be a Number, got ' + typeof(lat) + ' instead');
    if (typeof(lng) !== 'number') throw new Error('Longitude must be a Number, got ' + typeof(lng) + ' instead');

    if (lat < 47.6 || lat > 49.6) throw new Error('Latitude out of bounds, got ' + lat);
    if (lng < 16.7 || lng > 22.7) throw new Error('Longitude out of bounds, got ' + lng);

    return getDataAtLatLng(time, lat, lng);
};
