var fs = require('fs');
var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var strip = require('gulp-remove-code');
var header = require('gulp-header');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var del = require('del');

var buildDir = 'dist';
var banner = '/*!\n' +
        ' * Validetta (<%= pkg.homepage %>)\n' +
        ' * Version <%= pkg.version %>\n' +
        ' * Licensed under <%= pkg.license.type %> (<%= pkg.license.url %>)\n' +
        ' * Copyright 2013-<%= new Date().getFullYear() %> <%= pkg.author.name %> - <%= pkg.author.url %> \n' +
        ' */\n';


/* Development tasks */

gulp.task('sass', function() {
  return sass('demo/scss/styles.scss')
    .pipe(gulp.dest('demo/css'))
    .pipe(reload({ stream:true }));
});

gulp.task('js-watch', ['concat'], reload);

gulp.task('serve', ['sass'], function() {
  browserSync({
    server: {
      baseDir: ['demo', 'dist'],
    },
  });

  gulp.watch('demo/scss/*.scss', ['sass']);
  gulp.watch('src/validetta.js', ['js-watch']);
  gulp.watch(['demo/index.html', 'demo/js/main.js']).on('change', reload);
});


/* Build tasks */

gulp.task('clean', function() {
  return del(buildDir + '/*');
});

gulp.task('concat', function() {
  gulp.src('src/validetta.js')
    .pipe(strip({commentStart: '/*!', commentEnd: '*/'}))
    .pipe(header(banner, { pkg : pkg}))
    .pipe(gulp.dest('dist'));
});

gulp.task('uglify', function() {
  return gulp.src('src/validetta.js')
      .pipe(uglify())
      .pipe(header(banner, { pkg : pkg}))
      .pipe(rename({
        extname: '.min.js',
      }))
      .pipe(gulp.dest('dist'));
});

gulp.task('build', ['clean', 'concat', 'uglify']);
