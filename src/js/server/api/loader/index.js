'use strict';

var fs = require('fs');
var imagemagick = require('imagemagick');
var logger = require('../../logger').processing;
var moment = require('moment');
var path = require('path');
var q = require('q');
var request = require('request');
var temp = require('temp');
var url = require('url');

var config = require('../../../../../config');

var REFERENCE_PATH = path.join(__dirname, 'reference_blurred.png');

function download(uri) {
    var filePath = temp.openSync({ suffix: '.png' }).path;
    var stream = fs.createWriteStream(filePath);

    return q.ninvoke(request, 'head', uri).then(function(res) {
        if (res[0].statusCode !== 200) throw new Error('Image at ' + uri + ' not found');
    }).then(function() {
        var deferred = q.defer();

        request(uri).pipe(stream)
            .on('close', deferred.resolve)
            .on('error', deferred.reject);

        return deferred.promise.then(function() {
            stream.end();

            return filePath;
        });
    });
}

function quantizeTime(time) {
    var quantizedTime = moment(time);
    quantizedTime.hours(quantizedTime.hours() - quantizedTime.hours() % 3);

    return quantizedTime.format('DDMMYYYY-HH');
}

function cachedPath(time) {
    var quantizedTime = quantizeTime(time);
    var imageName = quantizedTime + '.png';

    return path.join(config.IMAGE_CACHE_DIR, imageName);
}

function cache(time, inputPath) {
    var outputPath = cachedPath(time);

    fs.writeFileSync(outputPath, fs.readFileSync(inputPath));

    return outputPath;
}

function cached(time) {
    var imagePath = cachedPath(time);

    return fs.existsSync(imagePath) ? imagePath : null;
}

function imageURLFromTime(time) {
    var quantizedTime = quantizeTime(time);
    var imageUrlName = 'zrazky_' + quantizedTime + '.png';

    return url.format({
        protocol: 'http',
        hostname: 'www.shmu.sk',
        pathname: path.join('data/datanwp/zrazky/', imageUrlName)
    });
}

exports.process = function(inputPath) {
    var outputPath = temp.openSync({ suffix: '.png' }).path;
    var gaussianBlur = '6x2';
    var command = [
        REFERENCE_PATH,
        inputPath,
        '-gaussian-blur', gaussianBlur,
        '-compose', 'difference',
        '-composite',
        '-negate',
        '-selective-blur', '12x4+08%',
        outputPath
    ];

    return q.ninvoke(imagemagick, 'convert', command).then(function() {
        return outputPath;
    });
};

exports.clear = function() {
    fs.readdirSync(config.IMAGE_CACHE_DIR).forEach(function(fileName) {
        fs.unlinkSync(path.join(config.IMAGE_CACHE_DIR, fileName));
    });
};

exports.load = function(time) {
    var formattedTime = moment(time).format('YYYY-MM-DD HH:mm');
    logger.log('info', 'Loading for %s', formattedTime);

    var cachedFilePath = cached(time);
    if (cachedFilePath) {
        logger.log('info', 'Returning cached for %s', formattedTime);

        return q(cachedFilePath);
    }

    var imageURL = imageURLFromTime(time);
    logger.log('info', 'Downloading for %s from %s', formattedTime, imageURL);

    return download(imageURL).then(function downloadSuccessful(downloadPath) {
        logger.log('info', 'Download successful for %s', formattedTime);

        return exports.process(downloadPath).then(function processingSuccessful(processedPath) {
            logger.log('info', 'Processing successful for %s', formattedTime);

            fs.unlinkSync(downloadPath);

            return processedPath;
        }, function processingFailed(error) {
            logger.log('error', 'Processing failed for %s', formattedTime, { error: error });

            throw new Error('Processing failed');
        });
    }, function downloadFailed(error) {
        logger.log('error', 'Downloaded failed for %s', formattedTime, { error: error && error.message });

        throw new Error('Download failed');
    }).then(function(processedPath) {
        var cachedProcessedPath = cache(time, processedPath);

        fs.unlinkSync(processedPath);

        return cachedProcessedPath;
    });
};
