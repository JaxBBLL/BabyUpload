const gulp = require('gulp');
const del = require('del');
const plumber = require('gulp-plumber');
const connect = require('gulp-connect');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const proxy = require('http-proxy-middleware');
const cp = require('child_process')

const paths = {
  dest: './'
};

const port = 3333;

function scriptBuild() {
  return gulp.src('./BabyUpload.js')
    .pipe(plumber())
    .pipe(uglify())
    .pipe(rename('BabyUpload.min.js'))
    .pipe(gulp.dest(paths.dest))
}

function script() {
  return gulp.src('./BabyUpload.js')
    .pipe(plumber())
    .pipe(uglify())
    .pipe(connect.reload())
}

function serve() {
  connect.server({
    root: './',
    port: port,
    livereload: true,
    host: '::',
    middleware: function(connect, opt) {
      return [proxy('/api/', {
        target: 'http://admin.test.kucdn.cn/',
        changeOrigin: true
      })]
    }
  });
}

function watch() {
  gulp.watch(['./index.html', 'BabyUpload.js'], script);
}

function openBrowser() {
  cp.exec(`start http://localhost:${port}`)
}

const test = gulp.series(
  gulp.parallel(script),
  gulp.parallel(openBrowser, serve, watch),
);

const build = gulp.series(
  gulp.parallel(scriptBuild)
)

gulp.task('test', test);
gulp.task('build', build);
