'use strict';

var gulp = require('gulp');
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var gulpLoadPlugins =  require('gulp-load-plugins');
var lazypipe = require('lazypipe');

var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var tsify = require('tsify');

var $ = gulpLoadPlugins();
var reload = browserSync.reload;
var pkg = require('./package.json');
var today = $.util.date('dd-mm-yyyy HH:MM');

var browserSyncConfigs = {
  notify: false,
  // Disable open automatically when Browsersync starts.
  open: false,
  server: ['./'],
  port: 3000
};

var banner = [
  '/*!',
  ' * Validetta (' + pkg.homepage + ')',
  ' * Version ' + pkg.version + ' (' + today + ')',
  ' * Licensed under ' + pkg.license + ' (https://github.com/hsnaydd/validetta/blob/master/LICENCE)',
  ' * Copyright 2013-' + $.util.date('yyyy') + ' ' + pkg.author,
  ' */\n\n'
].join('\n');

gulp.task('styles:lint', cb => {
  return gulp.src([
    'src/**/*.scss'
  ])
    .pipe($.plumber({errorHandler: $.notify.onError('Hata: <%= error.message %>')}))
    .pipe($.scssLint())
    .pipe(browserSync.active ? $.util.noop() : $.scssLint.failReporter('E'));
});

gulp.task('styles', ['styles:lint'], () => {
  const AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 33',
    'chrome >= 36',
    'safari >= 7',
    'opera >= 26',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ];

   const stylesMinChannel = lazypipe()
    .pipe($.cssnano, {discardComments: {removeAll: true}})
    .pipe($.rename, {suffix: '.min'})
    .pipe($.header, banner)
    .pipe(gulp.dest, 'dist');

  return gulp.src([
    'src/**/*.scss'
  ])
    .pipe($.plumber({errorHandler: $.notify.onError('Hata: <%= error.message %>')}))
    .pipe($.sass({precision: 10}).on('error', $.sass.logError))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe($.header(banner))
    .pipe(gulp.dest('dist'))
    .pipe(stylesMinChannel());
});

gulp.task('scripts:lint', cb => {
  return gulp.src('src/**/*.ts')
    .pipe($.plumber({errorHandler: $.notify.onError('Hata: <%= error.message %>')}))
    .pipe($.tslint({
      formatter: 'verbose'
    }))
    .pipe($.tslint.report());
});

gulp.task('scripts', ['scripts:lint'], function () {
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: './src/index.ts',
    debug: true
  });

  const scriptsMinChannel = lazypipe()
    .pipe($.rename, {suffix: '.min'})
    .pipe($.sourcemaps.init, {loadMaps: true})
    .pipe($.uglify)
    .pipe($.header, banner)
    .pipe($.sourcemaps.write, '.')
    .pipe(gulp.dest, 'dist');

  return b
    .plugin(tsify, {noImplicitAny: true, target: 'es5'})
    .bundle()
    .pipe($.plumber({errorHandler: $.notify.onError('Hata: <%= error.message %>')}))
    .pipe(source('validetta.js'))
    .pipe(buffer())
    .pipe($.header(banner))
    .pipe(gulp.dest('dist'))
    .pipe(scriptsMinChannel());
});

gulp.task('notify:build', () => {
  return gulp.src('')
    .pipe($.notify('Build completed.'));
});

gulp.task('clean:dist', () => del(['dist/*'], {dot: true}));

gulp.task('build', cb =>
  runSequence(
    ['clean:dist'],
    ['styles', 'scripts'],
    'notify:build',
    cb
  )
);

gulp.task('serve', () => {
  browserSync(browserSyncConfigs);
  gulp.watch(['src/**/*.scss'], ['styles', reload]);
  gulp.watch(['src/**/*.js'], ['scripts', reload]);
});
