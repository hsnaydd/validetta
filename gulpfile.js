'use strict';

var gulp = require('gulp');
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var gulpLoadPlugins =  require('gulp-load-plugins');
var lazypipe = require('lazypipe');

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
  return gulp.src('src/**/*.js')
    .pipe($.plumber({errorHandler: $.notify.onError('Hata: <%= error.message %>')}))
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe(browserSync.active ? $.util.noop() : $.eslint.failOnError());
});

gulp.task('scripts', () => {

  const scriptsMinChannel = lazypipe()
    .pipe($.uglify)
    .pipe($.rename, {suffix: '.min'})
    .pipe($.header, banner)
    .pipe(gulp.dest, 'dist');

  return gulp.src('src/validetta.js')
    .pipe($.plumber({errorHandler: $.notify.onError('Hata: <%= error.message %>')}))
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
