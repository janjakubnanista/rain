#!/usr/bin/env node

'use strict';

var fs = require('fs');
var config = require('../config');

if (!fs.existsSync(config.IMAGE_CACHE_DIR)) fs.mkdirSync(config.IMAGE_CACHE_DIR);
if (!fs.existsSync(config.LOG_DIR)) fs.mkdirSync(config.LOG_DIR);
