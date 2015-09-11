var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var webpack = require('webpack-stream');
var notify = require('gulp-notify');
var sass = require('gulp-sass');
var path = require('path');
var fs = require('fs');

var config = require('./config');

gulp.task('js:polyfills', function gulpTaskJsPolyfills() {
    var sources = path.join(config.JS_SRC_DIR, 'polyfills', '*.js');
    var compress = config.COMPRESS_JS;

    return gulp.src(sources)
        .pipe(webpack({
            output: { filename: 'polyfills.js' },
            plugins: [
                compress && new webpack.webpack.optimize.UglifyJsPlugin({
                    compress: {
                        warnings: false
                    }
                })
            ].filter(Boolean)
        }))
        .pipe(gulp.dest(config.JS_BUILD_DIR));
});

gulp.task('js', function gulpTaskJs() {
    var sources = path.join(config.JS_SRC_DIR, 'index.js');

    return gulp.src(sources)
        .pipe(webpack({
            module: {
                loaders: [
                    { test: /\.js$/, exclude: /node_modules/, loader: 'babel' },
                    { test: /\.jsx$/, loader: 'babel' },
                    { test: /\.svg$/, loaders: ['babel', 'svg-jsx?es6=true'] }
                ]
            },
            node: {
                process: false,
                Buffer: false
            },
            output: { filename: 'index.js' },
            plugins: [
                new webpack.webpack.DefinePlugin({
                    'process.env': { NODE_ENV: JSON.stringify(config.ENV) }
                }),
                config.COMPRESS_JS && new webpack.webpack.optimize.UglifyJsPlugin({
                    compress: { warnings: false }
                })
            ].filter(Boolean),
            resolve: {
                root: [config.SVG_BUILD_DIR]
            }
        }))
        .on('error', notify.onError('WebPack Error: <%= error.message %>'))
        .pipe(gulp.dest(config.JS_BUILD_DIR));
});

gulp.task('css', function gulpTaskCss() {
    var sources = path.join(config.SASS_SRC_DIR, '*.scss');
    var outputStyle = config.COMPRESS_CSS ? 'compressed' : 'expanded';

    return gulp.src(sources)
        .pipe(sourcemaps.init())
            .pipe(sass({ outputStyle: outputStyle }))
            .on('error', notify.onError('SASS Error: <%= error.message %>'))
            .pipe(autoprefixer())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(config.SASS_BUILD_DIR));
});

gulp.task('watch:css', function gulpTaskWatchCss() {
    var sources = path.join(config.SASS_SRC_DIR, '**/*.scss');

    return gulp.watch(sources, ['css']);
});

gulp.task('watch:js', function gulpTaskWatchJs() {
    var sources = [
        path.join(config.JS_SRC_DIR, '**/*.js'),
        path.join(config.SVG_SRC_DIR, '**/*.svg')
    ];

    return gulp.watch(sources, ['js']);
});

gulp.task('build', ['css', 'js', 'js:polyfills']);

gulp.task('watch', ['watch:css', 'watch:js']);
