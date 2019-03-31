// 'use strict';

const del = require(`del`);
const gulp = require(`gulp`);
// const sass = require(`gulp-sass`);
const less = require(`gulp-less`);
const plumber = require(`gulp-plumber`);
const postcss = require(`gulp-postcss`);
const autoprefixer = require(`autoprefixer`);
const server = require(`browser-sync`).create();
const mqpacker = require(`css-mqpacker`);
const minify = require(`gulp-clean-css`);
const rename = require(`gulp-rename`);
// const imagemin = require(`gulp-imagemin`);
const rollup = require(`gulp-better-rollup`);
const sourcemaps = require(`gulp-sourcemaps`);
// const mocha = require(`gulp-mocha`);
// const commonjs = require(`rollup-plugin-commonjs`);
const posthtml = require(`gulp-posthtml`);
const htmlmin = require(`gulp-htmlmin`);
const include = require(`posthtml-include`);

gulp.task(`copy-html`, () => {
  return gulp.src(`src/*.html`)
  .pipe(posthtml([include({root: `./src/`})]))
  .pipe(gulp.dest(`build/`));
});

gulp.task(`clean-js`, () => {
  return del(`build/js/*.js`);
});

gulp.task(`scripts`, () => {
  return gulp.src(`src/js/*.js`)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(rollup({}, `iife`))
    .pipe(sourcemaps.write(``))
    .pipe(gulp.dest(`build/js/`));
});

gulp.task(`clean-html`, () => {
  return del(`build/*.html`);
});

gulp.task(`css`, () => {
  return gulp.src(`src/less/style.less`)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      mqpacker({sort: true})
    ]))
    .pipe(gulp.dest(`build/css`))
    .pipe(minify())
    .pipe(rename(`style.min.css`))
    .pipe(sourcemaps.write(`.`))
    .pipe(gulp.dest(`build/css`))
    .pipe(server.stream());
});

gulp.task(`min-html`, () => {
  return gulp.src(`build/*.html`)
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(`build/`));
});

gulp.task(`copy`, gulp.series(`scripts`), () => {
  return gulp.src([
    `src/fonts/**/*.{woff2, woff}`,
    `src/img/**`
  ], {
    base: `src`
  })
    .pipe(gulp.dest(`build`));
});

gulp.task(`test`, () => {
});

gulp.task(`server`, () => {
  server.init({
    server: `build/`,
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.task(`refresh`, (done) => {
    server.reload();
    done();
  });


  gulp.watch(`src/less/**/*.less`, gulp.series(`css`));
  gulp.watch(`src/*.html`, gulp.series(`clean-html`, `copy-html`, `min-html`, `refresh`));
  gulp.watch(`src/js/*.js`, gulp.series(`clean-js`, `scripts`, `refresh`));
});

gulp.task(`clean`, () => {
  return del(`build`);
});


gulp.task(`build`, gulp.series(`clean`, `copy`, `css`, `copy-html`, `min-html`));
gulp.task(`start`, gulp.series(`build`, `server`));
